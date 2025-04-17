import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import {
  insertTaskSchema,
  insertProjectSchema,
  insertTimeEntrySchema,
  insertLeaveRequestSchema,
  timeEntries,
  Task,
  TimeEntry,
  LeaveRequest,
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes (/api/register, /api/login, /api/logout, /api/user)
  setupAuth(app);

  const httpServer = createServer(app);

  // API Routes - prefix all with /api

  // Projects API
  app.get("/api/projects", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      // If user is a manager, get only their projects
      if (req.user?.role === "manager") {
        const projects = await storage.getProjectsByManager(req.user.id);
        return res.json(projects);
      }

      // If admin, get all projects
      const projects = await storage.getProjects();
      res.json(projects);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });

  app.post("/api/projects", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    if (req.user?.role !== "manager" && req.user?.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Only managers can create projects" });
    }

    try {
      const projectData = insertProjectSchema.parse(req.body);
      const project = await storage.createProject({
        ...projectData,
        managerId: req.user.id,
      });
      res.status(201).json(project);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res
          .status(400)
          .json({ message: "Invalid project data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create project" });
    }
  });

  app.put("/api/projects/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    const projectId = parseInt(req.params.id);
    if (isNaN(projectId)) {
      return res.status(400).json({ message: "Invalid project ID" });
    }

    try {
      const project = await storage.getProject(projectId);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      // Check if user is the manager of the project or an admin
      if (project.managerId !== req.user?.id && req.user?.role !== "admin") {
        return res
          .status(403)
          .json({ message: "Not authorized to update this project" });
      }

      const updatedProject = await storage.updateProject(projectId, req.body);
      res.json(updatedProject);
    } catch (error) {
      res.status(500).json({ message: "Failed to update project" });
    }
  });

  // Tasks API
  app.get("/api/tasks", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      // If user is an employee, get only their assigned tasks
      if (req.user?.role === "employee") {
        const tasks = await storage.getTasksByAssignee(req.user.id);
        return res.json(tasks);
      }

      // If manager, get tasks for their projects
      if (req.user?.role === "manager") {
        const projects = await storage.getProjectsByManager(req.user.id);
        const projectIds = projects.map((p) => p.id);

        let managerTasks: Task[] = [];
        for (const projectId of projectIds) {
          const tasks = await storage.getTasksByProject(projectId);
          managerTasks = [...managerTasks, ...tasks];
        }

        return res.json(managerTasks);
      }

      // If admin, get all tasks
      const tasks = await storage.getTasks();
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tasks" });
    }
  });

  app.post("/api/tasks", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      const taskData = insertTaskSchema.parse(req.body);

      // Employee can only create tasks for themselves (self-assigned tasks)
      if (req.user?.role === "employee") {
        // Force assigneeId to be the employee's own ID
        taskData.assigneeId = req.user.id;

        // Employees can't assign tasks to projects unless they're specified as part of the project
        if (taskData.projectId) {
          // Here we could check if the employee is part of the project team
          // For now, we'll just allow it as we don't have a project-team relationship
        }
      }
      // Manager can only create tasks for their own projects
      else if (req.user?.role === "manager" && taskData.projectId) {
        const project = await storage.getProject(taskData.projectId);
        if (!project || project.managerId !== req.user.id) {
          return res
            .status(403)
            .json({ message: "Not authorized to add tasks to this project" });
        }
      }

      const task = await storage.createTask(taskData);
      res.status(201).json(task);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res
          .status(400)
          .json({ message: "Invalid task data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create task" });
    }
  });

  app.put("/api/tasks/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    const taskId = parseInt(req.params.id);
    if (isNaN(taskId)) {
      return res.status(400).json({ message: "Invalid task ID" });
    }

    try {
      const task = await storage.getTask(taskId);
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }

      // Employees can only update their own assigned tasks' status
      if (req.user?.role === "employee") {
        if (task.assigneeId !== req.user.id) {
          return res
            .status(403)
            .json({ message: "Not authorized to update this task" });
        }

        // Employees can only update the status of the task
        const updatedTask = await storage.updateTask(taskId, {
          status: req.body.status,
        });
        return res.json(updatedTask);
      }

      // Managers can update tasks for their projects
      if (req.user?.role === "manager" && task.projectId) {
        const project = await storage.getProject(task.projectId);
        if (!project || project.managerId !== req.user.id) {
          return res
            .status(403)
            .json({ message: "Not authorized to update this task" });
        }
      }

      const updatedTask = await storage.updateTask(taskId, req.body);
      res.json(updatedTask);
    } catch (error) {
      res.status(500).json({ message: "Failed to update task" });
    }
  });

  // Time Tracking API
  app.get("/api/time-entries", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      // If user is an employee, get only their time entries
      if (req.user?.role === "employee") {
        const timeEntries = await storage.getTimeEntriesByUser(req.user.id);
        return res.json(timeEntries);
      }

      // If manager, get all time entries for employees they manage
      if (req.user?.role === "manager") {
        // Get projects managed by the manager
        const projects = await storage.getProjectsByManager(req.user.id);

        // Get all tasks for these projects
        let assigneeIds = new Set<number>();
        for (const project of projects) {
          const tasks = await storage.getTasksByProject(project.id);
          tasks.forEach((task) => {
            if (task.assigneeId) assigneeIds.add(task.assigneeId);
          });
        }

        // Get time entries for these assignees
        let managerTimeEntries: TimeEntry[] = [];
        // Convert Set to Array for iteration
        for (const assigneeId of Array.from(assigneeIds)) {
          const entries = await storage.getTimeEntriesByUser(assigneeId);
          managerTimeEntries = [...managerTimeEntries, ...entries];
        }

        return res.json(managerTimeEntries);
      }

      // If admin, get all time entries
      const timeEntries = await storage.getTimeEntries();
      res.json(timeEntries);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch time entries" });
    }
  });

  app.get("/api/time-entries/current", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      const currentEntry = await storage.getCurrentTimeEntry(req.user!.id);
      res.json(currentEntry || null);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch current time entry" });
    }
  });

  app.post("/api/time-entries/clock-in", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      // Check if the user already has an active time entry
      const currentEntry = await storage.getCurrentTimeEntry(req.user!.id);
      if (currentEntry) {
        return res.status(400).json({ message: "You are already clocked in" });
      }

      const timeEntry = await storage.createTimeEntry({
        userId: req.user!.id,
        clockIn: new Date(),
        status: "in_progress",
      });

      res.status(201).json(timeEntry);
    } catch (error) {
      res.status(500).json({ message: "Failed to clock in" });
    }
  });

  app.post("/api/time-entries/clock-out", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      // Find the current active time entry
      const currentEntry = await storage.getCurrentTimeEntry(req.user!.id);
      if (!currentEntry) {
        return res.status(400).json({ message: "You are not clocked in" });
      }

      if (currentEntry.status === "completed") {
        return res
          .status(400)
          .json({ message: "This time entry is already completed" });
      }

      const clockOut = new Date();
      const clockInTime = new Date(currentEntry.clockIn).getTime();
      const clockOutTime = clockOut.getTime();

      // Calculate hours worked (milliseconds to hours)
      const totalHours =
        Math.round(((clockOutTime - clockInTime) / (1000 * 60 * 60)) * 100) /
        100;

      const updatedEntry = await storage.updateTimeEntry(currentEntry.id, {
        clockOut,
        totalHours,
        status: "completed",
        notes: req.body.notes || "",
      });

      if (!updatedEntry) {
        throw new Error("Failed to update time entry");
      }

      res.json(updatedEntry);
    } catch (error) {
      console.error("Clock out error:", error);
      res
        .status(500)
        .json({ message: "Failed to clock out: " + (error as Error).message });
    }
  });

  // Users API - for admin and manager use
  app.get("/api/users", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    if (req.user?.role === "employee") {
      return res.status(403).json({ message: "Not authorized to view users" });
    }

    try {
      // For managers, return only employees
      if (req.user?.role === "manager") {
        const employees = await storage.getUsersByRole("employee");
        return res.json(employees);
      }

      // For admins, return all users
      const users = await storage.getUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  // Leave Requests API
  app.get("/api/leave-requests", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      // If user is an employee, get only their leave requests
      if (req.user?.role === "employee") {
        const leaveRequests = await storage.getLeaveRequestsByUser(req.user.id);
        return res.json(leaveRequests);
      }

      // Managers and admins can see all pending requests
      if (req.user?.role === "manager" || req.user?.role === "admin") {
        const pendingRequests = await storage.getPendingLeaveRequests();
        return res.json(pendingRequests);
      }

      // Default case should not be reached
      res.status(403).json({ message: "Unauthorized" });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch leave requests" });
    }
  });

  app.post("/api/leave-requests", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      const leaveRequestData = insertLeaveRequestSchema.parse(req.body);

      // User can only submit leave requests for themselves
      const leaveRequest = await storage.createLeaveRequest({
        ...leaveRequestData,
        userId: req.user!.id,
        status: "pending", // Always start with pending status
      });

      res.status(201).json(leaveRequest);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: "Invalid leave request data",
          errors: error.errors,
        });
      }
      res.status(500).json({ message: "Failed to create leave request" });
    }
  });

  app.put("/api/leave-requests/:id", async (req, res) => {
    // if (!req.isAuthenticated()) return res.sendStatus(401);

    const leaveRequestId = parseInt(req.params.id);
    if (isNaN(leaveRequestId)) {
      return res.status(400).json({ message: "Invalid leave request ID" });
    }

    try {
      const leaveRequest = await storage.getLeaveRequest(leaveRequestId);
      if (!leaveRequest) {
        return res.status(404).json({ message: "Leave request not found" });
      }

      // Employees can only cancel their own pending leave requests
      if (req.user?.role === "employee") {
        if (leaveRequest.userId !== req.user.id) {
          return res
            .status(403)
            .json({ message: "Not authorized to update this leave request" });
        }

        if (leaveRequest.status !== "pending") {
          return res
            .status(400)
            .json({ message: "Only pending leave requests can be canceled" });
        }

        // Employee can only cancel their leave request
        if (req.body.status !== "cancelled") {
          return res
            .status(400)
            .json({ message: "Employees can only cancel leave requests" });
        }

        const updatedLeaveRequest = await storage.updateLeaveRequest(
          leaveRequestId,
          {
            status: "cancelled",
          }
        );
        return res.json(updatedLeaveRequest);
      }

      // Managers and admins can approve or reject leave requests
      if (req.user?.role === "manager" || req.user?.role === "admin") {
        if (leaveRequest.status !== "pending") {
          return res
            .status(400)
            .json({ message: "Only pending leave requests can be processed" });
        }

        if (req.body.status !== "approved" && req.body.status !== "rejected") {
          return res
            .status(400)
            .json({ message: "Status must be 'approved' or 'rejected'" });
        }

        const updatedLeaveRequest = await storage.updateLeaveRequest(
          leaveRequestId,
          {
            status: req.body.status,
            reviewerId: req.user.id,
            reviewedOn: new Date(),
            comments: req.body.comments || null,
          }
        );
        return res.json(updatedLeaveRequest);
      }

      res
        .status(403)
        .json({ message: "Not authorized to update leave requests" });
    } catch (error) {
      res.status(500).json({ message: "Failed to update leave request" });
    }
  });

  // For managers to see all leave requests
  app.get("/api/leave-requests/all", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    if (req.user?.role !== "manager" && req.user?.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Not authorized to view all leave requests" });
    }

    try {
      const leaveRequests = await storage.getLeaveRequests();
      res.json(leaveRequests);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch leave requests" });
    }
  });

  return httpServer;
}

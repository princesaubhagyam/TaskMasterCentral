import {
  User,
  InsertUser,
  Project,
  InsertProject,
  Task,
  InsertTask,
  TimeEntry,
  InsertTimeEntry,
  LeaveRequest,
  InsertLeaveRequest,
  users,
  projects,
  tasks,
  timeEntries,
  leaveRequests,
} from "@shared/schema";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { db, pool } from "./db";
import { eq, and, isNull } from "drizzle-orm";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";
import { IStorage } from "./storage";

const PostgresSessionStore = connectPg(session);
const scryptAsync = promisify(scrypt);

// Helper function to hash passwords
async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

export class DatabaseStorage implements IStorage {
  sessionStore: any; // Using any to avoid type errors with express-session

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true,
      tableName: "sessions",
    });
  }

  // async setupDatabase(): Promise<void> {
  //   // Add seed users if they don't exist
  //   const adminUser = await this.getUserByUsername("admin");
  //   if (!adminUser) {
  //     await this.createUser({
  //       username: "admin",
  //       password: await hashPassword("admin123"),
  //       name: "Admin User",
  //       email: "admin@example.com",
  //       role: "admin",
  //       department: "Administration",
  //     });
  //   }

  //   const managerUser = await this.getUserByUsername("manager");
  //   if (!managerUser) {
  //     await this.createUser({
  //       username: "manager",
  //       password: await hashPassword("manager123"),
  //       name: "Manager User",
  //       email: "manager@example.com",
  //       role: "manager",
  //       department: "Engineering",
  //     });
  //   }

  //   const employeeUser = await this.getUserByUsername("employee");
  //   if (!employeeUser) {
  //     await this.createUser({
  //       username: "employee",
  //       password: await hashPassword("employee123"),
  //       name: "Employee User",
  //       email: "employee@example.com",
  //       role: "employee",
  //       department: "Engineering",
  //     });
  //   }

  //   // Create sample projects if they don't exist
  //   const allProjects = await this.getProjects();
  //   if (allProjects.length === 0) {
  //     const manager = await this.getUserByUsername("manager");
  //     if (manager) {
  //       await this.createProject({
  //         name: "ERP System Upgrade",
  //         description: "Upgrade the existing ERP system to the latest version",
  //         deadline: new Date("2023-12-31"),
  //         status: "in_progress",
  //         managerId: manager.id,
  //       });

  //       await this.createProject({
  //         name: "Mobile App Development",
  //         description: "Develop a mobile application for clients",
  //         deadline: new Date("2023-10-15"),
  //         status: "in_progress",
  //         managerId: manager.id,
  //       });
  //     }
  //   }

  //   // Create sample tasks if they don't exist
  //   const allTasks = await this.getTasks();
  //   if (allTasks.length === 0) {
  //     const employee = await this.getUserByUsername("employee");
  //     const projects = await this.getProjects();

  //     if (employee && projects.length >= 2) {
  //       await this.createTask({
  //         title: "Update API documentation",
  //         description: "Document all API endpoints for the ERP system",
  //         projectId: projects[0].id,
  //         assigneeId: employee.id,
  //         status: "in_progress",
  //         priority: "high",
  //         dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Due tomorrow
  //       });

  //       await this.createTask({
  //         title: "Fix login page validation",
  //         description: "Fix validation issues on the login page",
  //         projectId: projects[1].id,
  //         assigneeId: employee.id,
  //         status: "not_started",
  //         priority: "medium",
  //         dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // Due in 2 days
  //       });

  //       await this.createTask({
  //         title: "Submit weekly status report",
  //         description: "Create and submit the weekly status report",
  //         assigneeId: employee.id,
  //         status: "not_started",
  //         priority: "low",
  //         dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // Due in 3 days
  //       });
  //     }
  //   }
  // }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, username));
    return user;
  }

  async updateUserProfile(
    username: string,
    updateData: Partial<User>
  ): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.username, username))
      .returning(); // Optionally, return the updated user
    // Return the updated user (with updated fields)
    return updatedUser;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getUsers(): Promise<User[]> {
    return db.select().from(users);
  }

  async getUsersByRole(role: string): Promise<User[]> {
    return db.select().from(users).where(eq(users.role, role));
  }

  // Project operations
  async getProject(id: number): Promise<Project | undefined> {
    const [project] = await db
      .select()
      .from(projects)
      .where(eq(projects.id, id));
    return project;
  }

  async getProjects(): Promise<Project[]> {
    return db.select().from(projects);
  }

  async getProjectsByManager(managerId: number): Promise<Project[]> {
    return db.select().from(projects).where(eq(projects.managerId, managerId));
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const [project] = await db
      .insert(projects)
      .values(insertProject)
      .returning();
    return project;
  }

  async updateProject(
    id: number,
    project: Partial<Project>
  ): Promise<Project | undefined> {
    const [updatedProject] = await db
      .update(projects)
      .set(project)
      .where(eq(projects.id, id))
      .returning();
    return updatedProject;
  }

  // Task operations
  async getTask(id: number): Promise<Task | undefined> {
    const [task] = await db.select().from(tasks).where(eq(tasks.id, id));
    return task;
  }

  async getTasks(): Promise<Task[]> {
    return db.select().from(tasks);
  }

  async getTasksByProject(projectId: number): Promise<Task[]> {
    return db.select().from(tasks).where(eq(tasks.projectId, projectId));
  }

  async getTasksByAssignee(assigneeId: number): Promise<Task[]> {
    return db.select().from(tasks).where(eq(tasks.assigneeId, assigneeId));
  }

  async createTask(insertTask: InsertTask): Promise<Task> {
    const [task] = await db.insert(tasks).values(insertTask).returning();
    return task;
  }

  async updateTask(id: number, task: Partial<Task>): Promise<Task | undefined> {
    const [updatedTask] = await db
      .update(tasks)
      .set(task)
      .where(eq(tasks.id, id))
      .returning();
    return updatedTask;
  }

  // Time entry operations
  async getTimeEntry(id: number): Promise<TimeEntry | undefined> {
    const [entry] = await db
      .select()
      .from(timeEntries)
      .where(eq(timeEntries.id, id));
    return entry;
  }

  async getTimeEntries(): Promise<TimeEntry[]> {
    return db.select().from(timeEntries);
  }

  async getTimeEntriesByUser(userId: number): Promise<TimeEntry[]> {
    return db
      .select()
      .from(timeEntries)
      .where(eq(timeEntries.userId, userId))
      .orderBy(timeEntries.clockIn);
  }

  async getCurrentTimeEntry(userId: number): Promise<TimeEntry | undefined> {
    const [entry] = await db
      .select()
      .from(timeEntries)
      .where(
        and(
          eq(timeEntries.userId, userId),
          eq(timeEntries.status, "in_progress")
        )
      );
    return entry;
  }

  async createTimeEntry(insertTimeEntry: InsertTimeEntry): Promise<TimeEntry> {
    const [entry] = await db
      .insert(timeEntries)
      .values(insertTimeEntry)
      .returning();
    return entry;
  }

  async updateTimeEntry(
    id: number,
    timeEntry: Partial<TimeEntry>
  ): Promise<TimeEntry | undefined> {
    const [updatedEntry] = await db
      .update(timeEntries)
      .set(timeEntry)
      .where(eq(timeEntries.id, id))
      .returning();
    return updatedEntry;
  }

  // Leave request operations
  async getLeaveRequest(id: number): Promise<LeaveRequest | undefined> {
    const [request] = await db
      .select()
      .from(leaveRequests)
      .where(eq(leaveRequests.id, id));
    return request;
  }

  async getLeaveRequests(): Promise<LeaveRequest[]> {
    return db.select().from(leaveRequests);
  }

  async getLeaveRequestsByUser(userId: number): Promise<LeaveRequest[]> {
    return db
      .select()
      .from(leaveRequests)
      .where(eq(leaveRequests.userId, userId))
      .orderBy(leaveRequests.requestedOn);
  }

  async getLeaveRequestsByStatus(status: string): Promise<LeaveRequest[]> {
    return db
      .select()
      .from(leaveRequests)
      .where(eq(leaveRequests.status, status))
      .orderBy(leaveRequests.requestedOn);
  }

  async getPendingLeaveRequests(): Promise<LeaveRequest[]> {
    return this.getLeaveRequestsByStatus("pending");
  }

  async createLeaveRequest(
    insertLeaveRequest: InsertLeaveRequest
  ): Promise<LeaveRequest> {
    const [request] = await db
      .insert(leaveRequests)
      .values({
        ...insertLeaveRequest,
        requestedOn: new Date(),
      })
      .returning();
    return request;
  }

  async updateLeaveRequest(
    id: number,
    leaveRequest: Partial<LeaveRequest>
  ): Promise<LeaveRequest | undefined> {
    const [updatedRequest] = await db
      .update(leaveRequests)
      .set(leaveRequest)
      .where(eq(leaveRequests.id, id))
      .returning();
    return updatedRequest;
  }
}

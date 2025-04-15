import { 
  User, InsertUser, 
  Project, InsertProject, 
  Task, InsertTask, 
  TimeEntry, InsertTimeEntry 
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getUsers(): Promise<User[]>;
  getUsersByRole(role: string): Promise<User[]>;
  
  // Project operations
  getProject(id: number): Promise<Project | undefined>;
  getProjects(): Promise<Project[]>;
  getProjectsByManager(managerId: number): Promise<Project[]>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: number, project: Partial<Project>): Promise<Project | undefined>;
  
  // Task operations
  getTask(id: number): Promise<Task | undefined>;
  getTasks(): Promise<Task[]>;
  getTasksByProject(projectId: number): Promise<Task[]>;
  getTasksByAssignee(assigneeId: number): Promise<Task[]>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: number, task: Partial<Task>): Promise<Task | undefined>;
  
  // Time entry operations
  getTimeEntry(id: number): Promise<TimeEntry | undefined>;
  getTimeEntries(): Promise<TimeEntry[]>;
  getTimeEntriesByUser(userId: number): Promise<TimeEntry[]>;
  getCurrentTimeEntry(userId: number): Promise<TimeEntry | undefined>;
  createTimeEntry(timeEntry: InsertTimeEntry): Promise<TimeEntry>;
  updateTimeEntry(id: number, timeEntry: Partial<TimeEntry>): Promise<TimeEntry | undefined>;
  
  // Session storage
  sessionStore: session.SessionStore;
}

// In-memory implementation of the storage interface
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private projects: Map<number, Project>;
  private tasks: Map<number, Task>;
  private timeEntries: Map<number, TimeEntry>;
  
  sessionStore: session.SessionStore;
  
  // Auto-increment IDs
  private userId: number;
  private projectId: number;
  private taskId: number;
  private timeEntryId: number;
  
  constructor() {
    this.users = new Map();
    this.projects = new Map();
    this.tasks = new Map();
    this.timeEntries = new Map();
    
    this.userId = 1;
    this.projectId = 1;
    this.taskId = 1;
    this.timeEntryId = 1;
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    });
    
    // Create initial admin user
    this.createUser({
      username: "admin",
      password: "admin123", // This will be hashed in the auth.ts file
      name: "Admin User",
      email: "admin@example.com",
      role: "admin",
      department: "Administration",
    });
    
    // Create a manager
    this.createUser({
      username: "manager",
      password: "manager123", // This will be hashed in the auth.ts file
      name: "Manager User",
      email: "manager@example.com",
      role: "manager",
      department: "Engineering",
    });
    
    // Create an employee
    this.createUser({
      username: "employee",
      password: "employee123", // This will be hashed in the auth.ts file
      name: "Employee User",
      email: "employee@example.com",
      role: "employee",
      department: "Engineering",
    });
    
    // Create sample projects
    const project1 = this.createProject({
      name: "ERP System Upgrade",
      description: "Upgrade the existing ERP system to the latest version",
      deadline: new Date("2023-12-31"),
      status: "in_progress",
      managerId: 2, // Manager user
    });
    
    const project2 = this.createProject({
      name: "Mobile App Development",
      description: "Develop a mobile application for clients",
      deadline: new Date("2023-10-15"),
      status: "in_progress",
      managerId: 2, // Manager user
    });
    
    // Create sample tasks
    this.createTask({
      title: "Update API documentation",
      description: "Document all API endpoints for the ERP system",
      projectId: 1,
      assigneeId: 3, // Employee user
      status: "in_progress",
      priority: "high",
      dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Due tomorrow
    });
    
    this.createTask({
      title: "Fix login page validation",
      description: "Fix validation issues on the login page",
      projectId: 2,
      assigneeId: 3, // Employee user
      status: "not_started",
      priority: "medium",
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // Due in 2 days
    });
    
    this.createTask({
      title: "Submit weekly status report",
      description: "Create and submit the weekly status report",
      assigneeId: 3, // Employee user
      status: "not_started",
      priority: "low",
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // Due in 3 days
    });
  }
  
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  async getUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }
  
  async getUsersByRole(role: string): Promise<User[]> {
    return Array.from(this.users.values()).filter(
      (user) => user.role === role,
    );
  }
  
  // Project operations
  async getProject(id: number): Promise<Project | undefined> {
    return this.projects.get(id);
  }
  
  async getProjects(): Promise<Project[]> {
    return Array.from(this.projects.values());
  }
  
  async getProjectsByManager(managerId: number): Promise<Project[]> {
    return Array.from(this.projects.values()).filter(
      (project) => project.managerId === managerId,
    );
  }
  
  async createProject(insertProject: InsertProject): Promise<Project> {
    const id = this.projectId++;
    const project: Project = { ...insertProject, id };
    this.projects.set(id, project);
    return project;
  }
  
  async updateProject(id: number, project: Partial<Project>): Promise<Project | undefined> {
    const existingProject = this.projects.get(id);
    if (!existingProject) return undefined;
    
    const updatedProject = { ...existingProject, ...project };
    this.projects.set(id, updatedProject);
    return updatedProject;
  }
  
  // Task operations
  async getTask(id: number): Promise<Task | undefined> {
    return this.tasks.get(id);
  }
  
  async getTasks(): Promise<Task[]> {
    return Array.from(this.tasks.values());
  }
  
  async getTasksByProject(projectId: number): Promise<Task[]> {
    return Array.from(this.tasks.values()).filter(
      (task) => task.projectId === projectId,
    );
  }
  
  async getTasksByAssignee(assigneeId: number): Promise<Task[]> {
    return Array.from(this.tasks.values()).filter(
      (task) => task.assigneeId === assigneeId,
    );
  }
  
  async createTask(insertTask: InsertTask): Promise<Task> {
    const id = this.taskId++;
    const task: Task = { ...insertTask, id };
    this.tasks.set(id, task);
    return task;
  }
  
  async updateTask(id: number, task: Partial<Task>): Promise<Task | undefined> {
    const existingTask = this.tasks.get(id);
    if (!existingTask) return undefined;
    
    const updatedTask = { ...existingTask, ...task };
    this.tasks.set(id, updatedTask);
    return updatedTask;
  }
  
  // Time entry operations
  async getTimeEntry(id: number): Promise<TimeEntry | undefined> {
    return this.timeEntries.get(id);
  }
  
  async getTimeEntries(): Promise<TimeEntry[]> {
    return Array.from(this.timeEntries.values());
  }
  
  async getTimeEntriesByUser(userId: number): Promise<TimeEntry[]> {
    return Array.from(this.timeEntries.values())
      .filter((entry) => entry.userId === userId)
      .sort((a, b) => new Date(b.clockIn).getTime() - new Date(a.clockIn).getTime());
  }
  
  async getCurrentTimeEntry(userId: number): Promise<TimeEntry | undefined> {
    return Array.from(this.timeEntries.values()).find(
      (entry) => entry.userId === userId && entry.status === "in_progress",
    );
  }
  
  async createTimeEntry(insertTimeEntry: InsertTimeEntry): Promise<TimeEntry> {
    const id = this.timeEntryId++;
    const timeEntry: TimeEntry = { ...insertTimeEntry, id };
    this.timeEntries.set(id, timeEntry);
    return timeEntry;
  }
  
  async updateTimeEntry(id: number, timeEntry: Partial<TimeEntry>): Promise<TimeEntry | undefined> {
    const existingTimeEntry = this.timeEntries.get(id);
    if (!existingTimeEntry) return undefined;
    
    const updatedTimeEntry = { ...existingTimeEntry, ...timeEntry };
    this.timeEntries.set(id, updatedTimeEntry);
    return updatedTimeEntry;
  }
}

export const storage = new MemStorage();

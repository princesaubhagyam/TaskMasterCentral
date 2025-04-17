import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User Model
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  role: text("role").notNull().default("employee"), // "admin", "manager", "employee"
  department: text("department"),
  profile_img: text("profile_img"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  name: true,
  email: true,
  role: true,
  department: true,
  profile_img: true,
});

// Project Model
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  deadline: text("deadline"),
  status: text("status").default("in_progress"), // "not_started", "in_progress", "completed"
  managerId: integer("manager_id").notNull(),
});

export const insertProjectSchema = createInsertSchema(projects).pick({
  name: true,
  description: true,
  deadline: true,
  status: true,
  managerId: true,
});

// Task Model
export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  projectId: integer("project_id"),
  assigneeId: integer("assignee_id"),
  status: text("status").default("not_started"), // "not_started", "in_progress", "completed"
  priority: text("priority").default("medium"), // "low", "medium", "high"
  dueDate: text("due_date"),
});

export const insertTaskSchema = createInsertSchema(tasks).pick({
  title: true,
  description: true,
  projectId: true,
  assigneeId: true,
  status: true,
  priority: true,
  dueDate: true,
});

// Time Entry Model
export const timeEntries = pgTable("time_entries", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  clockIn: timestamp("clock_in").notNull(),
  clockOut: timestamp("clock_out"),
  totalHours: integer("total_hours"),
  breakMinutes: integer("break_minutes").default(0),
  notes: text("notes"),
  status: text("status").default("in_progress"), // "in_progress", "completed"
});

export const insertTimeEntrySchema = createInsertSchema(timeEntries).pick({
  userId: true,
  clockIn: true,
  clockOut: true,
  totalHours: true,
  breakMinutes: true,
  notes: true,
  status: true,
});

// Leave Request Model
export const leaveRequests = pgTable("leave_requests", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  type: text("type").notNull(), // "annual", "sick", "unpaid", "bereavement", "maternity", "paternity"
  startDate: text("start_date").notNull(),
  endDate: text("end_date").notNull(),
  reason: text("reason"),
  status: text("status").default("pending"), // "pending", "approved", "rejected", "cancelled"
  requestedOn: timestamp("requested_on").notNull().defaultNow(),
  reviewedOn: timestamp("reviewed_on"),
  reviewerId: integer("reviewer_id"),
  comments: text("comments"),
});

export const insertLeaveRequestSchema = createInsertSchema(leaveRequests).pick({
  userId: true,
  type: true,
  startDate: true,
  endDate: true,
  reason: true,
  status: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;

export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;

export type TimeEntry = typeof timeEntries.$inferSelect;
export type InsertTimeEntry = z.infer<typeof insertTimeEntrySchema>;

export type LeaveRequest = typeof leaveRequests.$inferSelect;
export type InsertLeaveRequest = z.infer<typeof insertLeaveRequestSchema>;

// Extended schemas for frontend validation
export const loginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = insertUserSchema
  .extend({
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z
      .string()
      .min(6, "Password must be at least 6 characters"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });
export interface UpdateProfileData {
  name: string;
  email: string;
  username: string;
  department: string;
  profile_img: string;
  newPassword: string | null;
}

export type LoginData = z.infer<typeof loginSchema>;
export type RegisterData = z.infer<typeof registerSchema>;

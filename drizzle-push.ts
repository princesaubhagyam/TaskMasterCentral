import { db } from "./server/db";
import * as schema from "./shared/schema";

async function main() {
  try {
    // Create tables with foreign key relationships
    await db.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        role TEXT NOT NULL DEFAULT 'employee',
        department TEXT,
        profile_img TEXT
      );

      CREATE TABLE IF NOT EXISTS projects (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        deadline TEXT,
        status TEXT DEFAULT 'in_progress',
        manager_id INTEGER NOT NULL,
        FOREIGN KEY (manager_id) REFERENCES users(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS tasks (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        project_id INTEGER,
        assignee_id INTEGER,
        status TEXT DEFAULT 'not_started',
        priority TEXT DEFAULT 'medium',
        due_date TEXT,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
        FOREIGN KEY (assignee_id) REFERENCES users(id) ON DELETE SET NULL
      );

      CREATE TABLE IF NOT EXISTS time_entries (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        clock_in TIMESTAMP NOT NULL,
        clock_out TIMESTAMP,
        total_hours TEXT,
        break_minutes INTEGER DEFAULT 0,
        notes TEXT,
        status TEXT DEFAULT 'in_progress',
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS leave_requests (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        type TEXT NOT NULL,
        start_date TEXT NOT NULL,
        end_date TEXT NOT NULL,
        reason TEXT,
        status TEXT DEFAULT 'pending',
        requested_on TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        reviewed_on TIMESTAMP,
        reviewer_id INTEGER,
        comments TEXT,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE SET NULL
      );
    `);
    console.log("Migration successful");
  } catch (error) {
    console.error("Migration failed:", error);
  }
}

main();

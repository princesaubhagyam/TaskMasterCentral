import { db } from "./server/db";
import * as schema from "./shared/schema";

async function main() {
  try {
    // Use db with the schema for introspection
    const result = await db.execute("CREATE TABLE IF NOT EXISTS leave_requests (id SERIAL PRIMARY KEY, type TEXT NOT NULL, user_id INTEGER NOT NULL, start_date TIMESTAMP NOT NULL, end_date TIMESTAMP NOT NULL, reason TEXT, status TEXT NOT NULL, requested_on TIMESTAMP NOT NULL, reviewed_on TIMESTAMP, reviewer_id INTEGER, comments TEXT);");
    console.log("Migration successful");
  } catch (error) {
    console.error("Migration failed:", error);
  }
}

main();
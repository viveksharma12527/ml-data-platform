import { db } from "./db";
import { sql } from "drizzle-orm";
import { pgTable, text, varchar } from "drizzle-orm/pg-core";

// New table schema
export const tests = pgTable("tests", {
  id: varchar("id").primaryKey(),
  name: text("name").notNull(),
});

async function main() {
  try {
    // Create the table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS tests (
        id VARCHAR PRIMARY KEY,
        name TEXT NOT NULL
      );
    `);

    console.log("Table 'tests' created successfully.");

    // Insert a value
    await db.insert(tests).values({ id: "1", name: "Test Name" });

    console.log("Value inserted successfully.");

    // Query the table
    const result = await db.select().from(tests);
    console.log("Query result:", result);

    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

main();
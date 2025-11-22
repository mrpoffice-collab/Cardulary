import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

// Create connection only if DATABASE_URL is available
// This allows the build to succeed without runtime env vars
function createConnection() {
  if (!process.env.DATABASE_URL) {
    // Return a dummy connection during build time
    return null;
  }
  const sql = neon(process.env.DATABASE_URL);
  return drizzle(sql, { schema });
}

export const db = createConnection() as ReturnType<typeof drizzle<typeof schema>>;

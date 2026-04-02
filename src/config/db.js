import { drizzle } from "drizzle-orm/node-postgres";
import pkg from "pg";
const { Pool } = pkg;
import { ENV } from "./env.js";

// Connection to your local PostgreSQL
const pool = new Pool({
  connectionString: ENV.DATABASE_URL,
});

export const db = drizzle(pool);

console.log("Database Bridge Connected");
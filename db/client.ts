import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";
console.log(
  "DATABASE_URL:",
  process.env.DATABASE_URL
    ? "DATABASE_URL exists"
    : "DATABASE_URL is missing"
);
const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql, { schema });
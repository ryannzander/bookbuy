import dotenv from "dotenv";

// Load .env then .env.local so Prisma CLI sees DATABASE_URL (.env.local overrides)
dotenv.config();
dotenv.config({ path: ".env.local" });
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Use direct connection for CLI (avoids pooler "prepared statement already exists" errors)
    url: process.env.DIRECT_DATABASE_URL ?? env("DATABASE_URL"),
  },
});

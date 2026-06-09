import path from "node:path";
import { fileURLToPath } from "node:url";

import { config } from "dotenv";

const adminDir = path.dirname(fileURLToPath(import.meta.url));
// src/lib → admin app → apps → monorepo root
const repoRoot = path.resolve(adminDir, "../../../..");

config({ path: path.resolve(repoRoot, ".env") });

const databaseUrl = process.env.DATABASE_URL;
if (databaseUrl?.startsWith("file:")) {
  const filePath = databaseUrl.slice("file:".length);
  if (filePath && !path.isAbsolute(filePath)) {
    process.env.DATABASE_URL = `file:${path.resolve(repoRoot, filePath)}`;
  }
}

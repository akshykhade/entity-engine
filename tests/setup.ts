import { mkdir, unlink } from "node:fs/promises";
import { join } from "node:path";
import { afterAll, beforeAll } from "bun:test";
import dotenv from "dotenv";

const testsDir = import.meta.dir;
const repoRoot = join(testsDir, "..");
const serverDir = join(repoRoot, "apps/server");

const setupState = {
  started: false,
  serverProc: null as ReturnType<typeof Bun.spawn> | null,
};

function loadTestEnv(): void {
  dotenv.config({ path: join(testsDir, ".env.test") });

  const dbFile = join(testsDir, ".data", "test.sqlite");
  process.env.DATABASE_URL = `file:${dbFile}`;
  process.env.NODE_ENV = "test";
}

async function pushSchema(dbFile: string): Promise<void> {
  try {
    await unlink(dbFile);
  } catch {
    // fresh database for each test run
  }

  const proc = Bun.spawn({
    cmd: ["bunx", "drizzle-kit", "push"],
    cwd: join(repoRoot, "packages/db"),
    env: {
      ...process.env,
      DATABASE_URL: `file:${dbFile}`,
    } as Record<string, string>,
    stdout: "inherit",
    stderr: "inherit",
  });

  const code = await proc.exited;
  if (code !== 0) {
    throw new Error(`drizzle-kit push failed with exit code ${code}`);
  }
}

async function runSeed(dbFile: string): Promise<void> {
  const proc = Bun.spawn({
    cmd: ["bun", "run", "src/seed.ts"],
    cwd: join(repoRoot, "packages/db"),
    env: {
      ...process.env,
      DATABASE_URL: `file:${dbFile}`,
    } as Record<string, string>,
    stdout: "inherit",
    stderr: "inherit",
  });

  const code = await proc.exited;
  if (code !== 0) {
    throw new Error(`db seed failed with exit code ${code}`);
  }
}

async function waitForServer(baseUrl: string, timeoutMs = 30_000): Promise<void> {
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    try {
      const res = await fetch(`${baseUrl}/`);
      if (res.ok) {
        return;
      }
    } catch {
      // retry until timeout
    }
    await Bun.sleep(200);
  }

  const stderr = setupState.serverProc
    ? await new Response(setupState.serverProc.stderr).text()
    : "";
  throw new Error(
    `Server did not become ready at ${baseUrl}/ within ${timeoutMs}ms\n${stderr}`,
  );
}

beforeAll(async () => {
  if (setupState.started) {
    return;
  }
  setupState.started = true;

  loadTestEnv();
  await mkdir(join(testsDir, ".data"), { recursive: true });

  const dbFile = join(testsDir, ".data", "test.sqlite");
  await pushSchema(dbFile);
  await runSeed(dbFile);

  setupState.serverProc = Bun.spawn({
    cmd: ["bun", "run", "src/index.ts"],
    cwd: serverDir,
    env: process.env as Record<string, string>,
    stdout: "pipe",
    stderr: "pipe",
  });

  const port = process.env.PORT ?? "3099";
  const host = process.env.HOST ?? "127.0.0.1";
  await waitForServer(`http://${host}:${port}`);
}, 60_000);

afterAll(async () => {
  if (setupState.serverProc) {
    setupState.serverProc.kill();
    await setupState.serverProc.exited;
    setupState.serverProc = null;
  }
});

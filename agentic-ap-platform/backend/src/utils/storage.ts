import fs from "fs";
import path from "path";

/**
 * Resolve persistent JSON directory.
 * - DATA_DIR env wins (Docker)
 * - Otherwise backend/data, whether running from src/ or dist/
 */
function resolveDataDir(): string {
  if (process.env.DATA_DIR) return process.env.DATA_DIR;

  const fromUtils = path.resolve(__dirname, "..", "..", "data");
  if (fs.existsSync(fromUtils) || path.basename(path.resolve(__dirname, "..")) === "src") {
    return fromUtils;
  }
  // Fallback: cwd/data (npm scripts run from backend/)
  return path.join(process.cwd(), "data");
}

const DATA_DIR = resolveDataDir();

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

export function readJsonFile<T>(filename: string, fallback: T): T {
  ensureDataDir();
  const filePath = path.join(DATA_DIR, filename);
  if (!fs.existsSync(filePath)) {
    writeJsonFile(filename, fallback);
    return fallback;
  }
  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeJsonFile<T>(filename: string, data: T): void {
  ensureDataDir();
  const filePath = path.join(DATA_DIR, filename);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
}

export function getDataDir(): string {
  ensureDataDir();
  return DATA_DIR;
}

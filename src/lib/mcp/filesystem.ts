import { promises as fs } from "fs";
import * as syncFs from "fs";
import * as path from "path";

/**
 * Filesystem-Edu Service
 * Implements the filesystem-edu tool specification from GRADEMASTER007/ai-tutor-mcp-hub.
 * Reads and writes student data, lesson files, and study notes using Node.js fs/promises.
 * Resolves paths relative to the configured MCP_FILESYSTEM_DIR environment variable.
 */

export interface StudentFileMetadata {
  filename: string;
  relativePath: string;
  sizeBytes: number;
  lastModified: string;
  category?: string;
}

export interface StudentFileResult<T = string> {
  success: boolean;
  relativePath: string;
  data?: T;
  error?: string;
}

/**
 * Get the target base directory from MCP_FILESYSTEM_DIR or default to ./data/filesystem_edu
 */
export function getFilesystemBaseDir(): string {
  const envDir = process.env.MCP_FILESYSTEM_DIR || "./data/filesystem_edu";
  // Always resolve relative to current working directory (project root)
  const resolvedDir = path.isAbsolute(envDir)
    ? envDir
    : path.resolve(process.cwd(), envDir);

  if (!syncFs.existsSync(resolvedDir)) {
    try {
      syncFs.mkdirSync(resolvedDir, { recursive: true });
    } catch (err) {
      console.warn("[filesystem-edu] Error creating base storage directory:", err);
    }
  }

  return resolvedDir;
}

/**
 * Sanitizes and resolves a relative path within the MCP_FILESYSTEM_DIR boundary.
 * Prevents directory traversal attacks (e.g. ../../etc/passwd)
 */
export function resolveSafeRelativePath(userRelativePath: string): { fullPath: string; safeRelativePath: string } {
  const baseDir = getFilesystemBaseDir();
  // Normalize and remove leading slashes/traversal attempts
  const normalizedUserPath = path.normalize(userRelativePath)
    .replace(/^(\.\.[\/\\])+/, "")
    .replace(/^[\/\\]+/, "");

  const fullPath = path.resolve(baseDir, normalizedUserPath);

  // Ensure resolved path is strictly within the base directory
  if (!fullPath.startsWith(baseDir)) {
    throw new Error(`[filesystem-edu] Security Error: Path '${userRelativePath}' attempts to traverse outside storage boundary.`);
  }

  const safeRelativePath = path.relative(baseDir, fullPath) || ".";
  return { fullPath, safeRelativePath };
}

/**
 * Writes student data or lesson content to a file relative to MCP_FILESYSTEM_DIR using fs/promises
 */
export async function writeStudentData(
  relativePath: string,
  content: string | Record<string, any>,
  options?: { category?: string }
): Promise<StudentFileResult<string>> {
  try {
    const { fullPath, safeRelativePath } = resolveSafeRelativePath(relativePath);
    const parentDir = path.dirname(fullPath);

    await fs.mkdir(parentDir, { recursive: true });

    const payload = typeof content === "object" ? JSON.stringify(content, null, 2) : content;
    await fs.writeFile(fullPath, payload, "utf-8");

    return {
      success: true,
      relativePath: safeRelativePath,
      data: payload
    };
  } catch (err: any) {
    console.error("[filesystem-edu] Failed to write student data:", err);
    return {
      success: false,
      relativePath,
      error: err?.message || "Failed writing file"
    };
  }
}

/**
 * Reads student data or lesson content from a file relative to MCP_FILESYSTEM_DIR using fs/promises
 */
export async function readStudentData<T = string>(
  relativePath: string,
  parseJson = false
): Promise<StudentFileResult<T>> {
  try {
    const { fullPath, safeRelativePath } = resolveSafeRelativePath(relativePath);

    try {
      await fs.access(fullPath);
    } catch {
      return {
        success: false,
        relativePath: safeRelativePath,
        error: `File '${safeRelativePath}' does not exist.`
      };
    }

    const rawContent = await fs.readFile(fullPath, "utf-8");
    const data = parseJson ? (JSON.parse(rawContent) as T) : (rawContent as unknown as T);

    return {
      success: true,
      relativePath: safeRelativePath,
      data
    };
  } catch (err: any) {
    console.error("[filesystem-edu] Failed to read student data:", err);
    return {
      success: false,
      relativePath,
      error: err?.message || "Failed reading file"
    };
  }
}

/**
 * Lists all student files inside MCP_FILESYSTEM_DIR (or subfolder) using fs/promises
 */
export async function listStudentDataFiles(subDirectory = ""): Promise<StudentFileMetadata[]> {
  try {
    const { fullPath: targetDir } = resolveSafeRelativePath(subDirectory);
    const baseDir = getFilesystemBaseDir();

    try {
      await fs.access(targetDir);
    } catch {
      return [];
    }

    const results: StudentFileMetadata[] = [];

    const walkDir = async (currentDir: string) => {
      const items = await fs.readdir(currentDir, { withFileTypes: true });
      for (const item of items) {
        const itemFullPath = path.join(currentDir, item.name);
        if (item.isDirectory()) {
          await walkDir(itemFullPath);
        } else if (item.isFile()) {
          const stats = await fs.stat(itemFullPath);
          const relPath = path.relative(baseDir, itemFullPath);
          results.push({
            filename: item.name,
            relativePath: relPath,
            sizeBytes: stats.size,
            lastModified: stats.mtime.toISOString()
          });
        }
      }
    };

    await walkDir(targetDir);
    return results;
  } catch (err) {
    console.error("[filesystem-edu] Error listing student files:", err);
    return [];
  }
}

/**
 * Deletes a student file relative to MCP_FILESYSTEM_DIR using fs/promises
 */
export async function deleteStudentDataFile(relativePath: string): Promise<StudentFileResult<boolean>> {
  try {
    const { fullPath, safeRelativePath } = resolveSafeRelativePath(relativePath);

    try {
      await fs.access(fullPath);
    } catch {
      return {
        success: false,
        relativePath: safeRelativePath,
        error: "File does not exist"
      };
    }

    await fs.unlink(fullPath);
    return {
      success: true,
      relativePath: safeRelativePath,
      data: true
    };
  } catch (err: any) {
    return {
      success: false,
      relativePath,
      error: err?.message || "Failed deleting file"
    };
  }
}

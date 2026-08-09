import { promises as fs } from "fs";
import * as syncFs from "fs";
import * as path from "path";

/**
 * Memory-Edu Service
 * Implements the memory-edu tool specification from GRADEMASTER007/ai-tutor-mcp-hub.
 * Stores long-term student learning profiles in JSON files in process.env.MCP_MEMORY_DIR.
 * Automatically utilizes in-memory fallback if disk storage is unaccessible.
 */

export interface StudentLearningProfile {
  studentId: string;
  languageLevel: string;
  preferredTone: string;
  conceptsLearned: string[];
  mistakePatterns: string[];
  recentScoreAvg: number;
  lastUpdated: string;
  customNotes?: string;
  curriculumFocus?: string;
}

// In-Memory Fallback Store
const inMemoryProfiles: Record<string, StudentLearningProfile> = {};

/**
 * Resolves directory path for memory-edu from MCP_MEMORY_DIR or defaults to ./data/memory_edu
 */
export function getMemoryBaseDir(): string {
  const envDir = process.env.MCP_MEMORY_DIR || "./data/memory_edu";
  const resolvedDir = path.isAbsolute(envDir)
    ? envDir
    : path.resolve(process.cwd(), envDir);

  if (!syncFs.existsSync(resolvedDir)) {
    try {
      syncFs.mkdirSync(resolvedDir, { recursive: true });
    } catch (err) {
      console.warn("[memory-edu] Warning: Failed creating memory storage directory:", err);
    }
  }

  return resolvedDir;
}

/**
 * Sanitizes student ID to create a safe file name within MCP_MEMORY_DIR
 */
export function getSafeProfileFilePath(studentId: string): { fullPath: string; safeId: string } {
  const baseDir = getMemoryBaseDir();
  const safeId = (studentId || "default_student")
    .replace(/[^a-zA-Z0-9_\-]/g, "_")
    .slice(0, 100);

  const fullPath = path.join(baseDir, `${safeId}.json`);
  return { fullPath, safeId };
}

/**
 * Retrieves a student's long-term learning profile from JSON file storage (or in-memory fallback)
 */
export async function getStudentProfile(studentId: string): Promise<StudentLearningProfile> {
  const { fullPath, safeId } = getSafeProfileFilePath(studentId);

  // Check in-memory store first if cached
  if (inMemoryProfiles[safeId]) {
    return inMemoryProfiles[safeId];
  }

  // Attempt reading from disk
  try {
    await fs.access(fullPath);
    const fileContent = await fs.readFile(fullPath, "utf-8");
    const profile = JSON.parse(fileContent) as StudentLearningProfile;
    inMemoryProfiles[safeId] = profile;
    return profile;
  } catch (err) {
    // File not found or unreadable -> generate initial profile and cache it
  }

  const initialProfile: StudentLearningProfile = {
    studentId: safeId,
    languageLevel: "Intermediate / English Code-Switching",
    preferredTone: "Encouraging Socratic Tutor",
    conceptsLearned: ["Linear Equations", "Quadratic Formula", "Basic Trigonometry"],
    mistakePatterns: ["Sign flips in negative distribution", "Forgetting +C in indefinite integrals"],
    recentScoreAvg: 78,
    lastUpdated: new Date().toISOString(),
    customNotes: "Student benefits from step-by-step KaTeX breakdown and visual coordinate plots.",
    curriculumFocus: "CAPS Grade 12 Mathematics & Physical Sciences"
  };

  inMemoryProfiles[safeId] = initialProfile;

  // Try saving default profile to disk
  try {
    await fs.writeFile(fullPath, JSON.stringify(initialProfile, null, 2), "utf-8");
  } catch (err) {
    console.warn("[memory-edu] Saved initial profile to in-memory fallback:", err);
  }

  return initialProfile;
}

/**
 * Updates a student's long-term learning profile in JSON file storage (or in-memory fallback)
 */
export async function updateStudentProfile(
  studentId: string,
  updates: Partial<StudentLearningProfile>
): Promise<StudentLearningProfile> {
  const current = await getStudentProfile(studentId);
  const { fullPath, safeId } = getSafeProfileFilePath(studentId);

  const updatedProfile: StudentLearningProfile = {
    ...current,
    ...updates,
    studentId: safeId,
    lastUpdated: new Date().toISOString()
  };

  // Update in-memory store
  inMemoryProfiles[safeId] = updatedProfile;

  // Persist to disk
  try {
    const baseDir = getMemoryBaseDir();
    if (!syncFs.existsSync(baseDir)) {
      await fs.mkdir(baseDir, { recursive: true });
    }
    await fs.writeFile(fullPath, JSON.stringify(updatedProfile, null, 2), "utf-8");
  } catch (err) {
    console.warn("[memory-edu] Saved updated profile to in-memory fallback due to disk write error:", err);
  }

  return updatedProfile;
}

/**
 * Lists all student profiles stored in MCP_MEMORY_DIR
 */
export async function listStudentProfiles(): Promise<StudentLearningProfile[]> {
  const profilesMap: Record<string, StudentLearningProfile> = { ...inMemoryProfiles };

  try {
    const baseDir = getMemoryBaseDir();
    await fs.access(baseDir);
    const files = await fs.readdir(baseDir);

    for (const file of files) {
      if (file.endsWith(".json")) {
        try {
          const filePath = path.join(baseDir, file);
          const content = await fs.readFile(filePath, "utf-8");
          const parsed = JSON.parse(content) as StudentLearningProfile;
          if (parsed.studentId) {
            profilesMap[parsed.studentId] = parsed;
          }
        } catch (e) {
          // Ignore corrupt individual file
        }
      }
    }
  } catch (err) {
    console.warn("[memory-edu] Error listing memory profiles from disk:", err);
  }

  return Object.values(profilesMap);
}

/**
 * Deletes a student profile from disk and in-memory store
 */
export async function deleteStudentProfile(studentId: string): Promise<boolean> {
  const { fullPath, safeId } = getSafeProfileFilePath(studentId);

  delete inMemoryProfiles[safeId];

  try {
    await fs.access(fullPath);
    await fs.unlink(fullPath);
    return true;
  } catch (err) {
    return false;
  }
}

/**
 * MCP Edu Unified Client Interface
 * Grade Master Africa - Pocket School Pro (Gold Edition)
 *
 * Provides a unified client interface for AI Tutor agents to interact with:
 * 1. filesystem-edu: Secure local file storage for lesson notes, attachments & assignments
 * 2. memory-edu: Long-term student learning profile & cognitive state tracking
 * 3. fetch-edu: Web content scraper & educational material enrichment
 * 4. postgres-edu: Database proxy with automatic bypass when MCP_POSTGRES_DISABLED is set
 */

import {
  writeStudentData,
  readStudentData,
  listStudentDataFiles,
  deleteStudentDataFile,
  StudentFileMetadata,
  StudentFileResult
} from "./filesystem.js";

import {
  getStudentProfile as getMemoryProfile,
  updateStudentProfile as updateMemoryProfile,
  listStudentProfiles as listMemoryProfiles,
  deleteStudentProfile as deleteMemoryProfile,
  StudentLearningProfile
} from "./memory.js";

export interface FetchEduResult {
  url: string;
  title: string;
  content: string;
  success: boolean;
  error?: string;
}

export interface DbQueryResult<T = any> {
  success: boolean;
  bypassed: boolean;
  data: T | null;
  message: string;
  rowCount?: number;
}

export interface TutorContextPayload {
  profile: StudentLearningProfile;
  studentFiles: StudentFileMetadata[];
  postgresStatus: {
    disabled: boolean;
    mode: string;
  };
  fetchedAt: string;
}

/**
 * Main Unified MCP Educational Client
 */
export class McpEduClient {
  /**
   * Check if PostgreSQL integration is disabled.
   * Defaults to true unless process.env.MCP_POSTGRES_DISABLED === "false".
   */
  public isPostgresDisabled(): boolean {
    const envVal = process.env.MCP_POSTGRES_DISABLED;
    if (envVal === "false") {
      return false;
    }
    return true; // Disabled by default or when set to "true"
  }

  // =========================================================================
  // 1. FILESYSTEM-EDU TOOL INTERFACE
  // =========================================================================

  /**
   * Writes student content or lesson notes safely relative to MCP_FILESYSTEM_DIR
   */
  public async writeFile(
    relativePath: string,
    content: string | Record<string, any>
  ): Promise<StudentFileResult<string>> {
    return await writeStudentData(relativePath, content);
  }

  /**
   * Reads student content or lesson notes relative to MCP_FILESYSTEM_DIR
   */
  public async readFile<T = string>(
    relativePath: string,
    parseJson = false
  ): Promise<StudentFileResult<T>> {
    return await readStudentData<T>(relativePath, parseJson);
  }

  /**
   * Lists all student files inside MCP_FILESYSTEM_DIR or subfolder
   */
  public async listFiles(subDirectory = ""): Promise<StudentFileMetadata[]> {
    return await listStudentDataFiles(subDirectory);
  }

  /**
   * Deletes a student file safely relative to MCP_FILESYSTEM_DIR
   */
  public async deleteFile(relativePath: string): Promise<StudentFileResult<boolean>> {
    return await deleteStudentDataFile(relativePath);
  }

  // =========================================================================
  // 2. MEMORY-EDU TOOL INTERFACE
  // =========================================================================

  /**
   * Gets a student's long-term learning profile (cognitive state, score averages, learned concepts)
   */
  public async getProfile(studentId: string): Promise<StudentLearningProfile> {
    return await getMemoryProfile(studentId);
  }

  /**
   * Updates a student's long-term learning profile
   */
  public async updateProfile(
    studentId: string,
    updates: Partial<StudentLearningProfile>
  ): Promise<StudentLearningProfile> {
    return await updateMemoryProfile(studentId, updates);
  }

  /**
   * Lists all student profiles stored in memory-edu
   */
  public async listProfiles(): Promise<StudentLearningProfile[]> {
    return await listMemoryProfiles();
  }

  /**
   * Removes a student profile
   */
  public async deleteProfile(studentId: string): Promise<boolean> {
    return await deleteMemoryProfile(studentId);
  }

  // =========================================================================
  // 3. FETCH-EDU TOOL INTERFACE
  // =========================================================================

  /**
   * Fetches educational content from the web for AI lesson enrichment
   */
  public async fetchEnrichment(url: string): Promise<FetchEduResult> {
    try {
      if (!url || (!url.startsWith("http://") && !url.startsWith("https://"))) {
        return {
          url,
          title: "Invalid URL",
          content: "",
          success: false,
          error: "URL must begin with http:// or https://"
        };
      }

      const response = await fetch(url, {
        headers: {
          "User-Agent": "GradeMasterAfrica-EduFetcher/1.0 (CapsIEBAiTutor)"
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP Error ${response.status}: ${response.statusText}`);
      }

      const rawText = await response.text();

      // Strip scripts, styles, HTML tags, and consolidate whitespace
      const cleanText = rawText
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
        .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 5000);

      return {
        url,
        title: `Enrichment Article: ${url}`,
        content: cleanText,
        success: true
      };
    } catch (err: any) {
      console.warn("[fetch-edu] Web fetch failed, providing fallback content:", err?.message);
      return {
        url,
        title: `Enrichment Reference (${url})`,
        content: `Educational study materials fetched for CAPS/IEB curriculum reference at ${url}. Contains theory overview, step-by-step examples, and conceptual guidance.`,
        success: false,
        error: err?.message || "Failed fetching external URL"
      };
    }
  }

  // =========================================================================
  // 4. POSTGRES-EDU DATABASE BYPASS INTERFACE
  // =========================================================================

  /**
   * Executes or simulates a SQL database call.
   * Automatically checks process.env.MCP_POSTGRES_DISABLED.
   * Gracefully bypasses any database calls when disabled and returns safe fallback data.
   */
  public async queryDatabase<T = any>(
    sqlQuery: string,
    params: any[] = []
  ): Promise<DbQueryResult<T>> {
    if (this.isPostgresDisabled()) {
      return {
        success: true,
        bypassed: true,
        data: [] as unknown as T,
        rowCount: 0,
        message: `[postgres-edu] Query bypassed because process.env.MCP_POSTGRES_DISABLED is active. Query executed: '${sqlQuery.slice(0, 60)}...'`
      };
    }

    // Fallback if postgres feature is enabled but no driver configured
    try {
      return {
        success: true,
        bypassed: true,
        data: null,
        rowCount: 0,
        message: "[postgres-edu] Database driver not attached. Bypassing query cleanly."
      };
    } catch (err: any) {
      return {
        success: false,
        bypassed: false,
        data: null,
        message: err?.message || "Database operation failed"
      };
    }
  }

  // =========================================================================
  // 5. UNIFIED TUTOR COMBINED WORKFLOWS
  // =========================================================================

  /**
   * Assembles a comprehensive context bundle for the AI Tutor model (Gemini 1.5 Pro/Flash)
   */
  public async getTutorContext(studentId: string): Promise<TutorContextPayload> {
    const profile = await this.getProfile(studentId);
    const studentFiles = await this.listFiles();

    return {
      profile,
      studentFiles,
      postgresStatus: {
        disabled: this.isPostgresDisabled(),
        mode: this.isPostgresDisabled() ? "In-Memory / JSON File Storage" : "PostgreSQL Server"
      },
      fetchedAt: new Date().toISOString()
    };
  }

  /**
   * Saves a tutor study note to filesystem-edu AND updates the student's profile in memory-edu
   */
  public async saveTutorSessionSummary(
    studentId: string,
    topic: string,
    summaryContent: string,
    newConceptMastered?: string
  ): Promise<{ fileResult: StudentFileResult<string>; profile: StudentLearningProfile }> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `session_notes/${studentId}_${topic.replace(/[^a-zA-Z0-9_\-]/g, "_")}_${timestamp}.json`;

    const notePayload = {
      studentId,
      topic,
      summaryContent,
      createdAt: new Date().toISOString()
    };

    // 1. Write to filesystem-edu
    const fileResult = await this.writeFile(filename, notePayload);

    // 2. Update memory-edu profile
    const currentProfile = await this.getProfile(studentId);
    const updatedConcepts = [...currentProfile.conceptsLearned];

    if (newConceptMastered && !updatedConcepts.includes(newConceptMastered)) {
      updatedConcepts.push(newConceptMastered);
    }

    const updatedProfile = await this.updateProfile(studentId, {
      conceptsLearned: updatedConcepts,
      lastUpdated: new Date().toISOString()
    });

    return {
      fileResult,
      profile: updatedProfile
    };
  }
}

/**
 * Singleton instance of McpEduClient
 */
export const mcpEduClient = new McpEduClient();
export default mcpEduClient;

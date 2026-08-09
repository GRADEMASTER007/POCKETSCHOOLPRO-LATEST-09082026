import React, { useState, useEffect } from "react";
import {
  Server, Database, HardDrive, Brain, Github, Globe,
  CheckCircle2, XCircle, RefreshCw, FileText, Plus, Save, Sparkles, AlertTriangle,
  BookOpen, Cpu, Library, Volume2, Rocket, BarChart3
} from "lucide-react";

export function McpEduHub() {
  const [mcpConfig, setMcpConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [studentId, setStudentId] = useState("student_demo_001");
  const [profile, setProfile] = useState<any>(null);
  const [newConcept, setNewConcept] = useState("");
  const [newMistake, setNewMistake] = useState("");
  const [files, setFiles] = useState<any[]>([]);
  const [newFileName, setNewFileName] = useState("calculus_derivatives_summary.json");
  const [newFileContent, setNewFileContent] = useState('{\n  "topic": "Calculus Chain Rule",\n  "formula": "d/dx[f(g(x))] = f\'(g(x)) * g\'(x)",\n  "difficulty": "Grade 12 CAPS"\n}');
  const [githubResult, setGithubResult] = useState<any>(null);
  const [githubAction, setGithubAction] = useState<"read" | "repos" | "contents" | "commits" | "search" | "push" | "rate_limit">("read");
  const [repoName, setRepoName] = useState("GRADEMASTER007/ai-tutor-mcp-hub");
  const [githubPath, setGithubPath] = useState("README.md");
  const [searchQuery, setSearchQuery] = useState("calculus");
  const [pushContent, setPushContent] = useState("# Grade 12 Calculus Notes\nCreated via Grade Master MCP Server.");
  const [githubRateLimit, setGithubRateLimit] = useState<any>(null);
  const [fetchUrl, setFetchUrl] = useState("https://en.wikipedia.org/wiki/Calculus");
  const [fetchResult, setFetchResult] = useState<any>(null);
  const [wikiTopic, setWikiTopic] = useState("Calculus");
  const [wikiResult, setWikiResult] = useState<any>(null);
  const [arxivQuery, setArxivQuery] = useState("quantum mechanics");
  const [arxivResult, setArxivResult] = useState<any>(null);
  const [openAlexQuery, setOpenAlexQuery] = useState("calculus education");
  const [openAlexResult, setOpenAlexResult] = useState<any>(null);
  const [libraryQuery, setLibraryQuery] = useState("physics");
  const [libraryResult, setLibraryResult] = useState<any>(null);
  const [dictWord, setDictWord] = useState("photosynthesis");
  const [dictResult, setDictResult] = useState<any>(null);
  const [nasaQuery, setNasaQuery] = useState("mars rover");
  const [nasaResult, setNasaResult] = useState<any>(null);
  const [worldBankCountry, setWorldBankCountry] = useState("ZAF");
  const [worldBankResult, setWorldBankResult] = useState<any>(null);
  const [statusMsg, setStatusMsg] = useState("");

  const handleFetchWikipedia = async () => {
    try {
      const res = await fetch(`/api/mcp/edu/wikipedia?topic=${encodeURIComponent(wikiTopic)}`);
      if (res.ok) {
        const data = await res.json();
        setWikiResult(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleFetchArxiv = async () => {
    try {
      const res = await fetch(`/api/mcp/edu/arxiv?q=${encodeURIComponent(arxivQuery)}&limit=4`);
      if (res.ok) {
        const data = await res.json();
        setArxivResult(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleFetchOpenAlex = async () => {
    try {
      const res = await fetch(`/api/mcp/edu/openalex?q=${encodeURIComponent(openAlexQuery)}&limit=4`);
      if (res.ok) {
        const data = await res.json();
        setOpenAlexResult(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleFetchOpenLibrary = async () => {
    try {
      const res = await fetch(`/api/mcp/edu/openlibrary?q=${encodeURIComponent(libraryQuery)}&limit=4`);
      if (res.ok) {
        const data = await res.json();
        setLibraryResult(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleFetchDictionary = async () => {
    try {
      const res = await fetch(`/api/mcp/edu/dictionary?word=${encodeURIComponent(dictWord)}`);
      if (res.ok) {
        const data = await res.json();
        setDictResult(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleFetchNasa = async () => {
    try {
      const res = await fetch(`/api/mcp/edu/nasa?q=${encodeURIComponent(nasaQuery)}&limit=3`);
      if (res.ok) {
        const data = await res.json();
        setNasaResult(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleFetchWorldBank = async () => {
    try {
      const res = await fetch(`/api/mcp/edu/worldbank?country=${encodeURIComponent(worldBankCountry)}`);
      if (res.ok) {
        const data = await res.json();
        setWorldBankResult(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleFetchGithub = async () => {
    try {
      let url = "";
      if (githubAction === "read") {
        url = `/api/mcp/edu/github?repo=${encodeURIComponent(repoName)}&path=${encodeURIComponent(githubPath)}`;
      } else if (githubAction === "repos") {
        url = `/api/mcp/edu/github/repos?q=${encodeURIComponent(searchQuery)}`;
      } else if (githubAction === "contents") {
        url = `/api/mcp/edu/github/contents?repo=${encodeURIComponent(repoName)}&path=${encodeURIComponent(githubPath)}`;
      } else if (githubAction === "commits") {
        url = `/api/mcp/edu/github/commits?repo=${encodeURIComponent(repoName)}`;
      } else if (githubAction === "search") {
        url = `/api/mcp/edu/github/search?q=${encodeURIComponent(searchQuery)}`;
      } else if (githubAction === "rate_limit") {
        url = `/api/mcp/edu/github/rate-limit`;
      }

      if (url) {
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          setGithubResult(data);
          if (githubAction === "rate_limit") {
            setGithubRateLimit(data);
          }
        }
      }
    } catch (err) {
      console.error("Github API error", err);
    }
  };

  const handlePushLessonToGithub = async () => {
    try {
      const res = await fetch("/api/mcp/edu/github/push", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          repo: repoName,
          filePath: githubPath || "notes/new_lesson.md",
          content: pushContent,
          commitMessage: "Add lesson via Grade Master MCP Server UI"
        })
      });
      if (res.ok) {
        const data = await res.json();
        setGithubResult(data);
        setStatusMsg(data.success ? "✅ Successfully committed to GitHub!" : `⚠️ GitHub Commit Note: ${data.error}`);
        setTimeout(() => setStatusMsg(""), 5000);
      }
    } catch (e: any) {
      console.error("Push to GitHub error", e);
    }
  };

  const loadConfig = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/mcp/edu/config");
      if (res.ok) {
        const data = await res.json();
        setMcpConfig(data);
      }
    } catch (e) {
      console.error("Failed loading MCP config", e);
    } finally {
      setLoading(false);
    }
  };

  const loadStudentProfile = async () => {
    try {
      const res = await fetch(`/api/mcp/edu/memory/${studentId}`);
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
      }
    } catch (e) {
      console.error("Failed loading student memory profile", e);
    }
  };

  const loadFiles = async () => {
    try {
      const res = await fetch("/api/mcp/edu/filesystem");
      if (res.ok) {
        const data = await res.json();
        setFiles(data.files || []);
      }
    } catch (e) {
      console.error("Failed loading filesystem files", e);
    }
  };

  useEffect(() => {
    loadConfig();
    loadStudentProfile();
    loadFiles();
  }, [studentId]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updatedConcepts = [...(profile?.conceptsLearned || [])];
      if (newConcept.trim()) updatedConcepts.push(newConcept.trim());

      const updatedMistakes = [...(profile?.mistakePatterns || [])];
      if (newMistake.trim()) updatedMistakes.push(newMistake.trim());

      const res = await fetch(`/api/mcp/edu/memory/${studentId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conceptsLearned: updatedConcepts,
          mistakePatterns: updatedMistakes,
          languageLevel: profile?.languageLevel,
          preferredTone: profile?.preferredTone
        })
      });

      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        setNewConcept("");
        setNewMistake("");
        setStatusMsg("✅ Memory profile updated and saved to memory-edu!");
        setTimeout(() => setStatusMsg(""), 4000);
      }
    } catch (err) {
      console.error("Error updating profile", err);
    }
  };

  const handleCreateFile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/mcp/edu/filesystem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: newFileName,
          content: newFileContent,
          category: "lesson_summary"
        })
      });

      if (res.ok) {
        setStatusMsg("✅ File created and stored in filesystem-edu!");
        loadFiles();
        setTimeout(() => setStatusMsg(""), 4000);
      }
    } catch (err) {
      console.error("Error writing lesson file", err);
    }
  };

  const handleFetchWeb = async () => {
    try {
      const res = await fetch("/api/mcp/edu/fetch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: fetchUrl })
      });
      if (res.ok) {
        const data = await res.json();
        setFetchResult(data);
      }
    } catch (err) {
      console.error("Web fetch error", err);
    }
  };

  return (
    <div className="space-y-8 p-6 bg-slate-950 text-slate-100 rounded-3xl border border-slate-800 shadow-2xl">
      
      {/* HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-black uppercase tracking-wider mb-2">
            <Server className="w-4 h-4 text-amber-400" /> Model Context Protocol (MCP) Hub
          </div>
          <h2 className="text-2xl font-black text-white">
            GRADEMASTER007/ai-tutor-mcp-hub Config & Tool Status
          </h2>
          <p className="text-xs text-slate-400">
            Connected MCP tools: filesystem-edu, memory-edu, github-edu, fetch-edu & postgres-edu (bypassed safely).
          </p>
        </div>

        <button
          onClick={loadConfig}
          className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-amber-400 flex items-center gap-2 transition-all w-fit"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> Refresh MCP Servers
        </button>
      </div>

      {statusMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" /> {statusMsg}
        </div>
      )}

      {/* SERVER STATUS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* filesystem-edu */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <HardDrive className="w-5 h-5 text-blue-400" />
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">Active</span>
          </div>
          <h3 className="text-xs font-black text-white">filesystem-edu</h3>
          <p className="text-[10px] text-slate-400">Reads/writes lesson files & student uploads to local storage.</p>
        </div>

        {/* memory-edu */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <Brain className="w-5 h-5 text-purple-400" />
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">Active</span>
          </div>
          <h3 className="text-xs font-black text-white">memory-edu</h3>
          <p className="text-[10px] text-slate-400">Stores long-term student profile, concepts, and mistakes in JSON files.</p>
        </div>

        {/* github-edu */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <Github className="w-5 h-5 text-amber-400" />
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">Active</span>
          </div>
          <h3 className="text-xs font-black text-white">github-edu</h3>
          <p className="text-[10px] text-slate-400">Reads syllabus & course content from GRADEMASTER007 repos.</p>
        </div>

        {/* fetch-edu */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <Globe className="w-5 h-5 text-teal-400" />
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">Active</span>
          </div>
          <h3 className="text-xs font-black text-white">fetch-edu</h3>
          <p className="text-[10px] text-slate-400">Fetches web content for study enrichment and academic citations.</p>
        </div>

        {/* postgres-edu */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <Database className="w-5 h-5 text-rose-400" />
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold">Disabled</span>
          </div>
          <h3 className="text-xs font-black text-white">postgres-edu</h3>
          <p className="text-[10px] text-slate-400">No database required. Safely using local JSON / in-memory fallback.</p>
        </div>

      </div>

      {/* DETAILED INTERACTIVE MCP TABS / PANELS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* PANEL 1: MEMORY-EDU PROFILE TESTER */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-black text-white flex items-center gap-2">
              <Brain className="w-4 h-4 text-purple-400" /> memory-edu Profile Manager
            </h3>
            <div className="flex items-center gap-2">
              <label className="text-[10px] text-slate-400">Student ID:</label>
              <input
                type="text"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className="px-2 py-1 rounded bg-slate-950 border border-slate-800 text-xs font-mono text-amber-300"
              />
            </div>
          </div>

          {profile && (
            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono bg-slate-950 p-3 rounded-xl border border-slate-800/80">
                <div>Language: <strong className="text-amber-400">{profile.languageLevel}</strong></div>
                <div>Tone: <strong className="text-purple-400">{profile.preferredTone}</strong></div>
                <div>Avg Score: <strong className="text-emerald-400">{profile.recentScoreAvg}%</strong></div>
                <div>File: <strong className="text-slate-400">./data/memory_edu/{studentId}.json</strong></div>
              </div>

              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Mastered Concepts:</span>
                <div className="flex flex-wrap gap-1.5">
                  {(profile.conceptsLearned || []).map((c: string, i: number) => (
                    <span key={i} className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[10px]">
                      {c}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Mistake Patterns:</span>
                <div className="flex flex-wrap gap-1.5">
                  {(profile.mistakePatterns || []).map((m: string, i: number) => (
                    <span key={i} className="px-2 py-0.5 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-300 text-[10px]">
                      {m}
                    </span>
                  ))}
                </div>
              </div>

              <form onSubmit={handleUpdateProfile} className="space-y-2 pt-2 border-t border-slate-800">
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Add mastered concept..."
                    value={newConcept}
                    onChange={(e) => setNewConcept(e.target.value)}
                    className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white"
                  />
                  <input
                    type="text"
                    placeholder="Add mistake pattern..."
                    value={newMistake}
                    onChange={(e) => setNewMistake(e.target.value)}
                    className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all"
                >
                  <Save className="w-3.5 h-3.5" /> Save Memory Profile to Disk (memory-edu)
                </button>
              </form>
            </div>
          )}
        </div>

        {/* PANEL 2: FILESYSTEM-EDU EXPLORER */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-black text-white flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-blue-400" /> filesystem-edu File Storage
            </h3>
            <span className="text-[10px] font-mono text-slate-400">{files.length} Saved Files</span>
          </div>

          <form onSubmit={handleCreateFile} className="space-y-2">
            <input
              type="text"
              placeholder="Filename (e.g. math_summary.json)"
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-amber-300 font-mono"
            />
            <textarea
              rows={3}
              value={newFileContent}
              onChange={(e) => setNewFileContent(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 font-mono"
            />
            <button
              type="submit"
              className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all"
            >
              <Plus className="w-3.5 h-3.5" /> Write File to filesystem-edu
            </button>
          </form>

          <div className="space-y-2 pt-2 border-t border-slate-800 max-h-40 overflow-y-auto">
            {files.map((f, idx) => (
              <div key={idx} className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-[11px] flex items-center justify-between">
                <span className="font-mono text-amber-300 flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5 text-blue-400" /> {f.filename}
                </span>
                <span className="text-[9px] text-slate-500 font-mono">{f.createdAt?.slice(0, 10)}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* PANEL 3: GITHUB-EDU & FETCH-EDU QUICK TESTERS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
        
        {/* github-edu */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3 lg:col-span-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2">
            <h3 className="text-xs font-black text-white flex items-center gap-2">
              <Github className="w-4 h-4 text-amber-400" /> Enterprise github-edu MCP REST & Git Engine
            </h3>
            <span className="text-[10px] font-mono text-amber-400 font-bold">
              {githubRateLimit ? `Quota: ${githubRateLimit.remaining}/${githubRateLimit.limit} reqs` : "Token Authenticated / Public Fallback"}
            </span>
          </div>

          {/* Action selector */}
          <div className="flex flex-wrap gap-1 bg-slate-950 p-1.5 rounded-xl border border-slate-800 text-[11px] font-bold">
            <button
              onClick={() => setGithubAction("read")}
              className={`px-3 py-1 rounded-lg transition-all ${githubAction === "read" ? "bg-amber-500 text-slate-950 font-black" : "text-slate-400 hover:text-white"}`}
            >
              Read File
            </button>
            <button
              onClick={() => setGithubAction("repos")}
              className={`px-3 py-1 rounded-lg transition-all ${githubAction === "repos" ? "bg-amber-500 text-slate-950 font-black" : "text-slate-400 hover:text-white"}`}
            >
              List Repos
            </button>
            <button
              onClick={() => setGithubAction("contents")}
              className={`px-3 py-1 rounded-lg transition-all ${githubAction === "contents" ? "bg-amber-500 text-slate-950 font-black" : "text-slate-400 hover:text-white"}`}
            >
              Browse Dir
            </button>
            <button
              onClick={() => setGithubAction("commits")}
              className={`px-3 py-1 rounded-lg transition-all ${githubAction === "commits" ? "bg-amber-500 text-slate-950 font-black" : "text-slate-400 hover:text-white"}`}
            >
              Commits
            </button>
            <button
              onClick={() => setGithubAction("search")}
              className={`px-3 py-1 rounded-lg transition-all ${githubAction === "search" ? "bg-amber-500 text-slate-950 font-black" : "text-slate-400 hover:text-white"}`}
            >
              Search Code
            </button>
            <button
              onClick={() => setGithubAction("push")}
              className={`px-3 py-1 rounded-lg transition-all ${githubAction === "push" ? "bg-emerald-500 text-slate-950 font-black" : "text-slate-400 hover:text-white"}`}
            >
              Push Lesson
            </button>
            <button
              onClick={() => setGithubAction("rate_limit")}
              className={`px-3 py-1 rounded-lg transition-all ${githubAction === "rate_limit" ? "bg-purple-500 text-white font-black" : "text-slate-400 hover:text-white"}`}
            >
              Rate Limit
            </button>
          </div>

          {/* Form inputs based on selected action */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {(githubAction === "read" || githubAction === "contents" || githubAction === "commits" || githubAction === "push") && (
              <input
                type="text"
                value={repoName}
                onChange={(e) => setRepoName(e.target.value)}
                placeholder="Repo (e.g. GRADEMASTER007/ai-tutor-mcp-hub)"
                className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-amber-300 font-mono"
              />
            )}
            {(githubAction === "read" || githubAction === "contents" || githubAction === "push") && (
              <input
                type="text"
                value={githubPath}
                onChange={(e) => setGithubPath(e.target.value)}
                placeholder="Path (e.g. README.md or notes/calculus.md)"
                className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-amber-300 font-mono"
              />
            )}
            {(githubAction === "repos" || githubAction === "search") && (
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search query / Owner (e.g. GRADEMASTER007 or CAPS calculus)"
                className="col-span-2 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-amber-300 font-mono"
              />
            )}
          </div>

          {githubAction === "push" && (
            <textarea
              rows={3}
              value={pushContent}
              onChange={(e) => setPushContent(e.target.value)}
              placeholder="Lesson content to commit to GitHub..."
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200"
            />
          )}

          <button
            onClick={githubAction === "push" ? handlePushLessonToGithub : handleFetchGithub}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black w-full transition-all flex items-center justify-center gap-2"
          >
            <Github className="w-4 h-4" />
            {githubAction === "push" ? "Commit & Push Lesson File to GitHub" : `Execute github_edu_${githubAction}`}
          </button>

          {githubResult && (
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-300 space-y-1 max-h-48 overflow-y-auto">
              <div className="text-amber-400 font-bold">GitHub Response Payload:</div>
              <pre className="whitespace-pre-wrap">{JSON.stringify(githubResult, null, 2)}</pre>
            </div>
          )}
        </div>

        {/* fetch-edu */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="text-xs font-black text-white flex items-center gap-2">
              <Globe className="w-4 h-4 text-teal-400" /> Free Academic Research & Open Knowledge APIs (No Key Required)
            </h3>
            <span className="text-[10px] font-mono text-teal-400 font-bold">Wikipedia + arXiv + OpenAlex</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Wikipedia REST API */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" /> Wikipedia REST API
              </div>
              <input
                type="text"
                value={wikiTopic}
                onChange={(e) => setWikiTopic(e.target.value)}
                placeholder="Topic (e.g. Calculus, Photosynthesis)"
                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-amber-300"
              />
              <button
                onClick={handleFetchWikipedia}
                className="w-full py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all"
              >
                Fetch Topic Summary
              </button>
              {wikiResult && (
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-[10px] space-y-1 max-h-32 overflow-y-auto">
                  <div className="font-bold text-amber-300">{wikiResult.title}</div>
                  <p className="text-slate-300 line-clamp-4">{wikiResult.extract}</p>
                </div>
              )}
            </div>

            {/* arXiv e-Print Search */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> arXiv Open Science Search
              </div>
              <input
                type="text"
                value={arxivQuery}
                onChange={(e) => setArxivQuery(e.target.value)}
                placeholder="Query (e.g. quantum mechanics, calculus)"
                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-indigo-300"
              />
              <button
                onClick={handleFetchArxiv}
                className="w-full py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-all"
              >
                Search arXiv Papers
              </button>
              {arxivResult && Array.isArray(arxivResult) && (
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-[10px] space-y-2 max-h-32 overflow-y-auto">
                  {arxivResult.map((p: any, i: number) => (
                    <div key={i} className="border-b border-slate-800/80 pb-1 last:border-none">
                      <a href={p.arxivUrl} target="_blank" rel="noopener noreferrer" className="font-bold text-indigo-300 hover:underline block truncate">
                        {p.title}
                      </a>
                      <p className="text-slate-400 line-clamp-2">{p.summary}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* OpenAlex Academic Graph */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="text-xs font-bold text-teal-300 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5" /> OpenAlex Global Citations
              </div>
              <input
                type="text"
                value={openAlexQuery}
                onChange={(e) => setOpenAlexQuery(e.target.value)}
                placeholder="Query (e.g. calculus education)"
                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-teal-300"
              />
              <button
                onClick={handleFetchOpenAlex}
                className="w-full py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs transition-all"
              >
                Search Citations
              </button>
              {openAlexResult && Array.isArray(openAlexResult) && (
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-[10px] space-y-2 max-h-32 overflow-y-auto">
                  {openAlexResult.map((w: any, i: number) => (
                    <div key={i} className="border-b border-slate-800/80 pb-1 last:border-none">
                      <div className="font-bold text-teal-300 truncate">{w.title}</div>
                      <div className="text-[9px] text-slate-400 flex justify-between">
                        <span>Year: {w.publicationYear}</span>
                        <span>Citations: {w.citedByCount}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Open Library Books */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                <Library className="w-3.5 h-3.5" /> Open Library Textbooks
              </div>
              <input
                type="text"
                value={libraryQuery}
                onChange={(e) => setLibraryQuery(e.target.value)}
                placeholder="Query (e.g. physics, algebra)"
                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-emerald-300"
              />
              <button
                onClick={handleFetchOpenLibrary}
                className="w-full py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all"
              >
                Search Textbooks
              </button>
              {libraryResult && Array.isArray(libraryResult) && (
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-[10px] space-y-2 max-h-32 overflow-y-auto">
                  {libraryResult.map((b: any, i: number) => (
                    <div key={i} className="border-b border-slate-800/80 pb-1 last:border-none">
                      <div className="font-bold text-emerald-300 truncate">{b.title}</div>
                      <div className="text-[9px] text-slate-400">{b.author} ({b.firstPublishYear || "N/A"})</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Free Dictionary & Phonetics */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="text-xs font-bold text-rose-300 flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5" /> Free Dictionary & Phonetics
              </div>
              <input
                type="text"
                value={dictWord}
                onChange={(e) => setDictWord(e.target.value)}
                placeholder="Word (e.g. photosynthesis)"
                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-rose-300"
              />
              <button
                onClick={handleFetchDictionary}
                className="w-full py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-all"
              >
                Lookup Word
              </button>
              {dictResult && (
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-[10px] space-y-1 max-h-32 overflow-y-auto">
                  <div className="font-bold text-rose-300 flex justify-between">
                    <span>{dictResult.word}</span>
                    <span className="font-mono text-slate-400">{dictResult.phonetic}</span>
                  </div>
                  {dictResult.meanings?.[0] && (
                    <p className="text-slate-300 italic">{dictResult.meanings[0].definitions?.[0]}</p>
                  )}
                </div>
              )}
            </div>

            {/* NASA Space Science Media */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                <Rocket className="w-3.5 h-3.5" /> NASA Physics & Science
              </div>
              <input
                type="text"
                value={nasaQuery}
                onChange={(e) => setNasaQuery(e.target.value)}
                placeholder="Query (e.g. mars rover, galaxy)"
                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-cyan-300"
              />
              <button
                onClick={handleFetchNasa}
                className="w-full py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition-all"
              >
                Search NASA Assets
              </button>
              {nasaResult && Array.isArray(nasaResult) && (
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-[10px] space-y-2 max-h-32 overflow-y-auto">
                  {nasaResult.map((n: any, i: number) => (
                    <div key={i} className="border-b border-slate-800/80 pb-1 last:border-none">
                      <div className="font-bold text-cyan-300 truncate">{n.title}</div>
                      <p className="text-slate-400 line-clamp-2">{n.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* World Bank Open Education Data */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                <BarChart3 className="w-3.5 h-3.5" /> World Bank Open Education Data
              </div>
              <input
                type="text"
                value={worldBankCountry}
                onChange={(e) => setWorldBankCountry(e.target.value)}
                placeholder="ISO Code (e.g. ZAF, KEN, NGA)"
                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-purple-300"
              />
              <button
                onClick={handleFetchWorldBank}
                className="w-full py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-all"
              >
                Get Education Stats
              </button>
              {worldBankResult && Array.isArray(worldBankResult) && (
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-[10px] space-y-1 max-h-32 overflow-y-auto">
                  {worldBankResult.map((wb: any, i: number) => (
                    <div key={i} className="flex justify-between border-b border-slate-800/80 pb-0.5 last:border-none">
                      <span className="text-slate-300">{wb.year}:</span>
                      <span className="font-bold text-purple-300">{wb.value}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Web URL Fetcher */}
          <div className="pt-2 border-t border-slate-800 flex items-center gap-2">
            <input
              type="text"
              value={fetchUrl}
              onChange={(e) => setFetchUrl(e.target.value)}
              placeholder="Web URL..."
              className="flex-1 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-teal-300"
            />
            <button
              onClick={handleFetchWeb}
              className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-teal-300 font-bold text-xs transition-all"
            >
              Fetch Direct Web URL
            </button>
          </div>

          {fetchResult && (
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-[10px] font-mono text-slate-300 space-y-1 max-h-32 overflow-y-auto">
              <div className="text-teal-400 font-bold">{fetchResult.title}</div>
              <p className="line-clamp-3">{fetchResult.content}</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}

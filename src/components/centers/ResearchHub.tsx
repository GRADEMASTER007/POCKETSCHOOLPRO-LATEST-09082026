import { appCheck } from "@/src/lib/firebase";
import { getToken } from "firebase/app-check";
import { db, auth } from "@/src/lib/firebase";
import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Search, 
  RefreshCw,
  AlertTriangle,
  BookOpen, 
  FileText, 
  Quote, 
  Sparkles,
  ExternalLink,
  ChevronRight,
  Database,
  Filter,
  Volume2,
  AlertCircle,
  BrainCircuit,
  Globe,
  X,
  Send,
  Bot,
  Loader2,
  Bookmark,
  Copy,
  Check,
  Newspaper,
  Library,
  Rocket,
  BarChart3,
  Cpu,
  Download,
  Share2
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import { speak } from "@/src/lib/tts";
import { useAuth } from "@/src/components/auth/AuthContext";
import ReactMarkdown from "react-markdown";
import { collection, addDoc } from "firebase/firestore";

const ResearchSkeleton = () => (
  <div className="space-y-6">
    {[1, 2].map((n) => (
      <div key={n} className="bg-white p-8 rounded-[2rem] border border-gray-100 animate-pulse space-y-6">
        <div className="flex justify-between items-start">
          <div className="h-6 bg-gray-200/80 rounded-lg w-3/4" />
          <div className="h-8 w-8 bg-gray-200/80 rounded-lg" />
        </div>
        <div className="flex gap-4">
          <div className="h-4 bg-gray-200/80 rounded-md w-24" />
          <div className="h-4 bg-gray-200/80 rounded-md w-32" />
          <div className="h-4 bg-gray-200/80 rounded-md w-12" />
        </div>
        <div className="space-y-2.5">
          <div className="h-3 bg-gray-200/60 rounded-md w-full" />
          <div className="h-3 bg-gray-200/60 rounded-md w-full" />
          <div className="h-3 bg-gray-200/60 rounded-md w-2/3" />
        </div>
        <div className="flex justify-between items-center pt-2">
          <div className="h-4 bg-gray-200/60 rounded-md w-24" />
          <div className="h-8 bg-gray-200/60 rounded-xl w-28" />
        </div>
      </div>
    ))}
  </div>
);

export default function ResearchHub() {
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [errorMsg, setErrorMsg] = useState("");

  // Grounded Synthesis States
  const [activeTab, setActiveTab] = useState<"literature" | "synthesis" | "news" | "global_apis">("literature");
  const [synthesisQuery, setSynthesisQuery] = useState("");
  const [synthesisLoading, setSynthesisLoading] = useState(false);
  const [synthesisResult, setSynthesisResult] = useState("");
  const [synthesisMetadata, setSynthesisMetadata] = useState<any>(null);
  const [synthesisError, setSynthesisError] = useState("");
  const [copied, setCopied] = useState(false);

  // Global Knowledge Base (7 Free APIs) States
  const [globalTopic, setGlobalTopic] = useState("Photosynthesis");
  const [globalLoading, setGlobalLoading] = useState(false);
  const [globalResult, setGlobalResult] = useState<any>(null);
  const [globalError, setGlobalError] = useState("");
  const [globalCopied, setGlobalCopied] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [citationFormat, setCitationFormat] = useState<"APA" | "MLA" | "Harvard">("APA");

  const generateCitation = (title: string, format: "APA" | "MLA" | "Harvard") => {
    const year = new Date().getFullYear();
    const date = new Date().toLocaleDateString("en-ZA", { day: "numeric", month: "long", year: "numeric" });
    if (format === "APA") return `Grade Master Africa. (${year}). ${title}. Pocket School Pro Research Engine. Retrieved from https://grademasterafrica.com/research on ${date}`;
    if (format === "MLA") return `Grade Master Africa. "${title}." Pocket School Pro Research Engine, ${year}, https://grademasterafrica.com/research. Accessed ${date}.`;
    return `Grade Master Africa (${year}) ${title}. Available at: https://grademasterafrica.com/research (Accessed: ${date}).`;
  };

  const saveToNotebook = async (title: string, content: string, source: string) => {
    if (!user) return;
    setSaveLoading(true);
    setSaveStatus("saving");
    try {
      const payload = {
        userId: user.uid,
        title: `Research: ${title}`,
        content: `Source: ${source}\n\n${content}`,
        tags: ["Research", source],
        tasks: [],
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      await addDoc(collection(db, "notes"), payload);
      setSaveStatus("success");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } catch (e) {
      console.error(e);
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleGlobalSynthesis = async (topicToSearch?: string) => {
    const targetTopic = topicToSearch || globalTopic;
    if (!targetTopic.trim()) return;
    setGlobalLoading(true);
    setGlobalError("");
    setGlobalResult(null);
    try {
      const res = await fetch("/api/research/multi-api-synthesis", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${await auth.currentUser?.getIdToken()}`
        },
        body: JSON.stringify({ topic: targetTopic.trim() })
      });
      if (res.ok) {
        const data = await res.json();
        setGlobalResult(data);
      } else {
        const err = await res.json();
        setGlobalError(err.error || "Failed to generate multi-api synthesis.");
      }
    } catch (e: any) {
      console.error(e);
      setGlobalError("Network error during multi-api query.");
    } finally {
      setGlobalLoading(false);
    }
  };

  // Grounded News States
  const [newsQuery, setNewsQuery] = useState("");
  const [newsLoading, setNewsLoading] = useState(false);
  const [newsResult, setNewsResult] = useState("");
  const [newsMetadata, setNewsMetadata] = useState<any>(null);
  const [newsError, setNewsError] = useState("");
  const [newsCopied, setNewsCopied] = useState(false);
  const [savedBibliographyId, setSavedBibliographyId] = useState<string | null>(null);
  const [bibliographies, setBibliographies] = useState<any[]>([
    { id: "1", title: "Quantum Computing Foundations", count: 8 },
    { id: "2", title: "Digital Tools in Africa", count: 12 }
  ]);

  const handleCopySynthesis = () => {
    if (!synthesisResult) return;
    navigator.clipboard.writeText(synthesisResult);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveToBibliography = (bibId: string) => {
    setBibliographies(prev => prev.map(bib => {
      if (bib.id === bibId) {
        return { ...bib, count: bib.count + 1 };
      }
      return bib;
    }));
    setSavedBibliographyId(bibId);
    setTimeout(() => setSavedBibliographyId(null), 3000);
  };

  const triggerSampleSynthesis = async (sampleQuestion: string) => {
    setSynthesisLoading(true);
    setSynthesisError("");
    setSynthesisResult("");
    setSynthesisMetadata(null);
    try {
      const response = await fetch("/api/research/grounded-synthesis", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json", 
          "Authorization": `Bearer ${await auth.currentUser?.getIdToken()}`
        },
        body: JSON.stringify({ query: sampleQuestion })
      });
      if (response.ok) {
        const data = await response.json();
        setSynthesisResult(data.text);
        setSynthesisMetadata(data.groundingMetadata);
      } else {
        const err = await response.json();
        setSynthesisError(err.error || "Failed to generate synthesis.");
      }
    } catch (e) {
      console.error(e);
      setSynthesisError("Network error during synthesis query.");
    } finally {
      setSynthesisLoading(false);
    }
  };

  const handleSynthesisSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!synthesisQuery.trim()) return;
    triggerSampleSynthesis(synthesisQuery.trim());
  };

  const handleCopyNews = () => {
    if (!newsResult) return;
    navigator.clipboard.writeText(newsResult);
    setNewsCopied(true);
    setTimeout(() => setNewsCopied(false), 2000);
  };

  const triggerNewsSearch = async (queryToSearch: string) => {
    setNewsLoading(true);
    setNewsError("");
    setNewsResult("");
    setNewsMetadata(null);
    try {
      const response = await fetch("/api/research/news-search", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json", 
          "Authorization": `Bearer ${await auth.currentUser?.getIdToken()}`
        },
        body: JSON.stringify({ query: queryToSearch })
      });
      if (response.ok) {
        const data = await response.json();
        setNewsResult(data.text);
        setNewsMetadata(data.groundingMetadata);
      } else {
        const err = await response.json();
        setNewsError(err.error || "Failed to generate news summary.");
      }
    } catch (e) {
      console.error(e);
      setNewsError("Network error during news query.");
    } finally {
      setNewsLoading(false);
    }
  };

  const handleNewsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsQuery.trim()) return;
    triggerNewsSearch(newsQuery.trim());
  };

  // AI Research Assistant Interactive states
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [assistantMessages, setAssistantMessages] = useState<any[]>([
    { role: "model", text: "Hello! I am your AI Research Assistant. I can help you compile literature reviews, perform academic fact-checking using Live Search, formulate thesis drafts, or advise on citation formats. How can I assist with your research today?" }
  ]);
  const [assistantInput, setAssistantInput] = useState("");
  const [assistantLoading, setAssistantLoading] = useState(false);
  const [assistantThinking, setAssistantThinking] = useState(true);
  const [assistantGrounding, setAssistantGrounding] = useState<"search" | "none">("search");

  const sendAssistantMessage = async (textToSend?: string) => {
    const text = textToSend || assistantInput;
    if (!text.trim() || assistantLoading) return;
    
    const newUserMessage = { role: "user", text };
    setAssistantMessages(prev => [...prev, newUserMessage]);
    if (!textToSend) setAssistantInput("");
    setAssistantLoading(true);
    
    try {
      const historyToSend = assistantMessages.map(msg => ({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.text }]
      }));
      
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json", 
          "Authorization": `Bearer ${await auth.currentUser?.getIdToken()}`
        },
        body: JSON.stringify({
          message: text,
          history: historyToSend,
          mode: "researcher",
          thinking: assistantThinking,
          grounding: assistantGrounding,
          subject: "Academic Research"
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        setAssistantMessages(prev => [...prev, { 
          role: "model", 
          text: data.text || data.reply,
          groundingMetadata: data.groundingMetadata
        }]);
      } else {
        const err = await response.json();
        setAssistantMessages(prev => [...prev, { role: "model", text: `Error: ${err.error || "Failed to get response."}` }]);
      }
    } catch (err) {
      console.error(err);
      setAssistantMessages(prev => [...prev, { role: "model", text: "A network error occurred. Please try again." }]);
    } finally {
      setAssistantLoading(false);
    }
  };

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;
    setSearching(true);
    setErrorMsg("");
    setResults([]);
    
    try {
      const response = await fetch("/api/search-research", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${await auth.currentUser?.getIdToken()}`},
        body: JSON.stringify({ query: query.trim(), userId: user?.uid })
      });
      
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          setResults(data);
        } else {
          setErrorMsg("Received invalid format from server.");
        }
      } else {
        const err = await response.json();
        setErrorMsg(err.error || "Failed to search research.");
      }
    } catch (e) {
      console.error(e);
      setErrorMsg("Network error during research query.");
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <header className="mb-12">
        <h1 className="text-3xl font-bold mb-2">Research Hub</h1>
        <p className="text-gray-500">Academic searches, literature reviews, and citation management powered by Gemini.</p>
      </header>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-100 mb-8 pb-1">
        <button
          onClick={() => setActiveTab("literature")}
          className={cn(
            "pb-3 px-4 font-bold text-sm border-b-2 transition-all cursor-pointer flex items-center gap-2",
            activeTab === "literature"
              ? "border-brand-primary text-brand-primary"
              : "border-transparent text-gray-400 hover:text-gray-600 font-medium"
          )}
        >
          <Database className="w-4 h-4" />
          Academic Literature Search
        </button>
        <button
          onClick={() => setActiveTab("synthesis")}
          className={cn(
            "pb-3 px-4 font-bold text-sm border-b-2 transition-all cursor-pointer flex items-center gap-2",
            activeTab === "synthesis"
              ? "border-brand-primary text-brand-primary"
              : "border-transparent text-gray-400 hover:text-gray-600 font-medium"
          )}
        >
          <Sparkles className="w-4 h-4 text-sky-500" />
          Real-Time Grounded Synthesis
        </button>
        <button
          onClick={() => setActiveTab("news")}
          className={cn(
            "pb-3 px-4 font-bold text-sm border-b-2 transition-all cursor-pointer flex items-center gap-2",
            activeTab === "news"
              ? "border-brand-primary text-brand-primary"
              : "border-transparent text-gray-400 hover:text-gray-600 font-medium"
          )}
        >
          <Newspaper className="w-4 h-4 text-emerald-500" />
          Real-Time Grounded News
        </button>
        <button
          onClick={() => setActiveTab("global_apis")}
          className={cn(
            "pb-3 px-4 font-bold text-sm border-b-2 transition-all cursor-pointer flex items-center gap-2",
            activeTab === "global_apis"
              ? "border-brand-primary text-brand-primary"
              : "border-transparent text-gray-400 hover:text-gray-600 font-medium"
          )}
        >
          <Globe className="w-4 h-4 text-purple-500" />
          Global Knowledge Base (7 Free APIs)
        </button>
      </div>

      {activeTab === "literature" ? (
        <>
          <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm mb-12">
            <form onSubmit={handleSearch} className="relative mb-6">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
              <input 
                type="text" 
                placeholder="Enter research topic or DOI..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-16 pr-32 py-6 bg-gray-50 border-none rounded-3xl text-lg focus:ring-4 focus:ring-brand-primary/5 transition-all"
              />
              <button 
                type="submit"
                disabled={searching}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-brand-primary text-white px-6 py-3 rounded-2xl font-bold hover:bg-brand-primary/90 transition-all disabled:opacity-70 cursor-pointer"
              >
                {searching ? "Searching..." : "Search"}
              </button>
            </form>
            
            <div className="flex flex-wrap gap-3">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mr-2 mt-2">Sources:</span>
              {["Scholar", "arXiv", "PubMed", "JSTOR", "ScienceDirect"].map(source => (
                <button 
                  key={source} 
                  type="button"
                  onClick={() => {
                    setQuery(source + " " + query);
                    handleSearch();
                  }}
                  className="px-4 py-2 bg-white border border-gray-100 rounded-full text-xs font-bold text-gray-500 hover:border-brand-primary hover:text-brand-primary transition-all cursor-pointer"
                >
                  {source}
                </button>
              ))}
              <button className="px-4 py-2 bg-gray-50 text-gray-500 rounded-full text-xs font-bold flex items-center gap-2 cursor-pointer">
                <Filter className="w-3 h-3" />
                Filters
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
                <Database className="text-brand-primary" />
                Search Results
              </h2>
              
              {errorMsg && (
                <div className="p-4 bg-red-50 text-red-600 rounded-2xl flex items-start gap-3 border border-red-100 mb-6">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <p className="text-sm font-medium">{errorMsg}</p>
                </div>
              )}

              {searching ? (
                <ResearchSkeleton />
              ) : results.length === 0 && !errorMsg ? (
                <div className="bg-white p-12 rounded-[2rem] border border-gray-100 flex flex-col items-center justify-center text-center">
                  <Database className="w-12 h-12 text-gray-200 mb-4" />
                  <h3 className="text-lg font-bold text-gray-900 mb-2">No Research Found</h3>
                  <p className="text-sm text-gray-500 max-w-md">Try searching for a topic above to explore academic papers and articles.</p>
                </div>
              ) : (
                results.map((res, i) => (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    key={i}
                    className="bg-white p-8 rounded-[2rem] border border-gray-100 hover:border-brand-primary/20 hover:shadow-lg transition-all group"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-bold group-hover:text-brand-primary transition-colors pr-8 leading-tight">
                        {res.title}
                      </h3>
                      <button className="p-2 text-gray-400 hover:text-brand-primary transition-all cursor-pointer">
                        <Quote className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-4 text-xs text-gray-500 font-medium mb-6">
                      <span className="flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5" />
                        {res.authors}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5" />
                        {res.source}
                      </span>
                      <span className="px-2 py-0.5 bg-gray-100 rounded text-gray-400">{res.year}</span>
                      <span className="text-brand-primary font-bold">{res.citations} Citations</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-6 leading-relaxed line-clamp-3">
                      {res.summary}
                    </p>
                    <button 
                      onClick={() => speak(res.summary)}
                      className="mb-6 flex items-center gap-1 text-[10px] text-brand-primary font-bold uppercase tracking-widest hover:opacity-80 cursor-pointer"
                    >
                      <Volume2 className="w-3 h-3" />
                      Listen to Summary
                    </button>
                    <div className="flex items-center justify-between">
                      <button className="flex items-center gap-2 text-brand-primary text-xs font-bold uppercase tracking-widest cursor-pointer">
                        View Full Text
                        <ExternalLink className="w-3 h-3" />
                      </button>
                      <button className="flex items-center gap-2 bg-brand-primary/5 text-brand-primary px-4 py-2 rounded-xl text-xs font-bold hover:bg-brand-primary/10 transition-all cursor-pointer">
                        AI Summarize
                        <Sparkles className="w-3 h-3" />
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            <aside className="space-y-8">
              <div className="bg-brand-primary p-8 rounded-[2.5rem] text-white shadow-xl shadow-brand-primary/20">
                <h3 className="text-xl font-bold mb-4">AI Research Assistant</h3>
                <p className="text-sm text-white/80 mb-6 leading-relaxed">
                  I can help you write literature reviews, verify facts, and find the best sources for your thesis.
                </p>
                <button 
                  onClick={() => setIsAssistantOpen(true)}
                  className="w-full bg-white text-brand-primary py-4 rounded-2xl font-bold hover:bg-gray-100 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  Start Research Assistant
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100">
                <h3 className="text-lg font-bold mb-6">Saved Bibliographies</h3>
                <div className="space-y-4">
                  {bibliographies.map(bib => (
                    <div key={bib.id} className="flex items-center gap-4 group cursor-pointer">
                      <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 group-hover:bg-brand-primary/5 group-hover:text-brand-primary transition-all">
                        <Quote className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-800">{bib.title}</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">{bib.count} entries</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </>
      ) : activeTab === "synthesis" ? (
        <>
          <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm mb-12">
            <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
              <Globe className="text-sky-500 w-5 h-5" />
              Cited Academic Synthesizer
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              Ask any research question. Aristotle will search the live index, compile current academic perspectives, and return a cited, referenced synthesis.
            </p>
            <form onSubmit={handleSynthesisSubmit} className="relative mb-6">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
              <input 
                type="text" 
                placeholder="Ask a research question (e.g. Current status of fusion energy research...)"
                value={synthesisQuery}
                onChange={(e) => setSynthesisQuery(e.target.value)}
                className="w-full pl-16 pr-32 py-6 bg-gray-50 border-none rounded-3xl text-lg focus:ring-4 focus:ring-brand-primary/5 transition-all"
              />
              <button 
                type="submit"
                disabled={synthesisLoading}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-brand-primary text-white px-6 py-3 rounded-2xl font-bold hover:bg-brand-primary/90 transition-all disabled:opacity-70 flex items-center gap-2 cursor-pointer"
              >
                {synthesisLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Synthesizing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-sky-200" />
                    Synthesize
                  </>
                )}
              </button>
            </form>
            
            <div className="flex flex-wrap gap-2">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mr-2 mt-2">Try asking:</span>
              {[
                "CAPS curriculum goals for STEM in South Africa",
                "Status of room-temperature superconductivity in 2026",
                "AI chatbots impact on high school reading comprehension",
                "Latest advancements in malaria vaccine trials"
              ].map(sample => (
                <button 
                  key={sample} 
                  type="button"
                  onClick={() => {
                    setSynthesisQuery(sample);
                    triggerSampleSynthesis(sample);
                  }}
                  className="px-4 py-2 bg-gray-50 hover:bg-brand-primary/5 hover:text-brand-primary border border-transparent rounded-full text-xs font-bold text-gray-500 transition-all text-left cursor-pointer"
                >
                  {sample}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
                <Sparkles className="text-sky-500 w-5 h-5" />
                Aristotle's Synthesis
              </h2>

              {synthesisError && (
                <div className="p-4 bg-red-50 text-red-600 rounded-2xl flex items-start gap-3 border border-red-100">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <p className="text-sm font-medium">{synthesisError}</p>
                </div>
              )}

              {synthesisLoading ? (
                <div className="bg-white p-12 rounded-[2rem] border border-gray-100 flex flex-col items-center justify-center text-center space-y-4">
                  <Loader2 className="w-10 h-10 text-brand-primary animate-spin" />
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Synthesizing Real-Time Data</h3>
                    <p className="text-sm text-gray-500 max-w-sm mt-1 mx-auto">
                      Aristotle is actively consulting current Live Search Grounding layers to compile academic consensus and verify live citation records...
                    </p>
                  </div>
                </div>
              ) : !synthesisResult && !synthesisError ? (
                <div className="bg-white p-12 rounded-[2rem] border border-gray-100 flex flex-col items-center justify-center text-center">
                  <Sparkles className="w-12 h-12 text-sky-200 mb-4" />
                  <h3 className="text-lg font-bold text-gray-900 mb-2">No Synthesis Active</h3>
                  <p className="text-sm text-gray-500 max-w-md">
                    Enter a research question or click one of the suggested sample questions above to generate a grounded academic response.
                  </p>
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm space-y-6"
                >
                  <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                    <span className="bg-sky-50 text-sky-700 px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5" />
                      Verified Grounded Synthesis
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={handleCopySynthesis}
                        className="p-2.5 hover:bg-gray-100 text-gray-500 rounded-xl hover:text-gray-700 transition-all flex items-center gap-1 text-xs font-bold cursor-pointer"
                        title="Copy to Clipboard"
                      >
                        {copied ? (
                          <>
                            <Check className="w-4 h-4 text-emerald-500" />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => speak(synthesisResult)}
                        className="p-2.5 hover:bg-gray-100 text-gray-500 rounded-xl hover:text-gray-700 transition-all flex items-center gap-1 text-xs font-bold cursor-pointer"
                        title="Listen to response"
                      >
                        <Volume2 className="w-4 h-4" />
                        <span>Listen</span>
                      </button>
                    </div>
                  </div>

                  <div className="prose prose-brand max-w-none text-gray-800 leading-relaxed text-sm space-y-4 markdown-body">
                    <ReactMarkdown>{synthesisResult}</ReactMarkdown>
                  </div>

                  {/* Inline Citations Index Footer */}
                  {synthesisMetadata?.groundingChunks?.length > 0 && (
                    <div className="pt-6 border-t border-gray-100 mt-6">
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-1.5">
                        <Quote className="w-3.5 h-3.5 text-sky-500" />
                        Inline Bibliography List
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {synthesisMetadata.groundingChunks.map((chunk: any, idx: number) => {
                          if (chunk.web) {
                            let domain = "source";
                            try {
                              domain = new URL(chunk.web.uri).hostname.replace("www.", "");
                            } catch (_) {}
                            return (
                              <a
                                key={idx}
                                href={chunk.web.uri}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-4 border border-gray-100 rounded-2xl bg-gray-50/50 hover:bg-brand-primary/5 hover:border-brand-primary/20 transition-all flex gap-3 group"
                              >
                                <div className="w-7 h-7 rounded-lg bg-sky-500 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                                  {idx + 1}
                                </div>
                                <div className="space-y-1 min-w-0">
                                  <p className="text-xs font-bold text-gray-800 group-hover:text-brand-primary transition-colors line-clamp-1">
                                    {chunk.web.title || "Grounded Source"}
                                  </p>
                                  <p className="text-[10px] text-gray-400 font-medium flex items-center gap-1">
                                    <span className="truncate">{domain}</span>
                                    <span>•</span>
                                    <span className="text-brand-primary hover:underline shrink-0">Visit Page</span>
                                  </p>
                                </div>
                              </a>
                            );
                          }
                          return null;
                        })}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </div>

            <aside className="space-y-8">
              <div className="bg-brand-primary p-8 rounded-[2.5rem] text-white shadow-xl shadow-brand-primary/20">
                <h3 className="text-xl font-bold mb-4">Grounded Assistant</h3>
                <p className="text-sm text-white/80 mb-6 leading-relaxed">
                  Need more information or want to compile the literature review? Continue this search query directly inside the interactive assistant!
                </p>
                <button 
                  onClick={() => {
                    setIsAssistantOpen(true);
                    if (synthesisQuery) {
                      setAssistantInput(`Synthesize and analyze current research papers on: ${synthesisQuery}`);
                    }
                  }}
                  className="w-full bg-white text-brand-primary py-4 rounded-2xl font-bold hover:bg-gray-100 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  Send to Assistant
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {synthesisResult && (
                <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100">
                  <h3 className="text-lg font-bold mb-4">Save Synthesis</h3>
                  <p className="text-xs text-gray-400 mb-6 leading-relaxed">
                    Store this synthesized result directly into one of your Saved Bibliographies for quick retrieval later.
                  </p>
                  <div className="space-y-3">
                    {bibliographies.map(bib => (
                      <button
                        key={bib.id}
                        onClick={() => handleSaveToBibliography(bib.id)}
                        className="w-full p-4 border border-gray-100 rounded-2xl hover:border-brand-primary hover:bg-brand-primary/5 transition-all flex items-center justify-between cursor-pointer text-left"
                      >
                        <div>
                          <p className="text-xs font-bold text-gray-800">{bib.title}</p>
                          <p className="text-[9px] text-gray-400 font-bold uppercase tracking-tight">{bib.count} entries</p>
                        </div>
                        {savedBibliographyId === bib.id ? (
                          <span className="text-xs font-bold text-emerald-600">Saved!</span>
                        ) : (
                          <Bookmark className="w-4 h-4 text-gray-400 hover:text-brand-primary" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </aside>
          </div>
        </>
      ) : (
        <>
          <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm mb-12">
            <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
              <Newspaper className="text-emerald-500 w-5 h-5" />
              Real-Time Grounded News & Events
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              Search for any current news topic. Aristotle will search the live indexes, compile active news stories, and return a cited media summary.
            </p>
            <form onSubmit={handleNewsSubmit} className="relative mb-6">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search latest news (e.g. South Africa primary school funding changes 2026...)"
                value={newsQuery}
                onChange={(e) => setNewsQuery(e.target.value)}
                className="w-full pl-16 pr-32 py-6 bg-gray-50 border-none rounded-3xl text-lg focus:ring-4 focus:ring-brand-primary/5 transition-all"
              />
              <button 
                type="submit"
                disabled={newsLoading}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-brand-primary text-white px-6 py-3 rounded-2xl font-bold hover:bg-brand-primary/90 transition-all disabled:opacity-70 flex items-center gap-2 cursor-pointer"
              >
                {newsLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-emerald-200" />
                    Search News
                  </>
                )}
              </button>
            </form>
            
            <div className="flex flex-wrap gap-2">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mr-2 mt-2">Trending topics:</span>
              {[
                "Primary school funding updates in South Africa 2026",
                "Global educational AI tools breakthroughs",
                "UNESCO literacy campaigns in sub-Saharan Africa",
                "Latest school sports development initiatives"
              ].map(sample => (
                <button 
                  key={sample} 
                  type="button"
                  onClick={() => {
                    setNewsQuery(sample);
                    triggerNewsSearch(sample);
                  }}
                  className="px-4 py-2 bg-gray-50 hover:bg-brand-primary/5 hover:text-brand-primary border border-transparent rounded-full text-xs font-bold text-gray-500 transition-all text-left cursor-pointer"
                >
                  {sample}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
                <Newspaper className="text-emerald-500 w-5 h-5" />
                Live News Briefing & Citations
              </h2>

              {newsError && (
                <div className="p-4 bg-red-50 text-red-600 rounded-2xl flex items-start gap-3 border border-red-100">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <p className="text-sm font-medium">{newsError}</p>
                </div>
              )}

              {newsLoading ? (
                <div className="bg-white p-12 rounded-[2rem] border border-gray-100 flex flex-col items-center justify-center text-center space-y-4">
                  <Loader2 className="w-10 h-10 text-brand-primary animate-spin" />
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Retrieving Grounded News</h3>
                    <p className="text-sm text-gray-500 max-w-sm mt-1 mx-auto">
                      Aristotle is querying live news indices via Live Search Grounding to compile direct coverage, headlines, and articles...
                    </p>
                  </div>
                </div>
              ) : !newsResult && !newsError ? (
                <div className="bg-white p-12 rounded-[2rem] border border-gray-100 flex flex-col items-center justify-center text-center">
                  <Newspaper className="w-12 h-12 text-emerald-100 mb-4" />
                  <h3 className="text-lg font-bold text-gray-900 mb-2">No News Search Active</h3>
                  <p className="text-sm text-gray-500 max-w-md">
                    Enter a news topic above or click one of the trending items to generate a grounded, cited real-time news summary.
                  </p>
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm space-y-6"
                >
                  <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                    <span className="bg-emerald-50 text-emerald-700 px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5" />
                      Verified News Grounding
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={handleCopyNews}
                        className="p-2.5 hover:bg-gray-100 text-gray-500 rounded-xl hover:text-gray-700 transition-all flex items-center gap-1 text-xs font-bold cursor-pointer"
                        title="Copy News Summary to Clipboard"
                      >
                        {newsCopied ? (
                          <>
                            <Check className="w-4 h-4 text-emerald-500" />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => speak(newsResult)}
                        className="p-2.5 hover:bg-gray-100 text-gray-500 rounded-xl hover:text-gray-700 transition-all flex items-center gap-1 text-xs font-bold cursor-pointer"
                        title="Listen to News Summary"
                      >
                        <Volume2 className="w-4 h-4" />
                        <span>Listen</span>
                      </button>
                    </div>
                  </div>

                  <div className="prose prose-brand max-w-none text-gray-800 leading-relaxed text-sm space-y-4 markdown-body">
                    <ReactMarkdown>{newsResult}</ReactMarkdown>
                  </div>

                  {/* News Citations Index */}
                  {newsMetadata?.groundingChunks?.length > 0 && (
                    <div className="pt-6 border-t border-gray-100 mt-6">
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-1.5">
                        <Quote className="w-3.5 h-3.5 text-emerald-500" />
                        Live News Sources & Citations
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {newsMetadata.groundingChunks.map((chunk: any, idx: number) => {
                          if (chunk.web) {
                            let domain = "news source";
                            try {
                              domain = new URL(chunk.web.uri).hostname.replace("www.", "");
                            } catch (_) {}
                            return (
                              <a
                                key={idx}
                                href={chunk.web.uri}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-4 border border-gray-100 rounded-2xl bg-gray-50/50 hover:bg-brand-primary/5 hover:border-brand-primary/20 transition-all flex gap-3 group"
                              >
                                <div className="w-7 h-7 rounded-lg bg-emerald-500 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                                  {idx + 1}
                                </div>
                                <div className="space-y-1 min-w-0">
                                  <p className="text-xs font-bold text-gray-800 group-hover:text-brand-primary transition-colors line-clamp-2">
                                    {chunk.web.title || "Real-Time Article"}
                                  </p>
                                  <p className="text-[10px] text-gray-400 font-medium flex items-center gap-1">
                                    <span className="truncate">{domain}</span>
                                    <span>•</span>
                                    <span className="text-brand-primary hover:underline shrink-0">Read Article</span>
                                  </p>
                                </div>
                              </a>
                            );
                          }
                          return null;
                        })}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </div>

            <aside className="space-y-8">
              <div className="bg-brand-primary p-8 rounded-[2.5rem] text-white shadow-xl shadow-brand-primary/20">
                <h3 className="text-xl font-bold mb-4">News Assistant</h3>
                <p className="text-sm text-white/80 mb-6 leading-relaxed">
                  Have questions about these news developments or need to write an editorial draft? Send this search directly into the AI Assistant.
                </p>
                <button 
                  onClick={() => {
                    setIsAssistantOpen(true);
                    if (newsQuery) {
                      setAssistantInput(`Analyze current news and media coverage on: ${newsQuery}`);
                    }
                  }}
                  className="w-full bg-white text-brand-primary py-4 rounded-2xl font-bold hover:bg-gray-100 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  Send to Assistant
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {newsResult && (
                <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100">
                  <h3 className="text-lg font-bold mb-4">Save News Summary</h3>
                  <p className="text-xs text-gray-400 mb-6 leading-relaxed">
                    Save this real-time news briefing and the compiled web bibliography directly to your collections.
                  </p>
                  <div className="space-y-3">
                    {bibliographies.map(bib => (
                      <button
                        key={bib.id}
                        onClick={() => handleSaveToBibliography(bib.id)}
                        className="w-full p-4 border border-gray-100 rounded-2xl hover:border-brand-primary hover:bg-brand-primary/5 transition-all flex items-center justify-between cursor-pointer text-left"
                      >
                        <div>
                          <p className="text-xs font-bold text-gray-800">{bib.title}</p>
                          <p className="text-[9px] text-gray-400 font-bold uppercase tracking-tight">{bib.count} entries</p>
                        </div>
                        {savedBibliographyId === bib.id ? (
                          <span className="text-xs font-bold text-emerald-600">Saved!</span>
                        ) : (
                          <Bookmark className="w-4 h-4 text-gray-400 hover:text-brand-primary" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </aside>
          </div>
        </>
      )}

      {activeTab === "global_apis" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Global Search Header */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-purple-500 text-white flex items-center justify-center shadow-lg shadow-purple-500/20">
                  <Globe className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-gray-900">Global Knowledge Base</h3>
                  <p className="text-sm text-gray-500 font-medium tracking-tight">Enterprise 7-API Synthesis Engine</p>
                </div>
              </div>

              <div className="flex gap-3">
                <input
                  type="text"
                  value={globalTopic}
                  onChange={(e) => setGlobalTopic(e.target.value)}
                  placeholder="Enter research topic (e.g. Quantum Mechanics, African History)..."
                  onKeyDown={(e) => e.key === "Enter" && handleGlobalSynthesis()}
                  className="flex-1 px-6 py-4 rounded-2xl bg-gray-50 border border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all font-medium text-gray-800"
                />
                <button
                  onClick={() => handleGlobalSynthesis()}
                  disabled={globalLoading}
                  className="px-8 py-4 bg-purple-600 text-white rounded-2xl font-black shadow-lg shadow-purple-600/30 hover:bg-purple-700 transition-all disabled:opacity-50 disabled:shadow-none flex items-center gap-2"
                >
                  {globalLoading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                  {globalLoading ? "Synthesizing..." : "Synthesize"}
                </button>
              </div>

              {globalError && (
                <div className="mt-4 p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-xs font-bold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  {globalError}
                </div>
              )}
            </div>

            {/* Global Synthesis Result */}
            {globalResult && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-xl shadow-purple-500/5 relative overflow-hidden"
              >
                {/* Decorative background accent */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />
                
                <div className="flex items-center justify-between mb-8 relative z-10">
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-purple-500/10 text-purple-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-purple-500/20">
                      Master Academic Briefing
                    </span>
                    <span className="text-xs text-gray-400 font-bold">• Compiled from 7 Repositories</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => saveToNotebook(globalTopic, globalResult.synthesisMarkdown, "Global Synthesis")}
                      disabled={saveLoading}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border",
                        saveStatus === "success" 
                          ? "bg-emerald-500 border-emerald-500 text-white" 
                          : "bg-white border-gray-200 text-gray-600 hover:border-purple-500 hover:text-purple-600"
                      )}
                    >
                      {saveStatus === "success" ? <Check className="w-4 h-4" /> : <Download className="w-4 h-4" />}
                      {saveStatus === "success" ? "Saved to Notebook!" : "Export to Notebook"}
                    </button>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(globalResult.synthesisMarkdown);
                        setGlobalCopied(true);
                        setTimeout(() => setGlobalCopied(false), 2000);
                      }}
                      className="p-2.5 rounded-xl bg-gray-50 text-gray-400 hover:text-purple-600 hover:bg-purple-50 transition-all border border-gray-100"
                      title="Copy Markdown"
                    >
                      {globalCopied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => speak(globalResult.synthesisMarkdown)}
                      className="p-2.5 rounded-xl bg-gray-50 text-gray-400 hover:text-purple-600 hover:bg-purple-50 transition-all border border-gray-100"
                      title="Read Aloud"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="prose prose-purple max-w-none text-gray-800 leading-relaxed text-sm space-y-4 markdown-body relative z-10">
                  <ReactMarkdown>{globalResult.synthesisMarkdown}</ReactMarkdown>
                </div>

                {/* NASA Space & Science Media Section */}
                {globalResult.sources?.nasaImageLibrary?.length > 0 && (
                  <div className="mt-12 pt-8 border-t border-gray-100 relative z-10">
                    <h4 className="text-sm font-black text-gray-900 mb-6 flex items-center gap-2">
                      <Globe className="w-5 h-5 text-indigo-500" />
                      NASA Deep Space Media
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {globalResult.sources.nasaImageLibrary.slice(0, 4).map((item: any, idx: number) => (
                        <div key={idx} className="group relative aspect-square rounded-2xl overflow-hidden bg-gray-100 border border-gray-200">
                          <img 
                            src={item.href} 
                            alt={item.title} 
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-end">
                            <p className="text-[10px] font-bold text-white line-clamp-2 leading-tight">{item.title}</p>
                            <span className="text-[8px] text-amber-400 font-black uppercase mt-1">NASA Media</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Academic Citation Generator */}
                <div className="mt-12 p-8 rounded-3xl bg-gray-50 border border-gray-100 relative z-10">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div>
                      <h4 className="text-sm font-black text-gray-900">Academic Citation Generator</h4>
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Cite this research briefing for your assignments</p>
                    </div>
                    <div className="flex bg-white p-1 rounded-xl border border-gray-200">
                      {(["APA", "MLA", "Harvard"] as const).map((format) => (
                        <button
                          key={format}
                          onClick={() => setCitationFormat(format)}
                          className={cn(
                            "px-4 py-1.5 rounded-lg text-[10px] font-black transition-all",
                            citationFormat === format ? "bg-purple-600 text-white shadow-md" : "text-gray-500 hover:bg-gray-50"
                          )}
                        >
                          {format}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="relative group">
                    <div className="p-5 rounded-2xl bg-white border border-gray-200 text-xs font-serif italic text-gray-700 leading-relaxed pr-12">
                      {generateCitation(globalTopic, citationFormat)}
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(generateCitation(globalTopic, citationFormat));
                      }}
                      className="absolute top-3 right-3 p-2.5 rounded-xl bg-gray-50 text-gray-400 hover:text-purple-600 hover:bg-purple-50 transition-all border border-gray-100 opacity-0 group-hover:opacity-100"
                      title="Copy Citation"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Related Scientific Resources Section */}
                {(globalResult.sources?.arxivResearchPapers?.length > 0 || globalResult.sources?.openAlexCitations?.length > 0) && (
                  <div className="mt-12 pt-8 border-t border-gray-100 relative z-10">
                    <h4 className="text-sm font-black text-gray-900 mb-6 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-rose-500" />
                      Related Scientific Resources
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {globalResult.sources.arxivResearchPapers?.slice(0, 4).map((paper: any, idx: number) => (
                        <a
                          key={idx}
                          href={paper.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-5 rounded-2xl bg-gray-50 border border-gray-100 hover:border-rose-200 hover:bg-rose-50/30 transition-all group"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-[9px] font-black uppercase tracking-widest text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
                              Research Paper
                            </span>
                            <ExternalLink className="w-3 h-3 text-gray-300 group-hover:text-rose-500" />
                          </div>
                          <h5 className="text-xs font-bold text-gray-800 group-hover:text-rose-600 line-clamp-2 mb-2">
                            {paper.title}
                          </h5>
                          <p className="text-[10px] text-gray-500 font-medium">
                            {paper.authors?.join(", ")}
                          </p>
                        </a>
                      ))}
                      {globalResult.sources.openLibraryTextbooks?.slice(0, 2).map((book: any, idx: number) => (
                        <div key={idx} className="p-5 rounded-2xl bg-gray-50 border border-gray-100 flex gap-4">
                          <div className="w-12 h-16 bg-gray-200 rounded-lg flex-shrink-0 flex items-center justify-center text-gray-400">
                            <Library className="w-6 h-6" />
                          </div>
                          <div>
                            <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                              Textbook Reference
                            </span>
                            <h5 className="text-xs font-bold text-gray-800 mt-1 line-clamp-1">{book.title}</h5>
                            <p className="text-[10px] text-gray-500 font-medium">{book.author}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </div>

          {/* Sidebar / Source Matrix */}
          <aside className="space-y-8">
            <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-xl shadow-purple-500/10 border border-white/5">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Cpu className="w-5 h-5 text-purple-400" /> Source Matrix
              </h3>
              <p className="text-xs text-white/60 mb-6 leading-relaxed font-medium uppercase tracking-tight">
                Data was dynamically cross-referenced from:
              </p>
              
              <div className="grid grid-cols-1 gap-3">
                {[
                  { name: "Wikipedia", status: globalResult?.sources?.wikipediaSummary ? "Ready" : "Pending", icon: Globe },
                  { name: "arXiv Archive", status: globalResult?.sources?.arxivResearchPapers?.length > 0 ? "Ready" : "Pending", icon: FileText },
                  { name: "OpenAlex Graph", status: globalResult?.sources?.openAlexCitations?.length > 0 ? "Ready" : "Pending", icon: Cpu },
                  { name: "Open Library", status: globalResult?.sources?.openLibraryTextbooks?.length > 0 ? "Ready" : "Pending", icon: Library },
                  { name: "NASA Science", status: globalResult?.sources?.nasaSpaceScienceMedia?.length > 0 ? "Ready" : "Pending", icon: Rocket },
                  { name: "World Bank Data", status: globalResult?.sources?.worldBankEducationStats?.length > 0 ? "Ready" : "Pending", icon: BarChart3 },
                ].map((s, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5">
                    <div className="flex items-center gap-2.5">
                      <s.icon className={cn("w-4 h-4", s.status === "Ready" ? "text-emerald-400" : "text-white/20")} />
                      <span className="text-[11px] font-bold text-white/90">{s.name}</span>
                    </div>
                    <span className={cn("text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border", 
                      s.status === "Ready" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-white/5 text-white/20 border-white/5"
                    )}>
                      {s.status}
                    </span>
                  </div>
                ))}
              </div>

              <button 
                disabled={!globalResult}
                onClick={() => {
                  setIsAssistantOpen(true);
                  setAssistantInput(`Elaborate on the multi-api research synthesis for: ${globalTopic}. I'd like to dive deeper into the literature found.`);
                }}
                className="w-full mt-8 bg-purple-600 text-white py-4 rounded-2xl font-bold hover:bg-purple-500 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-purple-600/20 disabled:opacity-50"
              >
                Deep Research Assistant
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* AI Research Assistant Slide-over Drawer */}
      <AnimatePresence>
        {isAssistantOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAssistantOpen(false)}
              className="absolute inset-0 bg-black backdrop-blur-sm"
            />
            
            {/* Drawer Content */}
            <div className="absolute inset-y-0 right-0 max-w-full pl-10 flex">
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="w-screen max-w-lg bg-white shadow-2xl flex flex-col"
              >
                {/* Header */}
                <div className="p-6 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-brand-primary/10 rounded-xl text-brand-primary">
                      <Bot className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 leading-none">Research Assistant</h3>
                      <p className="text-xs text-gray-400 mt-1">Literature reviews, thesis assistance, academic fact-checking</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setIsAssistantOpen(false)}
                    className="p-2 hover:bg-gray-200/60 rounded-xl text-gray-400 hover:text-gray-600 transition-all cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Controls & Starters Bar */}
                <div className="px-6 py-4 bg-gray-50/50 border-b border-gray-100 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400">Assistant Controls</span>
                    <div className="flex items-center gap-2">
                      {/* Deep Think toggle */}
                      <button
                        onClick={() => setAssistantThinking(!assistantThinking)}
                        className={cn(
                          "flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold transition-all border cursor-pointer",
                          assistantThinking 
                            ? "bg-indigo-50 border-indigo-200 text-indigo-700 shadow-sm" 
                            : "bg-white border-gray-200 text-gray-400 hover:text-gray-600"
                        )}
                        title="Enable Deep Thinking Mode"
                      >
                        <BrainCircuit className="w-3 h-3" />
                        <span>DEEP THINK</span>
                      </button>

                      {/* Live Search toggle */}
                      <button
                        onClick={() => setAssistantGrounding(assistantGrounding === "search" ? "none" : "search")}
                        className={cn(
                          "flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold transition-all border cursor-pointer",
                          assistantGrounding === "search"
                            ? "bg-sky-50 border-sky-200 text-sky-700 shadow-sm" 
                            : "bg-white border-gray-200 text-gray-400 hover:text-gray-600"
                        )}
                        title="Enable Live Search Grounding"
                      >
                        <Globe className="w-3 h-3" />
                        <span>SEARCH</span>
                      </button>
                    </div>
                  </div>

                  {/* Suggestion Starters */}
                  <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
                    {[
                      { title: "Literature Review", text: "Draft a brief literature review on the impact of digital tools in African schools." },
                      { title: "Fact Checker", text: "Verify the scientific status and current global consensus on climate mitigation strategies." },
                      { title: "Thesis Formulator", text: "Help me structure an outline for a master's thesis in Educational Technology." }
                    ].map((p, idx) => (
                      <button
                        key={idx}
                        onClick={() => sendAssistantMessage(p.text)}
                        className="shrink-0 px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-xs font-medium text-gray-600 hover:border-brand-primary hover:text-brand-primary hover:bg-brand-primary/5 transition-all text-left max-w-[180px] truncate cursor-pointer"
                      >
                        <span className="font-bold block text-[9px] uppercase tracking-wide text-gray-400">{p.title}</span>
                        {p.text}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Messages Thread */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/30 custom-scrollbar">
                  {assistantMessages.map((msg, i) => (
                    <div 
                      key={i} 
                      className={cn(
                        "flex gap-3 max-w-[85%] flex-col",
                        msg.role === "user" ? "ml-auto" : "mr-auto"
                      )}
                    >
                      <div className="flex items-center gap-1.5">
                        <div className={cn("w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0", 
                          msg.role === "user" ? "bg-gray-200 text-gray-700" : "bg-brand-primary/10 text-brand-primary"
                        )}>
                          {msg.role === "user" ? "U" : "A"}
                        </div>
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                          {msg.role === "user" ? "You" : "Assistant"}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <div 
                          className={cn(
                            "p-4 rounded-2xl text-sm leading-relaxed",
                            msg.role === "user" 
                              ? "bg-brand-primary text-white rounded-tr-none" 
                              : "bg-white border border-gray-100 text-gray-800 rounded-tl-none shadow-sm"
                          )}
                        >
                          <ReactMarkdown>{msg.text}</ReactMarkdown>
                          {msg.groundingMetadata?.groundingChunks?.length > 0 && (
                            <div className="mt-4 pt-3 border-t border-gray-100 space-y-1.5">
                              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                                <Globe className="w-3.5 h-3.5 text-sky-500" />
                                Sources Consulted
                              </p>
                              <div className="flex flex-col gap-1 max-h-32 overflow-y-auto custom-scrollbar">
                                {msg.groundingMetadata.groundingChunks.map((chunk: any, idx: number) => {
                                  if (chunk.web) {
                                    return (
                                      <a
                                        key={idx}
                                        href={chunk.web.uri}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs text-brand-primary hover:underline flex items-center gap-1 font-semibold truncate"
                                      >
                                        <span className="shrink-0 bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded text-[8px] font-bold">
                                          {idx + 1}
                                        </span>
                                        <span className="truncate">{chunk.web.title || chunk.web.uri}</span>
                                        <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                                      </a>
                                    );
                                  }
                                  return null;
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                        {msg.role !== "user" && (
                          <button 
                            onClick={() => speak(msg.text)}
                            className="flex items-center gap-1 text-[10px] text-brand-primary font-bold uppercase tracking-wider hover:opacity-80 px-1 pt-1 cursor-pointer"
                          >
                            <Volume2 className="w-3 h-3" />
                            Speak Answer
                          </button>
                        )}
                      </div>
                    </div>
                  ))}

                  {assistantLoading && (
                    <div className="flex gap-3 items-center text-gray-400 text-xs font-bold pl-2">
                      <Loader2 className="w-4 h-4 animate-spin text-brand-primary" />
                      <span>Aristotle is analyzing academic sources...</span>
                    </div>
                  )}
                </div>

                {/* Footer Input */}
                <div className="p-4 border-t border-gray-100 bg-white">
                  <form 
                    onSubmit={(e) => { e.preventDefault(); sendAssistantMessage(); }}
                    className="flex gap-2"
                  >
                    <input
                      type="text"
                      placeholder="Ask the Research Assistant..."
                      value={assistantInput}
                      onChange={(e) => setAssistantInput(e.target.value)}
                      disabled={assistantLoading}
                      className="flex-1 px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                    />
                    <button
                      type="submit"
                      disabled={assistantLoading || !assistantInput.trim()}
                      className="p-3 bg-brand-primary text-white rounded-xl hover:bg-brand-primary/90 transition-all disabled:opacity-50 cursor-pointer"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

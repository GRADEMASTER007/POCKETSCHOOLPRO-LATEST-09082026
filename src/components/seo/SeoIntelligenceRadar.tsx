import React, { useState, useEffect } from "react";
import { 
  Search, Globe, TrendingUp, Sparkles, Copy, Check, ExternalLink, 
  BarChart3, Layers, Hash, Zap, ShieldCheck, ArrowRight, RefreshCw, Cpu
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface KeywordTrend {
  keyword: string;
  searchVolume: string;
  difficulty: string;
  intent: string;
  region: string;
  opportunityScore: number;
}

interface CurriculumCluster {
  name: string;
  topQueries: string[];
  searchGrowth: string;
}

interface SeoData {
  trendingKeywords: KeywordTrend[];
  curriculumClusters: CurriculumCluster[];
  socialHashtags: string[];
  seoAdvice: string;
}

export default function SeoIntelligenceRadar() {
  const [data, setData] = useState<SeoData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [customSubject, setCustomSubject] = useState<string>("");
  const [generatedKeywords, setGeneratedKeywords] = useState<string[]>([]);
  const [generatingCustom, setGeneratingCustom] = useState<boolean>(false);
  const [copiedHashtags, setCopiedHashtags] = useState<boolean>(false);
  const [copiedSchema, setCopiedSchema] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"radar" | "generator" | "crawlers" | "hashtags">("radar");

  useEffect(() => {
    fetchSeoTrends();
  }, []);

  const fetchSeoTrends = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/seo/keyword-trends");
      const json = await res.json();
      if (json.success && json.data) {
        setData(json.data);
      }
    } catch (err) {
      console.error("Error loading SEO radar data:", err);
    } finally {
      setLoading(false);
    }
  };

  const generateCustomKeywords = async () => {
    if (!customSubject.trim()) return;
    setGeneratingCustom(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `Generate 8 high-volume, high-ranking long-tail SEO keywords and search phrases for African students and schools searching for: "${customSubject}". Include regional terms (South Africa CAPS, IEB, SADC, WAEC, KCSE). Return ONLY a JSON array of strings.`,
          model: "gemini-3.5-flash"
        })
      });
      const json = await res.json();
      if (json.text) {
        const clean = json.text.replace(/```json|```/g, "").trim();
        const parsed = JSON.parse(clean);
        if (Array.isArray(parsed)) {
          setGeneratedKeywords(parsed);
        }
      }
    } catch (e) {
      setGeneratedKeywords([
        `${customSubject} step by step AI solver South Africa`,
        `best AI tutor for ${customSubject} matric 2026`,
        `free ${customSubject} study guide CAPS curriculum`,
        `${customSubject} past papers and memos AI explanations`,
        `homeschooling AI assistant ${customSubject} SADC`
      ]);
    } finally {
      setGeneratingCustom(false);
    }
  };

  const copyToClipboard = (text: string, type: "hashtags" | "schema") => {
    navigator.clipboard.writeText(text);
    if (type === "hashtags") {
      setCopiedHashtags(true);
      setTimeout(() => setCopiedHashtags(false), 2000);
    } else {
      setCopiedSchema(true);
      setTimeout(() => setCopiedSchema(false), 2000);
    }
  };

  const schemaSnippet = `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "EducationalOrganization",
  "name": "Grade Master Africa - Pocket School Pro",
  "url": "https://grademasterafrica.com",
  "description": "#1 AI Academic Tutor & CAPS/IEB/WAEC/Cambridge Homework Doctor for Primary School (Grades R-7), High School (Grades 8-12) & Higher Ed for South Africa, SADC & Africa.",
  "areaServed": ["South Africa", "Botswana", "Zambia", "Nigeria", "Zimbabwe", "Namibia", "Kenya"]
}
</script>`;

  return (
    <div className="max-w-7xl mx-auto space-y-8 text-slate-100">
      {/* Header Banner */}
      <div className="relative p-8 rounded-3xl bg-gradient-to-r from-amber-900/40 via-indigo-900/40 to-slate-900 border border-amber-500/30 overflow-hidden shadow-2xl backdrop-blur-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 text-xs font-bold uppercase tracking-widest mb-3">
              <Zap className="w-3.5 h-3.5 text-amber-400" /> SEMrush Style SERP Radar
            </div>
            <h1 className="text-3xl lg:text-4xl font-black tracking-tight text-white">
              Search & SEO Intelligence Command Center
            </h1>
            <p className="mt-2 text-sm lg:text-base text-slate-300 max-w-2xl">
              Monitor real-time search volume, SADC regional keyword intent, AI crawler indexing (Search, ChatGPT, Perplexity, Claude), and viral hashtag trends.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={fetchSeoTrends}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 transition-all shadow-md active:scale-95"
            >
              <RefreshCw className={`w-4 h-4 text-amber-400 ${loading ? "animate-spin" : ""}`} /> Refresh Trends
            </button>
            <a
              href="/sitemap.xml"
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-2 transition-all shadow-lg shadow-amber-500/20 active:scale-95"
            >
              <ExternalLink className="w-4 h-4" /> View Sitemap.xml
            </a>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3">
        {[
          { id: "radar", label: "SEMrush Keyword Radar", icon: BarChart3 },
          { id: "generator", label: "AI Long-Tail Generator", icon: Sparkles },
          { id: "crawlers", label: "Crawlers & Schema", icon: ShieldCheck },
          { id: "hashtags", label: "Social Hashtags Hub", icon: Hash }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${
                isActive
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-lg"
                  : "bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: RADAR GRID */}
      {activeTab === "radar" && (
        <div className="space-y-6">
          {/* Key Metric Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl">
              <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Targeted SADC Regions</div>
              <div className="text-2xl font-black text-amber-400 mt-2">17 Countries</div>
              <div className="text-[11px] text-slate-400 mt-1">SA, Botswana, Zambia, Nigeria, Kenya +</div>
            </div>
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl">
              <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Indexed Sitemaps & URLs</div>
              <div className="text-2xl font-black text-emerald-400 mt-2">19 Core Hubs</div>
              <div className="text-[11px] text-slate-400 mt-1">100% Crawlable via Robots.txt</div>
            </div>
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl">
              <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Average Keyword Opportunity</div>
              <div className="text-2xl font-black text-indigo-400 mt-2">95.4 / 100</div>
              <div className="text-[11px] text-slate-400 mt-1">High Intent Educational Searches</div>
            </div>
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl">
              <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">AI Search Compatibility</div>
              <div className="text-2xl font-black text-amber-300 mt-2">ChatGPT & Perplexity</div>
              <div className="text-[11px] text-slate-400 mt-1">GPTBot & ClaudeBot Enabled</div>
            </div>
          </div>

          {/* Trending Keywords Table */}
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800/80 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-amber-400" /> Top High-Volume African Search Queries
                </h2>
                <p className="text-xs text-slate-400">Calculated estimated monthly search volume and opportunity score for SADC educational markets.</p>
              </div>
            </div>

            {loading ? (
              <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
                <RefreshCw className="w-8 h-8 text-amber-400 animate-spin" />
                <p className="text-xs font-semibold">Analyzing SERP data & Gemini AI trends...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      <th className="py-3 px-4">Search Keyword Phrase</th>
                      <th className="py-3 px-4">Est. Volume</th>
                      <th className="py-3 px-4">Difficulty</th>
                      <th className="py-3 px-4">Intent</th>
                      <th className="py-3 px-4">Target Region</th>
                      <th className="py-3 px-4 text-right">Opportunity</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-xs">
                    {data?.trendingKeywords.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-slate-100 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-amber-400" />
                          {item.keyword}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-emerald-400 font-semibold">{item.searchVolume}</td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            item.difficulty === "Easy" ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" :
                            item.difficulty === "Medium" ? "bg-amber-500/20 text-amber-300 border border-amber-500/30" :
                            "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                          }`}>
                            {item.difficulty}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-300">{item.intent}</td>
                        <td className="py-3.5 px-4 font-semibold text-indigo-300">{item.region}</td>
                        <td className="py-3.5 px-4 text-right font-bold text-amber-400">{item.opportunityScore}/100</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Curriculum Clusters */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {data?.curriculumClusters.map((cluster, idx) => (
              <div key={idx} className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-400">{cluster.name}</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">{cluster.searchGrowth}</span>
                  </div>
                  <h3 className="text-sm font-black text-white mb-3">Popular Search Queries:</h3>
                  <ul className="space-y-2">
                    {cluster.topQueries.map((q, i) => (
                      <li key={i} className="text-xs text-slate-300 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80 flex items-center justify-between">
                        <span>"{q}"</span>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: AI LONG-TAIL GENERATOR */}
      {activeTab === "generator" && (
        <div className="p-8 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-2xl space-y-6">
          <div>
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" /> AI Long-Tail Educational Keyword Generator
            </h2>
            <p className="text-xs text-slate-400 mt-1">Enter any subject, grade level, or African city to discover high-intent keywords that students and parents search for.</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={customSubject}
              onChange={(e) => setCustomSubject(e.target.value)}
              placeholder="e.g. Grade 11 Chemistry Cape Town, CAPS Physical Sciences Soweto..."
              className="flex-1 px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-amber-500/60 transition-all"
            />
            <button
              onClick={generateCustomKeywords}
              disabled={generatingCustom || !customSubject.trim()}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 disabled:opacity-50 transition-all active:scale-95"
            >
              <Cpu className={`w-4 h-4 ${generatingCustom ? "animate-spin" : ""}`} />
              {generatingCustom ? "Analyzing..." : "Generate SERP Keywords"}
            </button>
          </div>

          {generatedKeywords.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-6 rounded-2xl bg-slate-950 border border-amber-500/30 space-y-3">
              <h3 className="text-xs font-bold text-amber-300 uppercase tracking-widest">Recommended Long-Tail Keywords to Rank First:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {generatedKeywords.map((kw, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs font-medium text-slate-200 flex items-center justify-between">
                    <span>{kw}</span>
                    <button
                      onClick={() => navigator.clipboard.writeText(kw)}
                      className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-all"
                      title="Copy keyword"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      )}

      {/* TAB 3: CRAWLERS & SCHEMA */}
      {activeTab === "crawlers" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" /> Active Search Crawlers & Endpoints
            </h3>
            <p className="text-xs text-slate-400">Grade Master Africa is configured for search engines and AI models (Searchbot, Bingbot, GPTBot, ClaudeBot, PerplexityBot).</p>

            <div className="space-y-3 pt-2">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white">XML Sitemap (`/sitemap.xml`)</div>
                  <div className="text-[11px] text-slate-400">Lists all 19 core academic hubs and study labs.</div>
                </div>
                <a href="/sitemap.xml" target="_blank" rel="noreferrer" className="px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 text-xs font-bold hover:bg-amber-500/30 transition-all flex items-center gap-1.5">
                  Inspect <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white">Robots File (`/robots.txt`)</div>
                  <div className="text-[11px] text-slate-400">Unlocks indexing for ChatGPT & Perplexity bots.</div>
                </div>
                <a href="/robots.txt" target="_blank" rel="noreferrer" className="px-3 py-1.5 rounded-xl bg-indigo-500/20 text-indigo-300 text-xs font-bold hover:bg-indigo-500/30 transition-all flex items-center gap-1.5">
                  Inspect <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-amber-400" /> Schema.org JSON-LD Structured Data
              </h3>
              <button
                onClick={() => copyToClipboard(schemaSnippet, "schema")}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-all"
              >
                {copiedSchema ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedSchema ? "Copied!" : "Copy Snippet"}
              </button>
            </div>
            <p className="text-xs text-slate-400">Injected into index.html for EducationalOrganization, SoftwareApplication, and Course indexing.</p>

            <pre className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-emerald-400 overflow-x-auto max-h-52">
              {schemaSnippet}
            </pre>
          </div>
        </div>
      )}

      {/* TAB 4: HASHTAGS HUB */}
      {activeTab === "hashtags" && (
        <div className="p-8 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                <Hash className="w-5 h-5 text-amber-400" /> High-Growth Social Media Hashtags
              </h2>
              <p className="text-xs text-slate-400 mt-1">Copy these targeted tags for viral reach across TikTok, Instagram, X (Twitter), Facebook & LinkedIn.</p>
            </div>
            <button
              onClick={() => copyToClipboard(data?.socialHashtags.join(" ") || "#GradeMasterAfrica #Matric2026 #AITutorAfrica", "hashtags")}
              className="px-5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-lg active:scale-95"
            >
              {copiedHashtags ? <Check className="w-4 h-4 text-slate-950" /> : <Copy className="w-4 h-4" />}
              {copiedHashtags ? "All Hashtags Copied!" : "Copy All Hashtags"}
            </button>
          </div>

          <div className="flex flex-wrap gap-2.5 p-6 rounded-2xl bg-slate-950 border border-slate-800">
            {data?.socialHashtags.map((tag, idx) => (
              <span
                key={idx}
                className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-amber-300 cursor-pointer transition-all hover:scale-105"
                onClick={() => navigator.clipboard.writeText(tag)}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

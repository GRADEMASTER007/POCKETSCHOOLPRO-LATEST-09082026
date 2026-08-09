import React, { useState } from "react";
import { 
  PenTool, 
  Lightbulb, 
  FileText, 
  Mail, 
  ChevronLeft, 
  Sparkles, 
  ArrowRight, 
  Loader2, 
  Send,
  MessageSquare,
  Check,
  Copy,
  Trash2,
  FileEdit
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { auth } from "@/src/lib/firebase";
import { cn } from "@/src/lib/utils";

type Idea = {
  title: string;
  description: string;
  outline: string[];
};

export default function WritingCenter() {
  const [mode, setMode] = useState<"menu" | "ideas" | "draft">("menu");
  const [type, setType] = useState<"Essay" | "Assignment" | "Letter" | "Speech">("Essay");
  const [topic, setTopic] = useState("");
  const [prompt, setPrompt] = useState("");
  const [tone, setTone] = useState("Professional");
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [ideas, setIdeas] = useState<Idea[] | null>(null);
  const [draft, setDraft] = useState<{ content: string; tips: string[] } | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerateIdeas = async () => {
    if (!topic.trim()) return;
    setIsGenerating(true);
    setIdeas(null);
    try {
      const idToken = await auth.currentUser?.getIdToken();
      const res = await fetch("/api/writing/generate-ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${idToken}` },
        body: JSON.stringify({ type, topic })
      });
      const data = await res.json();
      setIdeas(data.ideas);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateDraft = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setDraft(null);
    try {
      const idToken = await auth.currentUser?.getIdToken();
      const res = await fetch("/api/writing/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${idToken}` },
        body: JSON.stringify({ type, prompt, tone: tone.toLowerCase() })
      });
      const data = await res.json();
      setDraft({ content: data.draft, tips: data.tips });
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-4 lg:p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
            Writing Assistant <span className="text-sm px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full font-bold uppercase tracking-wider">Expert Edition</span>
          </h1>
          <p className="text-gray-500 text-sm mt-1">Unlock your creativity with AI-powered ideas and drafting tools.</p>
        </div>
        <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shrink-0">
          <PenTool className="w-6 h-6" />
        </div>
      </div>

      <AnimatePresence mode="wait">
        {mode === "menu" && (
          <motion.div 
            key="menu"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            <button 
              onClick={() => setMode("ideas")}
              className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col items-center text-center group hover:border-indigo-200 transition-all"
            >
              <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-all">
                <Lightbulb className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-black text-gray-900 mb-2">Idea Generator</h2>
              <p className="text-gray-500 text-sm leading-relaxed mb-6">Stuck at the start? Generate creative angles, outlines, and hooks for any topic.</p>
              <div className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-md">
                Get Ideas <ArrowRight className="w-4 h-4" />
              </div>
            </button>

            <button 
              onClick={() => setMode("draft")}
              className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col items-center text-center group hover:border-purple-200 transition-all"
            >
              <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-all">
                <FileEdit className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-black text-gray-900 mb-2">Drafting Assistant</h2>
              <p className="text-gray-500 text-sm leading-relaxed mb-6">Need a first draft? Let the AI help you structure and write your letters or essays.</p>
              <div className="w-full py-4 bg-purple-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-md">
                Start Drafting <ArrowRight className="w-4 h-4" />
              </div>
            </button>
          </motion.div>
        )}

        {mode === "ideas" && (
          <motion.div 
            key="ideas"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="flex justify-between items-center">
              <button onClick={() => setMode("menu")} className="flex items-center gap-1.5 text-sm font-bold text-gray-500 hover:text-gray-900">
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
              <div className="text-[10px] font-black uppercase tracking-widest bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full border border-indigo-100">Idea Lab</div>
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
              <div className="flex flex-wrap gap-3">
                {["Essay", "Assignment", "Letter", "Speech"].map((t) => (
                  <button 
                    key={t}
                    onClick={() => setType(t as any)}
                    className={cn(
                      "px-5 py-2 rounded-xl text-xs font-bold transition-all border",
                      type === t ? "bg-indigo-600 text-white border-transparent shadow-lg" : "bg-gray-50 text-gray-500 border-gray-100 hover:bg-gray-100"
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>

              <div className="relative">
                <input 
                  type="text" 
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder={`Enter your ${type.toLowerCase()} topic (e.g., Climate Change in Africa)...`}
                  className="w-full px-6 py-5 bg-gray-50 border border-gray-100 rounded-[2rem] text-lg font-bold focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
                />
              </div>

              <button 
                onClick={handleGenerateIdeas}
                disabled={isGenerating || !topic.trim()}
                className="w-full py-5 bg-indigo-600 text-white rounded-[2rem] font-black text-sm uppercase tracking-widest hover:scale-[1.02] transition-all disabled:opacity-50 flex items-center justify-center gap-3 shadow-xl shadow-indigo-500/20"
              >
                {isGenerating ? <Loader2 className="w-6 h-6 animate-spin" /> : <Sparkles className="w-6 h-6" />}
                Generate Ideas
              </button>
            </div>

            {ideas && (
              <div className="space-y-6">
                {ideas.map((idea, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm hover:border-indigo-200 transition-all group"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-black text-gray-900 group-hover:text-indigo-600 transition-colors">{idea.title}</h3>
                      <button onClick={() => handleCopy(`${idea.title}\n\n${idea.description}\n\nOutline:\n${idea.outline.join('\n')}`)} className="p-2 hover:bg-indigo-50 text-gray-400 hover:text-indigo-600 rounded-xl transition-all">
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed mb-6">{idea.description}</p>
                    <div className="space-y-3">
                      <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Recommended Outline</p>
                      <div className="space-y-2">
                        {idea.outline.map((step, sidx) => (
                          <div key={sidx} className="flex gap-3 text-xs text-gray-600">
                            <span className="w-5 h-5 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center shrink-0 font-bold">{sidx + 1}</span>
                            <span className="mt-0.5">{step}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {mode === "draft" && (
          <motion.div 
            key="draft"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="flex justify-between items-center">
              <button onClick={() => setMode("menu")} className="flex items-center gap-1.5 text-sm font-bold text-gray-500 hover:text-gray-900">
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
              <div className="text-[10px] font-black uppercase tracking-widest bg-purple-50 text-purple-700 px-3 py-1 rounded-full border border-purple-100">Drafting Lab</div>
            </div>

            {!draft ? (
              <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
                <div className="flex flex-wrap gap-3">
                  {["Formal", "Casual", "Professional", "Academic"].map((t) => (
                    <button 
                      key={t}
                      onClick={() => setTone(t)}
                      className={cn(
                        "px-5 py-2 rounded-xl text-xs font-bold transition-all border",
                        tone === t ? "bg-purple-600 text-white border-transparent shadow-lg" : "bg-gray-50 text-gray-500 border-gray-100 hover:bg-gray-100"
                      )}
                    >
                      {t}
                    </button>
                  ))}
                </div>

                <textarea 
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe what you want to write (e.g., A formal letter to the school board about extracurricular activities)..."
                  className="w-full h-40 p-6 bg-gray-50 border border-gray-100 rounded-[2rem] text-sm font-medium focus:outline-none focus:ring-4 focus:ring-purple-500/10 resize-none"
                />

                <button 
                  onClick={handleGenerateDraft}
                  disabled={isGenerating || !prompt.trim()}
                  className="w-full py-5 bg-purple-600 text-white rounded-[2rem] font-black text-sm uppercase tracking-widest hover:scale-[1.02] transition-all disabled:opacity-50 flex items-center justify-center gap-3 shadow-xl shadow-purple-500/20"
                >
                  {isGenerating ? <Loader2 className="w-6 h-6 animate-spin" /> : <Send className="w-6 h-6" />}
                  Generate Draft
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
                  <div className="flex justify-between items-center border-b border-gray-50 pb-4">
                    <h3 className="text-xl font-black text-gray-900">Your {tone} Draft</h3>
                    <div className="flex gap-2">
                      <button onClick={() => handleCopy(draft.content)} className="p-2 hover:bg-purple-50 text-gray-400 hover:text-purple-600 rounded-xl transition-all">
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </button>
                      <button onClick={() => setDraft(null)} className="p-2 hover:bg-rose-50 text-gray-400 hover:text-rose-600 rounded-xl transition-all">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed font-medium bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
                    {draft.content}
                  </div>
                </div>

                <div className="bg-amber-50 p-8 rounded-[2rem] border border-amber-100 space-y-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-500" />
                    <h4 className="text-sm font-black text-amber-900 uppercase tracking-widest">Writing Tips</h4>
                  </div>
                  <div className="space-y-2">
                    {draft.tips.map((tip, idx) => (
                      <div key={idx} className="flex gap-3 text-xs text-amber-800 font-medium leading-relaxed">
                        <Check className="w-4 h-4 text-amber-500 shrink-0" />
                        <span>{tip}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

import React, { useState, useRef } from "react";
import { 
  StickyNote, 
  Camera, 
  Mic, 
  Upload, 
  Sparkles, 
  Loader2, 
  Check, 
  Trash2, 
  Download, 
  Copy,
  ChevronLeft,
  FileText,
  Bookmark,
  Hash,
  MessageSquare
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { auth } from "@/src/lib/firebase";
import { cn } from "@/src/lib/utils";

type NoteSection = {
  heading: string;
  content: string;
};

type AINote = {
  title: string;
  sections: NoteSection[];
  summary: string;
  tags: string[];
};

export default function AINotes() {
  const [mode, setMode] = useState<"input" | "result">("input");
  const [content, setContent] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [note, setNote] = useState<AINote | null>(null);
  const [copied, setCopied] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!content.trim() && !image) return;
    setIsGenerating(true);
    setNote(null);
    try {
      const idToken = await auth.currentUser?.getIdToken();
      const res = await fetch("/api/writing/ai-notes", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${idToken}` },
        body: JSON.stringify({ 
          content, 
          image, 
          type: image ? "homework" : "summarize" 
        })
      });
      const data = await res.json();
      setNote(data);
      setMode("result");
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (!note) return;
    const text = `${note.title}\n\n${note.summary}\n\n${note.sections.map(s => `${s.heading}\n${s.content}`).join('\n\n')}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-4 lg:p-8 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
            AI Notes Master <span className="text-sm px-3 py-1 bg-amber-100 text-amber-700 rounded-full font-bold uppercase tracking-wider">Homework Edition</span>
          </h1>
          <p className="text-gray-500 text-sm mt-1">Snap a photo or record your thoughts to create perfect study notes.</p>
        </div>
        <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center shrink-0">
          <StickyNote className="w-6 h-6" />
        </div>
      </div>

      <AnimatePresence mode="wait">
        {mode === "input" ? (
          <motion.div 
            key="input"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className={cn(
                    "p-8 rounded-[2rem] border-2 border-dashed flex flex-col items-center gap-3 transition-all",
                    image ? "border-amber-400 bg-amber-50" : "border-gray-100 hover:border-amber-200 hover:bg-gray-50"
                  )}
                >
                  {image ? (
                    <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-sm">
                      <img src={image} alt="Upload" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <Camera className="w-8 h-8 text-white" />
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center">
                        <Camera className="w-6 h-6" />
                      </div>
                      <div className="text-center">
                        <p className="font-bold text-gray-900">Homework Photo</p>
                        <p className="text-xs text-gray-400">Upload handwritten notes or book pages</p>
                      </div>
                    </>
                  )}
                  <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
                </button>

                <div className="p-8 rounded-[2rem] border-2 border-gray-100 flex flex-col items-center gap-3 bg-gray-50/50">
                  <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center">
                    <Mic className="w-6 h-6" />
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-gray-900">Voice Note</p>
                    <p className="text-xs text-gray-400">Speak your thoughts directly (beta)</p>
                  </div>
                  <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden mt-2">
                    <div className="w-1/3 h-full bg-indigo-500 animate-pulse" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest px-1">Transcript / Additional Context</label>
                <textarea 
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Paste text here or add specific instructions for the AI..."
                  className="w-full h-40 p-6 bg-gray-50 border border-gray-100 rounded-[2rem] text-sm font-medium focus:outline-none focus:ring-4 focus:ring-amber-500/10 resize-none"
                />
              </div>

              <button 
                onClick={handleGenerate}
                disabled={isGenerating || (!content.trim() && !image)}
                className="w-full py-5 bg-amber-500 text-white rounded-[2rem] font-black text-sm uppercase tracking-widest hover:scale-[1.02] transition-all disabled:opacity-50 flex items-center justify-center gap-3 shadow-xl shadow-amber-500/20"
              >
                {isGenerating ? <Loader2 className="w-6 h-6 animate-spin" /> : <Sparkles className="w-6 h-6" />}
                Process AI Note
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="result"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="flex justify-between items-center">
              <button onClick={() => setMode("input")} className="flex items-center gap-1.5 text-sm font-bold text-gray-500 hover:text-gray-900">
                <ChevronLeft className="w-4 h-4" /> New Note
              </button>
              <div className="flex gap-2">
                <button onClick={handleCopy} className="p-3 bg-white border border-gray-100 rounded-xl text-gray-500 hover:text-amber-600 transition-all shadow-sm">
                  {copied ? <Check className="w-5 h-5 text-emerald-500" /> : <Copy className="w-5 h-5" />}
                </button>
                <button className="p-3 bg-white border border-gray-100 rounded-xl text-gray-500 hover:text-amber-600 transition-all shadow-sm">
                  <Bookmark className="w-5 h-5" />
                </button>
              </div>
            </div>

            {note && (
              <div className="space-y-6">
                {/* Main Content */}
                <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-8">
                  <div className="space-y-2">
                    <h2 className="text-3xl font-black text-gray-900 tracking-tight">{note.title}</h2>
                    <div className="flex flex-wrap gap-2">
                      {note.tags.map(tag => (
                        <span key={tag} className="text-[10px] font-black uppercase px-3 py-1 bg-gray-50 text-gray-400 rounded-full border border-gray-100">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="p-6 bg-amber-50/50 rounded-2xl border border-amber-100 relative">
                    <Sparkles className="absolute -top-3 -right-3 w-8 h-8 text-amber-200" />
                    <h3 className="text-xs font-black text-amber-600 uppercase tracking-widest mb-2 flex items-center gap-2">
                      <FileText className="w-3 h-3" /> Executive Summary
                    </h3>
                    <p className="text-sm text-gray-700 leading-relaxed font-medium">
                      {note.summary}
                    </p>
                  </div>

                  <div className="space-y-8">
                    {note.sections.map((section, idx) => (
                      <div key={idx} className="space-y-4">
                        <h4 className="text-lg font-black text-gray-900 flex items-center gap-3">
                          <span className="w-8 h-8 bg-gray-900 text-white rounded-lg flex items-center justify-center text-xs">{idx + 1}</span>
                          {section.heading}
                        </h4>
                        <div className="pl-11 border-l-2 border-gray-50">
                          <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap font-medium">
                            {section.content}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="bg-slate-900 p-8 rounded-[2rem] text-white flex flex-col md:flex-row justify-between items-center gap-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                      <Download className="w-6 h-6 text-amber-400" />
                    </div>
                    <div>
                      <p className="font-bold">Export Options</p>
                      <p className="text-xs text-slate-400">Save to PDF or share with classmates.</p>
                    </div>
                  </div>
                  <div className="flex gap-3 w-full md:w-auto">
                    <button className="flex-1 px-8 py-4 bg-white/10 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-white/20 transition-all">
                      PDF Export
                    </button>
                    <button className="flex-1 px-8 py-4 bg-amber-500 text-slate-900 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-amber-400 transition-all shadow-lg shadow-amber-400/20">
                      Add to Vault
                    </button>
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

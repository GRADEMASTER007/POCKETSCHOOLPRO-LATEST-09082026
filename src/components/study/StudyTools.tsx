import { appCheck } from "@/src/lib/firebase";
import { getToken } from "firebase/app-check";
import { auth } from "@/src/lib/firebase";
import React, { useState } from "react";
import { motion } from "motion/react";
import { BookOpen, HelpCircle, Loader2, Sparkles, Layout } from "lucide-react";
import { useAuth } from "@/src/components/auth/AuthContext";
import MathEngine from "./MathEngine";
import ScienceEngine from "./ScienceEngine";
import BiologyEngine from "./BiologyEngine";
import GeographyEngine from "./GeographyEngine";
import AgriEngine from "./AgriEngine";
import FlashcardEngine from "./FlashcardEngine";
import QuizEngine from "./QuizEngine";

interface Flashcard { front: string; back: string; }
interface QuizItem { question: string; options: string[]; answer: number; }

export default function StudyTools({ subject, initialTopic = "" }: { subject: string; initialTopic?: string }) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"engine" | "flashcards" | "quiz">("engine");
  const [topic, setTopic] = useState(initialTopic);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [quiz, setQuiz] = useState<QuizItem[]>([]);
  const [loading, setLoading] = useState(false);

  const generateFlashcards = async () => {
    if(!topic) return;
    setLoading(true);
    setActiveTab("flashcards");
    const response = await fetch("/api/generate-flashcards", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${await auth.currentUser?.getIdToken()}`},
      body: JSON.stringify({ topic, subject, userId: user?.uid }),
    });
    setFlashcards(await response.json());
    setLoading(false);
  };

  const generateQuiz = async () => {
    if(!topic) return;
    setLoading(true);
    setActiveTab("quiz");
    const response = await fetch("/api/generate-quiz", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${await auth.currentUser?.getIdToken()}`},
      body: JSON.stringify({ topic, subject, userId: user?.uid }),
    });
    setQuiz(await response.json());
    setLoading(false);
  };

  const renderEngine = () => {
    const s = subject.toLowerCase();
    if (s.includes("math")) return <MathEngine initialProblem={initialTopic} />;
    if (s.includes("physic") || s.includes("chemist") || s.includes("science")) return <ScienceEngine />;
    if (s.includes("biology") || s.includes("life")) return <BiologyEngine />;
    if (s.includes("geograph")) return <GeographyEngine />;
    if (s.includes("agri")) return <AgriEngine />;
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400 bg-gray-50 rounded-3xl border border-gray-100">
        <Sparkles className="w-12 h-12 mb-4 opacity-50" />
        <p className="font-medium text-gray-600">No dedicated virtual lab available for {subject} yet.</p>
        <p className="text-sm mt-2">Use the Flashcards or Quiz tools to study this subject.</p>
      </div>
    );
  };

  return (
    <div className="space-y-6 p-6 h-full overflow-y-auto custom-scrollbar">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-2">
        <div className="flex bg-gray-100/80 p-1.5 rounded-2xl border border-gray-200/50 w-full md:w-auto">
          <button
            onClick={() => setActiveTab("engine")}
            className={cn("flex-1 md:flex-none px-4 py-2.5 text-xs font-black uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2", activeTab === "engine" ? "bg-white text-brand-primary shadow-sm" : "text-gray-500 hover:text-gray-800")}
          >
            <Layout className="w-4 h-4" /> Lab
          </button>
          <button
            onClick={() => setActiveTab("flashcards")}
            className={cn("flex-1 md:flex-none px-4 py-2.5 text-xs font-black uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2", activeTab === "flashcards" ? "bg-white text-brand-primary shadow-sm" : "text-gray-500 hover:text-gray-800")}
          >
            <BookOpen className="w-4 h-4" /> Flashcards
          </button>
          <button
            onClick={() => setActiveTab("quiz")}
            className={cn("flex-1 md:flex-none px-4 py-2.5 text-xs font-black uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2", activeTab === "quiz" ? "bg-white text-brand-primary shadow-sm" : "text-gray-500 hover:text-gray-800")}
          >
            <HelpCircle className="w-4 h-4" /> Quiz
          </button>
        </div>
      </div>

      {activeTab === "engine" ? (
        renderEngine()
      ) : (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row gap-4">
            <input 
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder={`Enter ${subject} topic...`}
              className="flex-1 p-4 rounded-2xl border border-gray-200 focus:outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 transition-all"
            />
            <button onClick={activeTab === "flashcards" ? generateFlashcards : generateQuiz} disabled={loading || !topic} className="bg-brand-primary text-white px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-brand-primary/90 disabled:opacity-50">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Generate"}
            </button>
          </div>

          {loading && (
            <div className="py-20 flex justify-center">
              <Loader2 className="w-10 h-10 animate-spin text-brand-primary" />
            </div>
          )}

          {!loading && activeTab === "flashcards" && flashcards.length > 0 && (
            <FlashcardEngine cards={flashcards} />
          )}

          {!loading && activeTab === "quiz" && quiz.length > 0 && (
            <QuizEngine questions={quiz} />
          )}
        </div>
      )}
    </div>
  );
}

function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(" ");
}

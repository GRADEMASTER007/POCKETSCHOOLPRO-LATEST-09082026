import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Trophy, 
  Timer, 
  HelpCircle, 
  ArrowRight, 
  RotateCcw, 
  CheckCircle2, 
  XCircle,
  Zap,
  Star,
  Sparkles,
  BookOpen,
  Search,
  Shuffle,
  Award,
  Layers
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import { PRESEEDED_QUIZZES, PreseededQuizQuestion } from "@/src/data/preseededCoursework";

interface Question {
  id?: string | number;
  subject?: string;
  category?: string;
  question: string;
  options: string[];
  answer: number;
  explanation?: string;
}

export default function QuizEngine({ questions }: { questions?: Question[] }) {
  const [selectedSubject, setSelectedSubject] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [quizLength, setQuizLength] = useState<number>(10);
  
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);

  // All source questions
  const allQuestions = useMemo(() => {
    if (questions && questions.length > 0) return questions;
    return PRESEEDED_QUIZZES.map(q => ({
      id: q.id,
      subject: q.subject,
      category: q.category,
      question: q.question,
      options: q.options,
      answer: q.answer,
      explanation: q.explanation
    }));
  }, [questions]);

  // Unique subjects available
  const availableSubjects = useMemo(() => {
    const set = new Set<string>();
    allQuestions.forEach(q => { if (q.subject) set.add(q.subject); });
    return ["All", ...Array.from(set)];
  }, [allQuestions]);

  // Filter questions based on subject & search query
  const filteredPool = useMemo(() => {
    return allQuestions.filter(q => {
      const matchSubj = selectedSubject === "All" || q.subject === selectedSubject;
      const term = searchQuery.toLowerCase();
      const matchSearch = !term || q.question.toLowerCase().includes(term) || (q.category && q.category.toLowerCase().includes(term));
      return matchSubj && matchSearch;
    });
  }, [allQuestions, selectedSubject, searchQuery]);

  // Active quiz set for current session
  const activeQuestions = useMemo(() => {
    return filteredPool.slice(0, quizLength);
  }, [filteredPool, quizLength]);

  const handleSelect = (idx: number) => {
    if (isAnswered) return;
    setSelectedIdx(idx);
    setIsAnswered(true);
    if (activeQuestions[currentIdx] && idx === activeQuestions[currentIdx].answer) {
      setScore(prev => prev + 1);
    }
  };

  const nextQuestion = () => {
    if (currentIdx < activeQuestions.length - 1) {
      setCurrentIdx(prev => prev + 1);
      setSelectedIdx(null);
      setIsAnswered(false);
    } else {
      setShowResult(true);
    }
  };

  const resetQuiz = () => {
    setCurrentIdx(0);
    setSelectedIdx(null);
    setIsAnswered(false);
    setScore(0);
    setShowResult(false);
  };

  const shuffleQuestions = () => {
    resetQuiz();
  };

  if (!activeQuestions || activeQuestions.length === 0) {
    return (
      <div className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-xl text-center space-y-4">
        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto">
          <HelpCircle className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-gray-900">No Quiz Questions Found</h3>
        <p className="text-sm text-gray-500">Try adjusting your search query or subject category filter.</p>
        <button
          onClick={() => { setSelectedSubject("All"); setSearchQuery(""); }}
          className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl text-xs uppercase tracking-wider"
        >
          Reset Filters
        </button>
      </div>
    );
  }

  if (showResult) {
    const percentage = Math.round((score / activeQuestions.length) * 100);
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white p-8 md:p-12 rounded-[3rem] border border-gray-100 shadow-2xl text-center space-y-8"
      >
        <div className="relative inline-block">
          <Trophy className="w-24 h-24 text-amber-400 mx-auto" />
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute -top-4 -right-4"
          >
            <Star className="w-10 h-10 text-amber-400 fill-current" />
          </motion.div>
        </div>
        
        <div>
          <h3 className="text-4xl font-display font-black text-gray-900">Evaluation Completed!</h3>
          <p className="text-gray-500 font-medium mt-2">Earned <strong>+{score * 50} XP</strong> in subject mastery.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-lg mx-auto">
          <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Score</p>
            <p className="text-3xl font-black text-blue-600">{score} / {activeQuestions.length}</p>
          </div>
          <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Accuracy</p>
            <p className="text-3xl font-black text-emerald-500">{percentage}%</p>
          </div>
          <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Grade</p>
            <p className="text-3xl font-black text-purple-600">
              {percentage >= 90 ? "A+" : percentage >= 75 ? "B" : percentage >= 50 ? "C" : "Needs Review"}
            </p>
          </div>
        </div>

        <div className="flex justify-center gap-4">
          <button
            onClick={resetQuiz}
            className="px-10 py-4 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl transition-all shadow-lg shadow-blue-600/20 text-xs uppercase tracking-widest"
          >
            RETRY QUIZ
          </button>
          <button
            onClick={() => { resetQuiz(); setSelectedSubject("All"); }}
            className="px-8 py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-black rounded-2xl transition-all text-xs uppercase tracking-widest"
          >
            CHANGE SUBJECT
          </button>
        </div>
      </motion.div>
    );
  }

  const currentQ = activeQuestions[currentIdx];

  return (
    <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl overflow-hidden space-y-6">
      {/* Quiz Top Header */}
      <div className="p-6 md:p-8 border-b border-gray-100 bg-gradient-to-r from-blue-900 to-indigo-900 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/20 shrink-0">
            <Zap className="w-6 h-6 text-amber-400 fill-current" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-blue-200">
              <Sparkles className="w-3 h-3 text-amber-400" />
              {currentQ.subject || "Academic"} • {currentQ.category || "Evaluation"}
            </div>
            <h3 className="text-xl md:text-2xl font-display font-black leading-tight">300+ Curriculum Diagnostic Engine</h3>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-bold tracking-widest">
            Q {currentIdx + 1} / {activeQuestions.length}
          </span>
        </div>
      </div>

      {/* Filter and Subject Selector Bar */}
      <div className="px-6 md:px-8 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Subjects scroll */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none flex-1">
            {availableSubjects.map(s => (
              <button
                key={s}
                onClick={() => { setSelectedSubject(s); resetQuiz(); }}
                className={cn(
                  "px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider shrink-0 transition-all border",
                  selectedSubject === s 
                    ? "bg-blue-600 text-white border-transparent shadow-sm"
                    : "bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100"
                )}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative w-48 shrink-0">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); resetQuiz(); }}
              placeholder="Search 300+ quizzes..."
              className="w-full pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-[11px] font-semibold focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Question Card */}
      <div className="p-6 md:p-8 space-y-8">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-100">
            <HelpCircle className="w-3.5 h-3.5" />
            Diagnostic Question
          </div>
          <h4 className="text-2xl md:text-3xl font-display font-black text-gray-900 leading-snug">
            {currentQ.question}
          </h4>
        </div>

        {/* Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentQ.options.map((option, i) => {
            const isCorrect = i === currentQ.answer;
            const isSelected = i === selectedIdx;
            
            return (
              <motion.button
                key={i}
                onClick={() => handleSelect(i)}
                whileHover={!isAnswered ? { x: 4, scale: 1.01 } : {}}
                className={cn(
                  "p-5 rounded-2xl border-2 text-left transition-all relative flex items-center justify-between group cursor-pointer",
                  !isAnswered ? "border-gray-200 hover:border-blue-500 hover:bg-blue-50/50" : 
                  isCorrect ? "border-emerald-500 bg-emerald-50 text-emerald-950 font-bold" :
                  isSelected ? "border-rose-500 bg-rose-50 text-rose-950 font-bold" : "border-gray-100 opacity-50"
                )}
              >
                <div className="flex items-center gap-3.5 w-full">
                  <span className={cn(
                    "w-7 h-7 flex-shrink-0 rounded-full flex items-center justify-center text-xs font-black border",
                    isSelected ? "bg-blue-600 text-white border-transparent" : "bg-gray-100 border-gray-300 text-gray-600 group-hover:border-blue-500 group-hover:text-blue-600"
                  )}>
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span className="text-base font-semibold flex-1 leading-snug">{option}</span>
                </div>
                {isAnswered && isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />}
                {isAnswered && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />}
              </motion.button>
            );
          })}
        </div>

        {/* AI Step-by-Step Insight Explanation */}
        <AnimatePresence>
          {isAnswered && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-900 text-slate-100 p-6 rounded-3xl space-y-4 shadow-xl"
            >
              <div className="flex items-center gap-2 text-amber-400 font-black text-xs uppercase tracking-widest">
                <Sparkles className="w-4 h-4 animate-pulse" />
                AI Tutor Step-by-Step Explanation & Key Takeaway
              </div>
              <p className="text-slate-300 text-sm leading-relaxed font-medium">
                {currentQ.explanation || "Review fundamental formulas and logical steps to master this core curriculum topic."}
              </p>
              <button
                onClick={nextQuestion}
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl flex items-center justify-center gap-2 transition-all shadow-md text-xs uppercase tracking-widest"
              >
                {currentIdx === activeQuestions.length - 1 ? "FINISH EVALUATION" : "NEXT QUESTION"}
                <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

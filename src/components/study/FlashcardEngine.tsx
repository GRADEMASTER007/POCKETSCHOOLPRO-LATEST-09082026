import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Zap, 
  RotateCcw, 
  ThumbsUp, 
  ThumbsDown,
  Sparkles,
  Layers,
  Search,
  Shuffle,
  BookOpen,
  Filter,
  CheckCircle2,
  Bookmark
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import { PRESEEDED_FLASHCARDS, PreseededFlashcard } from "@/src/data/preseededCoursework";

interface Flashcard { 
  id?: string | number; 
  subject?: string;
  category?: string;
  front: string; 
  back: string; 
}

export default function FlashcardEngine({ cards }: { cards?: Flashcard[] }) {
  const [selectedSubject, setSelectedSubject] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [current, setCurrent] = useState<number>(0);
  const [flipped, setFlipped] = useState<boolean>(false);
  const [masteredIds, setMasteredIds] = useState<Set<string | number>>(new Set());

  // Base cards: if custom cards passed, use them; otherwise use 300 preseeded flashcards
  const allCards = useMemo(() => {
    if (cards && cards.length > 0) return cards;
    return PRESEEDED_FLASHCARDS.map(fc => ({
      id: fc.id,
      subject: fc.subject,
      category: fc.category,
      front: fc.front,
      back: fc.back
    }));
  }, [cards]);

  // Unique subjects available
  const availableSubjects = useMemo(() => {
    const set = new Set<string>();
    allCards.forEach(c => { if (c.subject) set.add(c.subject); });
    return ["All", ...Array.from(set)];
  }, [allCards]);

  // Filtered cards based on subject and search query
  const filteredCards = useMemo(() => {
    return allCards.filter(c => {
      const matchSubj = selectedSubject === "All" || c.subject === selectedSubject;
      const q = searchQuery.toLowerCase();
      const matchSearch = !q || c.front.toLowerCase().includes(q) || c.back.toLowerCase().includes(q) || (c.category && c.category.toLowerCase().includes(q));
      return matchSubj && matchSearch;
    });
  }, [allCards, selectedSubject, searchQuery]);

  // Reset index when filter changes
  const activeIndex = current >= filteredCards.length ? 0 : current;
  const activeCard = filteredCards[activeIndex] || filteredCards[0];

  const handleNext = () => {
    setFlipped(false);
    if (filteredCards.length > 0) {
      setCurrent((activeIndex + 1) % filteredCards.length);
    }
  };

  const handlePrev = () => {
    setFlipped(false);
    if (filteredCards.length > 0) {
      setCurrent((activeIndex - 1 + filteredCards.length) % filteredCards.length);
    }
  };

  const toggleMastered = (cardId?: string | number) => {
    if (!cardId) return;
    setMasteredIds(prev => {
      const next = new Set(prev);
      if (next.has(cardId)) next.delete(cardId);
      else next.add(cardId);
      return next;
    });
  };

  const shuffleDeck = () => {
    setFlipped(false);
    setCurrent(Math.floor(Math.random() * Math.max(1, filteredCards.length)));
  };

  if (!filteredCards || filteredCards.length === 0) {
    return (
      <div className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-xl text-center space-y-4">
        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto">
          <BookOpen className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-gray-900">No Flashcards Found</h3>
        <p className="text-sm text-gray-500">Try clearing your search query or choosing another subject filter.</p>
        <button
          onClick={() => { setSelectedSubject("All"); setSearchQuery(""); }}
          className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl text-xs uppercase tracking-wider"
        >
          Reset Filters
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[3rem] p-6 md:p-10 border border-gray-100 shadow-xl space-y-8">
      {/* Top Header & Search / Filter Controls */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-gray-100 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-[10px] font-black uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" /> 300+ High Quality Active Recall Deck
          </div>
          <h2 className="text-3xl font-display font-black text-gray-900">Smart Flashcards</h2>
          <p className="text-gray-500 text-xs font-medium">Master key formulas, concepts, and definitions across curricula</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          {/* Search bar */}
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrent(0); }}
              placeholder="Search 300+ cards..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-semibold focus:outline-none focus:border-indigo-500"
            />
          </div>

          <button
            onClick={shuffleDeck}
            className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-2xl text-xs font-bold flex items-center gap-1.5 transition-all"
            title="Shuffle active deck"
          >
            <Shuffle className="w-4 h-4" /> Shuffle
          </button>
        </div>
      </div>

      {/* Subject Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {availableSubjects.map(subj => (
          <button
            key={subj}
            onClick={() => { setSelectedSubject(subj); setCurrent(0); setFlipped(false); }}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider shrink-0 transition-all border",
              selectedSubject === subj 
                ? "bg-indigo-600 text-white border-transparent shadow-md shadow-indigo-600/20"
                : "bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100"
            )}
          >
            {subj}
          </button>
        ))}
      </div>

      {/* Main Flashcard Stage */}
      <div className="flex flex-col items-center justify-center min-h-[420px]">
        <div className="w-full max-w-xl aspect-[16/10] relative perspective-1000">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${activeIndex}-${flipped ? "back" : "front"}`}
              initial={{ rotateY: flipped ? -90 : 90, opacity: 0 }}
              animate={{ rotateY: 0, opacity: 1 }}
              exit={{ rotateY: flipped ? 90 : -90, opacity: 0 }}
              transition={{ duration: 0.35 }}
              onClick={() => setFlipped(!flipped)}
              className={cn(
                "absolute inset-0 rounded-[2.5rem] shadow-2xl flex flex-col justify-between p-8 text-center cursor-pointer border-4 border-white select-none overflow-y-auto custom-scrollbar transition-colors",
                flipped ? "bg-gradient-to-br from-indigo-600 to-violet-700 text-white" : "bg-gradient-to-br from-slate-900 to-indigo-950 text-slate-100"
              )}
            >
              {/* Card top bar */}
              <div className="flex items-center justify-between text-xs font-bold opacity-75">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full uppercase text-[9px] tracking-widest backdrop-blur-sm">
                  <Layers className="w-3.5 h-3.5" />
                  {activeCard.subject || "General"} • {activeCard.category || "Core"}
                </span>

                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); toggleMastered(activeCard.id); }}
                  className={cn(
                    "p-2 rounded-full transition-all",
                    masteredIds.has(activeCard.id || "") ? "bg-emerald-500 text-white" : "bg-white/10 text-white/70 hover:bg-white/20"
                  )}
                  title="Mark as mastered"
                >
                  <Bookmark className="w-4 h-4" />
                </button>
              </div>

              {/* Card Body */}
              <div className="my-auto py-6 px-4">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] mb-4 text-indigo-300">
                  {flipped ? "SOLUTION & DEFINITION" : "QUESTION / CONCEPT"}
                </p>

                <h3 className="text-xl md:text-2xl font-black leading-snug tracking-tight">
                  {flipped ? activeCard.back : activeCard.front}
                </h3>
              </div>

              {/* Card Footer Hint */}
              <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-white/60 pt-2 border-t border-white/10">
                <span>Click card to flip</span>
                <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap justify-center items-center gap-4 mt-8 w-full max-w-xl">
          <button 
            onClick={handlePrev}
            className="p-4 bg-gray-50 hover:bg-gray-100 rounded-2xl text-gray-600 transition-all border border-gray-200"
            title="Previous card"
          >
            <RotateCcw className="w-6 h-6" />
          </button>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => { toggleMastered(activeCard.id); handleNext(); }}
              className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-md shadow-emerald-600/10 transition-all"
            >
              <ThumbsUp className="w-4 h-4" /> Got It (+50 XP)
            </button>
            <button 
              onClick={handleNext}
              className="px-6 py-3.5 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-md shadow-amber-500/10 transition-all"
            >
              <ThumbsDown className="w-4 h-4" /> Review Later
            </button>
          </div>

          <button 
            onClick={handleNext}
            className="p-4 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-2xl transition-all border border-indigo-100"
            title="Next card"
          >
            <Zap className="w-6 h-6" />
          </button>
        </div>

        {/* Deck Progress Indicator */}
        <div className="mt-6 flex flex-col items-center gap-2 text-center">
          <div className="flex items-center gap-4 text-xs font-bold text-gray-500">
            <span>Card <strong>{activeIndex + 1}</strong> of <strong>{filteredCards.length}</strong></span>
            <span>•</span>
            <span className="text-emerald-600 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> {masteredIds.size} Mastered
            </span>
          </div>

          <div className="w-64 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-indigo-600 transition-all duration-300"
              style={{ width: `${((activeIndex + 1) / filteredCards.length) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

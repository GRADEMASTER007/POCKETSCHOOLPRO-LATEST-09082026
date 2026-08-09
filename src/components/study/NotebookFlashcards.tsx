import { appCheck } from "@/src/lib/firebase";
import { speak as ttsSpeak } from "@/src/lib/tts";
import { getToken } from "firebase/app-check";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Sparkles, 
  Plus, 
  Trash2, 
  Edit2, 
  Check, 
  X, 
  ChevronRight, 
  RefreshCw, 
  Flame, 
  GraduationCap, 
  HelpCircle, 
  Calendar,
  Layers,
  BookOpen,
  Volume2,
  AlertCircle
} from "lucide-react";
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  query, 
  where,
  increment,
  getDoc,
  setDoc
} from "firebase/firestore";
import { db, auth } from "@/src/lib/firebase";
import { cn } from "@/src/lib/utils";

// Spaced repetition properties interface
interface FlashcardItem {
  id: string;
  userId: string;
  noteId: string;
  question: string;
  answer: string;
  category?: string;
  interval: number; // in days
  repetition: number; // consecutive correct reviews
  easiness: number; // difficulty factor (SM-2)
  dueDate: number; // timestamp
  createdAt: number;
}

// Error handling based on Firebase Integration Skill
enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

interface NotebookFlashcardsProps {
  note: {
    id: string;
    title: string;
    content: string;
    tags?: string[];
  };
  onXpEarned: (xp: number) => void;
}

export default function NotebookFlashcards({ note, onXpEarned }: NotebookFlashcardsProps) {
  const [flashcards, setFlashcards] = useState<FlashcardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  
  // Creation state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newQuestion, setNewQuestion] = useState("");
  const [newAnswer, setNewAnswer] = useState("");
  const [formError, setFormError] = useState("");

  // Editing state
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [editQuestion, setEditQuestion] = useState("");
  const [editAnswer, setEditAnswer] = useState("");

  // Study session state
  const [isStudying, setIsStudying] = useState(false);
  const [studyQueue, setStudyQueue] = useState<FlashcardItem[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const [sessionXp, setSessionXp] = useState(0);
  const [isCramMode, setIsCramMode] = useState(false); // If no due cards, study all cards anyway

  // Load cards for this note from Firestore
  useEffect(() => {
    fetchFlashcards();
    // Reset study session states when switching notes
    setIsStudying(false);
    setSessionCompleted(false);
  }, [note.id]);

  const fetchFlashcards = async () => {
    setLoading(true);
    const userId = auth.currentUser?.uid;
    if (!userId) {
      setLoading(false);
      return;
    }

    const path = "flashcards";
    try {
      const q = query(
        collection(db, path),
        where("userId", "==", userId),
        where("noteId", "==", note.id)
      );
      const querySnapshot = await getDocs(q);
      const cards: FlashcardItem[] = [];
      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        cards.push({
          id: docSnap.id,
          userId: data.userId,
          noteId: data.noteId,
          question: data.question,
          answer: data.answer,
          category: data.category,
          interval: data.interval ?? 0,
          repetition: data.repetition ?? 0,
          easiness: data.easiness ?? 2.5,
          dueDate: data.dueDate ?? Date.now(),
          createdAt: data.createdAt ?? Date.now(),
        });
      });
      
      // Sort: older first, or due first
      cards.sort((a, b) => a.createdAt - b.createdAt);
      setFlashcards(cards);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
    } finally {
      setLoading(false);
    }
  };

  // Play audio tone feedback
  const playSfx = (type: "correct" | "incorrect" | "flip" | "finish") => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      if (type === "correct") {
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.12); // E5
        gain.gain.setValueAtTime(0.06, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      } else if (type === "flip") {
        osc.type = "triangle";
        osc.frequency.setValueAtTime(300, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(450, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.04, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
        osc.start();
        osc.stop(ctx.currentTime + 0.12);
      } else if (type === "finish") {
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.15); // E5
        osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.3); // G5
        osc.frequency.setValueAtTime(1046.50, ctx.currentTime + 0.45); // C6
        gain.gain.setValueAtTime(0.07, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.7);
        osc.start();
        osc.stop(ctx.currentTime + 0.7);
      } else {
        osc.frequency.setValueAtTime(220, ctx.currentTime); // A3
        osc.frequency.setValueAtTime(180, ctx.currentTime + 0.15); // G3
        gain.gain.setValueAtTime(0.06, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      }
    } catch (e) {
      console.log("Audio API blocked or not supported:", e);
    }
  };

  // Generate Flashcards using Gemini API
  const handleAiGenerate = async () => {
    if (generating) return;
    setGenerating(true);
    const userId = auth.currentUser?.uid;
    if (!userId) {
      setGenerating(false);
      return;
    }

    try {
      const subject = note.tags?.[0] || "General";
      const response = await fetch("/api/generate-flashcards", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${await auth.currentUser?.getIdToken()}`},
        body: JSON.stringify({
          topic: note.title,
          subject: `${subject}. Use the following details as context to make custom flashcards specifically: ${note.content.slice(0, 1500)}`
        })
      });

      if (!response.ok) {
        throw new Error("Failed to call flashcard generator API");
      }

      const rawCards = await response.json();
      if (Array.isArray(rawCards)) {
        // Save each generated flashcard to Firestore
        const writePath = "flashcards";
        for (const card of rawCards) {
          const payload = {
            userId,
            noteId: note.id,
            question: card.front || card.question || "",
            answer: card.back || card.answer || "",
            category: subject,
            interval: 0,
            repetition: 0,
            easiness: 2.5,
            dueDate: Date.now(),
            createdAt: Date.now()
          };
          
          try {
            await addDoc(collection(db, writePath), payload);
          } catch (err) {
            handleFirestoreError(err, OperationType.CREATE, writePath);
          }
        }
        
        // Award XP for generating flashcards
        await awardXpToUser(15);
        onXpEarned(15);
        playSfx("correct");
        fetchFlashcards();
      }
    } catch (error) {
      console.error("AI Generation error:", error);
    } finally {
      setGenerating(false);
    }
  };

  // Add Manual Flashcard
  const handleAddManualCard = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!newQuestion.trim() || !newAnswer.trim()) {
      setFormError("Both question and answer are required.");
      return;
    }

    const userId = auth.currentUser?.uid;
    if (!userId) return;

    const path = "flashcards";
    const payload = {
      userId,
      noteId: note.id,
      question: newQuestion.trim(),
      answer: newAnswer.trim(),
      category: note.tags?.[0] || "General",
      interval: 0,
      repetition: 0,
      easiness: 2.5,
      dueDate: Date.now(),
      createdAt: Date.now()
    };

    try {
      await addDoc(collection(db, path), payload);
      setNewQuestion("");
      setNewAnswer("");
      setShowAddForm(false);
      playSfx("correct");
      fetchFlashcards();
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  };

  // Delete Card
  const handleDeleteCard = async (id: string) => {
    const path = `flashcards/${id}`;
    try {
      await deleteDoc(doc(db, "flashcards", id));
      setFlashcards(prev => prev.filter(c => c.id !== id));
      playSfx("incorrect");
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  };

  // Save Edit Card
  const handleSaveEditCard = async (id: string) => {
    if (!editQuestion.trim() || !editAnswer.trim()) return;

    const path = `flashcards/${id}`;
    try {
      await updateDoc(doc(db, "flashcards", id), {
        question: editQuestion.trim(),
        answer: editAnswer.trim()
      });
      setFlashcards(prev => prev.map(c => c.id === id ? { ...c, question: editQuestion.trim(), answer: editAnswer.trim() } : c));
      setEditingCardId(null);
      playSfx("correct");
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  };

  // Trigger Study Session
  const startStudySession = (cram: boolean = false) => {
    // Find due cards
    const now = Date.now();
    let cardsToStudy = flashcards.filter(c => c.dueDate <= now);
    
    if (cardsToStudy.length === 0 || cram) {
      // If cramming, study all cards
      cardsToStudy = [...flashcards];
      setIsCramMode(true);
    } else {
      setIsCramMode(false);
    }

    if (cardsToStudy.length === 0) return;

    // Shuffle queue slightly or sort by urgency
    cardsToStudy.sort(() => Math.random() - 0.5);

    setStudyQueue(cardsToStudy);
    setCurrentIdx(0);
    setIsFlipped(false);
    setIsStudying(true);
    setSessionCompleted(false);
    setSessionXp(0);
  };

  // Spaced Repetition Rating Handler (SM-2 implementation)
  const rateCard = async (card: FlashcardItem, score: number) => {
    // score definitions:
    // 1 = "Again" (Forgot / incorrect)
    // 4 = "Good" (Correct with some effort)
    // 5 = "Easy" (Correct and perfect recall)

    let { interval, repetition, easiness } = card;
    let newInterval = 1;
    let newRepetition = 0;
    let newEasiness = easiness;

    if (score === 1) {
      // Forgot / Again
      newRepetition = 0;
      newInterval = 1; // repeat tomorrow
      newEasiness = Math.max(1.3, easiness - 0.2);
      playSfx("incorrect");
    } else if (score === 4) {
      // Good
      newRepetition = repetition + 1;
      if (newRepetition === 1) {
        newInterval = 1; // 1 day
      } else if (newRepetition === 2) {
        newInterval = 3; // 3 days
      } else {
        newInterval = Math.ceil(interval * easiness);
      }
      // Decrease difficulty factor slightly for mid-range recall
      newEasiness = Math.max(1.3, easiness - 0.15);
      playSfx("correct");
    } else if (score === 5) {
      // Easy
      newRepetition = repetition + 1;
      if (newRepetition === 1) {
        newInterval = 2; // 2 days
      } else if (newRepetition === 2) {
        newInterval = 5; // 5 days
      } else {
        newInterval = Math.ceil(interval * easiness * 1.5);
      }
      // Increase difficulty factor for great performance
      newEasiness = Math.max(1.3, easiness + 0.15);
      playSfx("correct");
    }

    const xpToEarn = score === 5 ? 10 : score === 4 ? 5 : 1;
    setSessionXp(prev => prev + xpToEarn);

    // Calculate due date in milliseconds
    const now = Date.now();
    const newDueDate = now + newInterval * 24 * 60 * 60 * 1000;

    const path = `flashcards/${card.id}`;
    try {
      await updateDoc(doc(db, "flashcards", card.id), {
        interval: newInterval,
        repetition: newRepetition,
        easiness: Number(newEasiness.toFixed(2)),
        dueDate: newDueDate
      });

      // Update locally
      setFlashcards(prev => prev.map(c => c.id === card.id ? {
        ...c,
        interval: newInterval,
        repetition: newRepetition,
        easiness: newEasiness,
        dueDate: newDueDate
      } : c));

    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    }

    // Go to next card or complete
    setIsFlipped(false);
    setTimeout(() => {
      if (currentIdx + 1 < studyQueue.length) {
        setCurrentIdx(prev => prev + 1);
      } else {
        completeSession();
      }
    }, 250);
  };

  const completeSession = async () => {
    setSessionCompleted(true);
    playSfx("finish");
    await awardXpToUser(sessionXp);
    onXpEarned(sessionXp);
  };

  // Helper to persist stats in Firestore
  const awardXpToUser = async (xp: number) => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    const path = `user_stats/${userId}`;
    try {
      const statsRef = doc(db, "user_stats", userId);
      const snap = await getDoc(statsRef);
      if (snap.exists()) {
        await updateDoc(statsRef, {
          xp: increment(xp),
          streak: increment(1)
        });
      } else {
        await setDoc(statsRef, {
          userId,
          xp,
          streak: 1,
          badges: ["Notebook scholar"]
        });
      }
    } catch (err) {
      console.warn("Failed to update user stats:", err);
    }
  };

  // TTS speech
  const speakText = (text: string) => {
    ttsSpeak(text);
  };

  const dueCardsCount = flashcards.filter(c => c.dueDate <= Date.now()).length;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <AnimatePresence mode="wait">
        {!isStudying ? (
          /* Deck Overview / Edit Deck Panel */
          <motion.div 
            key="overview"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex-1 flex flex-col min-h-0 p-6 md:p-8 overflow-y-auto"
          >
            {/* Header Cards Deck Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-brand-primary/5 p-4 rounded-2xl border border-brand-primary/10 flex items-center gap-4">
                <div className="w-10 h-10 bg-brand-primary/10 rounded-xl flex items-center justify-center text-brand-primary">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Total Deck</div>
                  <div className="text-xl font-bold text-gray-800">{flashcards.length} cards</div>
                </div>
              </div>

              <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 flex items-center gap-4">
                <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-600">
                  <Flame className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">Due Today</div>
                  <div className="text-xl font-bold text-emerald-700">{dueCardsCount} cards</div>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-600">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[10px] text-blue-500 font-bold uppercase tracking-wider">Mastered</div>
                  <div className="text-xl font-bold text-blue-700">
                    {flashcards.filter(c => c.repetition >= 4).length} cards
                  </div>
                </div>
              </div>
            </div>

            {/* AI Generation banner */}
            {flashcards.length === 0 && (
              <div className="bg-gradient-to-r from-violet-500 to-indigo-600 text-white p-6 rounded-3xl mb-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-md relative overflow-hidden">
                <div className="absolute right-0 bottom-0 top-0 opacity-10 flex items-center justify-center p-4 pointer-events-none">
                  <Sparkles className="w-48 h-48 rotate-12" />
                </div>
                <div className="flex gap-4 items-center">
                  <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-white text-3xl shrink-0">
                    ✨
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-1">Generate AI Flashcards</h3>
                    <p className="text-xs opacity-80 leading-relaxed max-w-md">
                      Let Aristotle AI review your notes for "{note.title}" and automatically extract key terms, formulas, and concepts into a Spaced Repetition deck!
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleAiGenerate}
                  disabled={generating}
                  className="bg-white text-indigo-600 font-bold text-sm px-6 py-3 rounded-2xl hover:bg-opacity-95 shadow-lg flex items-center gap-2 transition-all shrink-0 disabled:opacity-50"
                >
                  {generating ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Extracting concepts...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4.5 h-4.5" />
                      <span>Generate Deck</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Action buttons list */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <h3 className="font-bold text-base text-gray-800">Flashcards List</h3>
              
              <div className="flex gap-2 w-full md:w-auto">
                {flashcards.length > 0 && (
                  <>
                    <button
                      onClick={() => startStudySession(false)}
                      disabled={dueCardsCount === 0}
                      className="flex-1 md:flex-none bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-emerald-700 transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <Layers className="w-4 h-4" />
                      <span>Study Due ({dueCardsCount})</span>
                    </button>
                    <button
                      onClick={() => startStudySession(true)}
                      className="flex-1 md:flex-none bg-gray-100 text-gray-700 px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
                    >
                      <RefreshCw className="w-4 h-4" />
                      <span>Cram Deck</span>
                    </button>
                  </>
                )}
                <button
                  onClick={() => setShowAddForm(!showAddForm)}
                  className="flex-1 md:flex-none bg-brand-primary text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-brand-primary/95 transition-all shadow-md flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>{showAddForm ? "Hide" : "Add Card"}</span>
                </button>
              </div>
            </div>

            {/* Add Manual Form */}
            {showAddForm && (
              <motion.form 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                onSubmit={handleAddManualCard}
                className="bg-gray-50 border border-gray-100 rounded-2xl p-5 mb-6 space-y-4 overflow-hidden"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Question (Front)</label>
                    <input
                      type="text"
                      placeholder="e.g., What is the powerhouse of the cell?"
                      value={newQuestion}
                      onChange={(e) => setNewQuestion(e.target.value)}
                      className="w-full p-3 bg-white border border-gray-100 rounded-xl text-xs focus:ring-2 focus:ring-brand-primary/10 transition-all shadow-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Answer (Back)</label>
                    <input
                      type="text"
                      placeholder="e.g., Mitochondria"
                      value={newAnswer}
                      onChange={(e) => setNewAnswer(e.target.value)}
                      className="w-full p-3 bg-white border border-gray-100 rounded-xl text-xs focus:ring-2 focus:ring-brand-primary/10 transition-all shadow-sm"
                    />
                  </div>
                </div>
                {formError && (
                  <p className="text-rose-500 text-[11px] flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {formError}
                  </p>
                )}
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-100 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-all shadow-sm"
                  >
                    Add Flashcard
                  </button>
                </div>
              </motion.form>
            )}

            {/* Cards List rendering */}
            {loading ? (
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-gray-400">
                <RefreshCw className="w-8 h-8 animate-spin mb-3 text-brand-primary" />
                <p className="text-xs">Syncing Spaced Repetition logs...</p>
              </div>
            ) : flashcards.length === 0 ? (
              <div className="flex-1 border-2 border-dashed border-gray-100 rounded-3xl p-12 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                  <BookOpen className="w-8 h-8 text-gray-200" />
                </div>
                <h4 className="font-bold text-sm mb-1 text-gray-700">No cards in this deck</h4>
                <p className="text-xs text-gray-400 max-w-xs mb-4">
                  Create a flashcard manually, or let the AI analyze your content to generate key concept cards.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={handleAiGenerate}
                    disabled={generating}
                    className="bg-brand-primary/5 text-brand-primary border border-brand-primary/10 hover:bg-brand-primary/10 px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-brand-primary" />
                    {generating ? "Generating..." : "Generate AI Deck"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {flashcards.map((card) => {
                  const isEditing = editingCardId === card.id;
                  const daysToDue = Math.ceil((card.dueDate - Date.now()) / (24 * 60 * 60 * 1000));
                  const isDue = card.dueDate <= Date.now();

                  return (
                    <div 
                      key={card.id}
                      className={cn(
                        "p-4 rounded-2xl border transition-all duration-200 bg-white shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4",
                        isDue ? "border-emerald-100 bg-emerald-50/5" : "border-gray-100"
                      )}
                    >
                      <div className="flex-1 min-w-0 space-y-1">
                        {isEditing ? (
                          <div className="space-y-2 w-full pr-4">
                            <input
                              type="text"
                              value={editQuestion}
                              onChange={(e) => setEditQuestion(e.target.value)}
                              className="w-full p-2 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold text-gray-800"
                            />
                            <input
                              type="text"
                              value={editAnswer}
                              onChange={(e) => setEditAnswer(e.target.value)}
                              className="w-full p-2 bg-gray-50 border border-gray-100 rounded-xl text-xs text-gray-600"
                            />
                          </div>
                        ) : (
                          <>
                            <h4 className="font-bold text-xs text-gray-800 flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-brand-primary shrink-0" />
                              {card.question}
                            </h4>
                            <p className="text-xs text-gray-500 pl-4">Ans: {card.answer}</p>
                          </>
                        )}
                        
                        {/* Spaced repetition metrics metadata */}
                        <div className="flex flex-wrap gap-x-4 gap-y-1.5 items-center pl-4 pt-1 text-[10px] text-gray-400 font-medium">
                          <span className="flex items-center gap-1 text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full uppercase tracking-tighter">
                            <Calendar className="w-3 h-3" />
                            {isDue ? "Due Now" : `Due in ${daysToDue} days`}
                          </span>
                          <span>Repetitions: {card.repetition}</span>
                          <span>EF: {card.easiness.toFixed(2)}</span>
                          <span>Interval: {card.interval}d</span>
                        </div>
                      </div>

                      <div className="flex gap-2 items-center justify-end w-full md:w-auto self-end md:self-center">
                        {isEditing ? (
                          <>
                            <button
                              onClick={() => handleSaveEditCard(card.id)}
                              className="p-1.5 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 rounded-lg transition-all"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setEditingCardId(null)}
                              className="p-1.5 bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 rounded-lg transition-all"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => {
                                setEditingCardId(card.id);
                                setEditQuestion(card.question);
                                setEditAnswer(card.answer);
                              }}
                              className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteCard(card.id)}
                              className="p-1.5 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        ) : (
          /* Active Interactive Study Session */
          <motion.div
            key="session"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col min-h-0 p-6 md:p-8"
          >
            {/* Header / Session Stats */}
            <div className="flex justify-between items-center mb-6">
              <button
                onClick={() => setIsStudying(false)}
                className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-900"
              >
                <X className="w-4 h-4" />
                <span>Quit Session</span>
              </button>
              
              <div className="flex items-center gap-3">
                {isCramMode && (
                  <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    Cram Mode
                  </span>
                )}
                <span className="text-xs font-bold text-gray-400 tracking-wider">
                  Card {currentIdx + 1} of {studyQueue.length}
                </span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full h-1.5 bg-gray-100 rounded-full mb-8 overflow-hidden">
              <div 
                className="h-full bg-emerald-500 transition-all duration-300"
                style={{ width: `${((currentIdx) / studyQueue.length) * 100}%` }}
              />
            </div>

            {!sessionCompleted ? (
              <div className="flex-1 flex flex-col justify-between max-w-xl mx-auto w-full">
                {/* Visual card */}
                <motion.div
                  onClick={() => {
                    setIsFlipped(!isFlipped);
                    playSfx("flip");
                  }}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="w-full h-80 bg-white rounded-[2.5rem] border border-gray-100 shadow-lg cursor-pointer flex flex-col items-center justify-center p-8 transition-all duration-300 relative select-none"
                >
                  <span className="absolute top-6 left-6 text-[10px] bg-brand-primary/5 text-brand-primary px-3 py-1 rounded-full font-bold uppercase tracking-wider flex items-center gap-1">
                    <Layers className="w-3 h-3" />
                    {studyQueue[currentIdx]?.category || "Curriculum"}
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      speakText(isFlipped ? studyQueue[currentIdx]?.answer : studyQueue[currentIdx]?.question);
                    }}
                    className="absolute top-6 right-6 p-2 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all"
                  >
                    <Volume2 className="w-4 h-4 text-gray-500" />
                  </button>

                  {!isFlipped ? (
                    <div className="text-center space-y-3">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Question</span>
                      <p className="text-xl md:text-2xl font-extrabold text-gray-900 leading-normal max-w-md px-4">
                        "{studyQueue[currentIdx]?.question}"
                      </p>
                      <p className="text-[10px] text-brand-secondary font-bold uppercase tracking-wider pt-2">Tap to Flip Card</p>
                    </div>
                  ) : (
                    <div className="text-center space-y-3">
                      <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Answer</span>
                      <p className="text-xl md:text-2xl font-extrabold text-emerald-600 leading-normal max-w-md px-4">
                        "{studyQueue[currentIdx]?.answer}"
                      </p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider pt-2">Tap to see Question again</p>
                    </div>
                  )}
                </motion.div>

                {/* Rating rating block */}
                <div className="pt-8 flex flex-col items-center gap-4">
                  {!isFlipped ? (
                    <button
                      onClick={() => {
                        setIsFlipped(true);
                        playSfx("flip");
                      }}
                      className="w-full py-4 bg-brand-primary text-white font-bold rounded-2xl shadow-md hover:bg-brand-primary/95 transition-all text-sm"
                    >
                      Show Answer
                    </button>
                  ) : (
                    <div className="w-full space-y-4">
                      <div className="text-center text-xs text-gray-400 font-medium">How well did you memorize this concept?</div>
                      <div className="grid grid-cols-3 gap-3">
                        <button
                          onClick={() => rateCard(studyQueue[currentIdx], 1)}
                          className="py-4 bg-rose-50 border border-rose-100 hover:bg-rose-100/50 rounded-2xl transition-all text-rose-700 flex flex-col items-center justify-center gap-1.5"
                        >
                          <span className="text-lg">🔴</span>
                          <span className="text-xs font-bold">Again</span>
                          <span className="text-[9px] opacity-75">Forgot it</span>
                        </button>
                        <button
                          onClick={() => rateCard(studyQueue[currentIdx], 4)}
                          className="py-4 bg-amber-50 border border-amber-100 hover:bg-amber-100/50 rounded-2xl transition-all text-amber-700 flex flex-col items-center justify-center gap-1.5"
                        >
                          <span className="text-lg">🟡</span>
                          <span className="text-xs font-bold">Good</span>
                          <span className="text-[9px] opacity-75">Recalled</span>
                        </button>
                        <button
                          onClick={() => rateCard(studyQueue[currentIdx], 5)}
                          className="py-4 bg-emerald-50 border border-emerald-100 hover:bg-emerald-100/50 rounded-2xl transition-all text-emerald-700 flex flex-col items-center justify-center gap-1.5"
                        >
                          <span className="text-lg">🟢</span>
                          <span className="text-xs font-bold">Easy</span>
                          <span className="text-[9px] opacity-75">Perfect</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Session Completion Screen */
              <div className="flex-1 flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-6">
                <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-[2rem] flex items-center justify-center">
                  <Check className="w-10 h-10" />
                </div>

                <div className="space-y-2">
                  <h3 className="text-2xl font-extrabold text-gray-900">Session Complete!</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Splendid progress! Your spaced repetition intervals have been recalculated based on your answers to keep your memory sharp.
                  </p>
                </div>

                {/* Score results card */}
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 w-full grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Cards Reviewed</div>
                    <div className="text-xl font-bold text-gray-800">{studyQueue.length}</div>
                  </div>
                  <div className="text-center border-l border-gray-200">
                    <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">XP Claimed</div>
                    <div className="text-xl font-bold text-yellow-600 flex items-center justify-center gap-1">
                      <Flame className="w-4 h-4 fill-current text-yellow-500" />
                      +{sessionXp} XP
                    </div>
                  </div>
                </div>

                <div className="w-full pt-4">
                  <button
                    onClick={() => {
                      setIsStudying(false);
                      fetchFlashcards();
                    }}
                    className="w-full py-4 bg-brand-primary text-white font-bold rounded-2xl shadow-md hover:bg-brand-primary/95 transition-all text-sm"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

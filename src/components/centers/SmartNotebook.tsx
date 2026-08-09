import { appCheck } from "@/src/lib/firebase";
import { getToken } from "firebase/app-check";
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Plus, 
  Search, 
  MoreVertical, 
  Clock, 
  Tag, 
  Trash2, 
  Sparkles,
  Mic,
  Languages,
  ArrowRight,
  ChevronLeft,
  BookOpen,
  Check,
  Save,
  PenTool,
  BrainCircuit,
  RefreshCw,
  NotebookPen as NotebookPenIcon
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  query, 
  where,
  getDoc,
  setDoc
} from "firebase/firestore";
import { db, auth } from "@/src/lib/firebase";
import NotebookFlashcards from "@/src/components/study/NotebookFlashcards";

// Default starting notes to seed into the user's Firestore on first-ever load
const SEED_NOTES = [
  { 
    title: "Photosynthesis Overview", 
    content: "Photosynthesis is the process by which green plants, algae, and certain bacteria convert light energy into chemical energy in the form of glucose. It occurs mainly in the chloroplasts, using light-absorbing chlorophyll pigments.\n\nThe general equation is:\n6CO2 + 6H2O + Light Energy -> C6H12O6 + 6O2\n\nThere are two main phases:\n1. Light-Dependent Reactions: Solar energy is captured in the thylakoid membrane to produce ATP and NADPH, releasing oxygen as a byproduct.\n2. Light-Independent Reactions (Calvin Cycle): Occurs in the stroma. ATP and NADPH are used to fix carbon dioxide into G3P, which forms glucose.", 
    tags: ["Biology", "Grade 11"] 
  },
  { 
    title: "Calculus Limits", 
    content: "A limit is the fundamental concept in calculus that describes the behavior of a function as its input variables approach a specific value.\n\nDefinition:\nIf f(x) gets arbitrarily close to a number L as x approaches c, we say that the limit of f(x) as x approaches c is L.\nWritten as: lim(x->c) f(x) = L\n\nKey Properties:\n- Sum Rule: The limit of a sum is the sum of the limits.\n- Product Rule: The limit of a product is the product of the limits.\n- Limit of 1/x: As x approaches infinity, 1/x approaches 0.\n- Squeeze Theorem: If g(x) <= f(x) <= h(x) near c, and both g(x) and h(x) approach L, then f(x) must also approach L.", 
    tags: ["Math", "Calculus"] 
  },
  { 
    title: "Industrial Revolution", 
    content: "The Industrial Revolution was the transition from agrarian, handicraft economies to ones dominated by industry and machine manufacturing. It began in Great Britain in the mid-18th century and later spread to other parts of the world.\n\nKey Factors:\n- Abundant coal and iron ore deposits in Great Britain.\n- Development of the Steam Engine by James Watt.\n- Innovations in textile production, including the Spinning Jenny and Power Loom.\n- The rise of the factory system, shifting labor from rural homes to urban industrial centers.\n\nConsequences:\n- Unprecedented urban growth and demographic shifts.\n- Rise of capitalism and social classes (working class vs. industrial capitalists).\n- Significant environmental pollution.", 
    tags: ["History", "Grade 10"] 
  }
];

const SpeechRecognition = typeof window !== "undefined" ? ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition) : null;
const isSpeechSupported = !!SpeechRecognition;

export default function SmartNotebook() {
  const [notes, setNotes] = useState<any[]>([]);
  const [activeNote, setActiveNote] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<"edit" | "flashcards">("edit");
  
  // Local edit states
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editTags, setEditTags] = useState<string[]>([]);
  
  // Translate state
  const [translating, setTranslating] = useState(false);

  // Study Tasks State
  const [editTasks, setEditTasks] = useState<any[]>([]);
  const [newTaskInput, setNewTaskInput] = useState("");
  const [showVoiceSidebar, setShowVoiceSidebar] = useState(true);

  // Speech Recognition States
  const [isListening, setIsListening] = useState(false);
  const [speechMode, setSpeechMode] = useState<"dictate" | "command">("dictate");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [voiceLog, setVoiceLog] = useState<string[]>([]);
  const [recognitionInstance, setRecognitionInstance] = useState<any>(null);

  // Stable Speech handler ref
  const handleFinalSpeechRef = useRef<any>(null);

  // Keep handleFinalSpeechRef updated with the absolute latest state closure on every render
  useEffect(() => {
    handleFinalSpeechRef.current = (rawText: string) => {
      const text = rawText.trim();
      if (!text) return;

      setVoiceLog(prev => [`Heard: "${text}"`, ...prev].slice(0, 5));

      if (speechMode === "command") {
        const lowerText = text.toLowerCase();
        if (lowerText.startsWith("add task ") || lowerText.startsWith("create task ")) {
          const taskText = text.slice(lowerText.startsWith("add task ") ? 9 : 12).trim();
          if (taskText) {
            const newTask = {
              id: "task_" + Date.now(),
              text: taskText,
              completed: false,
              createdAt: Date.now()
            };
            setEditTasks(prev => [...prev, newTask]);
            setVoiceLog(log => [`Command: Added task "${taskText}"`, ...log].slice(0, 5));
          }
        } else if (lowerText === "save note" || lowerText === "save changes" || lowerText === "save") {
          setVoiceLog(log => [`Command: Saving note...`, ...log].slice(0, 5));
          handleSaveNote();
        } else if (lowerText === "translate note" || lowerText === "translate") {
          setVoiceLog(log => [`Command: Translating note...`, ...log].slice(0, 5));
          handleTranslateNote();
        } else if (lowerText === "clear note" || lowerText === "clear content") {
          setEditContent("");
          setVoiceLog(log => [`Command: Note cleared`, ...log].slice(0, 5));
        } else if (lowerText === "new note" || lowerText === "create note") {
          setVoiceLog(log => [`Command: Creating new note...`, ...log].slice(0, 5));
          handleCreateNote();
        } else {
          setVoiceLog(log => [`⚠️ Command not recognized: "${text}"`, ...log].slice(0, 5));
        }
      } else {
        // Dictation mode
        setEditContent(prev => {
          const spacer = prev && !prev.endsWith("\n") && !prev.endsWith(" ") ? " " : "";
          return prev + spacer + text;
        });
        setVoiceLog(log => [`Dictated: "${text}"`, ...log].slice(0, 5));
      }
    };
  });

  // Initialize SpeechRecognition on mount
  useEffect(() => {
    if (!isSpeechSupported) return;

    const rec = new SpeechRecognition();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = "en-US";

    rec.onstart = () => {
      setIsListening(true);
      setSpeechError(null);
    };

    rec.onend = () => {
      setIsListening(false);
    };

    rec.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      if (event.error === "not-allowed") {
        setSpeechError("Microphone access denied. Please check site permissions.");
      } else {
        setSpeechError(`Error: ${event.error}`);
      }
      setIsListening(false);
    };

    rec.onresult = (event: any) => {
      let interim = "";
      let final = "";

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          final += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }

      if (interim) {
        setInterimTranscript(interim);
      }

      if (final) {
        setInterimTranscript("");
        if (handleFinalSpeechRef.current) {
          handleFinalSpeechRef.current(final);
        }
      }
    };

    setRecognitionInstance(rec);

    return () => {
      try {
        rec.abort();
      } catch (e) {}
    };
  }, []);

  const toggleListening = () => {
    if (!recognitionInstance) return;
    if (isListening) {
      try {
        recognitionInstance.stop();
      } catch (e) {
        console.error(e);
      }
    } else {
      try {
        setSpeechError(null);
        recognitionInstance.start();
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleManualAddTask = () => {
    if (!newTaskInput.trim()) return;
    const newTask = {
      id: "task_" + Date.now(),
      text: newTaskInput.trim(),
      completed: false,
      createdAt: Date.now()
    };
    setEditTasks(prev => [...prev, newTask]);
    setNewTaskInput("");
  };

  const handleToggleTask = (taskId: string) => {
    setEditTasks(prev => prev.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t));
  };

  const handleDeleteTask = (taskId: string) => {
    setEditTasks(prev => prev.filter(t => t.id !== taskId));
  };

  // Fetch or Seed user notes on auth state
  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    setLoading(true);
    const userId = auth.currentUser?.uid;
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      const q = query(collection(db, "notes"), where("userId", "==", userId));
      const querySnapshot = await getDocs(q);
      const fetchedNotes: any[] = [];
      querySnapshot.forEach((docSnap) => {
        fetchedNotes.push({ id: docSnap.id, ...docSnap.data() });
      });

      if (fetchedNotes.length === 0) {
        // Seed initial notes for the user so their workspace isn't blank
        const seeded: any[] = [];
        for (const note of SEED_NOTES) {
          const payload = {
            userId,
            title: note.title,
            content: note.content,
            tags: note.tags,
            createdAt: Date.now(),
            updatedAt: Date.now()
          };
          const docRef = await addDoc(collection(db, "notes"), payload);
          seeded.push({ id: docRef.id, ...payload });
        }
        setNotes(seeded);
        if (seeded.length > 0) {
          selectNote(seeded[0]);
        }
      } else {
        // Sort: newest first
        fetchedNotes.sort((a, b) => b.updatedAt - a.updatedAt);
        setNotes(fetchedNotes);
        if (fetchedNotes.length > 0) {
          selectNote(fetchedNotes[0]);
        }
      }
    } catch (err) {
      console.warn("Failed to fetch notes:", err);
    } finally {
      setLoading(false);
    }
  };

  const selectNote = (note: any) => {
    setActiveNote(note);
    setEditTitle(note.title);
    setEditContent(note.content);
    setEditTags(note.tags || []);
    setEditTasks(note.tasks || []);
    setActiveTab("edit");
    setSavedSuccess(false);
  };

  // Create new note in Firestore
  const handleCreateNote = async () => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    try {
      const payload = {
        userId,
        title: "Untitled Note",
        content: "",
        tags: ["General"],
        tasks: [],
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      const docRef = await addDoc(collection(db, "notes"), payload);
      const newNote = { id: docRef.id, ...payload };
      setNotes(prev => [newNote, ...prev]);
      selectNote(newNote);
    } catch (err) {
      console.error("Failed to create note:", err);
    }
  };

  // Save current note changes to Firestore
  const handleSaveNote = async () => {
    if (!activeNote) return;
    setSaving(true);
    setSavedSuccess(false);

    try {
      const noteRef = doc(db, "notes", activeNote.id);
      await updateDoc(noteRef, {
        title: editTitle.trim() || "Untitled Note",
        content: editContent,
        tags: editTags,
        tasks: editTasks,
        updatedAt: Date.now()
      });

      // Update local state
      const updatedNote = {
        ...activeNote,
        title: editTitle.trim() || "Untitled Note",
        content: editContent,
        tags: editTags,
        tasks: editTasks,
        updatedAt: Date.now()
      };
      setActiveNote(updatedNote);
      setNotes(prev => prev.map(n => n.id === activeNote.id ? updatedNote : n));
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2000);
    } catch (err) {
      console.error("Failed to save note:", err);
    } finally {
      setSaving(false);
    }
  };

  // Translate active note content to Swahili (as secondary tutor aid)
  const handleTranslateNote = async () => {
    if (!editContent || translating) return;
    setTranslating(true);
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${await auth.currentUser?.getIdToken()}`},
        body: JSON.stringify({
          message: `Translate the following educational notes into clear Swahili to help bilingual East African students. Maintain formatting and terms. Just return the translation.\n\nNotes:\n${editContent}`,
          grounding: "none"
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.text) {
          setEditContent(prev => prev + "\n\n--- Swahili Translation ---\n\n" + data.text);
        }
      }
    } catch (err) {
      console.warn("Translation failed:", err);
    } finally {
      setTranslating(false);
    }
  };

  // Add a tag to active note
  const handleAddTag = () => {
    const newTag = prompt("Enter tag name:");
    if (newTag && newTag.trim()) {
      setEditTags(prev => {
        if (prev.includes(newTag.trim())) return prev;
        return [...prev, newTag.trim()];
      });
    }
  };

  // Delete note from Firestore
  const handleDeleteNote = async (noteId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this note and all associated flashcards?")) return;

    try {
      await deleteDoc(doc(db, "notes", noteId));
      setNotes(prev => prev.filter(n => n.id !== noteId));
      if (activeNote?.id === noteId) {
        setActiveNote(null);
      }
    } catch (err) {
      console.error("Failed to delete note:", err);
    }
  };

  const filteredNotes = notes.filter(n => 
    n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (n.content && n.content.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-6rem)] md:h-[calc(100vh-8rem)] flex flex-col md:flex-row gap-8">
      {/* Sidebar - Notes List */}
      <div className={cn(
        "md:w-80 flex-col gap-6 h-full",
        activeNote ? "hidden md:flex" : "flex flex-1"
      )}>
        <div className="flex items-center justify-between mt-2 md:mt-0 px-2 md:px-0">
          <h1 className="text-2xl font-bold font-display text-gray-800">Notebook</h1>
          <button 
            onClick={handleCreateNote}
            className="p-2.5 bg-brand-primary text-white rounded-xl hover:bg-brand-primary/90 transition-all shadow-md"
            title="Create New Note"
          >
            <Plus className="w-4.5 h-4.5" />
          </button>
        </div>

        <div className="relative px-2 md:px-0">
          <Search className="absolute left-5 md:left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search notes..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-brand-primary/10 transition-all shadow-sm"
          />
        </div>

        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-gray-400">
            <RefreshCw className="w-6 h-6 animate-spin mb-2" />
            <span className="text-xs">Loading notes...</span>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto space-y-3 px-2 md:px-0 pr-2 custom-scrollbar pb-24 md:pb-0">
            {filteredNotes.map((note) => {
              const preview = note.content ? note.content.slice(0, 100) : "Empty note...";
              return (
                <div
                  key={note.id}
                  onClick={() => selectNote(note)}
                  className={cn(
                    "w-full text-left p-4 rounded-2xl border transition-all duration-200 cursor-pointer relative group",
                    activeNote?.id === note.id 
                      ? "bg-brand-primary/5 border-brand-primary/20 ring-1 ring-brand-primary/10" 
                      : "bg-white border-gray-100 hover:border-gray-200 hover:shadow-sm"
                  )}
                >
                  <div className="flex justify-between items-start gap-2">
                    <h3 className="font-bold text-sm mb-1 truncate text-gray-800 flex-1">{note.title}</h3>
                    <button
                      onClick={(e) => handleDeleteNote(note.id, e)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-rose-500 rounded-lg transition-all"
                      title="Delete Note"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-2 mb-3 leading-relaxed">{preview}</p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] text-gray-400 font-medium flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(note.updatedAt || note.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                    <div className="flex gap-1">
                      {(note.tags || []).slice(0, 1).map((tag: string) => (
                        <span key={tag} className="text-[9px] px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full font-bold uppercase tracking-tighter">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Editor & Flashcard Reviewer Area */}
      <div className={cn(
        "flex-1 bg-white md:rounded-[2rem] border-0 md:border border-gray-100 shadow-sm flex flex-col overflow-hidden h-full fixed md:relative inset-0 z-50 md:z-0",
        !activeNote ? "hidden md:flex" : "flex"
      )}>
        {activeNote ? (
          <>
            {/* Header: Note details and Tab selectors */}
            <header className="p-4 md:p-6 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4 pt-safe shrink-0">
              <div className="flex items-center gap-3 md:gap-4">
                <button 
                  className="md:hidden p-2 -ml-2 text-gray-400 hover:text-gray-900"
                  onClick={() => setActiveNote(null)}
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <div className="hidden md:flex w-10 h-10 bg-brand-primary/5 rounded-xl items-center justify-center text-brand-primary">
                  <NotebookPen className="w-5 h-5" />
                </div>
                <div>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="text-lg font-bold text-gray-800 border-none bg-transparent p-0 focus:ring-0 focus:border-none focus:outline-none w-full max-w-[200px] md:max-w-[300px]"
                    placeholder="Note Title"
                  />
                  <p className="text-[10px] text-gray-400">
                    Last saved: {new Date(activeNote.updatedAt || activeNote.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Segmented Tab Switcher */}
              <div className="flex bg-gray-100 p-1 rounded-xl self-start md:self-center items-center">
                <button
                  onClick={() => setActiveTab("edit")}
                  className={cn(
                    "px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5",
                    activeTab === "edit" ? "bg-white text-gray-800 shadow-sm" : "text-gray-500 hover:text-gray-800"
                  )}
                >
                  <PenTool className="w-3.5 h-3.5" />
                  <span>Editor</span>
                </button>
                <button
                  onClick={() => setActiveTab("flashcards")}
                  className={cn(
                    "px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5",
                    activeTab === "flashcards" ? "bg-white text-gray-800 shadow-sm" : "text-gray-500 hover:text-gray-800"
                  )}
                >
                  <BrainCircuit className="w-3.5 h-3.5" />
                  <span>Flashcards & Spaced Repetition</span>
                </button>
                
                <button
                  onClick={() => setShowVoiceSidebar(!showVoiceSidebar)}
                  className={cn(
                    "ml-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 border border-gray-200/50 bg-white shadow-xs",
                    showVoiceSidebar ? "border-brand-primary text-brand-primary bg-brand-primary/5" : "text-gray-500 hover:text-gray-800"
                  )}
                  title="Toggle Hands-Free Speech Assistant & Checklist"
                >
                  <Mic className={cn("w-3.5 h-3.5", showVoiceSidebar && isListening && "animate-pulse text-rose-500")} />
                  <span className="hidden sm:inline">Hands-Free</span>
                </button>
              </div>
            </header>

            {/* Main view container based on active Tab */}
            <div className="flex-1 min-h-0">
              <AnimatePresence mode="wait">
                {activeTab === "edit" ? (
                  /* TAB 1: NOTE WRITING EDITOR */
                  <motion.div 
                    key="editor-tab"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="h-full flex flex-col"
                  >
                    <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden">
                      {/* Left: Textarea Editor */}
                      <div className="flex-1 p-6 md:p-8 overflow-y-auto flex flex-col">
                        <textarea 
                          className="w-full flex-1 resize-none border-none focus:ring-0 text-gray-800 leading-relaxed placeholder:text-gray-300 text-[15px] focus:outline-none"
                          placeholder="Start typing your notes here..."
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                        />
                      </div>
                      
                      {/* Right: Study Tasks & Voice Hub (Sidebar) */}
                      {showVoiceSidebar && (
                        <div className="w-full lg:w-80 bg-gray-50/50 border-t lg:border-t-0 lg:border-l border-gray-100 flex flex-col gap-5 p-5 overflow-y-auto select-none shrink-0 custom-scrollbar max-h-[300px] lg:max-h-none">
                          {/* Voice Assistant Module */}
                          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                            <div className="flex items-center justify-between">
                              <h3 className="font-bold text-xs text-gray-700 flex items-center gap-1.5 uppercase tracking-wider">
                                <Sparkles className="w-3.5 h-3.5 text-brand-primary animate-pulse" />
                                <span>Voice Assistant</span>
                              </h3>
                              {isListening && (
                                <span className="flex h-2 w-2 relative">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                                </span>
                              )}
                            </div>

                            {/* Mic Toggle Button Section */}
                            <div className="flex items-center gap-3">
                              <button
                                onClick={toggleListening}
                                className={cn(
                                  "w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-md relative group shrink-0",
                                  isListening 
                                    ? "bg-rose-500 text-white hover:bg-rose-600 ring-4 ring-rose-500/20" 
                                    : "bg-brand-primary text-white hover:bg-brand-primary/95 ring-4 ring-brand-primary/10"
                                )}
                              >
                                {isListening ? (
                                  <Mic className="w-5 h-5 animate-pulse" />
                                ) : (
                                  <Mic className="w-5 h-5" />
                                )}
                              </button>
                              <div className="flex-1 min-w-0">
                                <span className="text-[11px] font-bold block text-gray-700">
                                  {isListening ? "Listening Active" : "Hands-Free Offline"}
                                </span>
                                <span className="text-[10px] text-gray-400 block truncate">
                                  {isListening ? "Speak clearly now..." : "Click microphone to start"}
                                </span>
                              </div>
                            </div>

                            {/* Mode Toggles */}
                            <div className="flex bg-gray-100 p-0.5 rounded-lg text-[10px]">
                              <button
                                onClick={() => setSpeechMode("dictate")}
                                className={cn(
                                  "flex-1 py-1 rounded-md font-bold transition-all",
                                  speechMode === "dictate" ? "bg-white text-gray-800 shadow-xs" : "text-gray-400"
                                )}
                              >
                                Dictate Note
                              </button>
                              <button
                                onClick={() => setSpeechMode("command")}
                                className={cn(
                                  "flex-1 py-1 rounded-md font-bold transition-all",
                                  speechMode === "command" ? "bg-white text-gray-800 shadow-xs" : "text-gray-400"
                                )}
                              >
                                Voice Commands
                              </button>
                            </div>

                            {/* Interim Transcript box */}
                            {(interimTranscript || isListening) && (
                              <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-100 text-[11px] leading-relaxed">
                                {interimTranscript ? (
                                  <span className="text-gray-700 italic">"{interimTranscript}"</span>
                                ) : (
                                  <span className="text-gray-400">Waiting for speech...</span>
                                )}
                              </div>
                            )}

                            {/* Cheatsheet / Instructions */}
                            {speechMode === "command" && (
                              <div className="text-[10px] text-gray-400 bg-gray-50/50 p-2.5 rounded-xl border border-gray-100/50 space-y-1 font-sans">
                                <span className="font-bold text-gray-500 uppercase tracking-wide block mb-1">Command Cheatsheet:</span>
                                <p><strong className="text-brand-primary">"add task [your task name]"</strong> - Create task</p>
                                <p><strong className="text-brand-primary">"save note"</strong> - Save note to Cloud</p>
                                <p><strong className="text-brand-primary">"translate"</strong> - Translate notes</p>
                                <p><strong className="text-brand-primary">"clear note"</strong> - Clear text</p>
                                <p><strong className="text-brand-primary">"new note"</strong> - Create blank note</p>
                              </div>
                            )}

                            {/* Speech API support warning */}
                            {!isSpeechSupported && (
                              <p className="text-[10px] text-amber-500 font-medium">
                                ⚠️ Speech recognition is not fully supported in your current browser. Try Chrome.
                              </p>
                            )}

                            {/* Speech error */}
                            {speechError && (
                              <p className="text-[10px] text-rose-500 font-medium">
                                {speechError}
                              </p>
                            )}

                            {/* Voice execution log */}
                            {voiceLog.length > 0 && (
                              <div className="space-y-1 border-t pt-3">
                                <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400 block">Voice Activity Log</span>
                                <div className="space-y-1 max-h-24 overflow-y-auto custom-scrollbar font-mono text-[9px] text-gray-500">
                                  {voiceLog.map((log, index) => (
                                    <div key={index} className="truncate">
                                      {log}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Study Checklist Module */}
                          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                            <div className="flex items-center justify-between">
                              <h3 className="font-bold text-xs text-gray-700 flex items-center gap-1.5 uppercase tracking-wider">
                                <span>Study Tasks</span>
                                <span className="text-[10px] text-brand-primary font-mono lowercase">
                                  ({editTasks.filter(t => t.completed).length}/{editTasks.length})
                                </span>
                              </h3>
                            </div>

                            {/* Manual task input */}
                            <div className="flex gap-1.5">
                              <input 
                                type="text"
                                placeholder="Add custom study task..."
                                value={newTaskInput}
                                onChange={(e) => setNewTaskInput(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleManualAddTask()}
                                className="flex-1 px-3 py-1.5 border border-gray-100 rounded-lg text-xs focus:ring-1 focus:ring-brand-primary/20 focus:border-brand-primary focus:outline-none"
                              />
                              <button
                                onClick={handleManualAddTask}
                                className="p-1.5 bg-brand-primary/10 text-brand-primary rounded-lg hover:bg-brand-primary/25 transition-all shrink-0"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>

                            {/* Task List */}
                            <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-1">
                              {editTasks.length === 0 ? (
                                <p className="text-[10px] text-gray-400 text-center py-4">No study tasks. Say "add task..." or type above!</p>
                              ) : (
                                editTasks.map(task => (
                                  <div 
                                    key={task.id}
                                    className="flex items-start justify-between gap-2 p-2 bg-gray-50/50 rounded-xl border border-gray-100/50 group animate-fade-in"
                                  >
                                    <button
                                      onClick={() => handleToggleTask(task.id)}
                                      className="flex items-start gap-2.5 flex-1 text-left min-w-0 mt-0.5"
                                    >
                                      <span className={cn(
                                        "w-4 h-4 rounded-md border flex items-center justify-center shrink-0 transition-all",
                                        task.completed 
                                          ? "bg-brand-primary border-brand-primary text-white" 
                                          : "border-gray-200 bg-white hover:border-brand-primary/50"
                                      )}>
                                        {task.completed && <Check className="w-3 h-3" />}
                                      </span>
                                      <span className={cn(
                                        "text-xs leading-tight text-gray-600 break-words",
                                        task.completed && "line-through text-gray-400"
                                      )}>
                                        {task.text}
                                      </span>
                                    </button>
                                    <button
                                      onClick={() => handleDeleteTask(task.id)}
                                      className="p-1 text-gray-400 hover:text-rose-500 rounded-md transition-all shrink-0 md:opacity-0 group-hover:opacity-100"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </div>
                                ))
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Bottom Toolbar */}
                    <footer className="p-4 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between pb-safe-bottom shrink-0">
                      <div className="flex gap-2 flex-wrap">
                        <button 
                          onClick={handleAddTag}
                          className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-[10px] font-bold uppercase tracking-wider text-gray-500 flex items-center gap-2 hover:border-brand-primary transition-all"
                        >
                          <Tag className="w-3 h-3" />
                          <span>Add Tag</span>
                        </button>
                        
                        <button 
                          onClick={handleTranslateNote}
                          disabled={translating}
                          className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-[10px] font-bold uppercase tracking-wider text-gray-500 flex items-center gap-2 hover:border-brand-primary transition-all disabled:opacity-50"
                        >
                          <Languages className="w-3 h-3" />
                          <span>{translating ? "Translating..." : "Translate"}</span>
                        </button>

                        <div className="flex gap-1 items-center">
                          {editTags.map(tag => (
                            <span key={tag} className="text-[9px] px-2 py-1 bg-brand-primary/5 text-brand-primary rounded-full font-bold uppercase tracking-tight">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center gap-4 shrink-0">
                        <span className="hidden md:inline text-[10px] text-gray-400 font-medium">
                          {editContent.split(/\s+/).filter(Boolean).length} words
                        </span>
                        
                        <button 
                          onClick={handleSaveNote}
                          disabled={saving}
                          className="bg-brand-primary text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-brand-primary/95 shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50"
                        >
                          {saving ? (
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          ) : savedSuccess ? (
                            <Check className="w-3.5 h-3.5" />
                          ) : (
                            <Save className="w-3.5 h-3.5" />
                          )}
                          <span>{saving ? "Saving..." : savedSuccess ? "Saved!" : "Save Note"}</span>
                        </button>
                      </div>
                    </footer>
                  </motion.div>
                ) : (
                  /* TAB 2: INTERACTIVE FLASHCARD SYSTEM */
                  <motion.div 
                    key="flashcards-tab"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="h-full"
                  >
                    <NotebookFlashcards 
                      note={{
                        id: activeNote.id,
                        title: editTitle,
                        content: editContent,
                        tags: editTags
                      }}
                      onXpEarned={(xp) => {
                        console.log(`Earned ${xp} XP during study session!`);
                      }}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </>
        ) : (
          /* Empty State */
          <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-8">
              <NotebookPen className="w-12 h-12 text-gray-200" />
            </div>
            <h2 className="text-2xl font-bold mb-3 font-display text-gray-800">Select a note to read</h2>
            <p className="text-gray-500 max-w-sm mb-8 leading-relaxed text-sm">
              Choose an existing study guide from the sidebar or click New Note to write down your curriculum concepts and build an AI flashcard deck.
            </p>
            <button 
              onClick={handleCreateNote}
              className="flex items-center gap-2 bg-brand-primary text-white px-8 py-4 rounded-2xl font-bold hover:bg-brand-primary/90 transition-all shadow-xl shadow-brand-primary/20"
            >
              <Plus className="w-5 h-5" />
              <span>New Note</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const NotebookPen = ({ className }: { className?: string }) => (
  <NotebookPenIcon className={className} />
);

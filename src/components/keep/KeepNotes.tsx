import React, { useEffect, useState } from "react";
import { Notebook, Plus, RefreshCw, AlertCircle, Save, Loader2, StickyNote, Cloud, Check } from "lucide-react";
import { listNotes, createKeepNote, KeepNoteRequest } from "@/src/lib/google-keep";
import { cn } from "@/src/lib/utils";
import { motion, AnimatePresence } from "motion/react";
import { collection, addDoc, getDocs, query, orderBy, serverTimestamp } from "firebase/firestore";
import { db, auth } from "@/src/lib/firebase";

export const KeepNotes: React.FC = () => {
  const [notes, setNotes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFallbackMode, setIsFallbackMode] = useState(false);
  
  const [newNote, setNewNote] = useState<KeepNoteRequest>({ title: "", text: "" });

  const fetchFirestoreNotes = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        setNotes([]);
        return;
      }
      const notesRef = collection(db, "users", user.uid, "keep_notes");
      const q = query(notesRef, orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const fetchedNotes: any[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        fetchedNotes.push({
          name: doc.id,
          title: data.title || "",
          body: {
            text: {
              text: data.text || ""
            }
          },
          isLocal: true,
          createdAt: data.createdAt?.toDate() || new Date()
        });
      });
      setNotes(fetchedNotes);
    } catch (err: any) {
      console.error("Firestore notes read failed:", err);
      setError("Failed to sync notes with Firestore backup database: " + err.message);
    }
  };

  const fetchNotes = async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (!isFallbackMode) {
        try {
          const data = await listNotes();
          setNotes(data.notes || []);
        } catch (err: any) {
          console.warn("Google Keep API access restricted for standard account. Seamlessly switching to secure Firestore backup notes:", err);
          setIsFallbackMode(true);
          await fetchFirestoreNotes();
        }
      } else {
        await fetchFirestoreNotes();
      }
    } catch (err: any) {
      setError(err.message || "Failed to load notes. Note: The Google Keep API listing is often restricted for standard consumer accounts.");
    } finally {
      setIsLoading(false);
    }
  };

  const saveToFirestore = async (note: KeepNoteRequest) => {
    const user = auth.currentUser;
    if (!user) {
      throw new Error("You must be logged in to save notes.");
    }
    const notesRef = collection(db, "users", user.uid, "keep_notes");
    await addDoc(notesRef, {
      title: note.title,
      text: note.text,
      createdAt: serverTimestamp()
    });
  };

  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.title && !newNote.text) return;
    
    setIsCreating(true);
    try {
      if (!isFallbackMode) {
        try {
          await createKeepNote(newNote);
        } catch (err: any) {
          console.warn("Could not save to Keep, saving to Firestore backup notebooks instead:", err);
          setIsFallbackMode(true);
          await saveToFirestore(newNote);
        }
      } else {
        await saveToFirestore(newNote);
      }
      setNewNote({ title: "", text: "" });
      await fetchNotes();
    } catch (err: any) {
      setError(err.message || "Failed to create note");
    } finally {
      setIsCreating(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [isFallbackMode]);

  return (
    <div className="w-full max-w-4xl mx-auto p-4 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-yellow-100 rounded-2xl">
            <Notebook className="w-6 h-6 text-yellow-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 tracking-tight">Google Keep & Study Notes</h2>
            <p className="text-sm text-gray-500 font-medium">Quick notes, study aids, and app backup reminders</p>
          </div>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Sync status badge */}
          <span className={cn(
            "px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1.5 border",
            isFallbackMode 
              ? "bg-indigo-50 border-indigo-100 text-indigo-700" 
              : "bg-emerald-50 border-emerald-100 text-emerald-700"
          )}>
            {isFallbackMode ? (
              <>
                <Cloud className="w-3.5 h-3.5" />
                <span>Grade Master Africa Cloud Backup</span>
              </>
            ) : (
              <>
                <Check className="w-3.5 h-3.5 animate-pulse" />
                <span>Google Keep Live Sync</span>
              </>
            )}
          </span>
          <button
            onClick={fetchNotes}
            disabled={isLoading}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors disabled:opacity-50"
            title="Refresh notes"
          >
            <RefreshCw className={cn("w-5 h-5 text-gray-400", isLoading && "animate-spin")} />
          </button>
        </div>
      </div>

      {/* Create Note Form */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border border-gray-150 rounded-3xl p-6 shadow-sm"
      >
        <form onSubmit={handleCreateNote} className="space-y-4">
          <input
            type="text"
            placeholder="Title"
            value={newNote.title}
            onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
            className="w-full bg-transparent border-none text-lg font-bold placeholder:text-gray-300 focus:ring-0 p-0"
          />
          <textarea
            placeholder="Take a note..."
            value={newNote.text}
            onChange={(e) => setNewNote({ ...newNote, text: e.target.value })}
            className="w-full bg-transparent border-none text-sm placeholder:text-gray-400 focus:ring-0 p-0 resize-none min-h-[100px]"
          />
          <div className="flex justify-end pt-2 border-t border-gray-50">
            <button
              type="submit"
              disabled={isCreating || (!newNote.title && !newNote.text)}
              className="flex items-center gap-2 px-6 py-2.5 bg-yellow-500 text-white rounded-xl font-bold shadow-lg shadow-yellow-100 hover:bg-yellow-600 transition-all active:scale-95 disabled:opacity-50"
            >
              {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              <span>Save Note</span>
            </button>
          </div>
        </form>
      </motion.div>

      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-40 bg-gray-50 rounded-2xl animate-pulse border border-gray-100" />
            ))}
          </motion.div>
        ) : error ? (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-12 px-6 bg-amber-50 rounded-3xl border border-amber-100 text-center"
          >
            <AlertCircle className="w-12 h-12 text-amber-500 mb-4" />
            <h3 className="text-lg font-bold text-amber-900 mb-2">Note Access</h3>
            <p className="text-sm text-amber-700 max-w-md mb-6">{error}</p>
            <button
              onClick={fetchNotes}
              className="px-6 py-2.5 bg-amber-600 text-white rounded-xl font-bold shadow-lg shadow-amber-200 hover:bg-amber-700 transition-all active:scale-95"
            >
              Try Again
            </button>
          </motion.div>
        ) : notes.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-16 px-6 bg-gray-50/50 rounded-3xl border border-dashed border-gray-200 text-center"
          >
            <StickyNote className="w-12 h-12 text-gray-300 mb-4" />
            <p className="text-gray-500 font-medium">No notes found. Notes created here will appear after sync.</p>
          </motion.div>
        ) : (
          <motion.div
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {notes.map((note, index) => (
              <motion.div
                key={note.name}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="bg-yellow-50/50 border border-yellow-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all group"
              >
                <h3 className="text-sm font-bold text-gray-900 mb-2">{note.title || "Untitled"}</h3>
                <p className="text-xs text-gray-600 line-clamp-6 leading-relaxed whitespace-pre-wrap">
                  {note.body?.text?.text}
                </p>
                <div className="mt-4 pt-3 border-t border-yellow-100/50 flex justify-between items-center text-[10px] text-gray-400">
                  <span>{note.isLocal ? "Synced to Cloud Backup" : "Synced from Google Keep"}</span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

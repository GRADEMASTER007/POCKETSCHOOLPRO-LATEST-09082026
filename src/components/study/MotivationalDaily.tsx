import React, { useState, useEffect } from "react";
import { 
  Heart, 
  Sparkles, 
  Volume2, 
  Check, 
  Send, 
  Activity, 
  Smile, 
  Frown, 
  Zap, 
  Flame, 
  Coffee, 
  Plus, 
  BookOpen, 
  Compass, 
  Lightbulb, 
  Calendar,
  Lock,
  ArrowRight,
  HelpCircle,
  Clock,
  Loader2
} from "lucide-react";
import { 
  doc, 
  onSnapshot, 
  setDoc, 
  getDoc,
  arrayUnion 
} from "firebase/firestore";
import { db, auth, handleFirestoreError, OperationType } from "@/src/lib/firebase";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/src/lib/utils";

interface Affirmation {
  id: string;
  text: string;
  category: "Growth Mindset" | "Confidence" | "Stress Relief" | "Focus" | "Balance";
  author: string;
  mood: "Overwhelmed" | "Anxious" | "Focused" | "Fatigued" | "Calm";
}

const AFFIRMATIONS: Affirmation[] = [
  {
    id: "aff_1",
    text: "My intelligence and skills are not fixed. With every obstacle I tackle, my brain grows, adapts, and becomes stronger.",
    category: "Growth Mindset",
    author: "Academic Growth Theory",
    mood: "Overwhelmed"
  },
  {
    id: "aff_2",
    text: "One step, one page, one formula at a time. I am highly capable of breaking down complex problems and understanding them.",
    category: "Confidence",
    author: "Mindful Study",
    mood: "Anxious"
  },
  {
    id: "aff_3",
    text: "Deep, slow breaths. My worth as a student and a person is not defined by a single test score or homework grade.",
    category: "Stress Relief",
    author: "Well-being Circle",
    mood: "Anxious"
  },
  {
    id: "aff_4",
    text: "Focus is a muscle, and today I am choosing to train it. I will give my full, calm attention to the task right in front of me.",
    category: "Focus",
    author: "Deep Work Guide",
    mood: "Focused"
  },
  {
    id: "aff_5",
    text: "Rest is not wasted time; it is an essential part of the learning process. I respect my mind's need to recharge and recalibrate.",
    category: "Balance",
    author: "Cognitive Psychology",
    mood: "Fatigued"
  },
  {
    id: "aff_6",
    text: "Mistakes are not proof of failure; they are the active blueprints of learning. Every error brings me closer to mastery.",
    category: "Growth Mindset",
    author: "Edu-Resilience Lab",
    mood: "Overwhelmed"
  },
  {
    id: "aff_7",
    text: "I possess the focus, the resources, and the resilience to navigate through academic friction and succeed on my own terms.",
    category: "Confidence",
    author: "Inner Strength Journal",
    mood: "Focused"
  },
  {
    id: "aff_8",
    text: "I am studying to expand my understanding and serve my future, not just to complete a checklist. I embrace the journey.",
    category: "Balance",
    author: "Purposeful Learning",
    mood: "Fatigued"
  },
  {
    id: "aff_9",
    text: "I let go of perfectionism. I strive for progress, healthy curiosity, and steady, consistent effort.",
    category: "Stress Relief",
    author: "Calm Mind Project",
    mood: "Anxious"
  },
  {
    id: "aff_10",
    text: "When my energy is low, I do not quit. I take a mindful break, stretch, sip water, and return with a renewed spirit.",
    category: "Balance",
    author: "Vitality Practice",
    mood: "Fatigued"
  },
  {
    id: "aff_11",
    text: "Today, I let go of academic comparisons. My learning path is unique, and I am advancing at my own perfect pace.",
    category: "Stress Relief",
    author: "Self-Compassion Guide",
    mood: "Calm"
  },
  {
    id: "aff_12",
    text: "I am building habits that will serve me for a lifetime. Every minute of focused study is a deposit in my future self.",
    category: "Focus",
    author: "Habit Lab",
    mood: "Focused"
  }
];

interface SavedReflection {
  text: string;
  date: string;
}

export default function MotivationalDaily() {
  const [activeAffirmation, setActiveAffirmation] = useState<Affirmation>(AFFIRMATIONS[0]);
  const [selectedMood, setSelectedMood] = useState<"Overwhelmed" | "Anxious" | "Focused" | "Fatigued" | "Calm">("Focused");
  const [userFavorites, setUserFavorites] = useState<string[]>([]);
  const [showFavoritesList, setShowFavoritesList] = useState(false);
  const [reflectionText, setReflectionText] = useState("");
  const [savedReflections, setSavedReflections] = useState<SavedReflection[]>([]);
  const [savingReflection, setSavingReflection] = useState(false);
  const [submittingIntention, setSubmittingIntention] = useState(false);
  const [isChiming, setIsChiming] = useState(false);
  const [chimeTimer, setChimeTimer] = useState<number>(0);

  // Load from current date on mount, and listen to Firestore user stats
  useEffect(() => {
    // 1. Set daily quote based on the day of the month
    const dayIndex = new Date().getDate();
    const defaultAff = AFFIRMATIONS[dayIndex % AFFIRMATIONS.length];
    setActiveAffirmation(defaultAff);
    setSelectedMood(defaultAff.mood);

    if (!auth.currentUser) return;
    const uid = auth.currentUser.uid;

    const statsRef = doc(db, "user_stats", uid);
    const unsub = onSnapshot(statsRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (data.favoriteAffirmations) {
          setUserFavorites(data.favoriteAffirmations);
        }
        if (data.reflections) {
          setSavedReflections(data.reflections);
        }
      }
    }, (err) => {
      handleFirestoreError(err, OperationType.GET, "user_stats");
    });

    return unsub;
  }, []);

  // Update quote based on selected mood check-in
  const handleMoodSelect = (mood: "Overwhelmed" | "Anxious" | "Focused" | "Fatigued" | "Calm") => {
    setSelectedMood(mood);
    const options = AFFIRMATIONS.filter(aff => aff.mood === mood);
    if (options.length > 0) {
      // Pick random or first
      const randomItem = options[Math.floor(Math.random() * options.length)];
      setActiveAffirmation(randomItem);
    } else {
      // Fallback to day of month rotation
      const dayIndex = new Date().getDate();
      setActiveAffirmation(AFFIRMATIONS[dayIndex % AFFIRMATIONS.length]);
    }
  };

  // Synthesizes a crystalline singing bowl sound directly in the browser via Web Audio API
  const handlePlayCalmSound = () => {
    if (isChiming) return;
    setIsChiming(true);
    setChimeTimer(5);

    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) {
        setIsChiming(false);
        return;
      }
      const ctx = new AudioContextClass();
      
      // 1. Crystal Bowl Primary Carrier Note (C5 Pentatonic: ~523.25 Hz)
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(659.25, ctx.currentTime); // E5 (Perfect major third harmony)
      
      // Gentle, therapeutic well-being vibrato (LFO)
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.value = 3.5; // Slow relaxation rhythm
      lfoGain.gain.value = 1.2;
      
      lfo.connect(lfoGain);
      lfoGain.connect(osc1.frequency);
      lfoGain.connect(osc2.frequency);
      
      // Envelopes for smooth bell attack & long decay
      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.15); // Calm attack
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 4.5); // Warm ambient fade
      
      osc1.connect(gainNode);
      osc2.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      // Start sounds
      lfo.start();
      osc1.start();
      osc2.start();
      
      // Stop oscillator
      lfo.stop(ctx.currentTime + 5.0);
      osc1.stop(ctx.currentTime + 5.0);
      osc2.stop(ctx.currentTime + 5.0);
    } catch (e) {
      console.warn("Calming chime audio failed to load in sandbox:", e);
    }

    // Countdown interval for chime UI
    const interval = setInterval(() => {
      setChimeTimer(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsChiming(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Toggle Favorite Status
  const handleToggleFavorite = async () => {
    if (!auth.currentUser) {
      alert("Please log in to save favorite affirmations to your profile!");
      return;
    }
    const uid = auth.currentUser.uid;
    const statsRef = doc(db, "user_stats", uid);

    let updatedFavs: string[] = [];
    if (userFavorites.includes(activeAffirmation.id)) {
      updatedFavs = userFavorites.filter(id => id !== activeAffirmation.id);
    } else {
      updatedFavs = [...userFavorites, activeAffirmation.id];
    }

    try {
      await setDoc(statsRef, {
        favoriteAffirmations: updatedFavs
      }, { merge: true });
      setUserFavorites(updatedFavs);
    } catch (err) {
      console.error("Error saving favorite affirmation:", err);
    }
  };

  // Save Daily Positive Intention/Reflection
  const handleSubmitIntention = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reflectionText.trim()) return;

    if (!auth.currentUser) {
      alert("Please log in to register your daily well-being reflections!");
      return;
    }

    setSubmittingIntention(true);
    const uid = auth.currentUser.uid;
    const statsRef = doc(db, "user_stats", uid);

    const newReflection: SavedReflection = {
      text: reflectionText.trim(),
      date: new Date().toLocaleDateString()
    };

    try {
      await setDoc(statsRef, {
        reflections: arrayUnion(newReflection)
      }, { merge: true });
      
      setReflectionText("");
      // Locally append to show instant update
      setSavedReflections(prev => [newReflection, ...prev]);
    } catch (err) {
      console.error("Failed to commit reflection:", err);
    } finally {
      setSubmittingIntention(false);
    }
  };

  return (
    <div className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col justify-between h-full relative" id="daily-affirmations-widget">
      
      {/* Sound Waves Overlay during Chime */}
      <AnimatePresence>
        {isChiming && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-indigo-900/90 rounded-[2.5rem] z-30 flex flex-col items-center justify-center p-6 text-center text-white"
          >
            <motion.div 
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.6, 1, 0.6]
              }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="w-20 h-20 rounded-full bg-white/15 flex items-center justify-center mb-4"
            >
              <Volume2 className="w-10 h-10 text-indigo-200" />
            </motion.div>
            <h4 className="font-extrabold text-lg">Mindfulness Pause Active</h4>
            <p className="text-xs text-indigo-200 mt-1 max-w-xs leading-relaxed">
              Close your eyes. Inhale slowly for {chimeTimer} seconds. Embrace academic balance.
            </p>
            <span className="text-[10px] font-mono text-indigo-400 mt-4 uppercase tracking-widest">
              Synthesizing singing bowl audio...
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      <div>
        {/* Widget Title */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-50">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-indigo-50 text-indigo-700 rounded-full text-[10px] font-bold uppercase tracking-wider mb-1">
              <Sparkles className="w-3 h-3 text-indigo-500 fill-indigo-200 animate-pulse" /> Student Well-being
            </div>
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-1.5">
              Daily Affirmations
            </h3>
          </div>

          <div className="flex gap-1.5">
            <button
              onClick={handlePlayCalmSound}
              className="p-2.5 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-xl transition-all"
              title="Play Calming Chime"
            >
              <Volume2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowFavoritesList(prev => !prev)}
              className={cn(
                "p-2.5 rounded-xl transition-all relative",
                showFavoritesList ? "bg-indigo-600 text-white" : "bg-gray-50 hover:bg-gray-100 text-gray-400 hover:text-gray-600"
              )}
              title="Favorite Affirmations"
            >
              <Heart className="w-4 h-4" />
              {userFavorites.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center border-2 border-white">
                  {userFavorites.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Saved Favorites Drawer Overlay */}
        <AnimatePresence>
          {showFavoritesList && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute inset-x-6 top-[72px] bottom-6 bg-white border border-gray-100 rounded-2xl p-4 z-20 overflow-y-auto space-y-3.5 shadow-xl"
            >
              <div className="flex justify-between items-center pb-2 border-b border-gray-50">
                <span className="text-xs font-black text-gray-400 uppercase tracking-wider">Favorited Affirmations</span>
                <button 
                  onClick={() => setShowFavoritesList(false)}
                  className="text-xs text-indigo-600 font-extrabold hover:text-indigo-800"
                >
                  Close Drawer
                </button>
              </div>

              {userFavorites.length === 0 ? (
                <div className="text-center py-10 text-xs text-gray-400">
                  You haven't favorited any affirmations yet. Tap the heart icon on any card!
                </div>
              ) : (
                <div className="space-y-2.5">
                  {userFavorites.map((id) => {
                    const found = AFFIRMATIONS.find(a => a.id === id);
                    if (!found) return null;
                    return (
                      <div key={id} className="p-3 bg-indigo-50/40 border border-indigo-100/30 rounded-xl space-y-1 relative">
                        <p className="text-[11px] text-gray-700 italic font-medium leading-relaxed">
                          "{found.text}"
                        </p>
                        <div className="flex justify-between items-center text-[9px] text-gray-400 font-bold uppercase tracking-wider">
                          <span>{found.category}</span>
                          <span>{found.author}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* State Check-in Selector */}
        <div className="space-y-1.5 mb-4">
          <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block">How are you feeling today?</label>
          <div className="flex gap-1 overflow-x-auto pb-1 select-none scrollbar-none">
            {[
              { id: "Focused", label: "Focused", icon: Flame, color: "text-amber-500 bg-amber-50" },
              { id: "Calm", label: "Calm", icon: Compass, color: "text-emerald-500 bg-emerald-50" },
              { id: "Overwhelmed", label: "Overwhelmed", icon: Frown, color: "text-rose-500 bg-rose-50" },
              { id: "Fatigued", label: "Fatigued", icon: Coffee, color: "text-sky-500 bg-sky-50" },
              { id: "Anxious", label: "Anxious", icon: Zap, color: "text-purple-500 bg-purple-50" }
            ].map((m) => {
              const isSelected = selectedMood === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => handleMoodSelect(m.id as any)}
                  className={cn(
                    "px-2.5 py-1.5 rounded-xl text-[10px] font-bold flex items-center gap-1 transition-all shrink-0 border",
                    isSelected 
                      ? "bg-indigo-600 text-white border-transparent shadow-sm font-black" 
                      : "bg-gray-50 text-gray-500 border-gray-100 hover:bg-gray-100"
                  )}
                >
                  <m.icon className={cn("w-3 h-3 shrink-0", isSelected ? "text-white" : m.color.split(" ")[0])} />
                  {m.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Affirmation Card Display */}
        <div className="bg-indigo-50/40 border border-indigo-100/30 p-5 rounded-3xl relative overflow-hidden group mb-4">
          <div className="absolute right-4 top-4 opacity-5 group-hover:scale-125 transition-transform duration-500">
            <Lightbulb className="w-16 h-16 text-indigo-950" />
          </div>

          <div className="space-y-3 relative z-10">
            <div className="flex justify-between items-center">
              <span className="text-[9px] font-black uppercase tracking-wider text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100/40">
                {activeAffirmation.category}
              </span>
              <button
                onClick={handleToggleFavorite}
                className={cn(
                  "p-1.5 rounded-full transition-all hover:scale-110",
                  userFavorites.includes(activeAffirmation.id) 
                    ? "text-rose-500 fill-rose-500 bg-rose-50" 
                    : "text-gray-300 hover:text-rose-400 hover:bg-gray-50"
                )}
              >
                <Heart className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs md:text-sm font-medium leading-relaxed italic text-gray-800">
              "{activeAffirmation.text}"
            </p>

            <div className="flex justify-between items-center text-[9.5px] text-gray-400 font-bold uppercase tracking-wider pt-1">
              <span>{activeAffirmation.author}</span>
              <span className="text-indigo-400">Targeting {activeAffirmation.mood} Mindsets</span>
            </div>
          </div>
        </div>
      </div>

      {/* Intention Input & History Tracking */}
      <div>
        <form onSubmit={handleSubmitIntention} className="flex gap-1.5 mb-3">
          <input
            value={reflectionText}
            onChange={(e) => setReflectionText(e.target.value)}
            placeholder="Today, I intend to..."
            className="flex-1 p-2.5 border border-gray-100 bg-gray-50 rounded-xl text-xs font-semibold outline-none focus:bg-white focus:border-indigo-500 transition-all placeholder:text-gray-400"
          />
          <button
            type="submit"
            disabled={submittingIntention || !reflectionText.trim()}
            className="bg-indigo-600 text-white p-2.5 rounded-xl hover:bg-indigo-700 transition-all disabled:opacity-50 flex items-center justify-center shrink-0"
            title="Save Positive Intention"
          >
            {submittingIntention ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Check className="w-4 h-4" />
            )}
          </button>
        </form>

        {/* Micro well-being tracker log */}
        <div className="text-[10px] text-gray-400 leading-normal font-medium">
          {savedReflections.length > 0 ? (
            <div className="flex items-center gap-1.5 text-[9.5px]">
              <span className="font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">Intention logged:</span>
              <span className="truncate text-gray-600 italic">"{savedReflections[0].text}"</span>
            </div>
          ) : (
            <div className="text-center italic py-0.5">
              💡 Type a small target above (e.g. "I will take a 10m walk") to record your mindset.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


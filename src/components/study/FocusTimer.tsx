import React, { useState, useEffect, useRef } from "react";
import { doc, getDoc, setDoc, onSnapshot, collection, query, where, deleteDoc } from "firebase/firestore";
import { db, auth, handleFirestoreError, OperationType } from "@/src/lib/firebase";
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Flame, 
  Sparkles, 
  Coffee, 
  Check, 
  Clock, 
  Link2, 
  Volume2, 
  VolumeX,
  Plus,
  BarChart2,
  TrendingUp,
  History,
  Trash2
} from "lucide-react";
import { isToday } from "date-fns";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/src/lib/utils";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from "recharts";

interface Goal {
  id: string;
  text: string;
  completed: boolean;
}

interface GoalsData {
  goals: Goal[];
  lastUpdated: string;
}

type TimerMode = "focus" | "shortBreak" | "longBreak";

const MODE_PRESETS: Record<TimerMode, { label: string; duration: number; color: string; bgColor: string; icon: any }> = {
  focus: {
    label: "Focus Session",
    duration: 25 * 60,
    color: "text-blue-600 border-blue-200 bg-blue-50/50",
    bgColor: "bg-blue-600",
    icon: Flame
  },
  shortBreak: {
    label: "Short Break",
    duration: 5 * 60,
    color: "text-emerald-600 border-emerald-200 bg-emerald-50/50",
    bgColor: "bg-emerald-600",
    icon: Coffee
  },
  longBreak: {
    label: "Long Break",
    duration: 15 * 60,
    color: "text-indigo-600 border-indigo-200 bg-indigo-50/50",
    bgColor: "bg-indigo-600",
    icon: Coffee
  }
};

export default function FocusTimer() {
  const [mode, setMode] = useState<TimerMode>("focus");
  const [timeLeft, setTimeLeft] = useState(MODE_PRESETS.focus.duration);
  const [customDuration, setCustomDuration] = useState(25); // in minutes
  const [isRunning, setIsRunning] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  // Real-time Daily Goals Integration
  const [goals, setGoals] = useState<Goal[]>([]);
  const [selectedGoalId, setSelectedGoalId] = useState<string>("");
  const [goalsLoading, setGoalsLoading] = useState(true);
  const [showCelebration, setShowCelebration] = useState(false);
  const [lastCompletedGoalName, setLastCompletedGoalName] = useState("");

  // Tab Switcher and Focus Sessions Metrics State
  const [activeTab, setActiveTab] = useState<"timer" | "summary">("timer");
  const [sessionLogs, setSessionLogs] = useState<any[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const totalDuration = mode === "focus" && customDuration * 60 !== MODE_PRESETS.focus.duration 
    ? customDuration * 60 
    : MODE_PRESETS[mode].duration;

  // Real-time subscribe to daily goals
  useEffect(() => {
    if (!auth.currentUser) return;

    const goalsRef = doc(db, "user_goals", auth.currentUser.uid);
    const unsubscribe = onSnapshot(goalsRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as GoalsData;
        const currentGoals = data.goals || [];
        setGoals(currentGoals);
        
        // Clear selected goal if it got deleted or completed elsewhere
        if (selectedGoalId) {
          const matched = currentGoals.find(g => g.id === selectedGoalId);
          if (!matched || matched.completed) {
            setSelectedGoalId("");
          }
        }
      }
      setGoalsLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `user_goals/${auth.currentUser?.uid}`);
      setGoalsLoading(false);
    });

    return unsubscribe;
  }, [selectedGoalId]);

  // Real-time subscribe to focus sessions
  useEffect(() => {
    if (!auth.currentUser) return;
    const uid = auth.currentUser.uid;

    const q = query(
      collection(db, "focus_sessions"),
      where("userId", "==", uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const logs: any[] = [];
      snapshot.forEach((docSnap) => {
        logs.push({ id: docSnap.id, ...docSnap.data() });
      });
      setSessionLogs(logs);
      setSessionsLoading(false);
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, "focus_sessions");
      setSessionsLoading(false);
    });

    return unsubscribe;
  }, []);

  // Handle timer countdown
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setIsRunning(false);
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, timeLeft, mode, customDuration]);

  // Sync preset durations
  const handleModeChange = (newMode: TimerMode) => {
    setIsRunning(false);
    setMode(newMode);
    setShowCelebration(false);
    if (newMode === "focus") {
      setTimeLeft(customDuration * 60);
    } else {
      setTimeLeft(MODE_PRESETS[newMode].duration);
    }
  };

  // Sound Synthesizer (Web Audio API)
  const playChime = () => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      
      // Chime note 1
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      gain1.gain.setValueAtTime(0.3, ctx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.8);
      
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start();
      osc1.stop(ctx.currentTime + 0.8);

      // Chime note 2 (slightly staggered, higher pitch)
      setTimeout(() => {
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = "sine";
        osc2.frequency.setValueAtTime(659.25, ctx.currentTime); // E5
        gain2.gain.setValueAtTime(0.3, ctx.currentTime);
        gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.8);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start();
        osc2.stop(ctx.currentTime + 0.8);
      }, 150);

      // Chime note 3 (perfect fifth)
      setTimeout(() => {
        const osc3 = ctx.createOscillator();
        const gain3 = ctx.createGain();
        osc3.type = "sine";
        osc3.frequency.setValueAtTime(783.99, ctx.currentTime); // G5
        gain3.gain.setValueAtTime(0.4, ctx.currentTime);
        gain3.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.2);
        osc3.connect(gain3);
        gain3.connect(ctx.destination);
        osc3.start();
        osc3.stop(ctx.currentTime + 1.2);
      }, 300);

    } catch (e) {
      console.warn("Audio Context chime failed to play:", e);
    }
  };

  // Complete session and integrate with daily goals
  const handleTimerComplete = async () => {
    playChime();
    setShowCelebration(true);

    if (!auth.currentUser) return;
    const goalsRef = doc(db, "user_goals", auth.currentUser.uid);

    let goalText = "";
    let updatedGoalsList = [...goals];

    if (mode === "focus") {
      if (selectedGoalId) {
        // Option A: Complete the linked daily goal
        const matched = goals.find(g => g.id === selectedGoalId);
        if (matched) {
          goalText = `Completed linked goal: "${matched.text}"`;
          updatedGoalsList = goals.map(g => 
            g.id === selectedGoalId ? { ...g, completed: true } : g
          );
          setLastCompletedGoalName(matched.text);
        }
      } else {
        // Option B: Auto-create and complete a generic Pomodoro goal
        const sessionMinutes = Math.round(totalDuration / 60);
        const name = `Completed Focus Session (${sessionMinutes}m)`;
        goalText = name;
        setLastCompletedGoalName(name);

        const newGoal: Goal = {
          id: Date.now().toString(),
          text: name,
          completed: true
        };
        updatedGoalsList = [...goals, newGoal];
      }

      // Reset selection
      setSelectedGoalId("");

      // Save focus session log
      try {
        const sessionRef = doc(collection(db, "focus_sessions"));
        await setDoc(sessionRef, {
          userId: auth.currentUser.uid,
          date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
          durationSeconds: totalDuration,
          createdAt: Date.now()
        });
      } catch (err) {
        console.warn("Failed to log focus session in Firestore:", err);
      }

      // Update Firestore document which will instantly trigger a re-render in both DailyGoals.tsx and here!
      try {
        await setDoc(goalsRef, {
          goals: updatedGoalsList,
          lastUpdated: new Date().toISOString()
        }, { merge: true });
      } catch (err) {
        console.warn("Failed to complete goal in Firestore:", err);
      }
    } else {
      setLastCompletedGoalName(`Took a break: ${MODE_PRESETS[mode].label}`);
    }
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setShowCelebration(false);
    if (mode === "focus") {
      setTimeLeft(customDuration * 60);
    } else {
      setTimeLeft(MODE_PRESETS[mode].duration);
    }
  };

  const handleCustomDurationChange = (val: number) => {
    setCustomDuration(val);
    if (mode === "focus") {
      setIsRunning(false);
      setTimeLeft(val * 60);
    }
  };

  // Formatting minutes and seconds
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Manual offline logger helper
  const handleManualLog = async (minutes: number) => {
    if (!auth.currentUser) {
      alert("Please log in to register your study durations!");
      return;
    }
    try {
      const sessionRef = doc(collection(db, "focus_sessions"));
      await setDoc(sessionRef, {
        userId: auth.currentUser.uid,
        date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
        durationSeconds: minutes * 60,
        createdAt: Date.now()
      });
    } catch (err) {
      console.warn("Failed to manually log focus session:", err);
    }
  };

  // Delete logged session helper
  const handleForceDeleteSession = async (docId: string) => {
    if (!auth.currentUser) return;
    try {
      const docRef = doc(db, "focus_sessions", docId);
      await deleteDoc(docRef);
    } catch (err) {
      console.warn("Failed to delete focus session:", err);
    }
  };

  // Generate 7-day data for the Recharts Bar Chart
  const getChartData = () => {
    const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const chartData = [];
    const now = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const dateStr = d.toISOString().split("T")[0]; // YYYY-MM-DD
      const dayLabel = daysOfWeek[d.getDay()];
      const shortDate = `${d.getMonth() + 1}/${d.getDate()}`;

      // Sum focus sessions for this date
      const totalSeconds = sessionLogs
        .filter((s) => s.date === dateStr)
        .reduce((acc, curr) => acc + (curr.durationSeconds || 0), 0);
      
      const totalMinutes = Math.round(totalSeconds / 60);

      chartData.push({
        date: dateStr,
        day: dayLabel,
        displayDate: shortDate,
        minutes: totalMinutes,
        label: `${dayLabel} (${shortDate})`
      });
    }

    return chartData;
  };

  const chartData = getChartData();
  const todayDateStr = new Date().toISOString().split("T")[0];
  const todayMinutes = chartData.find((d) => d.date === todayDateStr)?.minutes || 0;
  
  const weeklyTotalMinutes = chartData.reduce((acc, curr) => acc + curr.minutes, 0);
  const weeklyAverageMinutes = Math.round(weeklyTotalMinutes / 7);

  const maxSessionSeconds = sessionLogs.length > 0 
    ? Math.max(...sessionLogs.map((s) => s.durationSeconds || 0)) 
    : 0;
  const maxSessionMinutes = Math.round(maxSessionSeconds / 60);

  const sortedLogs = [...sessionLogs]
    .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
    .slice(0, 10);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900 text-white p-3 rounded-2xl shadow-xl text-xs font-semibold border border-slate-800">
          <p className="font-bold text-gray-300">{data.label}</p>
          <p className="text-blue-400 mt-1 flex items-center gap-1.5 font-black">
            <Flame className="w-3.5 h-3.5" />
            {data.minutes} min studied
          </p>
        </div>
      );
    }
    return null;
  };

  // SVG Progress Ring calculations
  const radius = 84;
  const stroke = 6;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = totalDuration > 0 
    ? circumference - (timeLeft / totalDuration) * circumference 
    : circumference;

  const incompleteGoals = goals.filter(g => !g.completed);

  return (
    <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-gray-100/80 shadow-sm flex flex-col h-full min-h-[400px] justify-between relative overflow-hidden">
      
      {/* Visual celebration overlay */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-white/95 z-20 flex flex-col items-center justify-center p-6 text-center"
          >
            <motion.div
              initial={{ scale: 0.6, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mb-4 text-emerald-500 shadow-md shadow-emerald-100"
            >
              <Sparkles className="w-8 h-8" />
            </motion.div>
            <h4 className="text-xl font-bold text-gray-900 mb-2">Great job! Session Complete!</h4>
            <p className="text-sm text-gray-500 max-w-xs mb-6">
              You finished your interval! {mode === "focus" ? "We updated your Daily Goals tracker." : "Time to dive back in!"}
            </p>
            <div className="bg-emerald-50/50 border border-emerald-100 p-3 rounded-2xl text-xs font-semibold text-emerald-800 flex items-center gap-2 mb-8 max-w-xs justify-center">
              <Check className="w-4 h-4 shrink-0" />
              <span className="truncate">{lastCompletedGoalName}</span>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowCelebration(false);
                  handleModeChange(mode === "focus" ? "shortBreak" : "focus");
                }}
                className={cn(
                  "px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-md transition-all",
                  mode === "focus" ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200" : "bg-blue-600 hover:bg-blue-700 shadow-blue-200"
                )}
              >
                {mode === "focus" ? "Start Short Break" : "Start Next Focus"}
              </button>
              <button
                onClick={() => setShowCelebration(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-gray-500 bg-gray-50 border border-gray-100 hover:bg-gray-100 transition-colors"
              >
                Dismiss
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div>
        {/* Header with Tabs */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Clock className="w-6 h-6 text-blue-500 fill-blue-50" />
              Focus Companion
            </h3>
            <p className="text-sm text-gray-500 mt-0.5">Study interval & metrics</p>
          </div>
          
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
              <button
                onClick={() => setActiveTab("timer")}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-black transition-all",
                  activeTab === "timer" 
                    ? "bg-white text-blue-600 shadow-xs" 
                    : "text-gray-500 hover:text-gray-700"
                )}
              >
                Timer
              </button>
              <button
                onClick={() => setActiveTab("summary")}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1",
                  activeTab === "summary" 
                    ? "bg-white text-blue-600 shadow-xs" 
                    : "text-gray-500 hover:text-gray-700"
                )}
              >
                <BarChart2 className="w-3.5 h-3.5 text-blue-500" />
                Stats
              </button>
            </div>

            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={cn(
                "p-2.5 rounded-xl border transition-colors",
                soundEnabled 
                  ? "bg-gray-50 text-gray-600 border-gray-100 hover:bg-gray-100" 
                  : "bg-red-50 text-red-500 border-red-100"
              )}
              title={soundEnabled ? "Mute sound" : "Unmute sound"}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === "timer" ? (
            <motion.div
              key="timer-tab"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="space-y-6"
            >
              {/* Preset Modes selectors */}
              <div className="grid grid-cols-3 gap-2 mb-6">
                {(["focus", "shortBreak", "longBreak"] as TimerMode[]).map((m) => {
                  const preset = MODE_PRESETS[m];
                  const Icon = preset.icon;
                  const active = mode === m;
                  return (
                    <button
                      key={m}
                      onClick={() => handleModeChange(m)}
                      className={cn(
                        "flex flex-col items-center justify-center p-2 rounded-xl border text-center transition-all",
                        active 
                          ? "bg-slate-900 border-slate-950 text-white shadow-sm" 
                          : "bg-white border-gray-100 text-gray-600 hover:border-gray-200"
                      )}
                    >
                      <Icon className={cn("w-4 h-4 mb-1", active ? "text-white" : "text-gray-400")} />
                      <span className="text-[10px] font-bold uppercase tracking-wider">{preset.label.split(" ")[0]}</span>
                    </button>
                  );
                })}
              </div>

              {/* Main Timer Display Area */}
              <div className="flex flex-col md:flex-row items-center justify-center gap-8 my-3">
                {/* SVG Circle Progress Ring */}
                <div className="relative flex items-center justify-center">
                  <svg
                    height={radius * 2}
                    width={radius * 2}
                    className="transform -rotate-90"
                  >
                    <circle
                      stroke="#F1F5F9"
                      fill="transparent"
                      strokeWidth={stroke}
                      r={normalizedRadius}
                      cx={radius}
                      cy={radius}
                    />
                    <circle
                      stroke={mode === "focus" ? "#2563EB" : mode === "shortBreak" ? "#10B981" : "#4F46E5"}
                      fill="transparent"
                      strokeWidth={stroke}
                      strokeDasharray={circumference + " " + circumference}
                      style={{ strokeDashoffset }}
                      strokeLinecap="round"
                      r={normalizedRadius}
                      cx={radius}
                      cy={radius}
                      className="transition-all duration-300"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center text-center">
                    <span className="text-3xl font-black text-slate-800 tabular-nums leading-none mb-1">
                      {formatTime(timeLeft)}
                    </span>
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                      {isRunning ? "Running" : "Paused"}
                    </span>
                  </div>
                </div>

                {/* Controls and adjustments */}
                <div className="flex flex-col justify-center flex-1 w-full max-w-[200px] gap-4">
                  {/* Custom Focus Adjuster */}
                  {mode === "focus" && (
                    <div>
                      <div className="flex justify-between items-center text-xs font-bold text-gray-500 mb-1.5">
                        <span>Duration</span>
                        <span className="text-blue-600">{customDuration}m</span>
                      </div>
                      <input
                        type="range"
                        min="5"
                        max="60"
                        step="5"
                        disabled={isRunning}
                        value={customDuration}
                        onChange={(e) => handleCustomDurationChange(parseInt(e.target.value))}
                        className="w-full accent-blue-600 cursor-pointer disabled:opacity-50"
                      />
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={toggleTimer}
                      className={cn(
                        "flex-1 py-3 px-4 rounded-xl text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2",
                        isRunning 
                          ? "bg-slate-700 hover:bg-slate-800 shadow-slate-100" 
                          : mode === "focus" 
                            ? "bg-blue-600 hover:bg-blue-700 shadow-blue-100" 
                            : mode === "shortBreak" 
                              ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100" 
                              : "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100"
                      )}
                    >
                      {isRunning ? (
                        <>
                          <Pause className="w-4 h-4 fill-current" />
                          Pause
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 fill-current" />
                          Start
                        </>
                      )}
                    </button>

                    <button
                      onClick={resetTimer}
                      className="p-3 rounded-xl border border-gray-100 text-gray-500 hover:bg-gray-50 transition-colors"
                      title="Reset session"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Goal Linking Integration */}
              {mode === "focus" && (
                <div className="border-t border-gray-100 pt-4">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
                    <Link2 className="w-3.5 h-3.5 text-blue-500" />
                    Link to Daily Goal
                  </div>

                  {goalsLoading ? (
                    <div className="h-10 bg-gray-50 rounded-xl animate-pulse"></div>
                  ) : incompleteGoals.length === 0 ? (
                    <div className="text-xs text-gray-400 bg-gray-50 p-3 rounded-xl flex items-center justify-between font-medium">
                      <span>No outstanding daily goals today.</span>
                    </div>
                  ) : (
                    <div className="relative">
                      <select
                        value={selectedGoalId}
                        onChange={(e) => setSelectedGoalId(e.target.value)}
                        disabled={isRunning}
                        className="w-full bg-gray-50 border border-gray-200 text-slate-700 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-shadow cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed appearance-none pr-8"
                      >
                        <option value="">-- No Link (Add completed session goal) --</option>
                        {incompleteGoals.map((g) => (
                          <option key={g.id} value={g.id}>
                            🎯 {g.text}
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Break info text */}
              {mode !== "focus" && (
                <div className="border-t border-gray-100 pt-4 text-center text-xs font-medium text-gray-400">
                  🔋 Hydrate, stretch, or take a deep breath before your next session!
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="summary-tab"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="space-y-6"
            >
              {/* Chart Wrapper */}
              <div className="bg-slate-50 border border-slate-100 p-4 rounded-3xl h-[180px] flex flex-col justify-between">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5 text-blue-500" /> 7-Day Study Profile
                  </span>
                  <span className="text-[10px] text-gray-400 font-bold">Total: {weeklyTotalMinutes} min</span>
                </div>

                <div className="w-full h-[130px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                      <XAxis 
                        dataKey="day" 
                        tickLine={false} 
                        axisLine={false}
                        tick={{ fontSize: 9, fontWeight: 700, fill: "#94A3B8" }}
                      />
                      <YAxis 
                        tickLine={false} 
                        axisLine={false}
                        tick={{ fontSize: 9, fontWeight: 700, fill: "#94A3B8" }}
                      />
                      <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0, 0, 0, 0.02)' }} />
                      <Bar dataKey="minutes" radius={[4, 4, 0, 0]}>
                        {chartData.map((entry, index) => {
                          const isTodayBar = entry.date === todayDateStr;
                          return (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={isTodayBar ? "#2563EB" : "#DBEAFE"} 
                            />
                          );
                        })}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Quick Metrics Cards */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-blue-50/50 border border-blue-100/40 p-3 rounded-2xl text-center">
                  <div className="text-[9px] font-black text-blue-500 uppercase tracking-wider mb-0.5">Today</div>
                  <div className="text-sm font-black text-blue-900">{todayMinutes}m</div>
                </div>
                <div className="bg-indigo-50/50 border border-indigo-100/40 p-3 rounded-2xl text-center">
                  <div className="text-[9px] font-black text-indigo-500 uppercase tracking-wider mb-0.5">Avg/Day</div>
                  <div className="text-sm font-black text-indigo-900">{weeklyAverageMinutes}m</div>
                </div>
                <div className="bg-emerald-50/50 border border-emerald-100/40 p-3 rounded-2xl text-center">
                  <div className="text-[9px] font-black text-emerald-500 uppercase tracking-wider mb-0.5">Top Block</div>
                  <div className="text-sm font-black text-emerald-900">{maxSessionMinutes}m</div>
                </div>
              </div>

              {/* Manual Offline Session Logger */}
              <div className="bg-gray-50/50 border border-gray-100 p-4 rounded-3xl">
                <div className="flex items-center gap-1.5 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">
                  <Plus className="w-3.5 h-3.5 text-blue-500" /> Log Offline Study
                </div>
                <div className="flex gap-2">
                  {[15, 25, 45].map((mins) => (
                    <button
                      key={mins}
                      onClick={() => handleManualLog(mins)}
                      className="flex-1 py-2 px-3 bg-white hover:bg-gray-50 border border-gray-200 hover:border-gray-300 text-gray-700 text-[11px] font-bold rounded-xl transition-all"
                    >
                      +{mins} min
                    </button>
                  ))}
                </div>
              </div>

              {/* Recent History Logs */}
              <div className="space-y-2">
                <div className="flex items-center gap-1 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  <History className="w-3.5 h-3.5 text-blue-500" /> Recent Study History
                </div>
                
                {sessionsLoading ? (
                  <div className="h-20 bg-gray-50 rounded-2xl animate-pulse"></div>
                ) : sortedLogs.length === 0 ? (
                  <div className="text-center py-6 text-xs text-gray-400 italic">
                    No focus logs recorded yet. Start the timer to complete a session!
                  </div>
                ) : (
                  <div className="max-h-[140px] overflow-y-auto space-y-2 pr-1 scrollbar-thin">
                    {sortedLogs.map((log) => (
                      <div 
                        key={log.id} 
                        className="flex justify-between items-center p-3 bg-white border border-gray-100 hover:border-gray-200 rounded-2xl shadow-2xs transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                          <div>
                            <div className="text-xs font-black text-slate-800">
                              {Math.round(log.durationSeconds / 60)} minutes studied
                            </div>
                            <div className="text-[10px] text-gray-400 font-bold">
                              {log.date} @ {log.createdAt ? new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Recently"}
                            </div>
                          </div>
                        </div>
                        
                        <button
                          onClick={() => handleForceDeleteSession(log.id)}
                          className="text-gray-300 hover:text-rose-500 p-1.5 hover:bg-rose-50 rounded-lg transition-all"
                          title="Delete log"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

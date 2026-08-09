import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Timer, Play, Pause, RotateCcw } from "lucide-react";

const WORK_TIME = 25 * 60;
const BREAK_TIME = 5 * 60;

export default function PomodoroTimer() {
  const [timeLeft, setTimeLeft] = useState(WORK_TIME);
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState<"work" | "break">("work");

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          const nextMode = mode === "work" ? "break" : "work";
          setMode(nextMode);
          return nextMode === "work" ? WORK_TIME : BREAK_TIME;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, mode]);

  const toggleTimer = () => setIsRunning(!isRunning);
  const resetTimer = () => {
    setIsRunning(false);
    setMode("work");
    setTimeLeft(WORK_TIME);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className={cn(
      "p-8 rounded-[2.5rem] border transition-all duration-300",
      mode === "work" ? "bg-amber-50 border-amber-100" : "bg-green-50 border-green-100"
    )}>
      <div className={cn(
        "w-12 h-12 rounded-2xl flex items-center justify-center mb-6",
        mode === "work" ? "bg-amber-500 text-white" : "bg-green-500 text-white"
      )}>
        <Timer className="w-6 h-6" />
      </div>
      <h3 className="text-xl font-bold mb-2">
        {mode === "work" ? "Focus Session" : "Break Time"}
      </h3>
      <p className="text-sm text-amber-900/60 mb-6">
        {mode === "work" ? "Stay focused." : "Take a breather."}
      </p>
      <div className="text-4xl font-display font-bold text-amber-900 mb-6 tracking-widest tabular-nums">
        {formatTime(timeLeft)}
      </div>
      <div className="flex gap-2">
        <button 
          onClick={toggleTimer}
          className={cn(
            "flex-1 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2",
            mode === "work" ? "bg-amber-500 text-white hover:bg-amber-600" : "bg-green-500 text-white hover:bg-green-600"
          )}
        >
          {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          {isRunning ? "Pause" : "Start"}
        </button>
        <button 
          onClick={resetTimer}
          className="p-3 rounded-xl bg-white/50 hover:bg-white text-amber-900 transition-all"
        >
          <RotateCcw className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

// Minimal helper to fix scope issue
function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(" ");
}

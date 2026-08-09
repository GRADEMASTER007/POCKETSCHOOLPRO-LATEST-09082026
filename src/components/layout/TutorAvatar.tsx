import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Sparkles, 
  Bot, 
  Volume2, 
  BrainCircuit,
  MessageSquare,
  Zap,
  Heart
} from "lucide-react";
import aristotleAvatar from "@/src/assets/images/aristotle_ai_avatar_1783943391045.jpg";
import { cn } from "@/src/lib/utils";

interface TutorAvatarProps {
  status?: "idle" | "thinking" | "speaking" | "celebrating" | "encouraging";
  size?: "sm" | "md" | "lg" | "xl";
  personality?: "professional" | "energetic" | "calm" | "mentor";
}

export const TutorAvatar: React.FC<TutorAvatarProps> = ({ 
  status = "idle", 
  size = "md",
  personality = "professional" 
}) => {
  const sizeClasses = {
    sm: "w-10 h-10",
    md: "w-16 h-16",
    lg: "w-32 h-32",
    xl: "w-48 h-48"
  };

  const personalityConfig = {
    professional: { color: "bg-indigo-500", icon: Bot, label: "Tutor", accent: "text-indigo-400" },
    energetic: { color: "bg-amber-500", icon: Sparkles, label: "Hype", accent: "text-amber-400" },
    calm: { color: "bg-emerald-500", icon: Volume2, label: "Zen", accent: "text-emerald-400" },
    mentor: { color: "bg-rose-500", icon: BrainCircuit, label: "Mentor", accent: "text-rose-400" }
  };

  const config = personalityConfig[personality] || personalityConfig.professional;

  return (
    <div className={cn("relative flex items-center justify-center", sizeClasses[size])}>
      {/* Background Rings for Thinking & Breathing */}
      <AnimatePresence>
        {(status === "thinking" || status === "idle") && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ 
              scale: status === "thinking" ? [1, 1.8, 1] : [1, 1.1, 1],
              opacity: status === "thinking" ? [0.1, 0.3, 0.1] : [0.05, 0.15, 0.05]
            }}
            transition={{ repeat: Infinity, duration: status === "thinking" ? 1.5 : 4, ease: "easeInOut" }}
            className={cn("absolute inset-0 rounded-[2.5rem] blur-xl", config.color)}
          />
        )}
      </AnimatePresence>

      {/* Main Avatar Body */}
      <motion.div
        animate={
          status === "idle" ? {
            y: [0, -3, 0],
            scale: [1, 1.01, 1],
          } : status === "thinking" ? {
            scale: [1, 1.05, 1],
            rotate: [0, 2, -2, 0]
          } : status === "speaking" ? {
            scale: [1, 1.02, 1],
            y: [0, -1, 0]
          } : {
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0]
          }
        }
        transition={{
          repeat: Infinity,
          duration: status === "idle" ? 5 : status === "thinking" ? 2 : 0.4,
          ease: "easeInOut"
        }}
        className={cn(
          "relative rounded-[2rem] shadow-2xl flex items-center justify-center overflow-hidden border-4 border-white z-10 transition-all duration-500",
          "w-full h-full",
          config.color
        )}
      >
        <img 
          src={aristotleAvatar} 
          alt="Aristotle AI" 
          referrerPolicy="no-referrer"
          className={cn(
            "w-full h-full object-cover mix-blend-overlay scale-110 transition-transform duration-700",
            status === "thinking" ? "grayscale-0 brightness-110" : "grayscale-[0.2]"
          )}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        
        {/* Eye Systems */}
        <div className="absolute top-1/3 w-full flex justify-around px-3">
          <div className="relative">
            <motion.div 
              animate={{ 
                scaleY: [1, 1, 0.1, 1, 1],
                backgroundColor: status === "thinking" ? ["#fff", "#6366f1", "#fff"] : "#fff"
              }}
              transition={{ repeat: Infinity, duration: 4, times: [0, 0.9, 0.92, 0.94, 1] }}
              className="w-2 h-2 bg-white rounded-full shadow-[0_0_12px_white]"
            />
            {status === "thinking" && (
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                className="absolute inset-0 border-t border-indigo-400 rounded-full scale-150 opacity-50"
              />
            )}
          </div>
          <div className="relative">
            <motion.div 
              animate={{ 
                scaleY: [1, 1, 0.1, 1, 1],
                backgroundColor: status === "thinking" ? ["#fff", "#6366f1", "#fff"] : "#fff"
              }}
              transition={{ repeat: Infinity, duration: 4, times: [0, 0.92, 0.94, 0.96, 1] }}
              className="w-2 h-2 bg-white rounded-full shadow-[0_0_12px_white]"
            />
            {status === "thinking" && (
              <motion.div 
                animate={{ rotate: -360 }}
                transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                className="absolute inset-0 border-t border-indigo-400 rounded-full scale-150 opacity-50"
              />
            )}
          </div>
        </div>

        {/* Hand/Action Gestures (Abstracted via Icons) */}
        <AnimatePresence mode="wait">
          <motion.div
            key={status}
            initial={{ opacity: 0, scale: 0.5, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: 10 }}
            className="absolute bottom-3 flex items-center justify-center w-full"
          >
             {status === "celebrating" && <Zap className="w-6 h-6 text-yellow-400 fill-yellow-400 drop-shadow-lg" />}
             {status === "encouraging" && <Heart className="w-6 h-6 text-rose-400 fill-rose-400 drop-shadow-lg" />}
             {status === "speaking" && <Volume2 className="w-6 h-6 text-white/80" />}
          </motion.div>
        </AnimatePresence>

        <config.icon className="absolute top-2 right-2 w-3 h-3 text-white/30" />
      </motion.div>

      {/* Status Indicators */}
      <AnimatePresence>
        {status === "speaking" && (
          <div className="absolute -left-6 flex flex-col gap-1 h-12 items-center justify-center z-0">
            {[1, 2, 3, 4].map(i => (
              <motion.div
                key={i}
                animate={{ width: [4, 20, 4] }}
                transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.1 }}
                className={cn("h-1 rounded-full", config.color)}
              />
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Personality Label */}
      <motion.div 
        layoutId="personality-badge"
        className="absolute -bottom-2 px-3 py-1 bg-white rounded-full shadow-xl border border-gray-100 z-20 flex items-center gap-2"
      >
        <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", config.color)} />
        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-900">{config.label}</span>
      </motion.div>
    </div>
  );
};

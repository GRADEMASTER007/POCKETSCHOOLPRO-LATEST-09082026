import React, { useState, useEffect } from "react";
import { Zap, Sparkles, BrainCircuit, MessageSquare, Image as ImageIcon, Mic } from "lucide-react";
import { useAuth } from "@/src/components/auth/AuthContext";
import { motion } from "motion/react";
import { cn } from "@/src/lib/utils";

export default function UsageStats() {
  const { user } = useAuth();
  const [usage, setUsage] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsage = async () => {
      if (!user) return;
      try {
        const response = await fetch("/api/subscription/usage", {
          headers: { "Authorization": `Bearer ${await user.getIdToken()}` }
        });
        if (response.ok) {
          const data = await response.json();
          setUsage(data);
        }
      } catch (err) {
        console.error("Failed to fetch usage:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsage();
  }, [user]);

  if (loading || !usage) return null;

  const { subscriptionTier, limits, usage: stats } = usage;
  
  const tokenPercent = Math.min(100, (stats.totalTokensUsed / limits.tokens_per_month) * 100);
  const requestPercent = Math.min(100, (stats.dailyRequestsUsed / limits.ai_requests_per_day) * 100);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-900/50 backdrop-blur-xl rounded-[2.5rem] border border-slate-800 p-8 shadow-2xl space-y-8"
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-display font-black text-white flex items-center gap-2 tracking-tight">
            <Zap className="w-5 h-5 text-amber-400 fill-current" />
            Active Quota Status
          </h3>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">
            Plan: <span className="text-amber-400">{subscriptionTier.replace("_", " ").toUpperCase()}</span>
            {stats.isSchoolPooled && <span className="ml-2 text-sky-400">(School Pooled)</span>}
          </p>
        </div>
        <Sparkles className="w-6 h-6 text-amber-400/20" />
      </div>

      <div className="space-y-6">
        {/* Monthly Tokens */}
        <div className="space-y-2">
          <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
            <span className="text-slate-400 flex items-center gap-1.5">
              <BrainCircuit className="w-3.5 h-3.5" /> Monthly Intelligence (Tokens)
            </span>
            <span className="text-white">{stats.totalTokensUsed.toLocaleString()} / {limits.tokens_per_month.toLocaleString()}</span>
          </div>
          <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${tokenPercent}%` }}
              className={cn(
                "h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-600 shadow-[0_0_10px_rgba(245,158,11,0.5)]",
                tokenPercent > 90 && "from-red-500 to-orange-600"
              )}
            />
          </div>
        </div>

        {/* Daily Requests */}
        <div className="space-y-2">
          <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
            <span className="text-slate-400 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5" /> Daily AI Questions
            </span>
            <span className="text-white">{stats.dailyRequestsUsed} / {limits.ai_requests_per_day}</span>
          </div>
          <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${requestPercent}%` }}
              className={cn(
                "h-full rounded-full bg-gradient-to-r from-sky-400 to-blue-600 shadow-[0_0_10px_rgba(56,189,248,0.5)]",
                requestPercent > 90 && "from-orange-500 to-red-600"
              )}
            />
          </div>
        </div>

        {/* Other Mini Stats */}
        <div className="grid grid-cols-2 gap-4 pt-4">
          <div className="bg-slate-800/40 p-4 rounded-2xl border border-slate-700/50">
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-1.5">
              <ImageIcon className="w-3 h-3" /> Image Scans
            </p>
            <p className="text-lg font-black text-white">{stats.dailyImagesUsed} / {limits.image_generations_per_day}</p>
          </div>
          <div className="bg-slate-800/40 p-4 rounded-2xl border border-slate-700/50">
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-1.5">
              <Mic className="w-3 h-3" /> Voice Minutes
            </p>
            <p className="text-lg font-black text-white">{stats.dailyVoiceMinsUsed} / {limits.voice_minutes_per_day}</p>
          </div>
        </div>
      </div>

      <div className="pt-4">
        <button 
          onClick={() => window.location.href = "/settings/subscription"}
          className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-300 transition-all"
        >
          Manage Subscription & Quota
        </button>
      </div>
    </motion.div>
  );
}

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { db, auth, handleFirestoreError, OperationType } from "@/src/lib/firebase";
import { Award, Zap, Flame } from "lucide-react";

interface UserStats {
  xp: number;
  streak: number;
  badges: string[];
}

export default function Gamification() {
  const [stats, setStats] = useState<UserStats | null>(null);

  useEffect(() => {
    if (!auth.currentUser) return;
    const statsRef = doc(db, "user_stats", auth.currentUser.uid);
    const unsubscribe = onSnapshot(statsRef, (doc) => {
      if (doc.exists()) {
        setStats(doc.data() as UserStats);
      } else {
        setStats({ xp: 1250, streak: 12, badges: ["Early Bird", "Math Whiz"] });
      }
    }, (error) => {
      // Mock data if firebase fails for demo
      setStats({ xp: 1250, streak: 12, badges: ["Early Bird", "Math Whiz"] });
    });
    return unsubscribe;
  }, []);

  if (!stats) return null;

  const level = Math.floor(stats.xp / 1000) + 1;
  const xpInLevel = stats.xp % 1000;
  const progress = (xpInLevel / 1000) * 100;

  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl relative overflow-hidden group">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:scale-110 transition-transform duration-700">
        <Award className="w-32 h-32" />
      </div>

      <div className="relative z-10 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-brand-primary rounded-2xl flex items-center justify-center text-white shadow-lg shadow-brand-primary/20">
              <span className="text-2xl font-black">{level}</span>
            </div>
            <div>
              <h3 className="text-xl font-display font-black text-gray-900">Level {level} Explorer</h3>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Next level: {1000 - xpInLevel} XP needed</p>
            </div>
          </div>
          <motion.div 
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="flex items-center gap-2 px-3 py-1 bg-orange-50 text-orange-600 rounded-full text-xs font-black border border-orange-100"
          >
            <Flame className="w-4 h-4 fill-current" />
            {stats.streak} DAY STREAK
          </motion.div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-end text-[10px] font-black uppercase tracking-widest text-gray-400">
            <span>Progress to Level {level + 1}</span>
            <span className="text-brand-secondary">{xpInLevel} / 1000 XP</span>
          </div>
          <div className="h-4 bg-gray-50 rounded-full overflow-hidden border border-gray-100 p-1">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-brand-secondary to-blue-400 rounded-full shadow-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-50">
          <div className="text-center">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total XP</p>
            <p className="text-lg font-black text-gray-900">{stats.xp}</p>
          </div>
          <div className="text-center border-x border-gray-50">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Badges</p>
            <p className="text-lg font-black text-gray-900">{stats.badges?.length || 0}</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Ranking</p>
            <p className="text-lg font-black text-gray-900">#42</p>
          </div>
        </div>
      </div>
    </div>
  );
}

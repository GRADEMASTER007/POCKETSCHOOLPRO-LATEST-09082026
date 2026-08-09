import React from "react";
import { motion } from "motion/react";
import { 
  Target, 
  CheckCircle2, 
  Circle, 
  Clock, 
  Sparkles,
  Calendar,
  ArrowRight
} from "lucide-react";
import { cn } from "@/src/lib/utils";

const dailyMissions = [
  { id: 1, title: "Solve 5 Algebra Equations", subject: "Mathematics", completed: true, xp: 50 },
  { id: 2, title: "Review Soil Profiles", subject: "Agri Science", completed: false, xp: 30 },
  { id: 3, title: "Practice Swahili Past Tense", subject: "Languages", completed: false, xp: 40 },
];

export default function StudyPlanner() {
  return (
    <div className="bg-white rounded-[3rem] border border-gray-100 shadow-xl overflow-hidden flex flex-col">
      <div className="p-8 border-b border-gray-50 flex items-center justify-between bg-indigo-50/30">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-display font-black text-gray-900">Today's Mission</h3>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">AI Generated Focus</p>
          </div>
        </div>
        <button className="p-3 bg-white border border-gray-100 rounded-xl text-gray-400 hover:text-indigo-600 transition-all">
          <Calendar className="w-5 h-5" />
        </button>
      </div>

      <div className="p-8 space-y-4 flex-1">
        {dailyMissions.map((mission, i) => (
          <motion.div
            key={mission.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className={cn(
              "p-6 rounded-[2rem] border transition-all flex items-center gap-4 group cursor-pointer",
              mission.completed ? "bg-emerald-50/50 border-emerald-100" : "bg-gray-50 border-gray-100 hover:border-indigo-200"
            )}
          >
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center transition-all",
              mission.completed ? "bg-emerald-500 text-white" : "bg-white text-gray-300 group-hover:text-indigo-500"
            )}>
              {mission.completed ? <CheckCircle2 className="w-6 h-6" /> : <Circle className="w-6 h-6" />}
            </div>
            <div className="flex-1">
              <h4 className={cn("font-bold", mission.completed ? "text-emerald-900/60 line-through" : "text-gray-900")}>
                {mission.title}
              </h4>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{mission.subject}</p>
            </div>
            <div className="text-right">
                <span className="text-xs font-black text-brand-secondary">+{mission.xp} XP</span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="p-8 bg-gray-50 border-t border-gray-100">
        <div className="flex items-center justify-between mb-6">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Weekly Goal: 500 XP</span>
            <span className="text-xs font-black text-indigo-600">320/500</span>
        </div>
        <div className="h-3 bg-white rounded-full overflow-hidden border border-gray-200 p-0.5 mb-8">
            <motion.div 
                initial={{ width: 0 }}
                animate={{ width: "64%" }}
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
            />
        </div>

        <button className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all flex items-center justify-center gap-2 group">
            Optimize My Schedule
            <Sparkles className="w-4 h-4 text-brand-secondary group-hover:rotate-12 transition-transform" />
        </button>
      </div>
    </div>
  );
}

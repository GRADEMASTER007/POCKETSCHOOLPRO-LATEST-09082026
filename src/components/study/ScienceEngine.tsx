import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Atom, Zap, Thermometer, FlaskConical, Play, RotateCcw } from "lucide-react";
import { cn } from "@/src/lib/utils";

export default function ScienceEngine() {
  const [reactionStage, setReactionStage] = useState<"initial" | "mixing" | "product">("initial");

  const startReaction = () => {
    setReactionStage("mixing");
    setTimeout(() => setReactionStage("product"), 3000);
  };

  const reset = () => setReactionStage("initial");

  return (
    <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl overflow-hidden">
      <div className="p-8 border-b border-gray-50 flex items-center justify-between bg-emerald-50/30">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
            <Atom className="w-6 h-6 animate-spin-slow" />
          </div>
          <div>
            <h3 className="text-xl font-display font-black text-gray-900">Virtual Lab</h3>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Chemistry Experiment</p>
          </div>
        </div>
        <button 
          onClick={reset}
          className="p-3 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all"
        >
          <RotateCcw className="w-5 h-5" />
        </button>
      </div>

      <div className="p-12">
        <div className="max-w-3xl mx-auto space-y-16">
          {/* Visual Canvas */}
          <div className="relative h-64 bg-gray-50 rounded-[3rem] border-4 border-dashed border-gray-100 flex items-center justify-center overflow-hidden">
            
            {/* Molecule A */}
            <motion.div
              animate={reactionStage === "mixing" ? { x: 50, scale: 0.8, opacity: 0 } : { x: -80, scale: 1, opacity: 1 }}
              className="absolute w-24 h-24 bg-blue-500 rounded-full flex items-center justify-center text-white shadow-xl shadow-blue-500/30"
            >
              <div className="font-black text-2xl">H₂</div>
            </motion.div>

            {/* Molecule B */}
            <motion.div
              animate={reactionStage === "mixing" ? { x: -50, scale: 0.8, opacity: 0 } : { x: 80, scale: 1, opacity: 1 }}
              className="absolute w-24 h-24 bg-red-500 rounded-full flex items-center justify-center text-white shadow-xl shadow-red-500/30"
            >
              <div className="font-black text-2xl">O</div>
            </motion.div>

            {/* Reaction Effect */}
            <AnimatePresence>
              {reactionStage === "mixing" && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                  exit={{ scale: 2, opacity: 0 }}
                  className="absolute z-20"
                >
                  <Zap className="w-32 h-32 text-yellow-400 fill-current filter blur-sm" />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Product Molecule */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={reactionStage === "product" ? { scale: 1.2, opacity: 1 } : { scale: 0, opacity: 0 }}
              className="absolute w-32 h-32 bg-cyan-400 rounded-full flex items-center justify-center text-white shadow-2xl shadow-cyan-400/40"
            >
              <div className="text-center">
                <div className="font-black text-3xl">H₂O</div>
                <div className="text-[10px] font-bold uppercase tracking-widest mt-1">Water</div>
              </div>
            </motion.div>

            {/* Background Particles */}
            <div className="absolute inset-0 pointer-events-none opacity-20">
              {[...Array(10)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{ 
                    y: [Math.random() * 200, Math.random() * 200],
                    x: [Math.random() * 600, Math.random() * 600],
                    opacity: [0.2, 0.5, 0.2]
                  }}
                  transition={{ repeat: Infinity, duration: Math.random() * 5 + 5 }}
                  className="absolute w-1 h-1 bg-gray-400 rounded-full"
                />
              ))}
            </div>
          </div>

          {/* Explanation & Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-emerald-600 font-black uppercase tracking-widest text-xs">
                <FlaskConical className="w-4 h-4" />
                Reaction Notes
              </div>
              <h4 className="text-2xl font-display font-bold text-gray-900 leading-tight">
                {reactionStage === "initial" && "Combine Hydrogen and Oxygen to form Water."}
                {reactionStage === "mixing" && "Atoms are bonding... Breaking initial bonds."}
                {reactionStage === "product" && "Exothermic reaction completed successfully!"}
              </h4>
              <p className="text-gray-500 font-medium leading-relaxed">
                Watch how the energy release during the bond formation stabilizes the new H₂O molecule.
              </p>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="flex items-center gap-3">
                  <Thermometer className="w-5 h-5 text-red-500" />
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Temperature</span>
                </div>
                <span className="text-lg font-black text-gray-900">
                  {reactionStage === "mixing" ? "450°C" : "25°C"}
                </span>
              </div>
              <button
                onClick={startReaction}
                disabled={reactionStage !== "initial"}
                className={cn(
                  "w-full py-5 px-8 rounded-2xl font-black text-xl shadow-xl transition-all flex items-center justify-center gap-3",
                  reactionStage === "initial" 
                    ? "bg-emerald-500 text-white hover:scale-105 active:scale-95 shadow-emerald-500/30"
                    : "bg-gray-100 text-gray-400"
                )}
              >
                {reactionStage === "initial" ? <>Start Experiment <Play className="w-6 h-6" /></> : "Experiment Running..."}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

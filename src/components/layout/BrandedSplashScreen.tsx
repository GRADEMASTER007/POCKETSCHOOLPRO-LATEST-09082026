import React from "react";
import { motion } from "motion/react";

interface SplashScreenProps {
  message?: string;
}

export default function BrandedSplashScreen({ message = "Launching Grade Master..." }: SplashScreenProps) {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6, ease: "easeInOut" }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-indigo-950"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="flex flex-col items-center gap-8"
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="relative"
        >
          <img
            src="/icon-512.png"
            alt="Grade Master Logo"
            className="w-32 h-32 rounded-[2.5rem] object-cover shadow-[0_0_50px_rgba(129,140,248,0.5)] border-4 border-indigo-400 animate-pulse transition-all duration-1000"
            referrerPolicy="no-referrer"
          />
          {/* Spinner */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
            className="absolute -inset-4 rounded-full border-4 border-t-indigo-400 border-r-transparent border-b-transparent border-l-transparent"
          />
        </motion.div>
        
        <motion.div
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
          className="text-lg font-semibold text-indigo-100 tracking-wider"
        >
          {message}
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

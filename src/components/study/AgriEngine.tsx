import React from "react";
import { motion } from "motion/react";
import { 
  Sprout, 
  Wind, 
  Droplets, 
  Sun,
  Thermometer,
  CloudRain,
  Activity
} from "lucide-react";

export default function AgriEngine() {
  return (
    <div className="bg-white rounded-[3rem] p-10 border border-gray-100 shadow-xl min-h-[600px] flex flex-col">
      <div className="flex items-center gap-6 mb-12">
        <div className="w-20 h-20 bg-emerald-100 rounded-3xl flex items-center justify-center text-emerald-600">
          <Sprout className="w-10 h-10" />
        </div>
        <div>
          <h2 className="text-4xl font-display font-black text-gray-900">Agriculture Lab</h2>
          <p className="text-gray-500 font-medium">Interactive Soil & Climate Simulator</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 flex-1">
        <div className="md:col-span-2 bg-emerald-50 rounded-[2.5rem] border border-emerald-100 relative overflow-hidden flex items-center justify-center">
            <div className="text-center p-12">
                <Sun className="w-24 h-24 text-amber-400 mx-auto mb-6 animate-pulse" />
                <h3 className="text-2xl font-display font-bold text-emerald-900 mb-4">Soil Moisture Monitor</h3>
                <p className="text-emerald-700/70 max-w-sm mx-auto">Real-time simulation of soil hydration levels based on South African regional data.</p>
            </div>
            <motion.div 
                animate={{ y: [0, 20, 0] }}
                transition={{ repeat: Infinity, duration: 4 }}
                className="absolute bottom-0 w-full h-1/3 bg-emerald-200/30 backdrop-blur-sm"
            />
        </div>

        <div className="space-y-6">
            {[
                { icon: Wind, label: "Air Velocity", value: "12 km/h", color: "text-blue-500" },
                { icon: Thermometer, label: "Soil Temp", value: "24°C", color: "text-orange-500" },
                { icon: Droplets, label: "Humidity", value: "58%", color: "text-cyan-500" },
                { icon: CloudRain, label: "Rainfall", value: "2.4mm", color: "text-indigo-500" },
            ].map((stat, i) => (
                <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className={cn("p-3 rounded-xl bg-gray-50", stat.color)}>
                        <stat.icon className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</p>
                        <p className="text-lg font-bold text-gray-900">{stat.value}</p>
                    </div>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
}

import { cn } from "@/src/lib/utils";

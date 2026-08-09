import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Globe, 
  Wind, 
  Thermometer, 
  Droplets, 
  Sun, 
  CloudRain,
  Map as MapIcon,
  Layers,
  Sparkles,
  Zap
} from "lucide-react";
import { cn } from "@/src/lib/utils";

const layers = [
  { id: "crust", name: "Crust", depth: "5-70 km", info: "The outermost solid shell of Earth.", color: "bg-orange-200" },
  { id: "mantle", name: "Mantle", depth: "2,900 km", info: "The thickest layer, composed of silicate rocks.", color: "bg-orange-500" },
  { id: "outer-core", name: "Outer Core", depth: "2,200 km", info: "Liquid iron and nickel responsible for Earth's magnetic field.", color: "bg-red-600" },
  { id: "inner-core", name: "Inner Core", depth: "1,220 km", info: "A solid, extremely hot ball of mostly iron.", color: "bg-red-900" },
];

export default function GeographyEngine() {
  const [view, setView] = useState<"climate" | "layers">("climate");
  const [temp, setTemp] = useState(25);
  const [humidity, setHumidity] = useState(60);
  const [selectedLayer, setSelectedLayer] = useState<string | null>(null);

  return (
    <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl overflow-hidden">
      <div className="p-8 border-b border-gray-50 flex items-center justify-between bg-blue-50/30">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-600/20">
            <Globe className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-display font-black text-gray-900">Geo-Sim Studio</h3>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Interactive Earth Sciences</p>
          </div>
        </div>
        <div className="flex bg-white p-1 rounded-xl border border-gray-100">
          <button 
            onClick={() => setView("climate")}
            className={cn(
              "px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
              view === "climate" ? "bg-blue-500 text-white shadow-lg" : "text-gray-400 hover:text-gray-600"
            )}
          >
            Climate Sim
          </button>
          <button 
            onClick={() => setView("layers")}
            className={cn(
              "px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
              view === "layers" ? "bg-orange-500 text-white shadow-lg" : "text-gray-400 hover:text-gray-600"
            )}
          >
            Earth Layers
          </button>
        </div>
      </div>

      <div className="p-12">
        <AnimatePresence mode="wait">
          {view === "climate" ? (
            <motion.div
              key="climate"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-16"
            >
              <div className="space-y-12">
                <div className="relative h-[300px] bg-gradient-to-b from-blue-400 to-blue-200 rounded-[3rem] overflow-hidden shadow-inner border-4 border-white">
                  <AnimatePresence>
                    {temp > 30 && <Sun className="absolute top-8 right-8 w-16 h-16 text-yellow-300 animate-spin-slow" />}
                    {humidity > 70 && (
                      <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        className="absolute inset-0 bg-blue-900/10 backdrop-blur-[2px] flex items-center justify-around"
                      >
                        {[...Array(20)].map((_, i) => (
                          <motion.div
                            key={i}
                            animate={{ y: [0, 400] }}
                            transition={{ repeat: Infinity, duration: Math.random() * 1 + 0.5, delay: Math.random() }}
                            className="w-0.5 h-8 bg-blue-200 rounded-full"
                          />
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <div className="absolute bottom-8 left-8">
                    <p className="text-white text-5xl font-display font-black leading-none drop-shadow-lg">{temp}°C</p>
                    <p className="text-white/80 font-black uppercase tracking-widest text-xs mt-2">Surface Conditions</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-gray-400">
                            <div className="flex items-center gap-2">
                                <Thermometer className="w-3 h-3" />
                                Temperature
                            </div>
                            <span>{temp}°C</span>
                        </div>
                        <input 
                            type="range" 
                            min="-10" 
                            max="50" 
                            value={temp} 
                            onChange={(e) => setTemp(parseInt(e.target.value))}
                            className="w-full accent-red-500"
                        />
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-gray-400">
                            <div className="flex items-center gap-2">
                                <Droplets className="w-3 h-3" />
                                Humidity
                            </div>
                            <span>{humidity}%</span>
                        </div>
                        <input 
                            type="range" 
                            min="0" 
                            max="100" 
                            value={humidity} 
                            onChange={(e) => setHumidity(parseInt(e.target.value))}
                            className="w-full accent-blue-500"
                        />
                    </div>
                </div>
              </div>

              <div className="space-y-8">
                <div className="bg-blue-50 p-8 rounded-[2.5rem] border border-blue-100">
                    <h4 className="text-2xl font-display font-black text-blue-900 mb-4">Environment Analysis</h4>
                    <p className="text-blue-700/70 font-medium leading-relaxed">
                        {temp > 30 ? "High temperatures are increasing evaporation rates." : "Moderate temperatures are stabilizing the local ecosystem."}
                        {humidity > 70 ? " Excessive moisture is leading to precipitation and high-pressure systems." : " Low humidity is creating arid conditions."}
                    </p>
                </div>
                
                <div className="p-8 bg-white border border-gray-100 rounded-[2.5rem] shadow-sm space-y-4">
                    <div className="flex items-center gap-2 text-[10px] font-black text-brand-secondary uppercase tracking-widest">
                        <Zap className="w-3.5 h-3.5" />
                        AI Prediction
                    </div>
                    <h5 className="text-xl font-bold text-gray-900">Potential Weather Pattern</h5>
                    <div className="flex items-center gap-4 text-gray-500 font-medium">
                        {humidity > 70 ? <CloudRain className="w-8 h-8 text-blue-500" /> : <Sun className="w-8 h-8 text-amber-500" />}
                        <p>{humidity > 70 ? "Localized thunderstorm development likely within 2 hours." : "Clear skies expected for the next 24 hours."}</p>
                    </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="layers"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center"
            >
              <div className="relative h-[400px] flex items-center justify-center">
                {layers.map((layer, i) => (
                  <motion.div
                    key={layer.id}
                    onClick={() => setSelectedLayer(layer.id)}
                    animate={{ 
                      scale: selectedLayer === layer.id ? 1.05 : 1,
                      zIndex: layers.length - i 
                    }}
                    className={cn(
                      "absolute rounded-full border-4 border-white shadow-2xl cursor-pointer transition-all",
                      layer.color
                    )}
                    style={{ 
                      width: `${(layers.length - i) * 80}px`, 
                      height: `${(layers.length - i) * 80}px` 
                    }}
                  />
                ))}
              </div>

              <div className="space-y-8">
                <AnimatePresence mode="wait">
                  {selectedLayer ? (
                    <motion.div
                      key={selectedLayer}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-6"
                    >
                      <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-50 text-orange-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-orange-100">
                        <Layers className="w-3 h-3" />
                        Sub-Surface Dissection
                      </div>
                      <div>
                        <h4 className="text-4xl font-display font-black text-gray-900">{layers.find(l => l.id === selectedLayer)?.name}</h4>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Depth: {layers.find(l => l.id === selectedLayer)?.depth}</p>
                      </div>
                      <p className="text-lg text-gray-500 font-medium leading-relaxed">
                        {layers.find(l => l.id === selectedLayer)?.info}
                      </p>
                    </motion.div>
                  ) : (
                    <div className="text-center p-12 border-2 border-dashed border-gray-100 rounded-[3rem]">
                      <MapIcon className="w-16 h-16 text-gray-100 mx-auto mb-4" />
                      <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Tap a layer to explore Earth's interior</p>
                    </div>
                  )}
                </AnimatePresence>
                
                <div className="p-8 bg-gray-900 rounded-[2.5rem] text-white relative overflow-hidden">
                    <Sparkles className="w-8 h-8 text-brand-secondary mb-4" />
                    <h5 className="text-xl font-display font-black mb-2">Seismic Activity</h5>
                    <p className="text-white/50 text-sm font-medium">Core pressure is within nominal ranges. No major tectonic shifts detected in this simulation.</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }
      `}</style>
    </div>
  );
}

import React, { useState, useEffect, useRef } from 'react';
import { Scale, Ruler, Thermometer, ArrowRightLeft, History, Trash2, Database, Clock, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type UnitType = 'length' | 'mass' | 'temperature' | 'data' | 'time';

interface Unit {
  label: string;
  value: string;
  factor?: number; // Relative to base unit (meters for length, grams for mass, bits for data, seconds for time)
}

interface ConversionHistory {
  id: string;
  type: UnitType;
  value: string;
  fromUnit: string;
  toUnit: string;
  result: number;
  timestamp: number;
}

const UNITS: Record<UnitType, Unit[]> = {
  length: [
    { label: 'Meters (m)', value: 'm', factor: 1 },
    { label: 'Kilometers (km)', value: 'km', factor: 1000 },
    { label: 'Centimeters (cm)', value: 'cm', factor: 0.01 },
    { label: 'Millimeters (mm)', value: 'mm', factor: 0.001 },
    { label: 'Inches (in)', value: 'in', factor: 0.0254 },
    { label: 'Feet (ft)', value: 'ft', factor: 0.3048 },
    { label: 'Miles (mi)', value: 'mi', factor: 1609.34 },
  ],
  mass: [
    { label: 'Grams (g)', value: 'g', factor: 1 },
    { label: 'Kilograms (kg)', value: 'kg', factor: 1000 },
    { label: 'Milligrams (mg)', value: 'mg', factor: 0.001 },
    { label: 'Pounds (lb)', value: 'lb', factor: 453.592 },
    { label: 'Ounces (oz)', value: 'oz', factor: 28.3495 },
  ],
  temperature: [
    { label: 'Celsius (°C)', value: 'C' },
    { label: 'Fahrenheit (°F)', value: 'F' },
    { label: 'Kelvin (K)', value: 'K' },
  ],
  data: [
    { label: 'Bits (b)', value: 'b', factor: 1 },
    { label: 'Bytes (B)', value: 'B', factor: 8 },
    { label: 'Kilobytes (KB)', value: 'KB', factor: 8 * 1024 },
    { label: 'Megabytes (MB)', value: 'MB', factor: 8 * 1024 * 1024 },
    { label: 'Gigabytes (GB)', value: 'GB', factor: 8 * 1024 * 1024 * 1024 },
    { label: 'Terabytes (TB)', value: 'TB', factor: 8 * Math.pow(1024, 4) },
  ],
  time: [
    { label: 'Seconds (s)', value: 's', factor: 1 },
    { label: 'Minutes (min)', value: 'min', factor: 60 },
    { label: 'Hours (h)', value: 'h', factor: 3600 },
    { label: 'Days (d)', value: 'd', factor: 86400 },
    { label: 'Weeks (wk)', value: 'wk', factor: 604800 },
  ],
};

const CATEGORY_INFO: Record<UnitType, { label: string; icon: React.ReactNode }> = {
  length: { label: 'Length', icon: <Ruler className="w-4 h-4" /> },
  mass: { label: 'Mass', icon: <Scale className="w-4 h-4" /> },
  temperature: { label: 'Temperature', icon: <Thermometer className="w-4 h-4" /> },
  data: { label: 'Data Storage', icon: <Database className="w-4 h-4" /> },
  time: { label: 'Time', icon: <Clock className="w-4 h-4" /> },
};

const HISTORY_KEY = 'unit_converter_history';

export const UnitConverter: React.FC = () => {
  const [type, setType] = useState<UnitType>('length');
  const [fromUnit, setFromUnit] = useState('');
  const [toUnit, setToUnit] = useState('');
  const [value, setValue] = useState<string>('1');
  const [result, setResult] = useState<number | null>(null);
  const [isScientific, setIsScientific] = useState(false);
  const [history, setHistory] = useState<ConversionHistory[]>([]);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load history from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(HISTORY_KEY);
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse history', e);
      }
    }
  }, []);

  // Save history to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    // Only reset units if the current ones don't belong to the new type
    const availableUnits = UNITS[type].map(u => u.value);
    if (!availableUnits.includes(fromUnit) || !availableUnits.includes(toUnit)) {
      setFromUnit(UNITS[type][0].value);
      setToUnit(UNITS[type][1].value);
    }
  }, [type]);

  const convert = () => {
    const val = parseFloat(value);
    if (isNaN(val)) return null;

    let res: number;
    if (type === 'temperature') {
      let celsius = val;
      if (fromUnit === 'F') celsius = (val - 32) * 5 / 9;
      if (fromUnit === 'K') celsius = val - 273.15;

      let final = celsius;
      if (toUnit === 'F') final = (celsius * 9 / 5) + 32;
      if (toUnit === 'K') final = celsius + 273.15;
      
      res = Number(final.toFixed(4));
    } else {
      const fromFactor = UNITS[type].find(u => u.value === fromUnit)?.factor || 1;
      const toFactor = UNITS[type].find(u => u.value === toUnit)?.factor || 1;
      const final = (val * fromFactor) / toFactor;
      res = Number(final.toFixed(4));
    }
    setResult(res);
    return res;
  };

  useEffect(() => {
    const res = convert();

    // Debounced history save
    if (res !== null && value && value !== '0') {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      
      saveTimeoutRef.current = setTimeout(() => {
        setHistory(prev => {
          const newEntry: ConversionHistory = {
            id: Math.random().toString(36).substring(2, 9),
            type,
            value,
            fromUnit,
            toUnit,
            result: res,
            timestamp: Date.now()
          };

          // Check if identical to last entry
          if (prev.length > 0) {
            const last = prev[0];
            if (last.value === value && last.fromUnit === fromUnit && last.toUnit === toUnit && last.type === type) {
              return prev;
            }
          }

          // Filter out duplicates and keep last 5
          const filtered = prev.filter(h => 
            !(h.value === value && h.fromUnit === fromUnit && h.toUnit === toUnit && h.type === type)
          );
          return [newEntry, ...filtered].slice(0, 5);
        });
      }, 1000);
    }

    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [value, fromUnit, toUnit, type]);

  const swapUnits = () => {
    const temp = fromUnit;
    setFromUnit(toUnit);
    setToUnit(temp);
  };

  const loadFromHistory = (h: ConversionHistory) => {
    setType(h.type);
    setFromUnit(h.fromUnit);
    setToUnit(h.toUnit);
    setValue(h.value);
  };

  const clearHistory = () => {
    setHistory([]);
  };

  return (
    <div className="p-4 bg-white rounded-xl shadow-sm border border-slate-100 max-h-[70vh] overflow-y-auto custom-scrollbar">
      {/* Category Dropdown */}
      <div className="relative mb-4">
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">Category</label>
        <div className="relative">
          <select
            value={type}
            onChange={(e) => setType(e.target.value as UnitType)}
            className="w-full appearance-none pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-semibold text-slate-700 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all cursor-pointer"
          >
            {(Object.keys(UNITS) as UnitType[]).map((t) => (
              <option key={t} value={t}>
                {CATEGORY_INFO[t].label}
              </option>
            ))}
          </select>
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-600">
            {CATEGORY_INFO[type].icon}
          </div>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="relative">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Value</label>
          <input
            type="number"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
            placeholder="Enter value..."
          />
        </div>

        <div className="grid grid-cols-[1fr,auto,1fr] items-end gap-2">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">From</label>
            <div className="relative">
              <select
                value={fromUnit}
                onChange={(e) => setFromUnit(e.target.value)}
                className="w-full appearance-none pl-3 pr-8 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all cursor-pointer"
              >
                {UNITS[type]?.map(u => (
                  <option key={u.value} value={u.value}>{u.label}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
            </div>
          </div>

          <button 
            onClick={swapUnits}
            className="p-2.5 mb-0.5 rounded-xl bg-slate-50 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors shadow-sm"
          >
            <ArrowRightLeft className="w-4 h-4" />
          </button>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">To</label>
            <div className="relative">
              <select
                value={toUnit}
                onChange={(e) => setToUnit(e.target.value)}
                className="w-full appearance-none pl-3 pr-8 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all cursor-pointer"
              >
                {UNITS[type]?.map(u => (
                  <option key={u.value} value={u.value}>{u.label}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between px-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Notation</label>
          <div className="flex items-center bg-slate-100 rounded-lg p-1">
            <button
              onClick={() => setIsScientific(false)}
              className={`px-2 py-0.5 text-[9px] font-bold rounded-md transition-all ${
                !isScientific ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'
              }`}
            >
              Standard
            </button>
            <button
              onClick={() => setIsScientific(true)}
              className={`px-2 py-0.5 text-[9px] font-bold rounded-md transition-all ${
                isScientific ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'
              }`}
            >
              Scientific
            </button>
          </div>
        </div>

        <AnimatePresence mode="popLayout">
          {result !== null && (
            <motion.div
              key={`${value}-${fromUnit}-${toUnit}-${type}-${isScientific}`}
              initial={{ opacity: 0, scale: 0.98, y: 4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: -4 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="mt-2 p-4 bg-indigo-50/30 rounded-xl border border-indigo-100/50 text-center"
            >
              <div className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider mb-1">Result</div>
              <div className="text-xl font-bold text-indigo-700">
                {isScientific ? result.toExponential(4) : result} <span className="text-xs font-medium text-indigo-500">{toUnit}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* History Section */}
        {history.length > 0 && (
          <div className="mt-6 pt-4 border-t border-slate-50">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <History className="w-3 h-3" />
                Recent Conversions
              </div>
              <button 
                onClick={clearHistory}
                className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                title="Clear History"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
            
            <div className="space-y-2">
              {history.map((h) => (
                <button
                  key={h.id}
                  onClick={() => loadFromHistory(h)}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-50/50 hover:bg-indigo-50/50 border border-transparent hover:border-indigo-100 transition-all text-left group"
                >
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1.5 mb-1">
                      <div className="text-indigo-400">
                        {CATEGORY_INFO[h.type].icon}
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight leading-none">
                        {CATEGORY_INFO[h.type].label}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-slate-700">
                      {h.value}{h.fromUnit} → {h.result}{h.toUnit}
                    </span>
                  </div>
                  <ArrowRightLeft className="w-3.5 h-3.5 text-slate-300 group-hover:text-indigo-400 transition-colors" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

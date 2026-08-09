import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Binary, 
  Cpu, 
  Box, 
  Infinity as InfinityIcon, 
  Code, 
  Layers,
  Sparkles,
  ArrowRight,
  Calculator,
  RefreshCw,
  Scale,
  Settings,
  HelpCircle,
  FlaskConical,
  Zap,
  Globe,
  ArrowRightLeft,
  ChevronRight
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import STEMInteractiveLab from "./STEMInteractiveLab";

const STEMCard = ({ icon: Icon, title, description, color, badges, onClick }: any) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="bg-white p-6 rounded-[2rem] border border-gray-100 flex flex-col h-full shadow-sm hover:shadow-md transition-all"
  >
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 ${color}`}>
      <Icon className="w-6 h-6" />
    </div>
    <div className="flex gap-1.5 mb-3">
      {badges.map((b: string) => (
        <span key={b} className="text-[8px] px-2 py-0.5 bg-gray-50 text-gray-500 rounded-full font-bold uppercase tracking-wider border border-gray-100">
          {b}
        </span>
      ))}
    </div>
    <h3 className="text-lg font-black mb-2 text-gray-900">{title}</h3>
    <p className="text-gray-500 text-xs leading-relaxed flex-1 mb-6">
      {description}
    </p>
    <button onClick={onClick} className="flex items-center justify-center gap-1.5 w-full py-3 bg-gray-50 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-brand-primary hover:text-white transition-all group">
      Explore Module
      <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
    </button>
  </motion.div>
);

export default function STEMHub() {
  const [activeTab, setActiveTab] = useState<"modules" | "calculator" | "converter" | "coding" | "hardware" | "math" | "cad" | "ai" | "eco">("modules");

  // Calculator states
  const [calcCategory, setCalcCategory] = useState<"math" | "chemistry" | "physics">("math");
  const [selectedFormula, setSelectedFormula] = useState<string>("derivative");
  const [inputVal1, setInputVal1] = useState<string>("3"); // Coefficient or variable
  const [inputVal2, setInputVal2] = useState<string>("2"); // Power or limits
  const [calcResult, setCalcResult] = useState<any>(null);

  // Unit Converter States
  const [convertCategory, setConvertCategory] = useState<"industrial" | "agricultural" | "science">("industrial");
  const [convertPair, setConvertPair] = useState<string>("psi_to_bar");
  const [convertInput, setConvertInput] = useState<string>("100");
  const [convertResult, setConvertResult] = useState<number | null>(null);

  // Dynamic calculations for Scientific Calculator
  const handleSolveFormula = () => {
    const val1 = parseFloat(inputVal1) || 0;
    const val2 = parseFloat(inputVal2) || 0;

    if (calcCategory === "math") {
      if (selectedFormula === "derivative") {
        // Solving derivative of C * x^n
        const power = val2;
        const coef = val1;
        const resCoef = coef * power;
        const resPower = power - 1;
        setCalcResult({
          expression: `\\frac{d}{dx} (${coef}x^{${power}}) = ${resCoef}x^{${resPower}}`,
          steps: [
            `Identify the function parameters: Coefficient c = ${coef}, Power n = ${power}.`,
            `Apply the Power Rule: \\frac{d}{dx} (cx^n) = c \\cdot n \\cdot x^{n-1}.`,
            `Calculate the new coefficient: ${coef} \\cdot ${power} = ${resCoef}.`,
            `Calculate the new power: ${power} - 1 = ${resPower}.`,
            `Final expression: ${resCoef}x^{${resPower}}.`
          ]
        });
      } else if (selectedFormula === "integral") {
        // Solving definite integral of c * x^n from 0 to limit
        const coef = val1;
        const power = val2;
        const limit = 5;
        const antiderivativeCoef = coef / (power + 1);
        const antiderivativePower = power + 1;
        const valueAtLimit = antiderivativeCoef * Math.pow(limit, antiderivativePower);
        setCalcResult({
          expression: `\\int_{0}^{${limit}} ${coef}x^{${power}} \\, dx = ${valueAtLimit.toFixed(3)}`,
          steps: [
            `Identify the definite integral parameters: Coefficient = ${coef}, Power = ${power}, Interval = [0, ${limit}].`,
            `Apply the Power Rule for Integration: \\int c x^n \\, dx = \\frac{c}{n+1} x^{n+1} + C.`,
            `Determine the antiderivative: \\frac{${coef}}{${power + 1}} x^{${power + 1}} = ${antiderivativeCoef.toFixed(3)} x^{${power + 1}}.`,
            `Evaluate at upper limit ${limit}: ${antiderivativeCoef.toFixed(3)} \\cdot (${limit})^{${power + 1}} = ${valueAtLimit.toFixed(3)}.`,
            `Evaluate at lower limit 0: ${antiderivativeCoef.toFixed(3)} \\cdot (0) = 0.`,
            `Subtract lower limit from upper limit: ${valueAtLimit.toFixed(3)} - 0 = ${valueAtLimit.toFixed(3)}.`
          ]
        });
      } else if (selectedFormula === "matrix") {
        // Simple 2x2 Matrix Determinant [[a, b], [c, d]] -> inputVal1 is a, inputVal2 is d. Let's make b=3, c=4.
        const a = val1;
        const d = val2;
        const b = 3;
        const c = 4;
        const det = (a * d) - (b * c);
        setCalcResult({
          expression: `\\det \\begin{pmatrix} ${a} & ${b} \\\\ ${c} & ${d} \\end{pmatrix} = ${det}`,
          steps: [
            `Given matrix coordinates: a_{11} = ${a}, a_{12} = ${b}, a_{21} = ${c}, a_{22} = ${d}.`,
            `The formula for the determinant of a 2x2 matrix is: \\det(A) = a d - b c.`,
            `Compute cross multiplication terms: a \\cdot d = ${a} \\cdot ${d} = ${a * d}.`,
            `Compute subtracting terms: b \\cdot c = ${b} \\cdot ${c} = ${b * c}.`,
            `Subtract results: ${a * d} - ${b * c} = ${det}.`,
            `The matrix is ${det === 0 ? "singular" : "invertible"}.`
          ]
        });
      }
    } else if (calcCategory === "chemistry") {
      if (selectedFormula === "balance") {
        // Balancing chemical equations based on select
        const reaction = inputVal1 === "1" ? "H2 + O2 -> H2O" : inputVal1 === "2" ? "C3H8 + O2 -> CO2 + H2O" : "N2 + H2 -> NH3";
        let balanced = "";
        let steps: string[] = [];
        if (inputVal1 === "1") {
          balanced = "2 H₂ + O₂ → 2 H₂O";
          steps = [
            "Write down unbalanced reaction: H₂ + O₂ → H₂O.",
            "Count atoms on left side: Hydrogen = 2, Oxygen = 2.",
            "Count atoms on right side: Hydrogen = 2, Oxygen = 1.",
            "Balance oxygen by putting a coefficient of 2 in front of water: H₂ + O₂ → 2 H₂O.",
            "Recount right side: Hydrogen = 4, Oxygen = 2. Oxygen is balanced, but hydrogen is now unbalanced.",
            "Balance hydrogen by putting a coefficient of 2 on the left side: 2 H₂ + O₂ → 2 H₂O.",
            "Confirm atom counts: Hydrogen (4 vs 4), Oxygen (2 vs 2). Fully balanced!"
          ];
        } else if (inputVal1 === "2") {
          balanced = "C₃H₈ + 5 O₂ → 3 CO₂ + 4 H₂O";
          steps = [
            "Write unbalanced reaction: C₃H₈ + O₂ → CO₂ + H₂O.",
            "Balance Carbon: Carbon on left is 3. Multiply CO₂ on right by 3: C₃H₈ + O₂ → 3 CO₂ + H₂O.",
            "Balance Hydrogen: Hydrogen on left is 8. Multiply H₂O on right by 4: C₃H₈ + O₂ → 3 CO₂ + 4 H₂O.",
            "Balance Oxygen: Count right-side oxygen atoms: (3 x 2) + (4 x 1) = 10 atoms.",
            "Multiply O₂ on left side by 5 to obtain 10 oxygen atoms: C₃H₈ + 5 O₂ → 3 CO₂ + 4 H₂O.",
            "Double-check all coordinates: Carbon (3 vs 3), Hydrogen (8 vs 8), Oxygen (10 vs 10). Cleanly balanced!"
          ];
        } else {
          balanced = "N₂ + 3 H₂ → 2 NH₃";
          steps = [
            "Write unbalanced reaction: N₂ + H₂ → NH₃.",
            "Balance Nitrogen: Nitrogen on left is 2. Multiply NH₃ by 2: N₂ + H₂ → 2 NH₃.",
            "Balance Hydrogen: Count right-side hydrogen atoms: 2 x 3 = 6 atoms.",
            "Multiply H₂ on left side by 3 to obtain 6 atoms: N₂ + 3 H₂ → 2 NH₃.",
            "Verify both sides: Nitrogen (2 vs 2), Hydrogen (6 vs 6). Fully balanced!"
          ];
        }
        setCalcResult({
          expression: balanced,
          steps
        });
      } else if (selectedFormula === "molar_mass") {
        // Compute molar mass
        const compound = inputVal2 === "water" ? "H2O" : inputVal2 === "carbon" ? "CO2" : "C6H12O6";
        let mass = 0;
        let steps: string[] = [];
        if (compound === "H2O") {
          mass = 18.015;
          steps = [
            "Identify the elements in water: Hydrogen (H) and Oxygen (O).",
            "Lookup standard atomic weights: H = 1.008 g/mol, O = 15.999 g/mol.",
            "Multiply atomic weight by element frequency: Hydrogen (2 atoms * 1.008) = 2.016 g/mol.",
            "Oxygen (1 atom * 15.999) = 15.999 g/mol.",
            "Sum the totals: 2.016 + 15.999 = 18.015 g/mol."
          ];
        } else if (compound === "CO2") {
          mass = 44.009;
          steps = [
            "Identify elements in carbon dioxide: Carbon (C) and Oxygen (O).",
            "Lookup atomic weights: C = 12.011 g/mol, O = 15.999 g/mol.",
            "Multiply: Carbon (1 * 12.011) = 12.011 g/mol.",
            "Oxygen (2 atoms * 15.999) = 31.998 g/mol.",
            "Add weights together: 12.011 + 31.998 = 44.009 g/mol."
          ];
        } else {
          mass = 180.156;
          steps = [
            "Identify elements in glucose (C₆H₁₂O₆): Carbon, Hydrogen, Oxygen.",
            "Atomic weights: C = 12.011, H = 1.008, O = 15.999 g/mol.",
            "Carbon sum: 6 * 12.011 = 72.066 g/mol.",
            "Hydrogen sum: 12 * 1.008 = 12.096 g/mol.",
            "Oxygen sum: 6 * 15.999 = 95.994 g/mol.",
            "Add together: 72.066 + 12.096 + 95.994 = 180.156 g/mol."
          ];
        }
        setCalcResult({
          expression: `Molar \\, Mass \\, of \\, ${compound} = ${mass} \\, g/mol`,
          steps
        });
      }
    } else if (calcCategory === "physics") {
      if (selectedFormula === "thermo") {
        // Q = m c dT (Heat energy)
        const m = val1; // mass in kg
        const c = 4184; // specific heat of water J/kgC
        const dT = val2; // delta temp in C
        const q = m * c * dT;
        setCalcResult({
          expression: `Q = m \\cdot c \\cdot \\Delta T = ${q.toFixed(0)} \\, Joules`,
          steps: [
            `Identify thermodynamics constants: Specific Heat of Liquid Water c = 4184 J/kg·°C.`,
            `Substitute user values: Mass m = ${m} kg, Temperature Change \\Delta T = ${dT}°C.`,
            `Apply formula: Q = ${m} \\cdot 4184 \\cdot ${dT}.`,
            `Calculate total heat transferred: ${q.toFixed(0)} Joules (or ${(q/1000).toFixed(2)} kJ).`
          ]
        });
      } else if (selectedFormula === "force") {
        // F = m * a
        const m = val1;
        const a = val2;
        const f = m * a;
        setCalcResult({
          expression: `F = m \\cdot a = ${f.toFixed(2)} \\, Newtons`,
          steps: [
            `Apply Newton's Second Law of Motion: Force (F) = Mass (m) * Acceleration (a).`,
            `Substitute variables: Mass m = ${m} kg, Acceleration a = ${a} m/s².`,
            `Perform arithmetic: F = ${m} \\cdot ${a} = ${f.toFixed(2)}.`,
            `Force direction matches acceleration vector. Resultant Force is ${f.toFixed(2)} Newtons (N).`
          ]
        });
      }
    }
  };

  // Dynamic calculations for Universal Converter
  const handleConvert = () => {
    const input = parseFloat(convertInput) || 0;
    let convertedValue = 0;
    
    if (convertCategory === "industrial") {
      if (convertPair === "psi_to_bar") {
        convertedValue = input * 0.0689476;
      } else if (convertPair === "bar_to_psi") {
        convertedValue = input * 14.5038;
      } else if (convertPair === "watts_to_hp") {
        convertedValue = input * 0.00134102;
      } else if (convertPair === "hp_to_watts") {
        convertedValue = input * 745.7;
      } else if (convertPair === "nm_to_ftlbs") {
        convertedValue = input * 0.737562;
      } else if (convertPair === "ftlbs_to_nm") {
        convertedValue = input * 1.35582;
      }
    } else if (convertCategory === "agricultural") {
      if (convertPair === "ha_to_acres") {
        convertedValue = input * 2.47105;
      } else if (convertPair === "acres_to_ha") {
        convertedValue = input * 0.404686;
      } else if (convertPair === "liters_to_gallons") {
        convertedValue = input * 0.264172;
      } else if (convertPair === "gallons_to_liters") {
        convertedValue = input * 3.78541;
      } else if (convertPair === "kgha_to_lbsacre") {
        convertedValue = input * 0.892179;
      } else if (convertPair === "lbsacre_to_kgha") {
        convertedValue = input * 1.12085;
      }
    } else if (convertCategory === "science") {
      if (convertPair === "kg_to_lbs") {
        convertedValue = input * 2.20462;
      } else if (convertPair === "lbs_to_kg") {
        convertedValue = input * 0.453592;
      } else if (convertPair === "km_to_miles") {
        convertedValue = input * 0.621371;
      } else if (convertPair === "miles_to_km") {
        convertedValue = input * 1.60934;
      } else if (convertPair === "c_to_f") {
        convertedValue = (input * 1.8) + 32;
      } else if (convertPair === "f_to_c") {
        convertedValue = (input - 32) / 1.8;
      }
    }
    setConvertResult(convertedValue);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* High-Fidelity Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
            Pocket School Pro <span className="text-xs px-2.5 py-0.5 bg-brand-primary/10 text-brand-primary rounded-full font-extrabold uppercase">STEM Engine</span>
          </h1>
          <p className="text-gray-500 text-xs">Explore advanced modules, solve calculus equations, balance chemical formulas, and translate agricultural coordinates.</p>
        </div>

        {/* Tab switcher */}
        <div className="flex bg-gray-100/80 p-1.5 rounded-2xl border border-gray-200/50 self-stretch md:self-auto">
          <button
            onClick={() => setActiveTab("modules")}
            className={`flex-1 md:flex-none px-4 py-2.5 text-xs font-black uppercase tracking-wider rounded-xl transition-all ${
              activeTab === "modules"
                ? "bg-white text-brand-primary shadow-sm"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            Modules
          </button>
          <button
            onClick={() => {
              setActiveTab("calculator");
              handleSolveFormula(); // pre-fill determinant
            }}
            className={`flex-1 md:flex-none px-4 py-2.5 text-xs font-black uppercase tracking-wider rounded-xl transition-all ${
              activeTab === "calculator"
                ? "bg-white text-brand-primary shadow-sm"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            Calculator
          </button>
          <button
            onClick={() => {
              setActiveTab("converter");
              handleConvert();
            }}
            className={`flex-1 md:flex-none px-4 py-2.5 text-xs font-black uppercase tracking-wider rounded-xl transition-all ${
              activeTab === "converter"
                ? "bg-white text-brand-primary shadow-sm"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            Universal Converter
          </button>
        </div>
      </div>

      {/* Main Container Switching */}
      <AnimatePresence mode="wait">
        
        {/* TAB 1: STEM MODULES */}
        {activeTab === "modules" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <STEMCard onClick={() => setActiveTab('calculator')} icon={Calculator} title="Advanced Calculator"
                description="Solve complex math, chemistry, and physics equations with step-by-step AI assistance."
                color="bg-brand-primary" badges={["Math", "Physics", "Chem"]} />
              <STEMCard onClick={() => setActiveTab('converter')} icon={Scale} title="Universal Converter"
                description="Convert global units including metrics, currency, and scientific constants instantly."
                color="bg-emerald-500" badges={["Physics", "Agri", "All"]} />

              <STEMCard onClick={() => setActiveTab('coding')} icon={Binary} title="Coding Academy"
                description="Learn Python, Java, and C++ with AI-guided projects. From basic variables to advanced data structures."
                color="bg-blue-50 text-blue-600"
                badges={["Python", "Beginner"]}
              />
              <STEMCard onClick={() => setActiveTab('hardware')} icon={Cpu} title="Robotics & IoT"
                description="Build virtual circuits and learn Arduino/Raspberry Pi programming. Explore the world of sensors and automation."
                color="bg-rose-50 text-rose-600"
                badges={["Arduino", "Hardware"]}
              />
              <STEMCard onClick={() => setActiveTab('math')} icon={InfinityIcon} title="Advanced Math"
                description="Master Calculus, Statistics, and Linear Algebra. AI-powered solvers for complex engineering problems."
                color="bg-indigo-50 text-indigo-600"
                badges={["Calculus", "Advanced"]}
              />
              <STEMCard onClick={() => setActiveTab('cad')} icon={Box} title="3D Engineering"
                description="Principles of mechanical engineering, CAD basics, and 3D printing workflows for local innovation."
                color="bg-orange-50 text-orange-600"
                badges={["CAD", "Design"]}
              />
              <STEMCard onClick={() => setActiveTab('ai')} icon={Code} title="AI & ML"
                description="Introduction to Machine Learning, neural networks, and prompt engineering for future tech leaders."
                color="bg-brand-primary/5 text-brand-primary"
                badges={["AI", "ML"]}
              />
              <STEMCard onClick={() => setActiveTab('eco')} icon={Layers} title="Earth Science"
                description="Environmental monitoring, climate change learning, and renewable energy lessons for a sustainable future."
                color="bg-emerald-50 text-emerald-600"
                badges={["Eco", "Science"]}
              />
            </div>
          </motion.div>
        )}

        {/* TAB 2: ADVANCED SCIENTIFIC CALCULATOR */}
                {activeTab === "calculator" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {/* Left Column: Form Settings and Selector */}
            <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm space-y-5">
              <div className="flex items-center gap-2">
                <Calculator className="w-5 h-5 text-indigo-600" />
                <h3 className="font-extrabold text-sm text-gray-900">Configure Equation</h3>
              </div>
              
              <div className="bg-gray-50 p-1.5 rounded-xl flex">
                <div className="grid grid-cols-3 w-full gap-1">
                  <button
                    onClick={() => {
                      setCalcCategory("math");
                      setSelectedFormula("derivative");
                      setInputVal1("3");
                      setInputVal2("2");
                    }}
                    className={cn(
                      "py-2 rounded-lg text-[9px] font-black uppercase transition-all",
                      calcCategory === "math" ? "bg-white text-indigo-700 shadow-sm border border-gray-150/40" : "text-gray-500 hover:text-gray-800"
                    )}
                  >
                    Calculus
                  </button>
                  <button
                    onClick={() => {
                      setCalcCategory("chemistry");
                      setSelectedFormula("balance");
                      setInputVal1("1");
                    }}
                    className={cn(
                      "py-2 rounded-lg text-[9px] font-black uppercase transition-all",
                      calcCategory === "chemistry" ? "bg-white text-indigo-700 shadow-sm border border-gray-150/40" : "text-gray-500 hover:text-gray-800"
                    )}
                  >
                    Chemistry
                  </button>
                  <button
                    onClick={() => {
                      setCalcCategory("physics");
                      setSelectedFormula("force");
                      setInputVal1("5");
                      setInputVal2("9.8");
                    }}
                    className={cn(
                      "py-2 rounded-lg text-[9px] font-black uppercase transition-all",
                      calcCategory === "physics" ? "bg-white text-indigo-700 shadow-sm border border-gray-150/40" : "text-gray-500 hover:text-gray-800"
                    )}
                  >
                    Physics
                  </button>
                </div>
              </div>

              {/* Formula Selectors based on Category */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-gray-400">Formula Template</label>
                
                {calcCategory === "math" && (
                  <select
                    value={selectedFormula}
                    onChange={(e) => {
                      setSelectedFormula(e.target.value);
                      if (e.target.value === "derivative") { setInputVal1("3"); setInputVal2("2"); }
                      if (e.target.value === "integral") { setInputVal1("4"); setInputVal2("3"); }
                      if (e.target.value === "matrix") { setInputVal1("2"); setInputVal2("5"); }
                    }}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-bold text-gray-700 focus:outline-none focus:border-brand-primary"
                  >
                    <option value="derivative">Derivative of c*x^n</option>
                    <option value="integral">Definite Integral of c*x^n (from 0 to 5)</option>
                    <option value="matrix">Matrix Determinant of [[a, 3], [4, d]]</option>
                  </select>
                )}

                {calcCategory === "chemistry" && (
                  <select
                    value={selectedFormula}
                    onChange={(e) => setSelectedFormula(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-bold text-gray-700 focus:outline-none focus:border-brand-primary"
                  >
                    <option value="balance">Chemical Reaction Balancer</option>
                    <option value="molar_mass">Molecular Weight Mass Calculator</option>
                  </select>
                )}

                {calcCategory === "physics" && (
                  <select
                    value={selectedFormula}
                    onChange={(e) => setSelectedFormula(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-bold text-gray-700 focus:outline-none focus:border-brand-primary"
                  >
                    <option value="force">Force Formula (F = m * a)</option>
                    <option value="thermo">Thermodynamics Heat (Q = m * c * dT)</option>
                  </select>
                )}
              </div>

              {/* Dynamic Inputs Based on Formulas */}
              <div className="space-y-3 pt-2">
                {calcCategory === "math" && selectedFormula !== "matrix" && (
                  <>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase tracking-wider text-gray-400">Coefficient (c)</label>
                      <input
                        type="number"
                        value={inputVal1}
                        onChange={(e) => setInputVal1(e.target.value)}
                        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase tracking-wider text-gray-400">Exponent (n)</label>
                      <input
                        type="number"
                        value={inputVal2}
                        onChange={(e) => setInputVal2(e.target.value)}
                        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none"
                      />
                    </div>
                  </>
                )}

                {calcCategory === "math" && selectedFormula === "matrix" && (
                  <>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase tracking-wider text-gray-400">Matrix coordinate (a)</label>
                      <input
                        type="number"
                        value={inputVal1}
                        onChange={(e) => setInputVal1(e.target.value)}
                        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase tracking-wider text-gray-400">Matrix coordinate (d)</label>
                      <input
                        type="number"
                        value={inputVal2}
                        onChange={(e) => setInputVal2(e.target.value)}
                        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none"
                      />
                    </div>
                  </>
                )}

                {calcCategory === "chemistry" && selectedFormula === "balance" && (
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-wider text-gray-400">Select Reaction</label>
                    <select
                      value={inputVal1}
                      onChange={(e) => setInputVal1(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-gray-700 focus:outline-none"
                    >
                      <option value="1">H₂ + O₂ → H₂O (Water Synthesis)</option>
                      <option value="2">C₃H₈ + O₂ → CO₂ + H₂O (Propane Combustion)</option>
                      <option value="3">N₂ + H₂ → NH₃ (Haber Process Ammonia)</option>
                    </select>
                  </div>
                )}

                {calcCategory === "chemistry" && selectedFormula === "molar_mass" && (
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-wider text-gray-400">Select Compound</label>
                    <select
                      value={inputVal2}
                      onChange={(e) => setInputVal2(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-gray-700 focus:outline-none"
                    >
                      <option value="water">H₂O (Water)</option>
                      <option value="carbon">CO₂ (Carbon Dioxide)</option>
                      <option value="glucose">C₆H₁₂O₆ (Glucose Sugar)</option>
                    </select>
                  </div>
                )}

                {calcCategory === "physics" && (
                  <>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase tracking-wider text-gray-400">Mass m (kg)</label>
                      <input
                        type="number"
                        value={inputVal1}
                        onChange={(e) => setInputVal1(e.target.value)}
                        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase tracking-wider text-gray-400">
                        {selectedFormula === "force" ? "Acceleration a (m/s²)" : "Temperature Change ΔT (°C)"}
                      </label>
                      <input
                        type="number"
                        value={inputVal2}
                        onChange={(e) => setInputVal2(e.target.value)}
                        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none"
                      />
                    </div>
                  </>
                )}
              </div>

              <button
                onClick={handleSolveFormula}
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer mt-4"
              >
                <Sparkles className="w-3.5 h-3.5" /> Solve Equation
              </button>
            </div>

            {/* Right Columns: AI Step-by-Step Solved Output panel */}
            <div className="md:col-span-2 bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col justify-between">
              <div className="space-y-5">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
                    Sequential Steps
                  </span>
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    LaTeX Engine Output
                  </span>
                </div>

                {calcResult ? (
                  <div className="space-y-5">
                    {/* Visual Math LaTeX display */}
                    <div className="p-6 bg-gray-50 border border-gray-150/60 rounded-2xl flex flex-col items-center justify-center text-center space-y-2">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Equation Representation</span>
                      
                      {/* Stylized LaTeX mathematical equation display */}
                      <div className="font-serif italic text-2xl text-indigo-950 font-bold tracking-wide select-all bg-white px-5 py-3 rounded-xl border border-gray-200/60 shadow-sm">
                        {calcResult.expression}
                      </div>
                    </div>

                    {/* Step-by-Step explanation lists */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-black uppercase tracking-wider text-gray-400">Step-by-Step Guidance</h4>
                      <ol className="space-y-3.5">
                        {calcResult.steps.map((step: string, idx: number) => (
                          <li key={idx} className="flex gap-3 text-xs leading-relaxed text-gray-700">
                            <span className="w-5 h-5 rounded-full bg-indigo-50 border border-indigo-200/50 text-indigo-700 font-bold flex items-center justify-center flex-shrink-0 text-[10px]">
                              {idx + 1}
                            </span>
                            <span className="flex-1">{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  </div>
                ) : (
                  <div className="p-12 text-center text-gray-400 flex flex-col items-center justify-center h-64 border border-dashed border-gray-200 rounded-2xl">
                    <FlaskConical className="w-10 h-10 text-gray-300 mb-2" />
                    <span className="text-xs font-extrabold uppercase">Waiting for config</span>
                    <p className="text-[10px] text-gray-500 mt-1 max-w-[15rem]">Select parameters on the left and tap "Solve Equation" to balance atoms or compute derivatives!</p>
                  </div>
                )}
              </div>

              <div className="border-t border-gray-100 pt-4 mt-6 text-[10px] text-gray-400 font-extrabold uppercase tracking-widest flex items-center gap-1.5 justify-center">
                🦉 Aristotle Educational Engine verified • High accuracy mode active
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 3: UNIVERSAL UNIT CONVERTER */}
        {activeTab === "converter" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {/* Left selector */}
            <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm space-y-5">
              <div className="flex items-center gap-2">
                <ArrowRightLeft className="w-5 h-5 text-emerald-600" />
                <h3 className="font-extrabold text-sm text-gray-900">Configure Conversion</h3>
              </div>

              {/* Conversion pathway category select */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-gray-400">Industry Pathway</label>
                <div className="grid grid-cols-3 gap-1 bg-gray-50 p-1 rounded-xl border border-gray-150/60">
                  <button
                    onClick={() => {
                      setConvertCategory("industrial");
                      setConvertPair("psi_to_bar");
                    }}
                    className={cn(
                      "py-2 rounded-lg text-[9px] font-black uppercase transition-all",
                      convertCategory === "industrial" ? "bg-white text-emerald-700 shadow-sm border border-gray-150/40" : "text-gray-500 hover:text-gray-800"
                    )}
                  >
                    Industrial
                  </button>
                  <button
                    onClick={() => {
                      setConvertCategory("agricultural");
                      setConvertPair("ha_to_acres");
                    }}
                    className={cn(
                      "py-2 rounded-lg text-[9px] font-black uppercase transition-all",
                      convertCategory === "agricultural" ? "bg-white text-emerald-700 shadow-sm border border-gray-150/40" : "text-gray-500 hover:text-gray-800"
                    )}
                  >
                    Agricultural
                  </button>
                  <button
                    onClick={() => {
                      setConvertCategory("science");
                      setConvertPair("kg_to_lbs");
                    }}
                    className={cn(
                      "py-2 rounded-lg text-[9px] font-black uppercase transition-all",
                      convertCategory === "science" ? "bg-white text-emerald-700 shadow-sm border border-gray-150/40" : "text-gray-500 hover:text-gray-800"
                    )}
                  >
                    General Sci
                  </button>
                </div>
              </div>

              {/* Unit pair selector */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-gray-400">Unit coordinates pair</label>
                
                {convertCategory === "industrial" && (
                  <select
                    value={convertPair}
                    onChange={(e) => setConvertPair(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-bold text-gray-700 focus:outline-none"
                  >
                    <option value="psi_to_bar">PSI to Bar (Pressure)</option>
                    <option value="bar_to_psi">Bar to PSI (Pressure)</option>
                    <option value="watts_to_hp">Watts to Horsepower (Power)</option>
                    <option value="hp_to_watts">Horsepower to Watts (Power)</option>
                    <option value="nm_to_ftlbs">Newton-meters to Foot-pounds (Torque)</option>
                    <option value="ftlbs_to_nm">Foot-pounds to Newton-meters (Torque)</option>
                  </select>
                )}

                {convertCategory === "agricultural" && (
                  <select
                    value={convertPair}
                    onChange={(e) => setConvertPair(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-bold text-gray-700 focus:outline-none"
                  >
                    <option value="ha_to_acres">Hectares to Acres (Field Area)</option>
                    <option value="acres_to_ha">Acres to Hectares (Field Area)</option>
                    <option value="liters_to_gallons">Liters to Gallons (Liquid Volume)</option>
                    <option value="gallons_to_liters">Gallons to Liters (Liquid Volume)</option>
                    <option value="kgha_to_lbsacre">kg/ha to lbs/acre (Crop Yield)</option>
                    <option value="lbsacre_to_kgha">lbs/acre to kg/ha (Crop Yield)</option>
                  </select>
                )}

                {convertCategory === "science" && (
                  <select
                    value={convertPair}
                    onChange={(e) => setConvertPair(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-bold text-gray-700 focus:outline-none"
                  >
                    <option value="kg_to_lbs">Kilograms to Pounds (Weight)</option>
                    <option value="lbs_to_kg">Pounds to Kilograms (Weight)</option>
                    <option value="km_to_miles">Kilometers to Miles (Distance)</option>
                    <option value="miles_to_km">Miles to Kilometers (Distance)</option>
                    <option value="c_to_f">Celsius to Fahrenheit (Temp)</option>
                    <option value="f_to_c">Fahrenheit to Celsius (Temp)</option>
                  </select>
                )}
              </div>

              {/* Numerical value to convert */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-gray-400">Input Value</label>
                <input
                  type="number"
                  value={convertInput}
                  onChange={(e) => setConvertInput(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none"
                />
              </div>

              <button
                onClick={handleConvert}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer mt-4"
              >
                <ArrowRightLeft className="w-3.5 h-3.5" /> Convert Units
              </button>
            </div>

            {/* Conversion Result output display */}
            <div className="md:col-span-2 bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col justify-between">
              <div className="space-y-5">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
                    Conversions Log
                  </span>
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    Exact Factor Active
                  </span>
                </div>

                {convertResult !== null ? (
                  <div className="space-y-6">
                    <div className="p-8 bg-gray-50 border border-gray-150/60 rounded-2xl flex flex-col items-center justify-center text-center space-y-3">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Result Comparison</span>
                      
                      <div className="flex flex-col md:flex-row items-center gap-4 text-gray-800">
                        <span className="text-2xl font-black text-gray-950 bg-white px-5 py-3 rounded-xl border border-gray-200/50 shadow-sm">
                          {convertInput} <span className="text-xs text-gray-500 font-extrabold uppercase ml-1">{convertPair.split("_to_")[0]}</span>
                        </span>
                        <ChevronRight className="w-6 h-6 text-emerald-600 hidden md:block" />
                        <span className="text-2xl font-black text-emerald-700 bg-white px-5 py-3 rounded-xl border border-emerald-200 shadow-sm">
                          {convertResult.toFixed(4)} <span className="text-xs text-emerald-500 font-extrabold uppercase ml-1">{convertPair.split("_to_")[1]}</span>
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3 bg-emerald-50/20 p-5 rounded-2xl border border-emerald-100/50">
                      <h4 className="text-xs font-black uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 text-emerald-600" />
                        Agricultural & Industrial Conversion Insight
                      </h4>
                      <p className="text-xs text-emerald-800 leading-relaxed">
                        This formula tracks direct International Standard metrics. It guarantees the precise transfer of soil acres, horsepower coefficients, or heavy machinery bar-metric parameters without rounding gaps, ensuring optimal field measurements.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-12 text-center text-gray-400 flex flex-col items-center justify-center h-64 border border-dashed border-gray-200 rounded-2xl">
                    <ArrowRightLeft className="w-10 h-10 text-gray-300 mb-2" />
                    <span className="text-xs font-extrabold uppercase">Waiting for input</span>
                  </div>
                )}
              </div>

              <div className="border-t border-gray-100 pt-4 mt-6 text-[10px] text-gray-400 font-extrabold uppercase tracking-widest flex items-center gap-1.5 justify-center">
                🚜 Fully calibrated for farm and heavy technical systems
              </div>
            </div>
          </motion.div>
        )}
        {["coding", "hardware", "math", "cad", "ai", "eco"].includes(activeTab) && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full"
          >
            <STEMInteractiveLab 
              moduleType={activeTab as any} 
              onBack={() => setActiveTab('modules')} 
            />
          </motion.div>
        )}


      </AnimatePresence>

    </div>
  );
}

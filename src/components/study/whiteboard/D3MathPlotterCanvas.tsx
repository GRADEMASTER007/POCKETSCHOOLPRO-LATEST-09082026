import React, { useEffect, useRef, useState } from "react";
import { 
  renderD3MathPlot, 
  FunctionPlotConfig, 
  evaluateMathExpression, 
  computeNumericalDerivative 
} from "@/src/lib/d3MathPlotter";
import { Calculator, Sparkles, TrendingUp, RefreshCw, ZoomIn, ZoomOut, Move } from "lucide-react";

interface D3MathPlotterCanvasProps {
  initialExpression?: string;
  title?: string;
  height?: number;
  showControls?: boolean;
}

export const PRESET_MATH_FUNCTIONS = [
  { id: "parabola", label: "Parabola: f(x) = x² - 4x + 3", expr: "x^2 - 4*x + 3", xMin: -2, xMax: 6, yMin: -2, yMax: 8 },
  { id: "sine", label: "Trig: f(x) = sin(2x)", expr: "sin(2*x)", xMin: -3.14, xMax: 3.14, yMin: -2, yMax: 2 },
  { id: "cubic", label: "Cubic: f(x) = x³ - 3x", expr: "x^3 - 3*x", xMin: -3, xMax: 3, yMin: -5, yMax: 5 },
  { id: "exponential", label: "Exp: f(x) = e^(0.5x)", expr: "exp(0.5*x)", xMin: -4, xMax: 4, yMin: -1, yMax: 8 },
  { id: "hyperbola", label: "Rational: f(x) = 1/x", expr: "1/x", xMin: -5, xMax: 5, yMin: -5, yMax: 5 }
];

export default function D3MathPlotterCanvas({
  initialExpression = "x^2 - 4*x + 3",
  title = "D3.js Coordinate Plotter",
  height = 360,
  showControls = true,
}: D3MathPlotterCanvasProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  
  // Plotting State
  const [expression, setExpression] = useState(initialExpression);
  const [xMin, setXMin] = useState(-5);
  const [xMax, setXMax] = useState(5);
  const [yMin, setYMin] = useState(-5);
  const [yMax, setYMax] = useState(8);

  // Calculus Tangent & Integral Overlay State
  const [showTangent, setShowTangent] = useState(true);
  const [tangentX0, setTangentX0] = useState(2);
  const [showIntegral, setShowIntegral] = useState(false);
  const [integralA, setIntegralA] = useState(0);
  const [integralB, setIntegralB] = useState(3);

  // Hover Coordinates Readout
  const [hoverData, setHoverData] = useState<{ x: number; y: number; deriv?: number } | null>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    // Evaluate Roots / Intercepts for polynomial if possible
    const points = [];
    // Y-intercept at x = 0
    const yIntercept = evaluateMathExpression(expression, 0);
    if (!isNaN(yIntercept) && isFinite(yIntercept)) {
      points.push({ x: 0, y: yIntercept, label: "Y-Intercept", color: "#059669" });
    }

    // Tangent spec
    const tangents = showTangent ? [{ x0: tangentX0, label: `Tangent at x=${tangentX0}`, color: "#f59e0b" }] : [];

    // Integral spec
    const integrals = showIntegral ? [{ a: integralA, b: integralB, label: `∫ f(x)dx [${integralA}, ${integralB}]`, color: "rgba(99, 102, 241, 0.25)" }] : [];

    const config: FunctionPlotConfig = {
      title,
      width: 540,
      height,
      xMin,
      xMax,
      yMin,
      yMax,
      xLabel: "x",
      yLabel: "y = f(x)",
      grid: true,
      functions: [
        {
          id: "fn1",
          label: `f(x) = ${expression}`,
          expression,
          color: "#2563eb",
          strokeWidth: 3,
        }
      ],
      tangents,
      integrals,
      pointsOfInterest: points,
      interactiveHover: true,
    };

    const cleanup = renderD3MathPlot(svgRef.current, config, (coords) => {
      setHoverData(coords);
    });

    return cleanup;
  }, [expression, xMin, xMax, yMin, yMax, showTangent, tangentX0, showIntegral, integralA, integralB, title, height]);

  const handlePresetSelect = (preset: typeof PRESET_MATH_FUNCTIONS[0]) => {
    setExpression(preset.expr);
    setXMin(preset.xMin);
    setXMax(preset.xMax);
    setYMin(preset.yMin);
    setYMax(preset.yMax);
  };

  const currentDerivAtX0 = computeNumericalDerivative((x) => evaluateMathExpression(expression, x), tangentX0);

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-4 lg:p-5 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-extrabold text-slate-900 text-sm">{title}</h4>
            <p className="text-[11px] text-slate-500 font-medium">SVG Coordinate System & D3 Calculus Visualizer</p>
          </div>
        </div>

        {/* Real-time Hover Coordinates Readout Badge */}
        {hoverData ? (
          <div className="bg-slate-900 text-white font-mono text-[10px] px-3 py-1.5 rounded-xl flex items-center gap-2 shadow-xs">
            <span className="text-blue-400">x: {hoverData.x.toFixed(2)}</span>
            <span className="text-emerald-400">y: {hoverData.y.toFixed(2)}</span>
            {hoverData.deriv !== undefined && (
              <span className="text-amber-400">f'(x): {hoverData.deriv.toFixed(2)}</span>
            )}
          </div>
        ) : (
          <div className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
            <Move className="w-3 h-3 text-slate-400" /> Hover plot to inspect coordinates & derivative slope
          </div>
        )}
      </div>

      {/* Preset Pickers */}
      {showControls && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {PRESET_MATH_FUNCTIONS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => handlePresetSelect(preset)}
              className="px-2.5 py-1.5 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 rounded-xl text-[11px] font-bold transition-all shrink-0 border border-slate-200/60"
            >
              {preset.label}
            </button>
          ))}
        </div>
      )}

      {/* Expression Input & Controls */}
      {showControls && (
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 bg-slate-50/80 p-3 rounded-2xl border border-slate-200/80">
          {/* Function Expression Field */}
          <div className="sm:col-span-6 space-y-1">
            <label className="text-[10px] font-bold uppercase text-slate-500 tracking-wider flex items-center gap-1">
              <Calculator className="w-3 h-3 text-blue-600" /> Function Expression f(x)
            </label>
            <input
              type="text"
              value={expression}
              onChange={(e) => setExpression(e.target.value)}
              placeholder="e.g. x^2 - 4*x + 3"
              className="w-full bg-white border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Tangent Slider */}
          <div className="sm:col-span-6 space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold uppercase text-amber-600 tracking-wider flex items-center gap-1">
                <input
                  type="checkbox"
                  checked={showTangent}
                  onChange={(e) => setShowTangent(e.target.checked)}
                  className="rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                />
                Tangent Line at x = {tangentX0}
              </label>
              <span className="text-[10px] font-mono text-amber-700 font-bold">f'({tangentX0}) = {currentDerivAtX0.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min={xMin}
              max={xMax}
              step={0.1}
              value={tangentX0}
              disabled={!showTangent}
              onChange={(e) => setTangentX0(parseFloat(e.target.value))}
              className="w-full accent-amber-500"
            />
          </div>
        </div>
      )}

      {/* SVG Canvas Container */}
      <div className="border border-slate-200 rounded-2xl bg-white overflow-hidden flex justify-center items-center shadow-inner relative p-1">
        <svg ref={svgRef} className="w-full h-auto" />
      </div>

      {/* Integral Toggle Controls */}
      {showControls && (
        <div className="flex items-center justify-between pt-1 text-xs">
          <label className="flex items-center gap-2 font-bold text-indigo-700">
            <input
              type="checkbox"
              checked={showIntegral}
              onChange={(e) => setShowIntegral(e.target.checked)}
              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            Shade Definite Integral Region ∫ f(x) dx
          </label>

          {showIntegral && (
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-slate-500">From a:</span>
              <input
                type="number"
                value={integralA}
                onChange={(e) => setIntegralA(parseFloat(e.target.value) || 0)}
                className="w-12 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-lg text-xs font-mono font-bold"
              />
              <span className="text-[10px] font-bold text-slate-500">To b:</span>
              <input
                type="number"
                value={integralB}
                onChange={(e) => setIntegralB(parseFloat(e.target.value) || 0)}
                className="w-12 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-lg text-xs font-mono font-bold"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

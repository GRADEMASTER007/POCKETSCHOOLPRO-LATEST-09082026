import React, { useRef, useEffect, useState } from "react";
import * as d3 from "d3";
import { Sliders, RefreshCw, ZoomIn, Info, Sparkles, Activity } from "lucide-react";

import D3MathPlotterCanvas from "./D3MathPlotterCanvas";

export type GraphType = 
  | "2d_parabola" 
  | "3d_solid" 
  | "trig_wave" 
  | "circuit_diagram" 
  | "chemical_structure" 
  | "balance_sheet"
  | "math_function_plot";

interface D3InteractiveGraphProps {
  type: GraphType;
  label?: string;
  initialParams?: Record<string, number>;
  functionExpr?: string;
}

export default function D3InteractiveGraph({ type, label, initialParams, functionExpr }: D3InteractiveGraphProps) {
  if (type === "math_function_plot") {
    return (
      <D3MathPlotterCanvas
        initialExpression={functionExpr || "x^2 - 4*x + 3"}
        title={label || "D3 SVG Math Plotter"}
      />
    );
  }

  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Parameter Controls State
  const [paramA, setParamA] = useState<number>(initialParams?.a ?? 1); // e.g. parabola coefficient or trig amplitude
  const [paramB, setParamB] = useState<number>(initialParams?.b ?? 4); // e.g. upper limit y=4 or trig frequency
  const [paramC, setParamC] = useState<number>(initialParams?.c ?? 12); // e.g. disk count or resistor R1
  const [hoverCoords, setHoverCoords] = useState<{ x: number; y: number; valX: number; valY: number } | null>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous rendering

    const width = 360;
    const height = 240;
    const margin = { top: 25, right: 25, bottom: 35, left: 35 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    if (type === "2d_parabola") {
      // 2D Parabola y = a*x^2 bounded by y = b
      const xScale = d3.scaleLinear().domain([-3, 3]).range([0, innerWidth]);
      const yScale = d3.scaleLinear().domain([-0.5, Math.max(paramB + 1, 6)]).range([innerHeight, 0]);

      // Grid lines
      g.append("g")
        .attr("class", "grid")
        .attr("stroke", "#f1f5f9")
        .attr("stroke-opacity", 0.8)
        .call(d3.axisBottom(xScale).ticks(6).tickSize(innerHeight).tickFormat(() => ""));

      g.append("g")
        .attr("class", "grid")
        .attr("stroke", "#f1f5f9")
        .attr("stroke-opacity", 0.8)
        .call(d3.axisLeft(yScale).ticks(6).tickSize(-innerWidth).tickFormat(() => ""));

      // Axes
      const xAxis = d3.axisBottom(xScale).ticks(5);
      const yAxis = d3.axisLeft(yScale).ticks(5);

      g.append("g")
        .attr("transform", `translate(0,${yScale(0)})`)
        .call(xAxis)
        .attr("color", "#64748b")
        .attr("font-size", "9px");

      g.append("g")
        .attr("transform", `translate(${xScale(0)},0)`)
        .call(yAxis)
        .attr("color", "#64748b")
        .attr("font-size", "9px");

      // Boundary Line y = paramB
      g.append("line")
        .attr("x1", 0)
        .attr("y1", yScale(paramB))
        .attr("x2", innerWidth)
        .attr("y2", yScale(paramB))
        .attr("stroke", "#f59e0b")
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", "4,4");

      g.append("text")
        .attr("x", innerWidth - 5)
        .attr("y", yScale(paramB) - 5)
        .attr("text-anchor", "end")
        .attr("fill", "#b45309")
        .attr("font-size", "10px")
        .attr("font-weight", "bold")
        .text(`y = ${paramB}`);

      // Area Shading bounded by y = paramB and y = paramA * x^2 (for x >= 0)
      const maxXVal = Math.sqrt(Math.max(0, paramB / paramA));
      const areaData: [number, number][] = d3.range(0, maxXVal + 0.05, 0.05).map(x => [x, paramA * x * x]);

      const areaGenerator = d3.area<[number, number]>()
        .x(d => xScale(d[0]))
        .y0(yScale(paramB))
        .y1(d => yScale(d[1]))
        .curve(d3.curveBasis);

      g.append("path")
        .datum(areaData)
        .attr("fill", "rgba(99, 102, 241, 0.25)")
        .attr("stroke", "none")
        .attr("d", areaGenerator);

      // Curve y = a * x^2
      const lineData: [number, number][] = d3.range(-2.5, 2.55, 0.05).map(x => [x, paramA * x * x]);
      const lineGenerator = d3.line<[number, number]>()
        .x(d => xScale(d[0]))
        .y(d => yScale(d[1]))
        .curve(d3.curveBasis);

      g.append("path")
        .datum(lineData)
        .attr("fill", "none")
        .attr("stroke", "#2563eb")
        .attr("stroke-width", 3)
        .attr("d", lineGenerator);

      // Curve label
      g.append("text")
        .attr("x", xScale(1.5))
        .attr("y", yScale(paramA * 1.5 * 1.5) - 10)
        .attr("fill", "#1d4ed8")
        .attr("font-size", "11px")
        .attr("font-weight", "bold")
        .text(`y = ${paramA === 1 ? "" : paramA}x²`);

      // Interactive hover overlay
      const overlay = g.append("rect")
        .attr("width", innerWidth)
        .attr("height", innerHeight)
        .attr("fill", "none")
        .attr("pointer-events", "all");

      overlay.on("mousemove", (event) => {
        const [mouseX, mouseY] = d3.pointer(event);
        const valX = xScale.invert(mouseX);
        const valY = yScale.invert(mouseY);
        setHoverCoords({ x: mouseX, y: mouseY, valX, valY });
      }).on("mouseleave", () => setHoverCoords(null));

    } else if (type === "3d_solid") {
      // 3D Solid of Revolution around Y-Axis
      const diskCount = Math.max(3, Math.min(25, Math.round(paramC)));
      const topY = 20;
      const bottomY = innerHeight - 20;
      const centerX = innerWidth / 2;

      // Outer Bowl Outline
      const bowlPathData: [number, number][] = [];
      for (let i = 0; i <= 30; i++) {
        const t = i / 30;
        const yVal = bottomY - t * (bottomY - topY);
        const radius = Math.sqrt(t) * (innerWidth * 0.38);
        bowlPathData.push([centerX + radius, yVal]);
      }
      for (let i = 30; i >= 0; i--) {
        const t = i / 30;
        const yVal = bottomY - t * (bottomY - topY);
        const radius = Math.sqrt(t) * (innerWidth * 0.38);
        bowlPathData.push([centerX - radius, yVal]);
      }

      // Fill Bowl
      const lineGen = d3.line<[number, number]>().curve(d3.curveBasis);
      g.append("path")
        .attr("d", lineGen(bowlPathData) || "")
        .attr("fill", "url(#d3-bowl-gradient)")
        .attr("stroke", "#3b82f6")
        .attr("stroke-width", 2);

      // Top Opening Ellipse
      g.append("ellipse")
        .attr("cx", centerX)
        .attr("cy", topY)
        .attr("rx", innerWidth * 0.38)
        .attr("ry", 18)
        .attr("fill", "rgba(191, 219, 254, 0.7)")
        .attr("stroke", "#2563eb")
        .attr("stroke-width", 2);

      // Disk Slices (Washers)
      for (let k = 1; k < diskCount; k++) {
        const t = k / diskCount;
        const diskY = bottomY - t * (bottomY - topY);
        const diskRx = Math.sqrt(t) * (innerWidth * 0.38);
        const diskRy = diskRx * 0.3;

        g.append("ellipse")
          .attr("cx", centerX)
          .attr("cy", diskY)
          .attr("rx", diskRx)
          .attr("ry", diskRy)
          .attr("fill", "rgba(99, 102, 241, 0.15)")
          .attr("stroke", "#6366f1")
          .attr("stroke-width", 1)
          .attr("stroke-dasharray", "3,3");
      }

      // Y-Axis line through center
      g.append("line")
        .attr("x1", centerX)
        .attr("y1", topY - 15)
        .attr("x2", centerX)
        .attr("y2", bottomY + 15)
        .attr("stroke", "#f59e0b")
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", "4,4");

      g.append("text")
        .attr("x", centerX + 8)
        .attr("y", topY - 10)
        .attr("fill", "#b45309")
        .attr("font-size", "10px")
        .attr("font-weight", "bold")
        .text("y-axis rotation");

      // Gradient defs
      const defs = svg.append("defs");
      const grad = defs.append("linearGradient")
        .attr("id", "d3-bowl-gradient")
        .attr("x1", "0%").attr("y1", "0%")
        .attr("x2", "100%").attr("y2", "100%");
      grad.append("stop").attr("offset", "0%").attr("stop-color", "#93c5fd").attr("stop-opacity", 0.85);
      grad.append("stop").attr("offset", "100%").attr("stop-color", "#1d4ed8").attr("stop-opacity", 0.95);

    } else if (type === "trig_wave") {
      // Sine / Cosine Wave y = A * sin(f * x)
      const amplitude = paramA;
      const freq = paramB;

      const xScale = d3.scaleLinear().domain([0, 2 * Math.PI]).range([0, innerWidth]);
      const yScale = d3.scaleLinear().domain([-3, 3]).range([innerHeight, 0]);

      // Axes
      g.append("line")
        .attr("x1", 0)
        .attr("y1", yScale(0))
        .attr("x2", innerWidth)
        .attr("y2", yScale(0))
        .attr("stroke", "#94a3b8")
        .attr("stroke-width", 1.5);

      g.append("line")
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", 0)
        .attr("y2", innerHeight)
        .attr("stroke", "#94a3b8")
        .attr("stroke-width", 1.5);

      const waveData: [number, number][] = d3.range(0, 2 * Math.PI + 0.05, 0.05).map(x => [x, amplitude * Math.sin(freq * x)]);

      const lineGen = d3.line<[number, number]>()
        .x(d => xScale(d[0]))
        .y(d => yScale(d[1]))
        .curve(d3.curveBasis);

      g.append("path")
        .datum(waveData)
        .attr("fill", "none")
        .attr("stroke", "#2563eb")
        .attr("stroke-width", 3)
        .attr("d", lineGen);

      // Peak dots
      const peakX = Math.PI / (2 * freq);
      if (peakX <= 2 * Math.PI) {
        g.append("circle")
          .attr("cx", xScale(peakX))
          .attr("cy", yScale(amplitude))
          .attr("r", 5)
          .attr("fill", "#f59e0b")
          .attr("stroke", "#ffffff")
          .attr("stroke-width", 2);

        g.append("text")
          .attr("x", xScale(peakX) + 8)
          .attr("y", yScale(amplitude) - 4)
          .attr("fill", "#b45309")
          .attr("font-size", "10px")
          .attr("font-weight", "bold")
          .text(`Peak (${amplitude}V)`);
      }

      g.append("text")
        .attr("x", 10)
        .attr("y", 15)
        .attr("fill", "#1e293b")
        .attr("font-size", "11px")
        .attr("font-weight", "bold")
        .text(`y = ${amplitude} · sin(${freq}x)`);

    } else if (type === "circuit_diagram") {
      // Electrical Circuit Diagram (Resistors, Battery, Animated Currents)
      const voltage = paramA * 12; // e.g. 12V
      const R1 = paramC; // Resistance e.g. 12 Ohms
      const current = (voltage / R1).toFixed(2);

      // Wire Rect Loop
      const padX = 40;
      const padY = 30;
      const loopW = innerWidth - padX * 2;
      const loopH = innerHeight - padY * 2;

      g.append("rect")
        .attr("x", padX)
        .attr("y", padY)
        .attr("width", loopW)
        .attr("height", loopH)
        .attr("fill", "none")
        .attr("stroke", "#334155")
        .attr("stroke-width", 3)
        .attr("rx", 10);

      // Battery on Left Wire
      const batY = padY + loopH / 2;
      g.append("rect")
        .attr("x", padX - 12)
        .attr("y", batY - 20)
        .attr("width", 24)
        .attr("height", 40)
        .attr("fill", "#ffffff")
        .attr("stroke", "#none");

      g.append("line")
        .attr("x1", padX - 12)
        .attr("y1", batY - 12)
        .attr("x2", padX + 12)
        .attr("y2", batY - 12)
        .attr("stroke", "#dc2626")
        .attr("stroke-width", 4);

      g.append("line")
        .attr("x1", padX - 6)
        .attr("y1", batY + 12)
        .attr("x2", padX + 6)
        .attr("y2", batY + 12)
        .attr("stroke", "#2563eb")
        .attr("stroke-width", 2);

      g.append("text")
        .attr("x", padX - 25)
        .attr("y", batY + 4)
        .attr("fill", "#dc2626")
        .attr("font-size", "10px")
        .attr("font-weight", "bold")
        .text(`${voltage}V`);

      // Resistor ZigZag on Top Wire
      const resX = padX + loopW / 2;
      g.append("rect")
        .attr("x", resX - 25)
        .attr("y", padY - 10)
        .attr("width", 50)
        .attr("height", 20)
        .attr("fill", "#ffffff")
        .attr("stroke", "#none");

      const zigzag = `M ${resX - 25} ${padY} L ${resX - 18} ${padY - 8} L ${resX - 10} ${padY + 8} L ${resX - 2} ${padY - 8} L ${resX + 6} ${padY + 8} L ${resX + 14} ${padY - 8} L ${resX + 25} ${padY}`;
      g.append("path")
        .attr("d", zigzag)
        .attr("fill", "none")
        .attr("stroke", "#d97706")
        .attr("stroke-width", 2.5);

      g.append("text")
        .attr("x", resX)
        .attr("y", padY - 15)
        .attr("text-anchor", "middle")
        .attr("fill", "#b45309")
        .attr("font-size", "10px")
        .attr("font-weight", "bold")
        .text(`R = ${R1}Ω`);

      // Current Flow Badge
      g.append("rect")
        .attr("x", padX + loopW / 2 - 50)
        .attr("y", padY + loopH / 2 - 15)
        .attr("width", 100)
        .attr("height", 30)
        .attr("fill", "#f8fafc")
        .attr("stroke", "#cbd5e1")
        .attr("rx", 8);

      g.append("text")
        .attr("x", padX + loopW / 2)
        .attr("y", padY + loopH / 2 + 4)
        .attr("text-anchor", "middle")
        .attr("fill", "#1e293b")
        .attr("font-size", "11px")
        .attr("font-weight", "bold")
        .text(`I = ${current} A`);

    } else if (type === "chemical_structure") {
      // Organic Chemistry Benzene Ring + Functional Group
      const centerX = innerWidth / 2;
      const centerY = innerHeight / 2;
      const radius = 45;

      const ringNodes: [number, number][] = [];
      for (let i = 0; i < 6; i++) {
        const angle = (i * 60 - 30) * (Math.PI / 180);
        ringNodes.push([centerX + radius * Math.cos(angle), centerY + radius * Math.sin(angle)]);
      }

      // Outer Ring
      for (let i = 0; i < 6; i++) {
        const p1 = ringNodes[i];
        const p2 = ringNodes[(i + 1) % 6];
        g.append("line")
          .attr("x1", p1[0]).attr("y1", p1[1])
          .attr("x2", p2[0]).attr("y2", p2[1])
          .attr("stroke", "#1e293b")
          .attr("stroke-width", 2.5);

        // Double bond inner lines
        if (i % 2 === 0) {
          const innerR = radius * 0.82;
          const a1 = (i * 60 - 30) * (Math.PI / 180);
          const a2 = (((i + 1) % 6) * 60 - 30) * (Math.PI / 180);
          g.append("line")
            .attr("x1", centerX + innerR * Math.cos(a1))
            .attr("y1", centerY + innerR * Math.sin(a1))
            .attr("x2", centerX + innerR * Math.cos(a2))
            .attr("y2", centerY + innerR * Math.sin(a2))
            .attr("stroke", "#2563eb")
            .attr("stroke-width", 2);
        }
      }

      // Carbon nodes
      ringNodes.forEach(([nx, ny]) => {
        g.append("circle")
          .attr("cx", nx)
          .attr("cy", ny)
          .attr("r", 4)
          .attr("fill", "#334155");
      });

      // OH Functional Group branch
      const topNode = ringNodes[0];
      g.append("line")
        .attr("x1", topNode[0]).attr("y1", topNode[1])
        .attr("x2", topNode[0] + 25).attr("y2", topNode[1] - 25)
        .attr("stroke", "#dc2626")
        .attr("stroke-width", 2.5);

      g.append("text")
        .attr("x", topNode[0] + 28)
        .attr("y", topNode[1] - 25)
        .attr("fill", "#dc2626")
        .attr("font-size", "12px")
        .attr("font-weight", "bold")
        .text("OH");

      g.append("text")
        .attr("x", centerX)
        .attr("y", innerHeight - 5)
        .attr("text-anchor", "middle")
        .attr("fill", "#475569")
        .attr("font-size", "10px")
        .attr("font-weight", "bold")
        .text("Phenol (C₆H₅OH) Structure");

    } else if (type === "balance_sheet") {
      // Accounting Bar Chart (Assets vs Liabilities & Equity)
      const data = [
        { name: "Assets", val: paramA * 50, color: "#2563eb" },
        { name: "Liabilities", val: paramA * 20, color: "#dc2626" },
        { name: "Equity", val: paramA * 30, color: "#059669" },
      ];

      const xScale = d3.scaleBand().domain(data.map(d => d.name)).range([0, innerWidth]).padding(0.3);
      const yScale = d3.scaleLinear().domain([0, 200]).range([innerHeight, 0]);

      g.append("g")
        .attr("transform", `translate(0,${innerHeight})`)
        .call(d3.axisBottom(xScale))
        .attr("color", "#475569")
        .attr("font-size", "10px");

      g.append("g")
        .call(d3.axisLeft(yScale).ticks(5))
        .attr("color", "#475569")
        .attr("font-size", "9px");

      g.selectAll(".bar")
        .data(data)
        .enter()
        .append("rect")
        .attr("x", d => xScale(d.name) || 0)
        .attr("y", d => yScale(d.val))
        .attr("width", xScale.bandwidth())
        .attr("height", d => innerHeight - yScale(d.val))
        .attr("fill", d => d.color)
        .attr("rx", 6);

      // Value badges
      g.selectAll(".val-text")
        .data(data)
        .enter()
        .append("text")
        .attr("x", d => (xScale(d.name) || 0) + xScale.bandwidth() / 2)
        .attr("y", d => yScale(d.val) - 6)
        .attr("text-anchor", "middle")
        .attr("fill", "#0f172a")
        .attr("font-size", "10px")
        .attr("font-weight", "bold")
        .text(d => `R${d.val}k`);
    }

  }, [type, paramA, paramB, paramC]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm space-y-3 relative overflow-hidden" ref={containerRef}>
      
      {/* Graph Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-blue-600" />
          <span className="text-xs font-black uppercase tracking-wider text-slate-800">
            {label || "Interactive D3 SVG Model"}
          </span>
        </div>

        <button
          onClick={() => {
            setParamA(initialParams?.a ?? 1);
            setParamB(initialParams?.b ?? 4);
            setParamC(initialParams?.c ?? 12);
          }}
          className="p-1 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-50 transition-colors"
          title="Reset Parameters"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* D3 Canvas Render Box */}
      <div className="flex flex-col items-center justify-center bg-slate-50/60 rounded-xl p-2 border border-slate-100 relative min-h-[220px]">
        <svg ref={svgRef} width={360} height={240} className="w-full max-w-[360px] h-auto" />

        {hoverCoords && (
          <div className="absolute top-2 right-2 bg-slate-900/90 text-white px-2.5 py-1 rounded-lg text-[10px] font-mono shadow-md">
            x: {hoverCoords.valX.toFixed(2)}, y: {hoverCoords.valY.toFixed(2)}
          </div>
        )}
      </div>

      {/* Interactive Controls Sliders */}
      <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-2 text-xs">
        <div className="flex items-center justify-between text-[11px] font-bold text-slate-600">
          <span className="flex items-center gap-1">
            <Sliders className="w-3.5 h-3.5 text-blue-500" /> Adjust Parameters
          </span>
          <span className="text-blue-700 font-mono font-black">
            {type === "2d_parabola" && `a = ${paramA}, y-bound = ${paramB}`}
            {type === "3d_solid" && `Disk Count N = ${Math.round(paramC)}`}
            {type === "trig_wave" && `Amplitude = ${paramA}, Freq = ${paramB}`}
            {type === "circuit_diagram" && `Voltage = ${paramA * 12}V, R = ${paramC}Ω`}
            {type === "chemical_structure" && "Benzene Ring Model"}
            {type === "balance_sheet" && `Multiplier = ${paramA}x`}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {/* Slider 1 */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase flex justify-between">
              <span>{type === "trig_wave" ? "Amplitude" : type === "circuit_diagram" ? "Voltage" : "Coeff / Scale"}</span>
              <span className="font-mono text-slate-700">{paramA}</span>
            </label>
            <input
              type="range"
              min={0.5}
              max={3}
              step={0.25}
              value={paramA}
              onChange={(e) => setParamA(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>

          {/* Slider 2 */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase flex justify-between">
              <span>{type === "3d_solid" ? "Washers (N)" : type === "trig_wave" ? "Frequency" : "Boundary / Resistance"}</span>
              <span className="font-mono text-slate-700">
                {type === "3d_solid" ? Math.round(paramC) : paramB}
              </span>
            </label>
            <input
              type="range"
              min={type === "3d_solid" ? 3 : 1}
              max={type === "3d_solid" ? 25 : 8}
              step={1}
              value={type === "3d_solid" ? paramC : paramB}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                if (type === "3d_solid") setParamC(val);
                else setParamB(val);
              }}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>
        </div>
      </div>

    </div>
  );
}

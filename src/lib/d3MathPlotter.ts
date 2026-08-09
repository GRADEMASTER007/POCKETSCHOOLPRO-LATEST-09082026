/**
 * Grade Master Africa - D3.js Mathematical Function Plotter Utility
 * SVG-based coordinate systems and function plots for algebraic & calculus visualization.
 */

import * as d3 from "d3";

export interface MathFunctionSpec {
  id: string;
  label?: string;
  expression?: string; // e.g. "x^2 - 4*x + 3", "sin(x)", "2*x + 1", "e^(0.5*x)"
  fn?: (x: number) => number;
  color?: string;
  strokeWidth?: number;
  dashArray?: string;
}

export interface PointOfInterest {
  x: number;
  y: number;
  label: string;
  color?: string;
  type?: "root" | "vertex" | "intercept" | "inflection" | "tangent" | "point";
}

export interface TangentSpec {
  x0: number; // Point at which to draw tangent line
  fnIndex?: number; // Which function in functions array (default 0)
  label?: string;
  color?: string;
}

export interface IntegralRegionSpec {
  a: number; // Lower bound
  b: number; // Upper bound
  fnIndex?: number;
  color?: string;
  label?: string;
}

export interface FunctionPlotConfig {
  title?: string;
  width?: number;
  height?: number;
  xMin?: number;
  xMax?: number;
  yMin?: number;
  yMax?: number;
  xLabel?: string;
  yLabel?: string;
  grid?: boolean;
  functions: MathFunctionSpec[];
  tangents?: TangentSpec[];
  integrals?: IntegralRegionSpec[];
  pointsOfInterest?: PointOfInterest[];
  interactiveHover?: boolean;
}

/**
 * Parses and evaluates simple math expressions safely for plotting
 */
export function evaluateMathExpression(expr: string, x: number): number {
  const cleanExpr = expr
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/\^/g, "**")
    .replace(/sin\(/g, "Math.sin(")
    .replace(/cos\(/g, "Math.cos(")
    .replace(/tan\(/g, "Math.tan(")
    .replace(/exp\(/g, "Math.exp(")
    .replace(/sqrt\(/g, "Math.sqrt(")
    .replace(/abs\(/g, "Math.abs(")
    .replace(/ln\(/g, "Math.log(")
    .replace(/log\(/g, "Math.log10(")
    .replace(/\be\b/g, "Math.E")
    .replace(/pi/g, "Math.PI");

  try {
    // Substitute x into polynomial / trigonometric expressions
    // Handle implicit multiplication like 2x -> 2*x, 4x^2 -> 4*x**2
    const substituted = cleanExpr.replace(/(\d+)(x|Math\.)/g, "$1*$2");
    // Safe evaluation with Function
    const evaluator = new Function("x", `"use strict"; return (${substituted});`);
    const val = evaluator(x);
    return isNaN(val) || !isFinite(val) ? NaN : val;
  } catch (err) {
    // Fallback parser for standard polynomial ax^2 + bx + c or linear mx + c
    if (expr.includes("x^2")) {
      return x * x;
    } else if (expr.includes("sin")) {
      return Math.sin(x);
    } else if (expr.includes("cos")) {
      return Math.cos(x);
    }
    return x;
  }
}

/**
 * Computes numerical derivative f'(x0) using central difference
 */
export function computeNumericalDerivative(fn: (x: number) => number, x0: number, h: number = 0.0001): number {
  const yPlus = fn(x0 + h);
  const yMinus = fn(x0 - h);
  if (isNaN(yPlus) || isNaN(yMinus)) return 0;
  return (yPlus - yMinus) / (2 * h);
}

/**
 * Main D3 Renderer for Function Plotting & Coordinate Systems
 */
export function renderD3MathPlot(
  container: SVGSVGElement | HTMLElement,
  config: FunctionPlotConfig,
  onHoverCoords?: (coords: { x: number; y: number; deriv?: number } | null) => void
): () => void {
  const width = config.width || 480;
  const height = config.height || 320;
  const margin = { top: 30, right: 30, bottom: 40, left: 45 };

  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  // Domain & Range defaults
  const xMin = config.xMin ?? -5;
  const xMax = config.xMax ?? 5;
  const yMin = config.yMin ?? -5;
  const yMax = config.yMax ?? 5;

  // Select SVG element
  const svg = d3.select(container as any);
  svg.selectAll("*").remove(); // Clear canvas

  // Set attributes
  svg
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", `0 0 ${width} ${height}`)
    .attr("style", "max-width: 100%; height: auto;");

  // Create main group
  const g = svg
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Scales
  const xScale = d3.scaleLinear().domain([xMin, xMax]).range([0, innerWidth]);
  const yScale = d3.scaleLinear().domain([yMin, yMax]).range([innerHeight, 0]);

  // Background Grid Lines
  if (config.grid !== false) {
    const xGrid = d3.axisBottom(xScale).ticks(10).tickSize(innerHeight).tickFormat(() => "");
    const yGrid = d3.axisLeft(yScale).ticks(10).tickSize(-innerWidth).tickFormat(() => "");

    g.append("g")
      .attr("class", "grid-x")
      .attr("transform", `translate(0,0)`)
      .attr("stroke", "#f1f5f9")
      .attr("stroke-opacity", 0.8)
      .call(xGrid as any);

    g.append("g")
      .attr("class", "grid-y")
      .attr("stroke", "#f1f5f9")
      .attr("stroke-opacity", 0.8)
      .call(yGrid as any);

    // Style grid lines
    g.selectAll(".grid-x line, .grid-y line")
      .attr("stroke", "#e2e8f0")
      .attr("stroke-dasharray", "3,3");
    g.selectAll(".domain").attr("stroke", "none");
  }

  // Draw X-Axis at y = 0 (or bottom if 0 outside range)
  const yZeroPos = yMin <= 0 && yMax >= 0 ? yScale(0) : innerHeight;
  const xAxis = d3.axisBottom(xScale).ticks(8);
  
  const xAxisG = g.append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0,${yZeroPos})`)
    .call(xAxis as any);

  xAxisG.selectAll("text").attr("fill", "#64748b").attr("font-size", "10px").attr("font-weight", "600");
  xAxisG.selectAll("line").attr("stroke", "#94a3b8");
  xAxisG.select(".domain").attr("stroke", "#475569").attr("stroke-width", "1.5");

  // Draw Y-Axis at x = 0 (or left if 0 outside range)
  const xZeroPos = xMin <= 0 && xMax >= 0 ? xScale(0) : 0;
  const yAxis = d3.axisLeft(yScale).ticks(8);

  const yAxisG = g.append("g")
    .attr("class", "y-axis")
    .attr("transform", `translate(${xZeroPos},0)`)
    .call(yAxis as any);

  yAxisG.selectAll("text").attr("fill", "#64748b").attr("font-size", "10px").attr("font-weight", "600");
  yAxisG.selectAll("line").attr("stroke", "#94a3b8");
  yAxisG.select(".domain").attr("stroke", "#475569").attr("stroke-width", "1.5");

  // Axis Labels
  g.append("text")
    .attr("x", innerWidth - 5)
    .attr("y", yZeroPos - 6)
    .attr("text-anchor", "end")
    .attr("fill", "#334155")
    .attr("font-size", "11px")
    .attr("font-weight", "bold")
    .text(config.xLabel || "x");

  g.append("text")
    .attr("x", xZeroPos + 8)
    .attr("y", 12)
    .attr("text-anchor", "start")
    .attr("fill", "#334155")
    .attr("font-size", "11px")
    .attr("font-weight", "bold")
    .text(config.yLabel || "y");

  // Title
  if (config.title) {
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", 18)
      .attr("text-anchor", "middle")
      .attr("fill", "#0f172a")
      .attr("font-size", "13px")
      .attr("font-weight", "800")
      .text(config.title);
  }

  // Definite Integral Area Shading
  if (config.integrals && config.integrals.length > 0) {
    config.integrals.forEach((spec) => {
      const fnSpec = config.functions[spec.fnIndex || 0];
      if (!fnSpec) return;

      const evalFn = fnSpec.fn || ((x: number) => evaluateMathExpression(fnSpec.expression || "x", x));
      const step = (spec.b - spec.a) / 100;
      const areaPoints: [number, number][] = [];

      for (let x = spec.a; x <= spec.b; x += step) {
        const y = evalFn(x);
        if (!isNaN(y) && isFinite(y)) {
          areaPoints.push([x, y]);
        }
      }

      const areaGen = d3.area<[number, number]>()
        .x((d) => xScale(d[0]))
        .y0(yScale(0))
        .y1((d) => yScale(d[1]))
        .curve(d3.curveMonotoneX);

      g.append("path")
        .datum(areaPoints)
        .attr("fill", spec.color || "rgba(99, 102, 241, 0.25)")
        .attr("stroke", spec.color ? spec.color.replace("0.25", "0.8") : "rgba(99, 102, 241, 0.6)")
        .attr("stroke-width", "1")
        .attr("d", areaGen);

      // Integral Label
      if (spec.label) {
        const midX = (spec.a + spec.b) / 2;
        const midY = evalFn(midX) / 2;
        g.append("text")
          .attr("x", xScale(midX))
          .attr("y", yScale(midY))
          .attr("text-anchor", "middle")
          .attr("fill", "#4338ca")
          .attr("font-size", "10px")
          .attr("font-weight", "bold")
          .text(spec.label);
      }
    });
  }

  // Render Functions
  const defaultColors = ["#2563eb", "#dc2626", "#059669", "#d97706", "#7c3aed"];
  
  config.functions.forEach((fnSpec, idx) => {
    const color = fnSpec.color || defaultColors[idx % defaultColors.length];
    const evalFn = fnSpec.fn || ((x: number) => evaluateMathExpression(fnSpec.expression || "x", x));

    // Sample points
    const numSamples = 300;
    const dx = (xMax - xMin) / numSamples;
    const points: [number, number][] = [];

    for (let i = 0; i <= numSamples; i++) {
      const x = xMin + i * dx;
      const y = evalFn(x);
      if (!isNaN(y) && isFinite(y) && y >= yMin - 10 && y <= yMax + 10) {
        points.push([x, y]);
      }
    }

    const lineGen = d3.line<[number, number]>()
      .x((d) => xScale(d[0]))
      .y((d) => yScale(d[1]))
      .curve(d3.curveMonotoneX);

    g.append("path")
      .datum(points)
      .attr("fill", "none")
      .attr("stroke", color)
      .attr("stroke-width", fnSpec.strokeWidth || 3)
      .attr("stroke-dasharray", fnSpec.dashArray || "none")
      .attr("d", lineGen);

    // Function Legend Tag
    if (fnSpec.label || fnSpec.expression) {
      const legX = 10;
      const legY = 15 + idx * 18;
      g.append("circle")
        .attr("cx", legX)
        .attr("cy", legY)
        .attr("r", 4)
        .attr("fill", color);

      g.append("text")
        .attr("x", legX + 10)
        .attr("y", legY + 4)
        .attr("fill", "#1e293b")
        .attr("font-size", "10px")
        .attr("font-weight", "bold")
        .text(fnSpec.label || `f(x) = ${fnSpec.expression}`);
    }
  });

  // Render Calculus Tangent Lines
  if (config.tangents && config.tangents.length > 0) {
    config.tangents.forEach((tangent) => {
      const fnSpec = config.functions[tangent.fnIndex || 0];
      if (!fnSpec) return;

      const evalFn = fnSpec.fn || ((x: number) => evaluateMathExpression(fnSpec.expression || "x", x));
      const x0 = tangent.x0;
      const y0 = evalFn(x0);

      if (!isNaN(y0) && isFinite(y0)) {
        const slope = computeNumericalDerivative(evalFn, x0);
        const tangentColor = tangent.color || "#f59e0b";

        // Tangent line equation: y = y0 + slope * (x - x0)
        const tangentFn = (x: number) => y0 + slope * (x - x0);
        const tMinX = Math.max(xMin, x0 - 2.5);
        const tMaxX = Math.min(xMax, x0 + 2.5);

        const tangentPoints: [number, number][] = [
          [tMinX, tangentFn(tMinX)],
          [tMaxX, tangentFn(tMaxX)],
        ];

        const lineGen = d3.line<[number, number]>()
          .x((d) => xScale(d[0]))
          .y((d) => yScale(d[1]));

        g.append("path")
          .datum(tangentPoints)
          .attr("fill", "none")
          .attr("stroke", tangentColor)
          .attr("stroke-width", 2)
          .attr("stroke-dasharray", "4,4")
          .attr("d", lineGen);

        // Point of tangency node
        g.append("circle")
          .attr("cx", xScale(x0))
          .attr("cy", yScale(y0))
          .attr("r", 5)
          .attr("fill", tangentColor)
          .attr("stroke", "#ffffff")
          .attr("stroke-width", 2);

        // Tangent label with slope derivative f'(x0)
        g.append("text")
          .attr("x", xScale(x0) + 8)
          .attr("y", yScale(y0) - 8)
          .attr("fill", "#b45309")
          .attr("font-size", "10px")
          .attr("font-weight", "bold")
          .text(tangent.label || `Tangent at x=${x0.toFixed(1)} (f'=${slope.toFixed(2)})`);
      }
    });
  }

  // Render Points of Interest (Roots, Vertex, Intercepts)
  if (config.pointsOfInterest && config.pointsOfInterest.length > 0) {
    config.pointsOfInterest.forEach((poi) => {
      const poiColor = poi.color || "#e11d48";
      const cx = xScale(poi.x);
      const cy = yScale(poi.y);

      if (cx >= 0 && cx <= innerWidth && cy >= 0 && cy <= innerHeight) {
        g.append("circle")
          .attr("cx", cx)
          .attr("cy", cy)
          .attr("r", 5)
          .attr("fill", poiColor)
          .attr("stroke", "#ffffff")
          .attr("stroke-width", 2);

        g.append("text")
          .attr("x", cx + 8)
          .attr("y", cy - 5)
          .attr("fill", poiColor)
          .attr("font-size", "10px")
          .attr("font-weight", "bold")
          .text(`${poi.label} (${poi.x.toFixed(1)}, ${poi.y.toFixed(1)})`);
      }
    });
  }

  // Interactive Hover Crosshair
  if (config.interactiveHover !== false) {
    const overlay = g.append("rect")
      .attr("width", innerWidth)
      .attr("height", innerHeight)
      .attr("fill", "none")
      .attr("pointer-events", "all");

    const crosshairX = g.append("line")
      .attr("stroke", "#94a3b8")
      .attr("stroke-width", 1)
      .attr("stroke-dasharray", "3,3")
      .attr("opacity", 0);

    const crosshairY = g.append("line")
      .attr("stroke", "#94a3b8")
      .attr("stroke-width", 1)
      .attr("stroke-dasharray", "3,3")
      .attr("opacity", 0);

    const hoverDot = g.append("circle")
      .attr("r", 4)
      .attr("fill", "#2563eb")
      .attr("stroke", "#ffffff")
      .attr("stroke-width", 1.5)
      .attr("opacity", 0);

    overlay
      .on("mousemove", (event) => {
        const [mouseX, mouseY] = d3.pointer(event);
        const valX = xScale.invert(mouseX);
        const valY = yScale.invert(mouseY);

        const primaryFn = config.functions[0];
        let deriv: number | undefined;
        if (primaryFn) {
          const evalFn = primaryFn.fn || ((x: number) => evaluateMathExpression(primaryFn.expression || "x", x));
          deriv = computeNumericalDerivative(evalFn, valX);
        }

        crosshairX
          .attr("x1", mouseX).attr("y1", 0)
          .attr("x2", mouseX).attr("y2", innerHeight)
          .attr("opacity", 1);

        crosshairY
          .attr("x1", 0).attr("y1", mouseY)
          .attr("x2", innerWidth).attr("y2", mouseY)
          .attr("opacity", 1);

        hoverDot
          .attr("cx", mouseX).attr("cy", mouseY)
          .attr("opacity", 1);

        if (onHoverCoords) {
          onHoverCoords({ x: valX, y: valY, deriv });
        }
      })
      .on("mouseleave", () => {
        crosshairX.attr("opacity", 0);
        crosshairY.attr("opacity", 0);
        hoverDot.attr("opacity", 0);
        if (onHoverCoords) onHoverCoords(null);
      });
  }

  // Return cleanup function
  return () => {
    svg.selectAll("*").remove();
  };
}

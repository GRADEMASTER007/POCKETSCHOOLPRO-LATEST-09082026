import React, { useRef, useEffect, useState } from "react";
import katex from "katex";
import { Copy, Check, Code, Eye, Sparkles, TrendingUp } from "lucide-react";

interface KaTeXMathProps {
  math: string;
  block?: boolean;
  className?: string;
}

export function KaTeXMath({ math, block = false, className = "" }: KaTeXMathProps) {
  const containerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (containerRef.current && math) {
      try {
        katex.render(math, containerRef.current, {
          displayMode: block,
          throwOnError: false,
          output: "htmlAndMathml",
        });
      } catch (err) {
        console.error("KaTeX render error:", err);
        if (containerRef.current) {
          containerRef.current.textContent = math;
        }
      }
    }
  }, [math, block]);

  return <span ref={containerRef} className={`inline-block ${className}`} />;
}

export interface InteractiveLaTeXContainerProps {
  latex: string;
  title?: string;
  subtitle?: string;
  block?: boolean;
  className?: string;
  onSendToPlotter?: (expr: string) => void;
  onAskExplain?: (latex: string) => void;
}

/**
 * Interactive Container for KaTeX Mathematical Expressions
 * Allows toggling raw LaTeX source code, one-click copying,
 * and quick actions (explaining formula or plotting in D3).
 */
export function InteractiveLaTeXContainer({
  latex,
  title,
  subtitle,
  block = true,
  className = "",
  onSendToPlotter,
  onAskExplain
}: InteractiveLaTeXContainerProps) {
  const [showRaw, setShowRaw] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(latex);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`group relative my-3 p-4 bg-slate-900/95 text-blue-200 rounded-2xl border border-slate-800 shadow-lg transition-all duration-200 hover:border-blue-500/50 ${className}`}
    >
      {/* Container Header Toolbar */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800/80 text-[11px] font-mono text-slate-400">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          <span className="font-bold uppercase tracking-wider text-blue-400 text-[10px]">
            {title || "LaTeX Expression"}
          </span>
          {subtitle && <span className="text-slate-500">• {subtitle}</span>}
        </div>

        <div className="flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
          {/* Toggle Raw Source */}
          <button
            onClick={() => setShowRaw(!showRaw)}
            title={showRaw ? "Show Rendered Math" : "Show Raw LaTeX Code"}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors flex items-center gap-1 text-[10px]"
          >
            {showRaw ? <Eye className="w-3 h-3 text-blue-400" /> : <Code className="w-3 h-3" />}
            <span className="hidden sm:inline">{showRaw ? "Rendered" : "TeX"}</span>
          </button>

          {/* Copy LaTeX */}
          <button
            onClick={handleCopy}
            title="Copy LaTeX String"
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-amber-400 transition-colors flex items-center gap-1 text-[10px]"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span className="hidden sm:inline">{copied ? "Copied" : "Copy"}</span>
          </button>

          {/* Explain Formula */}
          {onAskExplain && (
            <button
              onClick={() => onAskExplain(latex)}
              title="Ask AI Tutor to Explain Formula"
              className="p-1 rounded-lg hover:bg-slate-800 text-amber-300 hover:text-amber-200 transition-colors flex items-center gap-1 text-[10px]"
            >
              <Sparkles className="w-3 h-3" />
              <span className="hidden sm:inline">Explain</span>
            </button>
          )}

          {/* Plot in D3 Plotter */}
          {onSendToPlotter && (
            <button
              onClick={() => onSendToPlotter(latex)}
              title="Send Expression to D3 Graph Plotter"
              className="p-1 rounded-lg hover:bg-slate-800 text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1 text-[10px]"
            >
              <TrendingUp className="w-3 h-3" />
              <span className="hidden sm:inline">Plot</span>
            </button>
          )}
        </div>
      </div>

      {/* Math Rendering or Raw Source View */}
      {showRaw ? (
        <pre className="p-3 bg-black/60 text-amber-300 rounded-xl text-xs font-mono overflow-x-auto whitespace-pre-wrap select-all border border-slate-800">
          {latex}
        </pre>
      ) : (
        <div className="py-1 text-center overflow-x-auto text-sm sm:text-base lg:text-lg font-mono">
          <KaTeXMath math={latex} block={block} />
        </div>
      )}
    </div>
  );
}

interface LaTeXRendererProps {
  text: string;
  className?: string;
  onSendToPlotter?: (expr: string) => void;
  onAskExplain?: (latex: string) => void;
}

/**
 * Helper to test if a plain text segment contains un-delimited LaTeX math commands
 */
function isRawLatexFormula(str: string): boolean {
  if (!str) return false;
  const trimmed = str.trim();
  // Check for common LaTeX command prefixes or operators
  const latexCommandRegex = /\\(int|frac|sqrt|sum|lim|theta|pi|infty|Delta|alpha|beta|gamma|sigma|partial|cdot|times|div|vec|left|right|begin|matrix|quad)/;
  if (latexCommandRegex.test(trimmed)) return true;
  // Check if string looks like an isolated math equation e.g. "V = \int_{0}^{4} \pi y dy = 8\pi"
  if (/^[a-zA-Z0-9\s\+\-\*\/\=\^\_\(\)]+\\[a-zA-Z]+/.test(trimmed)) return true;
  return false;
}

export function LaTeXRenderer({
  text,
  className = "",
  onSendToPlotter,
  onAskExplain
}: LaTeXRendererProps) {
  if (!text) return null;

  // Split by $$...$$ or $...$ or \[...\] or \(...\)
  const regex = /(\$\$.*?\$\$|\$.*?\$|\\\[.*?\\\]|\\\(.*?\\\))/gs;
  const parts = text.split(regex);

  return (
    <div className={`leading-relaxed ${className}`}>
      {parts.map((part, index) => {
        if (!part) return null;

        if (part.startsWith("$$") && part.endsWith("$$")) {
          const formula = part.slice(2, -2).trim();
          return (
            <InteractiveLaTeXContainer
              key={index}
              latex={formula}
              block={true}
              onSendToPlotter={onSendToPlotter}
              onAskExplain={onAskExplain}
            />
          );
        } else if (part.startsWith("\\[") && part.endsWith("\\]")) {
          const formula = part.slice(2, -2).trim();
          return (
            <InteractiveLaTeXContainer
              key={index}
              latex={formula}
              block={true}
              onSendToPlotter={onSendToPlotter}
              onAskExplain={onAskExplain}
            />
          );
        } else if (part.startsWith("$") && part.endsWith("$") && part.length > 2) {
          const formula = part.slice(1, -1).trim();
          return (
            <KaTeXMath
              key={index}
              math={formula}
              block={false}
              className="px-1.5 py-0.5 bg-blue-50 text-blue-700 font-bold rounded-lg border border-blue-100/80 mx-0.5"
            />
          );
        } else if (part.startsWith("\\(") && part.endsWith("\\)")) {
          const formula = part.slice(2, -2).trim();
          return (
            <KaTeXMath
              key={index}
              math={formula}
              block={false}
              className="px-1.5 py-0.5 bg-blue-50 text-blue-700 font-bold rounded-lg border border-blue-100/80 mx-0.5"
            />
          );
        } else if (isRawLatexFormula(part)) {
          // Un-delimited string containing LaTeX math syntax
          return (
            <KaTeXMath
              key={index}
              math={part.trim()}
              block={false}
              className="px-1.5 py-0.5 bg-blue-50 text-blue-700 font-bold rounded-lg border border-blue-100/80 mx-0.5"
            />
          );
        }

        // Return standard text block with newline formatting
        return <span key={index}>{part}</span>;
      })}
    </div>
  );
}



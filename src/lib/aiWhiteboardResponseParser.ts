/**
 * Grade Master Africa - AI Whiteboard Response & LaTeX Parser
 * Automatically detects mathematical expressions (LaTeX), step divisions,
 * equations, and graph requirements from raw AI model responses.
 */

import { WhiteboardStepData } from "@/src/components/study/whiteboard/StepBlock";
import { GraphType } from "@/src/components/study/whiteboard/D3InteractiveGraph";

export interface ParsedWhiteboardSolution {
  title: string;
  subject: string;
  steps: WhiteboardStepData[];
  evaluationFormula?: string;
  finalAnswer: string;
}

/**
 * Normalizes text to ensure LaTeX expressions are correctly delimited for KaTeX rendering
 */
export function normalizeLaTeXInText(text: string): string {
  if (!text) return "";

  let cleaned = text;

  // Replace common unescaped math expressions or raw \frac, \int, \sqrt if not inside $...$ or $$...$$
  // For instance: convert "x^2 - 4x + 3" or "\frac{a}{b}" when isolated into $...$
  cleaned = cleaned
    .replace(/\\\[/g, "$$")
    .replace(/\\\]/g, "$$")
    .replace(/\\\(/g, "$")
    .replace(/\\\)/g, "$");

  return cleaned;
}

/**
 * Parses raw text or structured AI output into step-by-step Whiteboard containers
 */
export function parseAIResponseToWhiteboardSteps(
  rawText: string,
  problemQuery: string,
  subjectKey: string = "mathematics"
): ParsedWhiteboardSolution {
  if (!rawText) {
    return {
      title: problemQuery,
      subject: "Mathematics",
      steps: [
        {
          stepNumber: 1,
          title: "Formulate problem statement",
          explanation: `Solving query: $${normalizeLaTeXInText(problemQuery)}$`,
          latexFormula: normalizeLaTeXInText(problemQuery),
          keyConcept: "Problem Formulation"
        }
      ],
      finalAnswer: `Solution derived for $${normalizeLaTeXInText(problemQuery)}$`
    };
  }

  const normalized = normalizeLaTeXInText(rawText);

  // Split by step markers like "Step 1:", "Step 2:", "1.", "2.", "### Step 1"
  const stepRegex = /(?:###?\s*)?Step\s*(\d+)[:\s–\-]*([^\n]*)/gi;
  const matches = [...normalized.matchAll(stepRegex)];

  const steps: WhiteboardStepData[] = [];

  if (matches.length > 0) {
    for (let i = 0; i < matches.length; i++) {
      const match = matches[i];
      const stepNum = parseInt(match[1]) || (i + 1);
      const stepTitle = match[2]?.trim() || `Step ${stepNum} Analysis`;
      
      const startIndex = match.index! + match[0].length;
      const endIndex = matches[i + 1] ? matches[i + 1].index! : normalized.length;
      const stepContent = normalized.slice(startIndex, endIndex).trim();

      // Extract formulas if enclosed in $$...$$ or $...$ or starting with \
      const formulaMatch = stepContent.match(/\$\$(.*?)\$\$/s) || stepContent.match(/\$(.*?)\$/);
      const latexFormula = formulaMatch ? formulaMatch[1].trim() : undefined;

      // Detect potential mathematical function plot expression (e.g. y = x^2 - 4x + 3)
      let functionExpr: string | undefined;
      const funcMatch = stepContent.match(/y\s*=\s*([x0-9\+\-\*\/\^\.\(\)\s\w]+)/i) || stepContent.match(/f\(x\)\s*=\s*([x0-9\+\-\*\/\^\.\(\)\s\w]+)/i);
      if (funcMatch && funcMatch[1].length < 30 && funcMatch[1].includes("x")) {
        functionExpr = funcMatch[1].trim().replace(/\^/g, "^");
      }

      // Determine graph type
      let graphType: GraphType | undefined;
      let graphLabel: string | undefined;

      if (functionExpr) {
        graphType = "math_function_plot";
        graphLabel = `D3 Plot: f(x) = ${functionExpr}`;
      } else if (subjectKey === "physical_sciences" && (stepContent.includes("circuit") || stepContent.includes("current") || stepContent.includes("ohm"))) {
        graphType = "circuit_diagram";
        graphLabel = "Interactive Circuit Diagram";
      } else if (stepContent.toLowerCase().includes("solid") || stepContent.toLowerCase().includes("volume") || stepContent.toLowerCase().includes("revolution")) {
        graphType = "3d_solid";
        graphLabel = "3D Revolution Solid";
      } else if (stepContent.toLowerCase().includes("parabola") || stepContent.toLowerCase().includes("quadratic") || stepContent.toLowerCase().includes("area")) {
        graphType = "2d_parabola";
        graphLabel = "2D Parabola Boundary Area";
      }

      steps.push({
        stepNumber: stepNum,
        title: stepTitle,
        explanation: stepContent,
        latexFormula: latexFormula,
        functionExpr: functionExpr,
        graphType: graphType,
        graphLabel: graphLabel,
        keyConcept: stepTitle.split(" ")[0] || "Step Concept"
      });
    }
  } else {
    // Fallback if no explicit "Step 1" markers found: split into 3 logical steps
    const paragraphs = normalized.split(/\n\n+/).filter(p => p.trim().length > 0);
    
    paragraphs.slice(0, 4).forEach((para, idx) => {
      const formulaMatch = para.match(/\$\$(.*?)\$\$/s) || para.match(/\$(.*?)\$/);
      const latexFormula = formulaMatch ? formulaMatch[1].trim() : undefined;

      steps.push({
        stepNumber: idx + 1,
        title: idx === 0 ? "Problem Setup & Definition" : idx === paragraphs.length - 1 ? "Final Simplification & Result" : `Mathematical Operation Part ${idx + 1}`,
        explanation: para,
        latexFormula: latexFormula,
        keyConcept: idx === 0 ? "Given Parameters" : "Derivation"
      });
    });
  }

  // Extract final answer
  const finalAnswerMatch = normalized.match(/(?:Final Answer|Conclusion|Result|Solution)[:\s]*([^\n]*)/i);
  const finalAnswer = finalAnswerMatch ? finalAnswerMatch[1].trim() : `Verified solution for: $${problemQuery}$`;

  // Extract evaluation formula if present
  const evalMatch = normalized.match(/(?:Evaluation|Formula|Verified)[:\s]*(\$\$[^\$]+\$\$|\$[^\$]+\$|[^\n]+)/i);
  const evaluationFormula = evalMatch ? evalMatch[1].trim() : undefined;

  return {
    title: problemQuery,
    subject: subjectKey,
    steps: steps.length > 0 ? steps : [
      {
        stepNumber: 1,
        title: "Step 1: Execute Mathematical Derivation",
        explanation: normalized,
        latexFormula: problemQuery.includes("=") ? problemQuery : undefined
      }
    ],
    evaluationFormula,
    finalAnswer
  };
}

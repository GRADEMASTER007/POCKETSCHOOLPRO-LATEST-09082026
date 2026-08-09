# 06 - AI Routing & System Prompt Engine

## Curriculum & Language Routing System (`CurriculumRouting.ts`)

The `CurriculumRouting` engine dynamically constructs AI system instructions based on the student's active profile parameters:

```typescript
// System Prompt Builder Core Logic
const curriculum = GLOBAL_CURRICULA[curriculumId] || GLOBAL_CURRICULA['caps'];
const examBoard = EXAM_BOARDS[examBoardId] || EXAM_BOARDS['default'];

// Language Instruction Strategy
let languageInstruction = "";
if (language === "english") {
  languageInstruction = `Deliver instruction in formal academic English while using local terms appropriate for ${curriculum.name}`;
} else if (isRegionalDialect) {
  languageInstruction = `[REGIONAL DIALECT VOICE TUTORING INSTRUCTION]
1. Deliver primary spoken and written tutoring explanations in ${language}.
2. Use bilingual pedagogical code-switching: explain concepts in ${language}, while providing standard English STEM terms in parentheses (e.g. "isiphumo (derivative)").
3. Keep spoken voice output fluid, natural, and phonetically clear for TTS.
4. Maintain standard international mathematical symbols and KaTeX LaTeX formatting.`;
}
```

---

## Specialized Persona Prompts

### 1. STEM Whiteboard Master Tutor Persona
- Formats answers into structured numbered steps (Step 1, Step 2, Step 3).
- Ensures every mathematical step contains a LaTeX formula block (`$$...$$`).
- Extracts explicit function expressions for rendering on the D3 interactive coordinate plotter canvas.

### 2. Google Vision AI Homework Doctor Persona
- Identifies handwritten equations, geometric figures, and physical diagrams.
- Provides a "Mistake Diagnostic": pinpoints exactly where the student made a calculation error in previous attempts.

### 3. Academic Research Synthesizer Persona
- Synthesizes academic literature with numbered inline citations (`[1]`, `[2]`).
- Structures findings into Abstract, Methodology Review, Key Findings, and Literature Matrix.

# 05 - AI Architecture

## Model Ecosystem & SDK Usage

Pocket School Pro leverages the official `@google/genai` SDK for Node.js, utilizing Google Gemini models hosted on Google Cloud infrastructure.

### Model Aliases & Model Routing Strategy

1. **Gemini 1.5 Pro (`gemini-1.5-pro`)**:
   - **Primary Use Cases**: Advanced calculus, physics derivations, chemistry reaction mechanisms, complex research synthesis, teacher lesson plan generation, and Whiteboard step-by-step reasoning.
   - **Strengths**: Deep reasoning, complex instruction following, 1M+ token context window, high precision in LaTeX output.

2. **Gemini 1.5 Flash (`gemini-1.5-flash`)**:
   - **Primary Use Cases**: Fast interactive chat, real-time voice tutoring response generation, flashcard creation, quick quiz generation, and vision OCR image classification.
   - **Strengths**: Low latency (<1s response time), cost efficiency, lightweight token consumption.

---

## Multi-Modal Capabilities

### 1. Vision AI & OCR
- Converts uploaded or live camera images (base64 data URLs) into structured LaTeX equations and step-by-step solutions.
- Analyzes diagrams, graphs, circuits, and handwritten chemistry structural formulas.

### 2. Speech & Regional Voice Tutoring
- Generates phonetically clear text tailored for Web Speech API synthesis (`window.speechSynthesis`).
- Supports bilingual code-switching for 11 South African official languages and major African dialects (isiZulu, Sesotho, Swahili, Yoruba, isiXhosa, Afrikaans, Sepedi, Setswana, Hausa, Igbo, Amharic, Shona).

### 3. Mathematical & D3 Plot Generation
- Emits structured JSON or delimited markdown containing:
  - KaTeX LaTeX formulas (`$f(x) = x^2 - 4x + 3$`).
  - Function plot definitions (`f(x) = x^2 - 4x + 3`, tangent points `x0`, integral bounds `[a, b]`).
  - D3 graph type selectors (`2d_parabola`, `3d_solid`, `circuit_diagram`, `math_function_plot`).

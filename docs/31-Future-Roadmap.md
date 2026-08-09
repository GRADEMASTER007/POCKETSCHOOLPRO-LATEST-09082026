# 31 - Future Roadmap & AI Rebuild Guide

## Product Roadmap & Future Enhancements

1. **Offline AI Model Execution**:
   - Integrate WebLLM / On-Device Gemini Nano for basic math operations when entirely disconnected from the internet.
2. **Expanded SADC & All-Africa Curricula**:
   - Add specialized support for Francophone Africa (BAC Benin, Senegal, Ivory Coast) and Lusophone Africa (Angola, Mozambique).
3. **Low-Bandwidth USSD & WhatsApp Bot Gateway**:
   - Expose Pocket School Pro AI solver endpoints over WhatsApp Business API and USSD channels for feature phone users in rural areas.

---

# Rebuilding Pocket School Pro From Scratch

> This section provides the complete blueprint required for any future AI model or software engineer to recreate Pocket School Pro from scratch without external guidance.

### 1. Business & User Experience Goals
- **Objective**: Build a 4K AI-Powered Academic & Accessibility Ecosystem for South Africa and Africa.
- **Unit Economics**: 53%+ gross profit margin across tier passes (R49 Basic, R69 Plus, R99 Standard, R199 Gold VIP, R499 - R14,999 School Base Passes).
- **Core Value**: 24/7 AI Master Tutor combining step-by-step Feynman Whiteboard reasoning, KaTeX math notation, D3.js function plotting, Vision AI OCR homework doctor, and 11 South African language voice tutoring.

### 2. Architecture & Stack
- **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons, KaTeX, D3.js, Web Speech API.
- **Backend**: Node.js, Express, ESBuild CJS bundler (`server.ts` -> `dist/server.cjs`). Port `3000`, host `0.0.0.0`.
- **Database & Auth**: Firebase Firestore & Firebase Auth.
- **AI Models**: Google Gemini 1.5 Pro & Gemini 1.5 Flash via `@google/genai` SDK.
- **Payments**: Yoco Payment SDK (`/api/checkout/yoco`), Learner Sponsorship portal (`/sponsor`), and App Donation portal (`/donate`).

### 3. Step-by-Step Rebuild Execution Order
1. **Initialize Project**: Create Vite React TS app. Add Tailwind CSS directives to `src/index.css`.
2. **Configure Express Entry Point (`server.ts`)**:
   - Implement `/api/health`, `/api/ai/solve`, `/api/ai/ocr`, `/api/quota`, `/api/checkout/yoco`, `/sitemap.xml`, `/robots.txt`.
   - Setup Vite middleware in dev mode and static `dist/` fallback in production.
   - Configure `package.json` scripts:
     - `"dev": "tsx server.ts"`
     - `"build": "vite build && esbuild server.ts --bundle --platform=node --format=cjs --packages=external --sourcemap --outfile=dist/server.cjs"`
     - `"start": "node dist/server.cjs"`
3. **Build Core Libraries**:
   - `src/lib/globalCurriculum.ts`: Curricula (CAPS, IEB, Cambridge, IB, CCSS) & regional languages (isiZulu, Sesotho, Swahili, Yoruba, etc.).
   - `src/lib/CurriculumRouting.ts`: System prompt builder with bilingual code-switching instructions.
   - `src/lib/d3MathPlotter.ts`: D3 SVG renderer for function graphs, tangent derivatives, and definite integrals.
   - `src/lib/tts.ts`: Multi-language Web Speech API speech synthesizer.
   - `src/lib/aiWhiteboardResponseParser.ts`: Regex & parser converting raw AI responses to step containers with LaTeX math blocks.
4. **Build Key UI Components**:
   - `src/components/landing/LandingPage.tsx`: Space science 4K hero canvas, Gold VIP emblem, pricing tables.
   - `src/components/study/Whiteboard.tsx`: Feynman whiteboard with KaTeX equations & D3 canvas.
   - `src/components/classroom/HomeworkDoctor.tsx`: Vision AI OCR scanner for handwritten math/physics.
   - `src/components/study/LanguageHub.tsx`: Multilingual voice tutor hub.
   - `src/components/keep/GoogleKeepNotes.tsx`: Smart AI study notes.
   - `src/components/seo/SERPRadar.tsx`: SEMrush-style keyword intelligence radar.
   - `src/components/dashboards/*`: Student, Teacher, Parent, Admin dashboards.
5. **Set Up PWA Assets**:
   - `/public/manifest.json`, `/public/firebase-messaging-sw.js`, installer guide view (`/pwa-install`).
6. **Deploy**:
   - Set `GEMINI_API_KEY` and deploy to Google Cloud Run listening on port `3000`.

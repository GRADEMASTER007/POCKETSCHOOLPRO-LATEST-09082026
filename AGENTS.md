# AGENTS.md — Pocket School Pro Memory & Project Context

## Project Identity
- **Name**: Pocket School Pro – (Gold Edition) by Grade Master Africa
- **Tagline**: The Enterprise 4K AI-Powered Academic & Accessibility Ecosystem for Africa.
- **Tech Stack**:
  - **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons, Framer Motion.
  - **Backend**: Node.js, Express, ESBuild CJS bundler (`server.ts` -> `dist/server.cjs`).
  - **AI Model Standard**: Google Gemini 1.5 Pro & Gemini 1.5 Flash (`@google/genai` SDK).
  - **Database & Auth**: Firebase Firestore & Firebase Authentication (`ai-studio-grademasterafric-238ddcd7-d3ea-4870-8512-5e7dba6a594c`).
  - **Payment Gateway & Sponsorship**: Yoco SDK integration (`/api/checkout/yoco` and `/api/create-checkout-session`), Sponsor a Learner (`/sponsor`), and App Development Donation (`/donate`).
  - **SEO & Search Intelligence**: SEMrush style SERP radar (`/seo`), dynamic `/sitemap.xml`, `/robots.txt`, and Schema.org JSON-LD for AI search engines (ChatGPT, Claude, Perplexity, Gemini).
  - **PWA Capabilities**: Full Web App Manifest (`/public/manifest.json`), service worker (`firebase-messaging-sw.js`), standalone display mode, downloadable on Android, iOS, Windows, macOS, and Linux.

## Subscription Tiers & Financial Unit Economics (53%+ Profit)
All pricing schemes are synchronized across `src/lib/quota.ts`, `src/components/settings/Subscription.tsx`, `src/components/landing/LandingPage.tsx`, and `server.ts`:

### Student Individual Passes
1. **Basic Starter (`basic_49`)**: R49/mo — 150k Tokens/mo, 30 AI Queries/day, 10 Vision Scans/day.
2. **Student Plus (`plus_69`)**: R69/mo — 350k Tokens/mo, 75 AI Queries/day, 25 Vision Scans/day.
3. **Standard Pass (`standard_99`)**: R99/mo — 750k Tokens/mo, 150 AI Queries/day, 50 Vision Scans/day.
4. **Gold VIP Pass (`gold_199`)**: R199/mo (3-Day Free Trial) — 2.5M Tokens/mo, 300 AI Queries/day, 100 Vision Scans/day.

### Institutional School Base Passes (Multi-Learner Seats)
5. **School Base 25 (`school_25`)**: R499/mo — Up to 25 Learners (10M Pooled Tokens, ~R19.96/seat).
6. **School Base 100 (`school_100`)**: R1,899/mo — Up to 100 Learners (35M Pooled Tokens, ~R18.99/seat).
7. **School Base 300 (`school_300`)**: R3,999 or R4,999/mo — Up to 300 Learners (90M Pooled Tokens, ~R16.66/seat).
8. **School Base 1000 (`school_1000`)**: R14,999/mo — Up to 1,000 Learners (250M Pooled Tokens, ~R14.99/seat).

## Core Architecture Guidelines
1. **Server Entry Point**: `server.ts` compiles to `dist/server.cjs` via `npm run build`. Port strictly set to `3000`.
2. **AI Model Selection**: Rely strictly on Gemini 1.5 Pro and Gemini 1.5 Flash for optimal balance between reasoning accuracy (calculus, physics, chemistry) and low latency / cost efficiency.
3. **PWA Downloadability**: Ensure `manifest.json` and meta tags in `index.html` maintain PWA mobile/tablet standalone status.

## Inclusive Education & Accessibility (Global Standard)
- **Accessibility Center (`/accessibility`)**: A unified hub for students with visual, auditory, or cognitive disabilities.
  - **Visual Modes**: High Contrast (Yellow/Black), Large Font Scaling (1.25x), and Dyslexic-Friendly Typography (Lexend Font).
  - **Cognitive Support**: Reduced Motion (stops animations) and Screen Reader Optimizations (enhanced ARIA).
  - **Global Shortcuts**: Alt+A (Accessibility), Alt+S (Sign Language), Alt+T (AI Tutor), Alt+D (Dashboard).
- **Sign Language Center (`/sign-language`)**: Interactive library for American and South African Sign Language (ASL/SASL) with visual hand-gesture cards and descriptive text.

## Advanced AI Study Ecosystem
- **Topic Master AI**: On-demand study deck generator. Students type any academic topic (e.g., "Mitochondria", "French Revolution") to instantly build AI-powered Quizzes or Flashcards.
- **Language Master**: Real-time translation to 40+ African languages, grammar analysis with scoring, and AI-generated language lessons (Beginner to Advanced).
- **Writing Assistant**: AI-powered idea generation and drafting for essays, assignments, and formal letters.
- **CV Builder**: Intelligent career coach that guides users through building professional Curriculum Vitae and generates high-quality PDFs.
- **AI Notes Master**: intelligent homework assistant that captures photos of handwriting or book pages and summarizes them into structured study notes.

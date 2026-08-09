# 07 - Feature Documentation

## Complete Inventory of Core Application Features

### 1. Space Science 4K Landing Page & Gold Branding
- **Files**: `src/components/landing/LandingPage.tsx`, `src/components/landing/SpaceHero.tsx`
- **Description**: Features a 4K cosmic space universe canvas with animated particle stars, gold luxury emblem, subscription comparison pricing tables, and live feature demos.

### 2. Feynman AI Whiteboard & D3 Function Plotter
- **Files**: `src/components/study/Whiteboard.tsx`, `src/lib/d3MathPlotter.ts`, `src/components/study/whiteboard/D3MathPlotterCanvas.tsx`, `src/components/study/whiteboard/KaTeXMath.tsx`
- **Description**: Interactive step-by-step math solver rendering KaTeX mathematical equations and D3.js SVG function plots with tangent derivative sliders, definite integral region shading, and real-time hover coordinate readouts.

### 3. Google Vision AI Step-by-Step Homework Doctor (OCR)
- **Files**: `src/components/classroom/HomeworkDoctor.tsx`, `src/components/tools/OCRScanner.tsx`
- **Description**: Uploads camera or file images of handwritten calculus, physics, or chemistry problems; performs OCR analysis; outputs 4-step solutions with speech narration.

### 4. Spoken AI Voice Tutor & Multi-Language Hub
- **Files**: `src/components/study/LanguageHub.tsx`, `src/lib/tts.ts`, `src/lib/globalCurriculum.ts`
- **Description**: Supports voice tutoring in 11 South African official languages and regional African dialects (isiZulu, Sesotho, Swahili, Yoruba, isiXhosa, Afrikaans, Sepedi, Setswana, Hausa, Igbo, Amharic, Shona). Implements bilingual code-switching for STEM terminology.

### 5. Multi-User Dashboards (Student, Teacher, Parent, Admin)
- **Files**: `src/components/dashboards/*`
- **Description**: Specialized dashboard interfaces for:
  - **Student**: Grade tracker, study streak, study quests, daily goals, subject labs.
  - **Teacher**: Lesson plan builder, rubric auto-grader, class performance analytics.
  - **Parent**: Real-time progress monitoring, attendance logs, direct teacher chat.
  - **Admin**: School-wide seat allocation, token pool management, user role management.

### 6. Academic Research Hub & Paper Synthesizer
- **Files**: `src/components/study/ResearchHub.tsx`
- **Description**: Searches academic literature, summarizes research papers, generates inline citations, and constructs literature review matrices.

### 7. Google Keep Style Smart Notes (`/keep`)
- **Files**: `src/components/keep/GoogleKeepNotes.tsx`
- **Description**: Color-coded pinning system for AI study notes, flashcard exports, and quick scratchpad ideas with cloud Firestore persistence.

### 8. PWA Mobile & Desktop Installer (`/pwa-install`)
- **Files**: `src/components/pwa/PWAInstallGuide.tsx`, `public/manifest.json`, `public/firebase-messaging-sw.js`
- **Description**: Full PWA support enabling standalone app installation on Android, iOS, Windows, macOS, and Linux with AAA High Contrast Accessibility Mode and audio voice walkthroughs.

### 9. Learner Sponsorship & App Development Donation (`/sponsor`, `/donate`)
- **Files**: `src/components/wallet/LearnerSponsor.tsx`, `src/components/wallet/AppDonation.tsx`
- **Description**: Direct ZAR billing portals allowing corporations, NGOs, and individual sponsors to fund student passes or support server infrastructure.

### 10. SEO & SERP Intelligence Command Center (`/seo`)
- **Files**: `src/components/seo/SERPRadar.tsx`, `src/components/seo/KeywordGenerator.tsx`
- **Description**: SEMrush-style keyword search difficulty radar, location-targeted AI keyword generator, and AI search crawler optimization (`/robots.txt`, `/sitemap.xml`, Schema.org JSON-LD).

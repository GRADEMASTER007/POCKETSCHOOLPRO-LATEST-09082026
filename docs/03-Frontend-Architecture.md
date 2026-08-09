# 03 - Frontend Architecture

## Component & Directory Layout

The frontend resides in `/src` following a clean, modular structure:

```
src/
├── App.tsx                     # Main layout shell, view routing, quota modals, sidebar
├── main.tsx                    # Entry point mounting React DOM root
├── index.css                   # Global CSS importing Tailwind CSS directives
├── types.ts                    # Global TypeScript interfaces, types, and enums
├── assets/                     # Logos, static banners, audio assets
├── components/
│   ├── auth/                   # LoginModal, SignupModal, AuthProvider
│   ├── billing/                # YocoCheckoutModal, SubscriptionPlans, QuotaIndicator
│   ├── centers/                # STEM Lab, Vocational Center, Exam Hub
│   ├── classroom/              # Live Classroom, Video Lecture, Homework Doctor
│   ├── dashboards/             # StudentDashboard, TeacherDashboard, ParentDashboard, AdminDashboard
│   ├── info/                   # AboutUs, FeaturesModal, HelpCenter
│   ├── keep/                   # Google Keep style Smart Notes component
│   ├── landing/                # Space Science 4K Landing Page, Hero, Features, Pricing
│   ├── layout/                 # Sidebar, Header Navbar, MobileDrawer, Footer
│   ├── productivity/           # FocusTimer, StudyPlanner, DailyGoals
│   ├── pwa/                    # PWAInstallPrompt, InstallGuideModal
│   ├── safety/                 # Child Safety, AI Moderation Alerts
│   ├── seo/                    # SERPRadar, KeywordGenerator, SchemaLD
│   ├── settings/               # UserSettings, SubscriptionSettings, CurriculumSettings
│   ├── study/                  # Whiteboard, QuizEngine, FlashcardEngine, ResearchHub, D3Graph
│   ├── tools/                  # OCR Scanner, Voice Synthesizer, Calculator
│   └── wallet/                 # Learner Sponsorship, App Donation, Token Wallet
├── data/                       # Subjects database, sample mock data, curricula definitions
├── hooks/                      # Custom hooks (useAuth, useQuota, useTTS, usePWA)
└── lib/                        # Core utilities
    ├── CurriculumRouting.ts    # AI prompt system instructions builder
    ├── globalCurriculum.ts     # Curricula & regional language definitions
    ├── firebase.ts             # Firebase initializeApp, Auth, and Firestore instance
    ├── quota.ts                # Client token quota calculation logic
    ├── d3MathPlotter.ts        # D3 SVG coordinate system and function plotter
    ├── tts.ts                  # Web Speech API multi-language synthesizer
    └── aiWhiteboardResponseParser.ts # AI response to LaTeX / KaTeX converter
```

---

## State Management Approach

1. **Global Authentication & User State**: Managed via Firebase Auth listener inside `AuthProvider` context and React hooks.
2. **Subscription & Quota State**: Fetched from `/api/quota` and stored in local React state with fallback to local storage for instant offline evaluation.
3. **Active View Navigation**: Controlled by `activeView` string state in `App.tsx` (e.g. `'dashboard'`, `'whiteboard'`, `'ocr'`, `'seo'`, `'sponsor'`, `'donate'`).
4. **Interactive Component Local State**: Form states, chat history, active tabs, and canvas drawing coordinates stored within isolated component state hooks.

---

## Performance & Optimization Techniques

- **Lazy Component Mounting**: Heavy tools like D3 Math Plotter, KaTeX, and SERP Radar are rendered conditionally based on active tab state.
- **D3 SVG Cleanup**: Custom teardown callbacks return unmount cleanups for SVG canvas instances to prevent memory leaks.
- **KaTeX Fast Parsing**: Regex-driven LaTeX string parsing avoids full heavy DOM reflows during streaming text output.

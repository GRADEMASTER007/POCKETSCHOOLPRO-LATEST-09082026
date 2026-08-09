# 13 - Subscription Tiers & Pricing System

## Subscription Matrix & Pricing Schemes

All pricing schemes are synchronized across `src/lib/quota.ts`, `src/components/settings/Subscription.tsx`, `src/components/landing/LandingPage.tsx`, and `server.ts`.

### 1. Student Individual Passes

| Plan Identifier | Plan Name | Monthly Price (ZAR) | Monthly Tokens | Daily AI Queries | Daily Vision Scans | Key Features Included |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `free` | Guest Free | R0 | 25,000 | 5 | 2 | Basic math solver, D3 plotter preview |
| `basic_49` | Basic Starter | R49/mo | 150,000 | 30 | 10 | CAPS/IEB curriculum solver, Smart Notes |
| `plus_69` | Student Plus | R69/mo | 350,000 | 75 | 25 | Full exam engine, KaTeX math solver |
| `standard_99` | Standard Pass | R99/mo | 750,000 | 150 | 50 | Feynman Whiteboard, Research Hub |
| `gold_199` | Gold VIP Pass | R199/mo | 2,500,000 | 300 | 100 | **3-Day Free Trial**, 11 SA voice tutoring |

---

### 2. Institutional School Base Passes (Multi-Learner Seats)

| Plan Identifier | Plan Name | Monthly Price (ZAR) | Included Learner Seats | Pooled Monthly Tokens | Effective Cost per Seat |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `school_25` | School Base 25 | R499/mo | 25 Learners | 10,000,000 | ~R19.96 / seat |
| `school_100` | School Base 100 | R1,899/mo | 100 Learners | 35,000,000 | ~R18.99 / seat |
| `school_300` | School Base 300 | R4,999/mo | 300 Learners | 90,000,000 | ~R16.66 / seat |
| `school_1000` | School Base 1000 | R14,999/mo | 1,000 Learners | 250,000,000 | ~R14.99 / seat |

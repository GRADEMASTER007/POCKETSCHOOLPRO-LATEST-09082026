# 04 - Backend Architecture

## Server Entry Point & Middleware Chain
The backend server is implemented in `server.ts` and compiled via ESBuild into `dist/server.cjs`.

### Middleware Stack
1. `express.json({ limit: '10mb' })`: JSON body parsing with elevated size limits to accept high-resolution camera image payloads for OCR analysis.
2. `cors()`: Cross-Origin Resource Sharing handling.
3. **Optional Auth Middleware**: Extracts Firebase Bearer ID tokens from request headers to identify authenticated users.
4. **Rate Limiting & Token Quota Middleware**: Checks token balance before allowing expensive Gemini API requests.
5. **Vite Development Middleware**: Integrated via `createViteServer` when `NODE_ENV !== "production"`.
6. **Production Static Middleware**: Serves compiled frontend assets from `dist/` directory with SPA index.html fallback for unmatched routes.

---

## Core Backend API Routes

| Endpoint | Method | Purpose |
| :--- | :--- | :--- |
| `/api/health` | `GET` | Health check returning status `"ok"` and system uptime. |
| `/api/ai/solve` | `POST` | General STEM problem solver using Gemini 1.5 Pro / Flash. |
| `/api/ai/ocr` | `POST` | Google Vision AI OCR analysis for handwritten homework images. |
| `/api/ai/research` | `POST` | Academic paper search and research synthesis engine. |
| `/api/ai/quiz` | `POST` | Curriculum-aligned multiple choice and essay quiz generator. |
| `/api/quota` | `GET` | Returns user token quotas, tier limits, and monthly usage stats. |
| `/api/checkout/yoco` | `POST` | Initializes Yoco card payment checkout session for subscriptions. |
| `/api/donate` | `POST` | Processes ZAR app development donations. |
| `/api/sponsor` | `POST` | Handles learner sponsorship purchases for NGOs and corporations. |
| `/sitemap.xml` | `GET` | Dynamic XML sitemap generation for search engines and AI crawlers. |
| `/robots.txt` | `GET` | Crawler access rules enabling GPTBot, ClaudeBot, PerplexityBot, and Google-Extended. |

---

## Database Integration & Security Model
- Uses **Firebase Firestore** via the Firebase Admin SDK / Client SDK.
- Collections: `users`, `quota_usage`, `subscriptions`, `notes`, `chats`, `sponsorships`, `donations`.
- Security governed by `firestore.rules`.

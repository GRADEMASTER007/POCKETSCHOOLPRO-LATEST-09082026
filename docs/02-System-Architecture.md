# 02 - System Architecture

## High-Level Architectural Pattern
Pocket School Pro utilizes a full-stack, single-container, client-server architecture with an Express server hosting the API routes and proxying Vite frontend assets in development, or serving static bundle files in production.

```
+-----------------------------------------------------------------------+
|                            Browser / PWA                              |
|   (React 18, Vite, Tailwind CSS, Lucide Icons, KaTeX, D3.js, Web Speech)|
+-----------------------------------+-----------------------------------+
                                    |
                             HTTP / REST API
                                    |
+-----------------------------------v-----------------------------------+
|                        Node.js / Express Server                       |
|                       (Port 3000, dist/server.cjs)                    |
|                                                                       |
|  +--------------------+  +----------------------+  +---------------+  |
|  | Token Quota Engine |  | Gemini 1.5 Pro/Flash |  | Yoco SDK API  |  |
|  +--------------------+  +----------------------+  +---------------+  |
+-------------------+------------------+-----------------------+--------+
                    |                  |                       |
                    v                  v                       v
          +------------------+ +---------------+     +------------------+
          | Google Gemini API| | Firebase Auth |     | Firestore DB     |
          +------------------+ +---------------+     +------------------+
```

---

## Technical Stack Summary

| Component | Technology | Version / Specification |
| :--- | :--- | :--- |
| **Frontend Framework** | React | 18.3.1 |
| **Build Tool & Bundler** | Vite / ESBuild | Vite 5.4.1, ESBuild for `server.ts` -> `dist/server.cjs` |
| **Styling Engine** | Tailwind CSS | v3.4+ with custom gold luxury palette |
| **Icons & Visuals** | Lucide React | 0.344.0 |
| **Mathematical Notation** | KaTeX | High-performance LaTeX rendering |
| **Interactive Graphing** | D3.js | 7.9.0 |
| **Backend Runtime** | Node.js / Express | Node 20.x, Express 4.18.2 |
| **TypeScript Support** | TSX / tsc | 5.2.2 |
| **Database & Persistence** | Firebase Firestore | Cloud NoSQL DB |
| **Authentication** | Firebase Auth | Email/Password, Anonymous, Custom Tokens |
| **AI Model SDK** | Google Gen AI SDK | `@google/genai` (Gemini 1.5 Pro & Flash) |
| **Payment Gateway** | Yoco Payment SDK | Direct ZAR Card Checkout (`/api/checkout/yoco`) |
| **PWA & Offline** | Web App Manifest / Service Worker | `manifest.json`, `firebase-messaging-sw.js` |

---

## Network Ingress & Container Execution Rules

1. **Port Constraint**: Port `3000` is the ONLY externally accessible port through the Cloud Run ingress and NGINX reverse proxy layer.
2. **Host Binding**: Express MUST listen on host `0.0.0.0` and port `3000`.
3. **Build Pipeline**:
   - Development: `tsx server.ts` handles API routes and mounts Vite middleware (`middlewareMode: true`).
   - Production: `npm run build` runs `vite build && esbuild server.ts --bundle --platform=node --format=cjs --packages=external --sourcemap --outfile=dist/server.cjs`.
   - Start: `node dist/server.cjs`.

# 25 - Environment Variables Reference

Below is the complete inventory of required and optional environment variables (`.env.example`):

```env
# Google Gemini AI Key [CRITICAL - SERVER ONLY]
GEMINI_API_KEY=your_google_gemini_api_key_here

# Application Public Host Domain
APP_URL=https://your-domain.com

# Yoco Payment Gateway Keys
VITE_YOCO_PUBLIC_KEY=pk_test_yoco_public_key
YOCO_SECRET_KEY=sk_test_yoco_secret_key

# Firebase Client Configuration (Public VITE_ prefixed)
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=ai-studio-grademasterafric-238ddcd7-d3ea-4870-8512-5e7dba6a594c
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

> **Security Warning**: `GEMINI_API_KEY` and `YOCO_SECRET_KEY` MUST NEVER be prefixed with `VITE_` or exposed to the client browser. All Gemini calls MUST be proxied through backend server routes (`/api/ai/*`).

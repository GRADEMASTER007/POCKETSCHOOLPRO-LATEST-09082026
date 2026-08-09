# 26 - Security & Data Protection Architecture

## Security Standards & Safeguards

1. **API Key Isolation**:
   - `GEMINI_API_KEY` and `YOCO_SECRET_KEY` are kept exclusively server-side in Node.js `process.env`.
2. **Child Safety & AI Moderation**:
   - System prompts enforce strict safety guidelines prohibiting harmful content, self-harm topics, or non-educational responses.
   - All student queries pass through safety filters.
3. **Firestore Security Rules**:
   - `firestore.rules` enforces strict user boundary checks: students can only read/write their own profiles, notes, and quota records.
4. **HTTPS & CORS Restrictions**:
   - Production container enforces SSL/TLS via Cloud Run ingress proxy.

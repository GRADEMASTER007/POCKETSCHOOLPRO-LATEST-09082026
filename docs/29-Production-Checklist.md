# 29 - Production Deployment Checklist

## Pre-Launch Verification Steps

- [x] **Compile Applet Check**: Run `npm run build` and ensure zero TypeScript or ESBuild bundling errors.
- [x] **Port Binding**: Verify `server.ts` listens on port `3000` and host `0.0.0.0`.
- [x] **Environment Secrets**: Ensure `GEMINI_API_KEY` and `YOCO_SECRET_KEY` are populated in secret manager.
- [x] **PWA Manifest & Icons**: Check `/public/manifest.json`, `/icon-192.png`, `/icon-512.png` match PWA specs.
- [x] **SEO Crawlers**: Validate `/sitemap.xml` and `/robots.txt` permit indexing by GPTBot, ClaudeBot, PerplexityBot, and Google-Extended.
- [x] **Yoco Payment SDK**: Test card transaction flow on `/api/checkout/yoco`.
- [x] **Multi-Language Speech**: Verify Web Speech API fallback for 11 SA languages.

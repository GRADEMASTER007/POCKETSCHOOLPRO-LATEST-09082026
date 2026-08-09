# 24 - Deployment Guide & Cloud Run Instructions

## Single-Container Cloud Run Deployment

Pocket School Pro is packaged into a lightweight, high-performance Docker container running Node.js 20 on Google Cloud Run.

### Container Build & Startup Commands

```bash
# Production Build
npm run build

# Start Production Server (Port 3000)
npm run start
```

---

## Cloud Run Container Specifications

- **Port Binding**: Must bind to `PORT=3000` and host `0.0.0.0`.
- **Memory Recommendation**: 1GiB minimum (2GiB recommended for heavy D3/KaTeX static asset serving).
- **CPU**: 1 vCPU.
- **Concurrency**: 80 requests per instance.
- **Execution Environment**: Gen 2.
- **Invocations**: `--allow-unauthenticated` for public web traffic behind Cloud Run CDN.

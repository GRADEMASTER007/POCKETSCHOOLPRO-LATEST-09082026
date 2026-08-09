# CDN Benchmark & Edge Delivery Strategy for Rural Mobile Networks

## 1. Analysis of Existing Configuration

Your current setup in `server.ts` and `vite.config.ts` includes excellent foundational practices for asset delivery:

*   **Aggressive Caching**: You are correctly serving hashed static assets (`.js`, `.css`, images) with `Cache-Control: public, max-age=31536000, immutable`. This is ideal for CDN edge caching.
*   **Fresh HTML Delivery**: `index.html` uses `max-age=0, must-revalidate`, ensuring clients always get the latest pointers to your hashed assets without stale caching issues.
*   **Code Splitting**: `vite.config.ts` breaks the app into `vendor`, `firebase`, and `ui` chunks. This prevents minor application changes from busting the cache for large third-party libraries.
*   **Compression**: Express middleware is configured with `compression` at level 6, providing a good balance between CPU load and payload reduction.
*   **Offline Support (PWA)**: The `VitePWA` plugin uses Workbox to precache the application, shielding returning users from network unreliability.

### Identifying Bottlenecks for Rural Networks

While the current setup is solid for average networks, rural 3G/4G networks face distinct challenges:
1.  **High Latency (Time To First Byte - TTFB)**: Every round trip takes significantly longer (200ms+).
2.  **Low Bandwidth**: Fetching a 1.6MB `index.js` (as seen in the build logs) over a 2 Mbps connection takes over 6 seconds. 
3.  **Connection Drops**: Large contiguous files are more prone to failing mid-download.

## 2. Benchmark Strategy

To ensure a **sub-second bootstrap**, we must measure and optimize specifically for edge conditions.

### A. Define the Target Metrics
*   **TTFB (Time To First Byte)**: < 100ms at the CDN edge.
*   **FCP (First Contentful Paint)**: < 800ms on a simulated "Slow 3G" or "Fast 3G" connection.
*   **TTI (Time To Interactive)**: < 1.5s for the critical path (shell).

### B. Tooling for Benchmarking
1.  **Lighthouse (CLI / CI Integration)**: 
    *   Run audits explicitly throttling to `Mobile Slow 4G` (1.6 Mbps down, 150ms RTT).
2.  **WebPageTest.org**: 
    *   Test from physical edge locations near your target rural demographics (e.g., specific regions in Africa or South Asia).
    *   Measure the visual progress graph.
3.  **Real User Monitoring (RUM)**: 
    *   Log `window.performance.timing` metrics to Firestore for actual field data.

## 3. Recommended CDN & Routing Optimizations

To achieve the sub-second goal, consider implementing the following enhancements on top of your current stack:

### Tier 1: Edge Computing & Routing
*   **Migrate HTML to the Edge**: Currently, your `express.static` serves everything from the Cloud Run container. You should place a CDN (e.g., Cloudflare, Firebase Hosting, AWS CloudFront) in front of Cloud Run. The CDN will cache the immutable assets at the edge node closest to the user, bypassing the Cloud Run cold start.
*   **Brotli Compression**: `compression` in Express uses gzip. Modern CDNs can compress on-the-fly using Brotli (`br`), which provides 15-25% smaller file sizes for JS/CSS compared to gzip.

### Tier 2: Asset Delivery Optimization
*   **Further Chunking**: The main `index.js` chunk was reported as 1.6MB in the build logs. You must heavily utilize dynamic `import()` for routes that are not immediately visible on the home screen.
*   **Preconnect & Resource Hints**: Add `<link rel="preconnect" href="...">` in `index.html` for critical external domains (like Firebase APIs or Font CDNs) to warm up DNS and TLS handshakes during the latency-heavy rural connection process.
*   **Stale-While-Revalidate for HTML**: Instead of `max-age=0`, consider `Cache-Control: public, s-maxage=1, stale-while-revalidate=59`. This allows the CDN to serve a slightly stale `index.html` instantly from the edge while re-fetching it in the background from Cloud Run.

### Tier 3: Resiliency for Unstable Networks
*   **Service Worker Fallbacks**: Ensure the Workbox configuration serves a minimal offline fallback page instantly if the network hangs.
*   **Retry Logic**: Implement exponential backoff for Firebase/API calls to handle intermittent packet loss without throwing UI errors.

## Conclusion

Your Node/Express configuration is fully optimized for the *origin server*. The next evolutionary step for rural performance is shifting the delivery responsibility from the Express server to a distributed CDN layer, paired with aggressive dynamic route splitting to reduce the initial JavaScript payload.

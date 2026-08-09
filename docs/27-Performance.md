# 27 - Performance Optimization & CDN Benchmark Strategy

## Frontend & Backend Performance Benchmarks

1. **ESBuild Server Bundling (`dist/server.cjs`)**:
   - Compiles server TypeScript into a single, bundled CJS file, reducing container cold-start filesystem I/O.
2. **KaTeX In-Memory Regex Parsing**:
   - Math expressions are parsed into KaTeX HTML strings on the fly without triggering standard DOM reflow bottlenecks.
3. **D3 SVG Container Cleanup**:
   - All interactive coordinate charts register cleanup listeners on unmount (`svg.selectAll("*").remove()`) to avoid SVG element leaks.
4. **PWA Static Asset Caching**:
   - Service worker caches core bundle assets for offline shell loading.

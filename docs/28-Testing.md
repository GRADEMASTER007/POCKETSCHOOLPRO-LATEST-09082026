# 28 - Automated Probe & System Verification

## Automated Probe Suite

Pocket School Pro includes a dedicated automated probe script to verify AI model endpoints and token quotas:

```bash
# Run automated AI probe
npm run test:ai
```

### Verification Checks

1. **Gemini 1.5 Pro & Flash Connectivity**:
   - Sends test prompt to `/api/ai/solve` and verifies HTTP `200 OK` response with valid LaTeX step containers.
2. **KaTeX Formula Rendering Test**:
   - Ensures mathematical expressions `$f(x) = x^2 - 4x + 3$` convert correctly to KaTeX HTML syntax.
3. **D3 Function Plotter Verification**:
   - Validates numerical derivative computation and sampling arrays for coordinate systems.
4. **Token Quota Middleware Probe**:
   - Confirms rate-limiting headers and usage balance calculations.

# 14 - Token Management & Quota Enforcement

## Token Accounting Engine (`src/lib/quota.ts` & `server.ts`)

To ensure cost control and operational sustainability (53%+ gross profit margin), Pocket School Pro tracks AI token consumption on both the client and server.

```typescript
// Server-side checkUsageBalance function signature in server.ts
async function checkUsageBalance(
  userId: string, 
  requestType: 'ai_requests' | 'vision_scans' = 'ai_requests', 
  costTokens: number = 1000, 
  requiredFeature?: string
): Promise<{ allowed: boolean; error?: string; code?: string; tier?: string }>
```

---

## Feature Gate Enforcement

Premium features are guarded against token exhaustion or unpaid tier access:
- **Whiteboard (`whiteboard`)**
- **OCR Analysis (`ocr_analysis`)**
- **Research Hub (`research_hub`)**
- **Document Analysis (`document_analysis`)**
- **Curriculum Tutoring (`curriculum_tutoring`)**

If a free or exhausted user attempts to invoke these features, the server responds with status `429 Too Many Requests` containing JSON:
```json
{
  "error": "Monthly token limit exceeded for your tier.",
  "code": "FEATURE_GATE_EXHAUSTION",
  "tier": "basic_49"
}
```
The client catches this error and automatically pops open the `YocoCheckoutModal` subscription upgrade dialog.

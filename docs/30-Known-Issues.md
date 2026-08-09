# 30 - Known Issues & Operational Mitigations

## System Considerations & Workarounds

1. **Web Speech API Browser Variance**:
   - *Issue*: Safari iOS and older Android browsers have varying support for native voices in regional languages like isiZulu (`zu-ZA`) or Sesotho (`st-ZA`).
   - *Mitigation*: `tts.ts` includes intelligent fallback logic that falls back to standard English female voices with clear phonetic pacing when regional voices are missing on the host OS.

2. **Camera Permissions in iFrame Preview**:
   - *Issue*: Browser iFrame sandbox restrictions may block camera access for Vision AI OCR scanning.
   - *Mitigation*: The app detects iFrame context and presents a prominent "Open in New Tab" button, while supporting file drag-and-drop as a direct alternative.

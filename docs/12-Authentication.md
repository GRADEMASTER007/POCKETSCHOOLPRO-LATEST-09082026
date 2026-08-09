# 12 - Authentication & User Security Flow

## Authentication Mechanism

Pocket School Pro integrates **Firebase Authentication** supporting:
1. **Email / Password Authentication**: Standard registration and login with input validation.
2. **Anonymous Guest Session**: Instant evaluation mode allowing first-time visitors to test the AI Whiteboard and D3 Math Plotter before creating an account.
3. **Custom Auth Claims & Bearer ID Tokens**: Client attaches `Authorization: Bearer <idToken>` header to API calls. The Express server verifies the token via Firebase Admin SDK to attach `req.user.uid` to request context.

---

## User Roles & Access Control

- **Student Role**: Access to study tools, Whiteboard, OCR, flashcards, quiz generator, and personal progress tracker.
- **Teacher Role**: Access to lesson planning tools, class performance dashboards, rubric auto-graders, and student activity logs.
- **Parent Role**: Access to learner progress cards, attendance summaries, and direct teacher communication.
- **Admin Role**: Access to school seat management, pooled institutional token distribution, and system-wide usage audits.

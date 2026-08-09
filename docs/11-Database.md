# 11 - Database Architecture & Firestore Schema

## Firebase Firestore Collections Structure

Pocket School Pro utilizes Cloud Firestore as its primary NoSQL database.

### 1. `users` Collection
- **Document ID**: `{uid}`
- **Fields**:
  - `email`: string
  - `displayName`: string
  - `role`: `'student' | 'teacher' | 'parent' | 'admin'`
  - `curriculumId`: string (`'caps'`, `'ieb'`, `'cambridge'`, `'ib'`, `'common_core'`)
  - `gradeYear`: string (`'grade_10'`, `'grade_11'`, `'grade_12'`, `'tertiary'`)
  - `language`: string (`'english'`, `'isizulu'`, `'sesotho'`, `'swahili'`, `'yoruba'`)
  - `subscriptionTier`: string (`'free'`, `'basic_49'`, `'plus_69'`, `'standard_99'`, `'gold_199'`)
  - `trialEndsAt`: Timestamp
  - `createdAt`: Timestamp

### 2. `quota_usage` Collection
- **Document ID**: `{uid}_{YYYY_MM}`
- **Fields**:
  - `userId`: string
  - `yearMonth`: string (`'2026_07'`)
  - `totalTokens`: number
  - `aiRequestsCount`: number
  - `visionScansCount`: number
  - `lastRequestAt`: Timestamp

### 3. `notes` Collection
- **Document ID**: Auto-generated
- **Fields**:
  - `userId`: string
  - `title`: string
  - `content`: string
  - `color`: string
  - `pinned`: boolean
  - `tags`: array of strings
  - `updatedAt`: Timestamp

### 4. `sponsorships` Collection
- **Document ID**: Auto-generated
- **Fields**:
  - `sponsorUserId`: string
  - `sponsorName`: string
  - `tierPlan`: string
  - `seatsCount`: number
  - `amountZar`: number
  - `paymentStatus`: `'completed' | 'pending'`
  - `createdAt`: Timestamp

---

## Security Rules (`firestore.rules`)
- Read/Write access restricted to authenticated document owners (`request.auth.uid == resource.data.userId`).
- Public read access permitted for static curriculum definitions and public landing metrics.

# 15 - Payment Gateway System

## Yoco SDK Integration

Pocket School Pro integrates South Africa's leading payment gateway, **Yoco**, for seamless local credit/debit card billing in South African Rand (ZAR).

### Checkout Sequence Flow

```
+------------------+         +----------------------+         +-------------------+
|  User Clicks     |         |  Yoco Inline Modal   |         |  Backend Server   |
|  "Upgrade Plan"  | ------->|  (Card Details Input)| ------->| /api/checkout/yoco|
+------------------+         +----------------------+         +---------+---------+
                                                                        |
                                                                        v
                                                              +-------------------+
                                                              | Update Firestore  |
                                                              | Subscription Tier |
                                                              +-------------------+
```

---

## Sponsorship & Donation Billing Portals

1. **Sponsor a Learner (`/sponsor`)**:
   - Allows corporate CSR divisions, NGOs, and individual sponsors to fund student passes.
   - Calculates total ZAR cost based on selected quantity and tier pass (`basic_49`, `plus_69`, `standard_99`, `gold_199`).
2. **App Development Donation (`/donate`)**:
   - Accepts custom ZAR contributions to support server infrastructure, Gemini AI token quotas, and voice synthesizer expansions.

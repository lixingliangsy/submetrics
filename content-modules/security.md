# SubMetrics — Security & Compliance

## What we handle
SubMetrics processes the subscription and billing figures (MRR, ARPU, churn, plan counts, customer lists) you paste or connect to produce its metrics and readouts. These are **business billing data**, not end-user personal data in most cases, but they may contain identifiable business information. We do not train public models on your submissions without explicit consent.

## Data handling commitments
- Input is used only to generate your metrics and exports.
- We minimize retained data and avoid storing secrets longer than needed.
- Transfers use TLS encryption in transit; data at rest is encrypted by our hosting provider (Vercel).
- Access to stored data is restricted to the account owner; we do not share figures with other customers.

## Compliance posture
SubMetrics is a B2B tool for subscription metrics. We apply GDPR data-minimization (Art.5) and security principles (Art.32). Billing is handled by our merchant of record (Waffo); we never see your card number.

> **Honesty note:** SubMetrics is a tool that helps you prepare and assess. It does **not** guarantee compliance, 100% coverage, or that you will never miss a requirement. Treat its output as decision-support, not legal or financial sign-off.

## Subprocessors
We rely on our hosting provider (Vercel) and payment processor (Waffo). No data is sold to third parties.

References: ref: OWASP Top 10; GDPR Art.5 (data minimization), Art.32 (security of processing)

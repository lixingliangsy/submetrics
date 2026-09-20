import type { GovEntry } from './governance-data/index'

/**
 * Honest guardrails for the vertical SaaS-metrics agent (submetrics deep-data moat).
 * Aligned to OPC asset guardrails G1–G5.
 *
 * These validators run AFTER the grounded model call returns, BEFORE the
 * report is assembled and emitted. A failing validator refuses emission —
 * matching the existing "no citation → refuse" red line.
 *
 *   G1 — analysis is decision-support, not certified financial / valuation advice
 *   G2 — no "guarantee your metrics will improve" / "guaranteed to hit 100% NDR" / "guaranteed valuation"
 *   G3 — benchmark figures (ChartMogul/OpenView/SaaS Capital/Bessemer) are public reference
 *        points, never a promise the tool will get the user to those numbers
 *   G4 — English B2B positioning (enforced at content/design layer, not runtime)
 *   G5 — metric mapping/diagnosis is analysis aid; must not claim a certified or exact valuation
 */

export interface GuardrailResult {
  ok: boolean
  violations: string[]
  note: string
  needsHumanReview: boolean
}

const DECISION_SUPPORT_FOOTER =
  '\n\n— Decision-support only. Not financial, accounting, or valuation advice. Verify formulas and benchmarks against primary sources (ChartMogul / OpenView / SaaS Capital / Bessemer) before acting. ' +
  'This is a good-faith metric read you can stand behind, not a certified valuation or audit.'

const UNCERTAINTY_FOOTER =
  '\n\n⚠️ Open uncertainties detected — confirm with a qualified finance / FP&A reviewer before acting.' + DECISION_SUPPORT_FOOTER

// G2 / G5 — prohibited absolute-assurance phrases. Anchored to avoid false
// positives on mentions of metrics as topics (e.g. "NDR benchmark" as a subject).
const PROHIBITED_PHRASES: Array<{ re: RegExp; code: string }> = [
  { re: /\bguarantee[ds]?\b[^.]{0,40}\b(your|the|you)( metrics| ndr| nrr| churn| ltv| valuation| growth| retention)\b/i, code: 'G2_GUARANTEE_METRIC' },
  { re: /\b(you will|you'll) (definitely|certainly|guaranteed) (hit|reach|achieve|exceed)\b/i, code: 'G2_GUARANTEE_OUTCOME' },
  { re: /\bguarantee[ds]? (no|zero) (churn|loss|miss)\b/i, code: 'G2_GUARANTEE_NO_LOSS' },
  { re: /\bthis (is|gives you) (a|the) (exact|certified|guaranteed) (valuation|worth|number)\b/i, code: 'G5_CERTIFIED_VALUATION' },
  { re: /\bwe (certify|guarantee) (your|the) (metrics|valuation|financials)\b/i, code: 'G5_CERTIFY' },
  { re: /\b(ensures?|guarantees?) (your )?(exact |precise )?(valuation|worth|compliance with benchmark)\b/i, code: 'G5_ENSURE_VALUATION' },
]

// G3 — benchmark ceilings must be framed as public reference points, never as a
// promise that the tool will get the user to those numbers.
const BENCHMARK_PROMISE: RegExp =
  /\b(we |this (tool|report) |the agent )(will|can|guarantees?) (get|move|push) (you|your (company|saas)) (to|above|past).*(ndr|nrr|rule of 40|benchmark|top quartile)\b/i

// G1 — the report must be grounded in at least one cited metric source from the dataset.
const CITATION_MARKER = /MRR|ARR|NDR|NRR|GRR|ARPU|ARPA|ACV|CMRR|LTV|CAC|churn|retention|Rule of 40|Rule of X|Burn Multiple|Magic Number|SaaS Capital Index|ChartMogul|OpenView|Bessemer|KeyBanc/i

const UNCERTAINTY_MARKER =
  /\b(uncertain|not certain|may not (be|apply)|verify with|consult (a|your|qualified)|should confirm|depends on|open (question|issue)|needs? (human|finance|fpa|expert) review|cannot (determine|confirm)|out of scope|estimate only)\b/i

/** G1 — report is grounded in at least one cited metric source from the dataset. */
export function checkCitationGrounded(report: string, citations: GovEntry[]): boolean {
  return citations.length > 0 && CITATION_MARKER.test(report)
}

/** G2 / G5 — scan for prohibited absolute-assurance phrasing. */
export function checkNoGuarantee(text: string): string[] {
  const hits: string[] = []
  for (const p of PROHIBITED_PHRASES) {
    if (p.re.test(text)) hits.push(p.code)
  }
  if (BENCHMARK_PROMISE.test(text)) hits.push('G3_BENCHMARK_PROMISE')
  return hits
}

/** Uncertainty detector — drives the "confirm with finance" flag (G1/G5). */
export function detectUncertainty(text: string): boolean {
  return UNCERTAINTY_MARKER.test(text)
}

/** Main entry — returns whether the report may be emitted, plus the redline note. */
export function applyGuardrails(report: string, citations: GovEntry[]): GuardrailResult {
  const violations: string[] = []

  if (!checkCitationGrounded(report, citations)) {
    violations.push('G1_NO_CITATION')
  }
  violations.push(...checkNoGuarantee(report))

  const needsHumanReview = detectUncertainty(report)
  const ok = violations.length === 0

  let note = DECISION_SUPPORT_FOOTER
  if (needsHumanReview) {
    note = UNCERTAINTY_FOOTER
  }

  return { ok, violations, note, needsHumanReview }
}

/**
 * Metric consistency gaps - deeper conversion bars derived from the real Scorecard hits.
 * Generated 2026-11-11 (U9/U10 closeout) - see scripts/_patch_bcd_conversion_bars.py.
 *
 * Rules of the house:
 *   - every count comes from lib/scorecard over the real hits array
 *   - a bucket fails only when a hit id is IN its ruleIds list (never by
 *     regex-matching a finding title)
 *   - no invented metrics, no model-authored numbers, no ML claims
 *   - source is only 'Rule-based' | 'N/A'
 */
import type { GuardHit } from './scorecard'
import { buildScorecard, normSeverity } from './scorecard'

export type BucketStatus = 'clear' | 'flagged' | 'na'

export type BarBucket = {
  id: string
  title: string
  ruleIds: string[]
  blurb: string
  status: BucketStatus
  hits: number
  high: number
}

export type MetricsBars = {
  buckets: BarBucket[]
  flagged: number
  clear: number
  na: number
  conclusion: string
}

export const BAR_BUCKETS: Array<{ id: string; title: string; ruleIds: string[]; blurb: string }> = [
  {
    id: 'inputs',
    title: 'Core metric inputs',
    ruleIds: ['SM-01', 'SM-02', 'SM-03'],
    blurb: 'Metrics were not supplied, or MRR / active customer count is not a positive number.',
  },
  {
    id: 'churn',
    title: 'Churn rate and basis',
    ruleIds: ['SM-04', 'SM-09'],
    blurb: 'Churn rate is outside 0-100%, or the churn basis (logo vs MRR) is not declared.',
  },
  {
    id: 'arpu',
    title: 'ARPU derivation',
    ruleIds: ['SM-07', 'SM-08'],
    blurb: 'ARPU trend cannot be derived, or ARPU is implausible for the stated customer count.',
  },
  {
    id: 'net',
    title: 'Net MRR change',
    ruleIds: ['SM-06'],
    blurb: 'Net MRR change is not positive - growth does not offset churn.',
  },
  {
    id: 'honesty',
    title: 'Method honesty',
    ruleIds: ['SM-05'],
    blurb: 'A zero-churn case was handled without a derived LTV.',
  },
]

export function buildMetricsBars(hits?: GuardHit[] | null, rulesEvaluated?: number): MetricsBars {
  const list = Array.isArray(hits) ? hits : []
  const sc = buildScorecard(list, rulesEvaluated)

  const buckets: BarBucket[] = BAR_BUCKETS.map((b) => {
    const own = list.filter((h) => b.ruleIds.includes(String(h.id || '')))
    const high = own.filter((h) => normSeverity(h.severity) === 'high').length
    if (sc.rulesTotal === 0) {
      return { ...b, status: 'na' as BucketStatus, hits: 0, high: 0 }
    }
    return {
      ...b,
      status: own.length ? ('flagged' as BucketStatus) : ('clear' as BucketStatus),
      hits: own.length,
      high,
    }
  })

  const flagged = buckets.filter((b) => b.status === 'flagged')
  const clear = buckets.filter((b) => b.status === 'clear')
  const na = buckets.filter((b) => b.status === 'na')
  const highTotal = flagged.reduce((n, b) => n + b.high, 0)

  let conclusion: string
  if (sc.rulesTotal === 0) {
    conclusion = 'Metric consistency gaps - run the check to populate these bars.'
  } else if (flagged.length === 0) {
    conclusion = 'Metric consistency gaps - all ' + String(clear.length) + ' bars clear in this pass (' + String(sc.rulesTotal) + ' rules evaluated).'
  } else {
    conclusion =
      'Metric consistency gaps - ' + String(flagged.length) + ' of ' + String(buckets.length) + ' bars flagged' +
      (highTotal ? ' (' + String(highTotal) + ' high severity)' : '') +
      ' across ' + String(sc.rulesTotal) + ' rules evaluated.'
  }

  return { buckets, flagged: flagged.length, clear: clear.length, na: na.length, conclusion }
}

export function bucketChip(status: BucketStatus): { label: string; bg: string; fg: string } {
  if (status === 'clear') return { label: 'Clear', bg: '#ecfdf5', fg: '#047857' }
  if (status === 'flagged') return { label: 'Flagged', bg: '#fef2f2', fg: '#b91c1c' }
  return { label: 'N/A', bg: '#fffbeb', fg: '#b45309' }
}

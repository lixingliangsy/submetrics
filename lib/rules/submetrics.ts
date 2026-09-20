export const RULESET_VERSION = 'submetrics@2026-09-17'

export type RuleHit = {
  id: string
  title: string
  severity: 'low' | 'medium' | 'high'
  passed: boolean
  remediation?: string
  ref?: string
}

export function runDeterministicChecks(inputs: Record<string, string>): RuleHit[] {
  const blob = Object.values(inputs || {}).join('\n').trim()
  const hits: RuleHit[] = []
  hits.push({
    id: 'R1',
    title: 'Input provided',
    severity: 'medium',
    passed: blob.length > 0,
    remediation: 'Provide the required inputs before running.',
    ref: 'https://schema.org/HowTo',
  })
  hits.push({
    id: 'R2',
    title: 'No efficacy guarantee language required',
    severity: 'low',
    passed: true,
    ref: 'https://www.ftc.gov/business-guidance/resources/advertising-faqsa-guide-small-business',
  })
  return hits
}

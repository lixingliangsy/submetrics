import fs from 'fs'
import path from 'path'
import { getAcceptedContributed } from '../data-flywheel'

export interface GovEntry {
  id: string
  ref: string
  title: string
  text: string
  source: string
  scope: GovScope
  verify?: boolean
  tags?: string[]
}

export type GovScope = 'mrr' | 'churn' | 'ndr' | 'benchmarks'

interface RawEntry {
  id: string
  title: string
  body: string
  ref: string
  tags?: string[]
  verify: boolean
}

interface DatasetFile {
  version: string
  source: string
  entries: RawEntry[]
}

const DATA_DIR = __dirname
const STOP = new Set([
  'the', 'a', 'an', 'of', 'to', 'and', 'or', 'for', 'in', 'on', 'is', 'are', 'be', 'your', 'you', 'with',
  'that', 'this', 'from', 'as', 'by', 'at', 'it', 'its', 'their', 'they', 'per', 'vs', 'how', 'what',
  'much', 'many', 'rate', 'month', 'year', 'annual', 'monthly', 'revenue', 'saas', 'metric', 'metrics',
  'good', 'strong', 'benchmark', 'definition', 'formula', 'new', 'net', 'gross', 'growth',
])

function readJson(name: string): DatasetFile {
  const p = path.join(DATA_DIR, name)
  return JSON.parse(fs.readFileSync(p, 'utf8')) as DatasetFile
}

const SCOPE_SOURCE: Record<GovScope, string> = {
  mrr: 'MRR/ARR corpus (ChartMogul / OpenView / SaaS Capital)',
  churn: 'Churn & retention corpus (OpenView / ChartMogul)',
  ndr: 'NRR/NDR & GRR corpus (ChartMogul / OpenView / Stripe / KeyBanc)',
  benchmarks: 'Efficiency & valuation benchmarks (SaaS Capital / Bessemer / KeyBanc)',
}

let _index: GovEntry[] | null = null

export function loadGovernanceIndex(): GovEntry[] {
  if (_index) return _index
  const out: GovEntry[] = []

  const files: Array<{ name: string; scope: GovScope }> = [
    { name: 'mrr.json', scope: 'mrr' },
    { name: 'churn.json', scope: 'churn' },
    { name: 'ndr.json', scope: 'ndr' },
    { name: 'benchmarks.json', scope: 'benchmarks' },
  ]

  for (const { name, scope } of files) {
    const ds = readJson(name)
    for (const e of ds.entries) {
      out.push({
        id: e.id,
        ref: e.ref,
        title: e.title,
        text: e.body,
        source: SCOPE_SOURCE[scope],
        scope,
        verify: e.verify,
        tags: e.tags,
      })
    }
  }

  // DATA FLYWHEEL — merge human-accepted contributed signals into the
  // retrievable index. Contributed entries always carry verify:true and are
  // never treated as vetted primary sources (see data-flywheel.ts / guardrails G1–G5).
  for (const c of getAcceptedContributed()) {
    out.push({
      id: c.id,
      ref: c.ref,
      title: c.title,
      text: c.text,
      source: c.source,
      scope: c.scope,
      verify: c.verify,
      tags: c.tags,
    })
  }

  _index = out
  return out
}

/** Force the next retrieve to rebuild from disk (re-ingest newly accepted signals). */
export function invalidateGovernanceCache(): void {
  _index = null
}

export function tokenize(s: string): string[] {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9.\s]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 1 && !STOP.has(t))
}

export interface RetrieveOpts {
  scope?: GovScope | 'all'
  topK?: number
  threshold?: number
}

export function retrieve(query: string, opts: RetrieveOpts = {}): GovEntry[] {
  const idx = loadGovernanceIndex()
  const scope = opts.scope || 'all'
  const topK = opts.topK || 6
  const qTokens = new Set(tokenize(query))
  const scopeFilter = scope === 'all' ? idx : idx.filter((e) => e.scope === scope)

  const scored = scopeFilter.map((e) => {
    const hay = tokenize(`${e.title} ${e.text} ${e.ref} ${(e.tags || []).join(' ')}`)
    let score = 0
    for (const t of hay) if (qTokens.has(t)) score += 1
    // ref-match boost (e.g. "ndr", "mrr", "rule of 40", "churn")
    for (const qt of qTokens) {
      if (e.ref.toLowerCase().includes(qt)) score += 2
    }
    return { e, score }
  })

  return scored
    .filter((s) => s.score > (opts.threshold ?? 0))
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map((s) => ({
      id: s.e.id,
      ref: s.e.ref,
      title: s.e.title,
      text: s.e.text,
      source: s.e.source,
      scope: s.e.scope,
      verify: s.e.verify,
      tags: s.e.tags,
    }))
}

export const GOVERNANCE_SOURCES = [
  'ChartMogul SaaS Metrics Library & Glossary',
  'OpenView SaaS Benchmarks & KPI guidance',
  'SaaS Capital Research & SaaS Capital Index',
  'Stripe — Net Dollar Retention explainer',
  'KeyBanc / Bessemer SaaS surveys (via 2026 benchmark aggregates)',
]

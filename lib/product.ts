export interface InputField {
  key: string
  label: string
  type: 'input' | 'textarea' | 'select'
  placeholder?: string
  options?: string[]
}

export const PRODUCT = {
  name: "SubMetrics",
  slug: "submetrics",
  tagline: "Know your SaaS numbers without a spreadsheet",
  description: "Paste your subscription numbers and get MRR, ARPU, churn, LTV, and a plain-English read on what's moving - built for solo founders and small teams who'd rather not live in a spreadsheet.",
  toolTitle: "Analyze your subscription metrics",
  resultLabel: "Your metrics",
  ctaLabel: "Calculate metrics",
  features: [
  "MRR & growth rate",
  "ARPU & LTV",
  "Churn & retention",
  "Plain-English diagnosis"
],
  inputs: [
  {
    "key": "mrr",
    "label": "Current MRR ($)",
    "type": "input",
    "placeholder": "e.g. 4200"
  },
  {
    "key": "customers",
    "label": "Active customers",
    "type": "input",
    "placeholder": "e.g. 180"
  },
  {
    "key": "churn",
    "label": "Monthly churn rate (%)",
    "type": "input",
    "placeholder": "e.g. 4"
  },
  {
    "key": "arpu_prev",
    "label": "MRR last month ($)",
    "type": "input",
    "placeholder": "e.g. 4000"
  }
] as InputField[],
  systemPrompt: "You are a SaaS metrics analyst. Given MRR, customer count, churn rate and last month's MRR, compute MRR growth, ARPU, LTV (using churn), and write a 3-line plain-English diagnosis of business health. Use the real numbers; be specific and blunt.",
  pricing: [
  {
    "tier": "Free",
    "price": "$0",
    "desc": "5 calculations/month"
  },
  {
    "tier": "Starter",
    "price": "$15/mo",
    "desc": "Unlimited, save history"
  },
  {
    "tier": "Pro",
    "price": "$39/mo",
    "desc": "Benchmark vs similar SaaS"
  }
],
  mock: (inputs: Record<string, string>): string => {
  const mrr = parseFloat(inputs['mrr']) || 0
  const cust = parseInt(inputs['customers']) || 0
  const churn = parseFloat(inputs['churn']) || 0
  const prev = parseFloat(inputs['arpu_prev']) || 0
  const arpu = cust ? (mrr / cust) : 0
  const ltv = (churn > 0) ? (arpu / (churn / 100)) : 0
  const growth = prev ? (((mrr - prev) / prev) * 100) : 0
  const verdict = (churn > 5 ? 'Churn above 5% is the danger zone - retention work pays off fastest.' : 'Churn looks manageable.') + ' ' + (growth > 0 ? 'MRR is growing - keep acquisition on.' : 'MRR flat/down - check acquisition.')
  return `SUBSCRIPTION METRICS
MRR: $${mrr.toLocaleString()}
Customers: ${cust}
ARPU: $${arpu.toFixed(2)}
LTV (at ${churn}% churn): $${ltv.toFixed(0)}
MRR growth vs last month: ${growth.toFixed(1)}%

READ: ${verdict}

--- (Mock math from your inputs. Add OPENAI_API_KEY for an AI diagnosis.)`
}
}

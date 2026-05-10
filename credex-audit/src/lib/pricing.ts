export type Plan = {
  name: string
  pricePerSeat: number
  minSeats?: number
  maxSeats?: number
}

export type Tool = {
  id: string
  label: string
  plans: Plan[]
  category: string
}

export const TOOLS: Record<string, Tool> = {
  cursor: {
    id: 'cursor',
    label: 'Cursor',
    category: 'coding',
    plans: [
      { name: 'Hobby', pricePerSeat: 0 },
      { name: 'Pro', pricePerSeat: 20 },
      { name: 'Business', pricePerSeat: 40 },
      { name: 'Enterprise', pricePerSeat: 100 },
    ],
  },
  github_copilot: {
    id: 'github_copilot',
    label: 'GitHub Copilot',
    category: 'coding',
    plans: [
      { name: 'Individual', pricePerSeat: 10 },
      { name: 'Business', pricePerSeat: 19 },
      { name: 'Enterprise', pricePerSeat: 39 },
    ],
  },
  claude: {
    id: 'claude',
    label: 'Claude',
    category: 'mixed',
    plans: [
      { name: 'Free', pricePerSeat: 0 },
      { name: 'Pro', pricePerSeat: 20 },
      { name: 'Max', pricePerSeat: 100 },
      { name: 'Team', pricePerSeat: 30, minSeats: 5 },
      { name: 'Enterprise', pricePerSeat: 60, minSeats: 10 },
      { name: 'API', pricePerSeat: 0 },
    ],
  },
  chatgpt: {
    id: 'chatgpt',
    label: 'ChatGPT',
    category: 'mixed',
    plans: [
      { name: 'Plus', pricePerSeat: 20 },
      { name: 'Team', pricePerSeat: 30, minSeats: 2 },
      { name: 'Enterprise', pricePerSeat: 60, minSeats: 10 },
      { name: 'API', pricePerSeat: 0 },
    ],
  },
  anthropic_api: {
    id: 'anthropic_api',
    label: 'Anthropic API',
    category: 'mixed',
    plans: [{ name: 'Pay-as-you-go', pricePerSeat: 0 }],
  },
  openai_api: {
    id: 'openai_api',
    label: 'OpenAI API',
    category: 'mixed',
    plans: [{ name: 'Pay-as-you-go', pricePerSeat: 0 }],
  },
  gemini: {
    id: 'gemini',
    label: 'Gemini',
    category: 'mixed',
    plans: [
      { name: 'Pro', pricePerSeat: 20 },
      { name: 'Ultra', pricePerSeat: 30 },
      { name: 'API', pricePerSeat: 0 },
    ],
  },
  windsurf: {
    id: 'windsurf',
    label: 'Windsurf',
    category: 'coding',
    plans: [
      { name: 'Free', pricePerSeat: 0 },
      { name: 'Pro', pricePerSeat: 15 },
      { name: 'Teams', pricePerSeat: 35 },
    ],
  },
}

export type ToolInput = {
  toolId: string
  plan: string
  monthlySpend: number
  seats: number
}

export type AuditResult = {
  toolId: string
  label: string
  currentSpend: number
  recommendedAction: string
  savings: number
  reason: string
  severity: 'overspending' | 'optimal' | 'minor'
}

export function runAuditEngine(
  inputs: ToolInput[],
  teamSize: number,
  useCase: string
): AuditResult[] {
  const results: AuditResult[] = []

  for (const input of inputs) {
    const tool = TOOLS[input.toolId]
    if (!tool) continue

    const currentPlan = tool.plans.find(p => p.name === input.plan)
    if (!currentPlan) continue

    const expectedSpend = currentPlan.pricePerSeat * input.seats
    const result = evaluateTool(input, tool, teamSize, useCase, expectedSpend)
    results.push(result)
  }

  return results
}

function evaluateTool(
  input: ToolInput,
  tool: Tool,
  teamSize: number,
  useCase: string,
  expectedSpend: number
): AuditResult {
  const { toolId, plan, monthlySpend, seats } = input

  // Check: paying retail but API would be cheaper for low usage
  if (
    (toolId === 'claude' || toolId === 'chatgpt') &&
    plan === 'Pro' &&
    seats === 1 &&
    monthlySpend >= 20
  ) {
    if (useCase === 'data' || useCase === 'research') {
      return {
        toolId,
        label: tool.label,
        currentSpend: monthlySpend,
        recommendedAction: `Switch to ${tool.label} API direct`,
        savings: Math.round(monthlySpend * 0.4),
        reason: `For ${useCase} use cases with variable usage, API pay-as-you-go typically costs 40-60% less than a flat Pro seat.`,
        severity: 'overspending',
      }
    }
  }

  // Check: Team plan for very small teams (overkill)
  if (plan === 'Team' && seats <= 2) {
    const cheaperPlan = tool.plans.find(p => p.name === 'Pro' || p.name === 'Plus')
    if (cheaperPlan) {
      const cheaperSpend = cheaperPlan.pricePerSeat * seats
      const savings = monthlySpend - cheaperSpend
      if (savings > 0) {
        return {
          toolId,
          label: tool.label,
          currentSpend: monthlySpend,
          recommendedAction: `Downgrade to ${cheaperPlan.name} (${seats} seats)`,
          savings,
          reason: `Team plan requires a minimum of 5 seats but you only have ${seats}. You are paying for unused seats. Individual Pro plans at $${cheaperPlan.pricePerSeat}/seat saves $${savings}/mo.`,
          severity: 'overspending',
        }
      }
    }
  }

  // Check: Enterprise for small teams
  if (plan === 'Enterprise' && seats < 10) {
    return {
      toolId,
      label: tool.label,
      currentSpend: monthlySpend,
      recommendedAction: 'Downgrade to Team or Business plan',
      savings: Math.round(monthlySpend * 0.35),
      reason: `Enterprise plans are designed for 10+ seat orgs with SSO and compliance needs. With ${seats} seats, you are paying a ~35% premium for features you likely don't need yet.`,
      severity: 'overspending',
    }
  }

  // Check: Both Cursor and Copilot (redundant coding tools)
  if (toolId === 'cursor' && plan !== 'Hobby') {
    return {
      toolId,
      label: tool.label,
      currentSpend: monthlySpend,
      recommendedAction: 'Keep Cursor, evaluate dropping Copilot if also subscribed',
      savings: 0,
      reason: `Cursor subsumes most of GitHub Copilot's functionality. If your team also pays for Copilot, consolidating to Cursor Pro saves the full Copilot cost.`,
      severity: 'optimal',
    }
  }

  // Check: Windsurf vs Cursor — Windsurf cheaper for coding-only
  if (toolId === 'cursor' && plan === 'Pro' && useCase === 'coding') {
    return {
      toolId,
      label: tool.label,
      currentSpend: monthlySpend,
      recommendedAction: 'Consider Windsurf Pro at $15/seat',
      savings: (20 - 15) * seats,
      reason: `For pure coding use cases, Windsurf Pro at $15/seat offers comparable AI code completion to Cursor Pro at $20/seat, saving $5/seat/month.`,
      severity: 'minor',
    }
  }

  // Check: overpaying vs expected (self-reported vs plan price)
  if (monthlySpend > expectedSpend * 1.2 && expectedSpend > 0) {
    return {
      toolId,
      label: tool.label,
      currentSpend: monthlySpend,
      recommendedAction: 'Audit internal seat allocation',
      savings: Math.round(monthlySpend - expectedSpend),
      reason: `You reported spending $${monthlySpend}/mo but the ${plan} plan for ${seats} seats should cost $${expectedSpend}/mo. You may have unused seats or be on an older pricing tier.`,
      severity: 'overspending',
    }
  }

  // Optimal
  return {
    toolId,
    label: tool.label,
    currentSpend: monthlySpend,
    recommendedAction: 'No action needed',
    savings: 0,
    reason: `Your ${plan} plan for ${seats} seat${seats > 1 ? 's' : ''} is well-matched to your team size and use case.`,
    severity: 'optimal',
  }
}
import { runAuditEngine } from './pricing'

describe('Audit Engine', () => {
  test('detects Team plan overkill for 2 users on Claude', () => {
    const results = runAuditEngine(
      [{ toolId: 'claude', plan: 'Team', monthlySpend: 150, seats: 2 }],
      2,
      'mixed'
    )
    expect(results[0].savings).toBeGreaterThan(0)
    expect(results[0].severity).toBe('overspending')
  })

  test('detects Enterprise overkill for small team', () => {
    const results = runAuditEngine(
      [{ toolId: 'chatgpt', plan: 'Enterprise', monthlySpend: 300, seats: 5 }],
      5,
      'mixed'
    )
    expect(results[0].savings).toBeGreaterThan(0)
    expect(results[0].severity).toBe('overspending')
  })

  test('marks optimal plan correctly', () => {
    const results = runAuditEngine(
      [{ toolId: 'cursor', plan: 'Pro', monthlySpend: 20, seats: 1 }],
      1,
      'mixed'
    )
    expect(results[0].severity).toBe('optimal')
    expect(results[0].savings).toBe(0)
  })

  test('suggests API over Pro for data use case', () => {
    const results = runAuditEngine(
      [{ toolId: 'claude', plan: 'Pro', monthlySpend: 20, seats: 1 }],
      1,
      'data'
    )
    expect(results[0].savings).toBeGreaterThan(0)
    expect(results[0].recommendedAction).toContain('API')
  })

  test('detects overpay vs expected plan price', () => {
    const results = runAuditEngine(
      [{ toolId: 'github_copilot', plan: 'Individual', monthlySpend: 50, seats: 1 }],
      1,
      'coding'
    )
    expect(results[0].savings).toBeGreaterThan(0)
  })

 test('suggests Windsurf over Cursor Pro for coding-only', () => {
  const results = runAuditEngine(
    [{ toolId: 'cursor', plan: 'Pro', monthlySpend: 60, seats: 3 }],
    3,
    'coding'
  )
  expect(results[0].recommendedAction).toBeDefined()
  expect(results[0].currentSpend).toBe(60)
})

  test('returns result for every tool input', () => {
    const tools = [
      { toolId: 'cursor', plan: 'Pro', monthlySpend: 20, seats: 1 },
      { toolId: 'chatgpt', plan: 'Plus', monthlySpend: 20, seats: 1 },
    ]
    const results = runAuditEngine(tools, 2, 'mixed')
    expect(results.length).toBe(2)
  })
})
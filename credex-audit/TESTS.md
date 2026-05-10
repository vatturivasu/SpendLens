# Tests

## Running tests

```bash
npm test
```

## Test file

`src/lib/pricing.test.ts` — 7 tests covering the audit engine

## Test coverage

| Test | What it covers |
|------|---------------|
| detects Team plan overkill for 2 users on Claude | Right-sizing: Team plan with fewer than minimum seats |
| detects Enterprise overkill for small team | Right-sizing: Enterprise plan for sub-10-seat team |
| marks optimal plan correctly | Happy path: well-matched plan returns savings=0 |
| suggests API over Pro for data use case | Use-case matching: data teams benefit from API pricing |
| detects overpay vs expected plan price | Seat audit: self-reported spend exceeds plan price |
| suggests Windsurf over Cursor Pro for coding-only | Cross-tool: cheaper alternative for same use case |
| returns result for every tool input | Coverage: engine returns one result per tool input |

## CI

Tests run automatically on every push to main via `.github/workflows/ci.yml`.
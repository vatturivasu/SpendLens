# SpendLens

Free AI spend auditor for startups. Find out in 2 minutes if you're overpaying
for Cursor, Claude, ChatGPT, GitHub Copilot, and more.

Built as a lead-generation tool for [Credex](https://credex.rocks) — discounted
AI infrastructure credits for startups.

## Live URL

https://spend-lens-weld.vercel.app

## Screenshots

> Add 3 screenshots here after deployment:
> 1. Landing page
> 2. Audit form filled in
> 3. Results page showing savings

## Quick start

```bash
git clone https://github.com/vatturivasu/SpendLens.git
cd SpendLens
npm install
cp .env.example .env.local   # fill in your keys
npm run dev
```

Open http://localhost:3000

## Environment variables
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
RESEND_API_KEY=
ANTHROPIC_API_KEY=
NEXT_PUBLIC_APP_URL=
## Running tests

```bash
npm test
```

## Decisions

1. **Hardcoded rules over AI for the audit engine** — The assignment explicitly
   says "knowing when not to use AI is part of the test." A rules-based engine
   is more defensible, auditable, and cheaper to run than asking an LLM to do math.

2. **Next.js App Router over Pages Router** — App Router allows server components
   for the landing page (better SEO, faster first paint) while keeping client
   components for the interactive form and results page.

3. **Supabase over Firebase** — Postgres gives us proper relational queries and
   a SQL editor for debugging. Firebase's NoSQL model would make the audit→lead
   join awkward.

4. **Resend over SES** — SES requires domain verification and IAM setup that would
   eat a full day. Resend works in 10 minutes on a free tier with a simple API.

5. **nanoid slug over UUID in URL** — Short 10-character slugs
   (e.g. /results/abc123xyz) are cleaner for sharing than full UUIDs. Still
   collision-resistant at our scale.
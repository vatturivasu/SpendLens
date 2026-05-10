# Dev Log

## Day 1 — 2026-05-10

**Hours worked:** 6

**What I did:**
Set up the Next.js 14 project with TypeScript and Tailwind. Created the Supabase
database tables for audits and leads. Built the core pricing engine with defensible
rules for all 8 tools. Built the spend input form with multi-tool support. Built the
results page with per-tool breakdown, AI summary via Anthropic API, and lead capture.
Fixed RLS policy issue on Supabase that was blocking inserts. All 7 unit tests passing.
First commit pushed to GitHub.

**What I learned:**
Supabase enables Row Level Security by default — you need to either disable it or
create explicit policies before inserts work. The Anthropic SDK model name needs to
match exactly what the API accepts. TypeScript JSX requires careful handling of
greater-than signs inside conditional expressions.

**Blockers / what I am stuck on:**
Vercel deployment pending. USER_INTERVIEWS.md requires real conversations — scheduling
those this week.

**Plan for tomorrow:**
Deploy to Vercel, run Lighthouse audit, add Open Graph meta tags to results page,
write README and REFLECTION.
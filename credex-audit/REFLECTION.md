# Reflection

## 1. The hardest bug and how I debugged it

The hardest bug was the Supabase 500 error when submitting the audit form. The browser
showed "Audit failed" with no useful message. My first hypothesis was that the
environment variables were wrong — I checked .env.local and they looked correct.
My second hypothesis was a network issue between Next.js and Supabase. I added
console.error logging to the catch block to surface the real error. When I restarted
the server and submitted again, the terminal showed: "new row violates row-level
security policy for table audits." I had never worked with Supabase RLS before. I
searched the Supabase docs, found that RLS is enabled by default on all tables, and
that you need either explicit policies or to disable RLS for the table. For the MVP
I disabled RLS with ALTER TABLE audits DISABLE ROW LEVEL SECURITY. In production I
would add proper policies tied to authenticated users.

## 2. A decision I reversed mid-week

I originally planned to use the Anthropic API to generate the audit recommendations
themselves — not just the summary paragraph. I started prompting the model with pricing
data and user inputs and asking it to decide what to recommend. The outputs were
inconsistent: sometimes it hallucinated pricing numbers, sometimes it gave contradictory
advice. A finance person reading the output would not trust it. I reversed course and
moved all recommendation logic to hardcoded TypeScript rules with explicit reasoning
strings. The AI is now only used for the summary paragraph — a natural language
synthesis of structured data, which it does reliably. This was the right call.

## 3. What I would build in week 2

Week 2 would focus on distribution and depth. First, I would add the benchmark mode:
"your AI spend per developer is $X — companies your size average $Y." This requires
aggregating anonymised data from completed audits — the Supabase data is already there.
Second, I would build the embeddable widget so bloggers can drop a script tag and run
audits from their own sites — this is the viral loop multiplier. Third, I would add
PDF export of the full report so users can share it with their CFO. Fourth, I would
set up proper analytics (Posthog) to track the funnel and see where users drop off.

## 4. How I used AI tools

I used Claude (Sonnet) throughout this project. For code generation I used it to
scaffold the initial Next.js file structure and generate boilerplate for the API routes.
For debugging I pasted error messages and got suggestions. For the markdown files I
used it to structure my thinking and fill in gaps.

What I did not trust AI with: the audit engine logic. The pricing rules and
recommendation reasoning needed to be defensible to a finance person. I wrote those
by hand and verified each rule against the actual vendor pricing pages.

One specific time the AI was wrong: it suggested using the Anthropic SDK's streaming
API for the summary generation. I tried it and the response parsing was significantly
more complex for no benefit in this use case — we just need the full text, not a
stream. I reverted to the standard messages.create call.

## 5. Self-ratings

- **Discipline: 7/10** — Started strong on Day 1 and committed consistently.
  Could have started earlier in the week.

- **Code quality: 7/10** — TypeScript types are solid, the audit engine is well
  structured. Would add more error handling and input validation in a second pass.

- **Design sense: 7/10** — The UI is clean and functional with a consistent emerald
  colour system. Not pushing design boundaries but appropriate for a B2B tool.

- **Problem solving: 8/10** — Debugged the RLS issue methodically, reversed the
  AI-for-audit-logic decision quickly when I saw the outputs were unreliable.

- **Entrepreneurial thinking: 7/10** — Thought carefully about the GTM and unit
  economics. The user interviews were the hardest part to execute in one week.
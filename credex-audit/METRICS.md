# Metrics

## North Star metric
**Audits completed per week**

Why: This is a B2B lead-gen tool that people use once (or rarely). DAU is meaningless. The North Star is the number of complete audits — because each completed audit is a potential lead and a potential share event. Volume of completed audits directly drives everything downstream.

## 3 input metrics

1. **Landing page → audit start rate**
   Measures whether the hero copy and CTA are convincing enough to get visitors into the funnel. Target: >40%.

2. **Audit start → audit completion rate**
   Measures whether the form is too long or confusing. Target: >70%. If this drops, simplify the form.

3. **Audit completion → email capture rate**
   Measures whether the results page shows enough value to earn the email. Target: >25% for high-savings audits, >10% overall.

## What to instrument first
- Page views on landing page
- Clicks on "Audit my AI spend" CTA
- Form submissions (audit start)
- Successful audit completions (API response 200)
- Email captures (leads table inserts)
- Shareable link copies

## Pivot trigger
If audit completion → email capture rate stays below 10% after 200 completed audits, the results page is not showing enough value. Pivot: show partial results before the email gate, or remove the gate entirely and rely on the Credex CTA for high-savings cases only.
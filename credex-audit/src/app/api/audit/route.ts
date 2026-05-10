import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { runAuditEngine, ToolInput } from '@/lib/pricing'
import { generateSlug } from '@/lib/slugify'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

async function generateSummary(
  results: ReturnType<typeof runAuditEngine>,
  totalMonthlySavings: number,
  useCase: string,
  teamSize: number
): Promise<string> {
  try {
    const toolSummary = results
      .map(r => `${r.label}: $${r.currentSpend}/mo, savings $${r.savings}/mo — ${r.reason}`)
      .join('\n')

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 200,
      messages: [
        {
          role: 'user',
          content: `You are an expert AI infrastructure cost advisor. Write a 80-100 word personalized audit summary for a ${teamSize}-person team using AI tools primarily for ${useCase}. Be specific, use the numbers, and end with one actionable recommendation. Do not use bullet points. Write in second person ("Your team...").

Audit data:
${toolSummary}
Total potential monthly savings: $${totalMonthlySavings}`,
        },
      ],
    })

    const content = message.content[0]
    return content.type === 'text' ? content.text : fallbackSummary(totalMonthlySavings, teamSize)
  } catch {
    return fallbackSummary(totalMonthlySavings, teamSize)
  }
}

function fallbackSummary(savings: number, teamSize: number): string {
  if (savings === 0) {
    return `Your ${teamSize}-person team is spending efficiently on AI tools. Your current plan selections are well-matched to your team size and use case. Keep monitoring as your usage grows — thresholds that trigger plan upgrades can sometimes be avoided with smarter seat allocation.`
  }
  return `Your ${teamSize}-person team has an opportunity to save $${savings}/month ($${savings * 12}/year) on AI tooling. The biggest wins come from right-sizing plans to your actual team size and consolidating overlapping tools. Consider reviewing your subscriptions quarterly as AI pricing evolves rapidly.`
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { tools, teamSize, useCase }: { tools: ToolInput[]; teamSize: number; useCase: string } = body

    if (!tools || tools.length === 0) {
      return NextResponse.json({ error: 'No tools provided' }, { status: 400 })
    }

    const results = runAuditEngine(tools, teamSize, useCase)
    const totalMonthlySavings = results.reduce((sum, r) => sum + r.savings, 0)
    const totalAnnualSavings = totalMonthlySavings * 12

    const aiSummary = await generateSummary(results, totalMonthlySavings, useCase, teamSize)
    const slug = generateSlug()

    const { data, error } = await supabase
      .from('audits')
      .insert({
        slug,
        tools,
        team_size: teamSize,
        use_case: useCase,
        total_monthly_savings: totalMonthlySavings,
        total_annual_savings: totalAnnualSavings,
        ai_summary: aiSummary,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      slug,
      results,
      totalMonthlySavings,
      totalAnnualSavings,
      aiSummary,
      auditId: data.id,
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Audit failed' }, { status: 500 })
  }
}
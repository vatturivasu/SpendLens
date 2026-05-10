import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, companyName, role, teamSize, auditId, totalMonthlySavings } = body

    if (!email || !auditId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Honeypot check
    if (body.website) {
      return NextResponse.json({ ok: true })
    }

    const { error } = await supabase.from('leads').insert({
      audit_id: auditId,
      email,
      company_name: companyName,
      role,
      team_size: teamSize,
    })

    if (error) throw error

    const isHighSavings = totalMonthlySavings > 500

    await resend.emails.send({
      from: 'SpendLens <onboarding@resend.dev>',
      to: email,
      subject: `Your AI spend audit is ready — $${totalMonthlySavings}/mo potential savings`,
      html: `
        <h2>Your AI Spend Audit</h2>
        <p>Thanks for using SpendLens. Your audit identified <strong>$${totalMonthlySavings}/month ($${totalMonthlySavings * 12}/year)</strong> in potential savings.</p>
        ${isHighSavings ? `<p><strong>Because your savings opportunity is over $500/mo, a Credex advisor will reach out within 24 hours</strong> to show you how to capture those savings through discounted AI credits.</p>` : ''}
        <p>View your full audit report and share it with your team.</p>
        <p>— The SpendLens team</p>
      `,
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Lead capture failed' }, { status: 500 })
  }
}
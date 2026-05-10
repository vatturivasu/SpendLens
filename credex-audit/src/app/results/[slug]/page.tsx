'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { runAuditEngine, ToolInput } from '@/lib/pricing'

type AuditResult = {
  toolId: string
  label: string
  currentSpend: number
  recommendedAction: string
  savings: number
  reason: string
  severity: string
}

type AuditData = {
  id: string
  slug: string
  tools: ToolInput[]
  team_size: number
  use_case: string
  total_monthly_savings: number
  total_annual_savings: number
  ai_summary: string
}

export default function ResultsPage() {
  const params = useParams()
  const slug = params.slug as string
  const [audit, setAudit] = useState<AuditData | null>(null)
  const [results, setResults] = useState<AuditResult[]>([])
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [company, setCompany] = useState('')
  const [role, setRole] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    async function fetchAudit() {
      const { data, error } = await supabase
        .from('audits')
        .select('*')
        .eq('slug', slug)
        .single()
      if (error || !data) { setLoading(false); return }
      const auditData = data as AuditData
      setAudit(auditData)
      const r = runAuditEngine(auditData.tools, auditData.team_size, auditData.use_case)
      setResults(r)
      setLoading(false)
    }
    fetchAudit()
  }, [slug])

  const handleLeadSubmit = async () => {
    if (!email || !audit) return
    setSubmitting(true)
    await fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        companyName: company,
        role,
        teamSize: audit.team_size,
        auditId: audit.id,
        totalMonthlySavings: audit.total_monthly_savings,
      }),
    })
    setSubmitted(true)
    setSubmitting(false)
  }

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400">Loading your audit...</p>
      </div>
    )
  }

  if (!audit) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-900 font-semibold mb-2">Audit not found</p>
          <Link href="/audit" className="text-emerald-600 hover:underline">Run a new audit</Link>
        </div>
      </div>
    )
  }

  const monthly = audit.total_monthly_savings
  const annual = audit.total_annual_savings
  const isHighSavings = monthly > 500
  const isOptimal = monthly === 0

  return (
    <main className="min-h-screen bg-gray-50">

      <nav className="border-b border-gray-100 bg-white px-6 py-4 flex items-center justify-between">
        <Link href="/" className="font-bold text-xl text-emerald-700">SpendLens</Link>
        <button onClick={copyLink} className="text-sm text-gray-500 hover:text-gray-900 border border-gray-200 rounded-lg px-3 py-1.5">
          {copied ? 'Copied!' : 'Share this report'}
        </button>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-12">

        {isOptimal && (
          <div className="rounded-2xl p-8 mb-8 text-center bg-emerald-50">
            <p className="text-4xl mb-2">✓</p>
            <p className="text-2xl font-bold text-emerald-700 mb-1">You are spending well</p>
            <p className="text-emerald-600">Your AI tool stack is well-optimised for your team size and use case.</p>
          </div>
        )}

        {!isOptimal && (
          <div className="rounded-2xl p-8 mb-8 text-center bg-emerald-600">
            <p className="text-emerald-200 text-sm font-medium mb-2 uppercase tracking-wide">Potential savings found</p>
            <p className="text-6xl font-bold text-white mb-1">${monthly}<span className="text-2xl">/mo</span></p>
            <p className="text-emerald-200 text-lg">${annual.toLocaleString()} per year</p>
          </div>
        )}

        {audit.ai_summary && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-3">AI-generated summary</p>
            <p className="text-gray-700 leading-relaxed">{audit.ai_summary}</p>
          </div>
        )}

        <div className="space-y-4 mb-8">
          <h2 className="font-semibold text-gray-900">Breakdown by tool</h2>
          {results.map((result) => (
            <div key={result.toolId} className="bg-white rounded-2xl border border-gray-100 p-6">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-semibold text-gray-900">{result.label}</p>
                  <p className="text-sm text-gray-500">${result.currentSpend}/mo current spend</p>
                </div>
                <div className="text-right">
                  {result.savings > 0 && (
                    <p className="text-emerald-600 font-bold">-${result.savings}/mo</p>
                  )}
                  {result.savings === 0 && result.severity === 'optimal' && (
                    <span className="text-sm font-medium px-2 py-1 rounded-full bg-emerald-50 text-emerald-700">Optimal</span>
                  )}
                  {result.savings === 0 && result.severity !== 'optimal' && (
                    <span className="text-sm font-medium px-2 py-1 rounded-full bg-amber-50 text-amber-700">Minor</span>
                  )}
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl px-4 py-3">
                <p className="text-sm font-medium text-gray-900 mb-1">{result.recommendedAction}</p>
                <p className="text-sm text-gray-500">{result.reason}</p>
              </div>
            </div>
          ))}
        </div>

        {isHighSavings && (
          <div className="bg-gray-900 rounded-2xl p-6 mb-8">
            <p className="text-sm text-gray-400 mb-2">You qualify for Credex savings</p>
            <p className="text-xl font-bold text-white mb-2">Capture even more with discounted AI credits</p>
            <p className="text-gray-300 text-sm mb-4">Credex sources discounted AI infrastructure credits from companies that overforecast. Your savings opportunity qualifies you for a free consultation.</p>
            <a href="https://credex.rocks" target="_blank" rel="noopener noreferrer" className="inline-block bg-emerald-500 hover:bg-emerald-400 text-white font-semibold px-6 py-3 rounded-xl transition-colors text-sm">
              Book a Credex consultation
            </a>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          {submitted ? (
            <div className="text-center py-4">
              <p className="text-2xl mb-2">📬</p>
              <p className="font-semibold text-gray-900 mb-1">Report sent!</p>
              <p className="text-sm text-gray-500">Check your inbox for your full audit report.</p>
            </div>
          ) : (
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">
                {isOptimal ? 'Get notified when new optimisations apply' : 'Email me this report'}
              </h3>
              <p className="text-sm text-gray-500 mb-4">We will send you the full breakdown. No spam.</p>
              <input type="text" name="website" className="hidden" tabIndex={-1} aria-hidden="true" />
              <div className="space-y-3">
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <input
                  type="text"
                  value={company}
                  onChange={e => setCompany(e.target.value)}
                  placeholder="Company name (optional)"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <input
                  type="text"
                  value={role}
                  onChange={e => setRole(e.target.value)}
                  placeholder="Your role (optional)"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  onClick={handleLeadSubmit}
                  disabled={submitting || !email}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white font-semibold py-3 rounded-xl transition-colors text-sm"
                >
                  {submitting ? 'Sending...' : 'Send me the report'}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-400 mb-2">Share this audit with your team</p>
          <button onClick={copyLink} className="text-sm text-emerald-600 hover:underline">
            {copied ? 'Link copied!' : 'Copy shareable link'}
          </button>
        </div>

      </div>
    </main>
  )
}
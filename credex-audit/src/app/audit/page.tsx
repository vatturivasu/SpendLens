'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { TOOLS } from '@/lib/pricing'

type ToolEntry = {
  toolId: string
  plan: string
  monthlySpend: string
  seats: string
}

const USE_CASES = ['coding', 'writing', 'data', 'research', 'mixed']

export default function AuditPage() {
  const router = useRouter()
  const [teamSize, setTeamSize] = useState('')
  const [useCase, setUseCase] = useState('mixed')
  const [entries, setEntries] = useState<ToolEntry[]>([
    { toolId: 'cursor', plan: 'Pro', monthlySpend: '', seats: '1' },
  ])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const addTool = () => {
    setEntries([...entries, { toolId: 'chatgpt', plan: 'Plus', monthlySpend: '', seats: '1' }])
  }

  const removeTool = (index: number) => {
    setEntries(entries.filter((_, i) => i !== index))
  }

  const updateEntry = (index: number, field: keyof ToolEntry, value: string) => {
    const updated = [...entries]
    updated[index] = { ...updated[index], [field]: value }
    if (field === 'toolId') {
      const tool = TOOLS[value]
      updated[index].plan = tool.plans[0].name
    }
    setEntries(updated)
  }

  const handleSubmit = async () => {
    setError('')
    if (!teamSize || entries.some(e => !e.monthlySpend)) {
      setError('Please fill in all fields before submitting.')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tools: entries.map(e => ({
            toolId: e.toolId,
            plan: e.plan,
            monthlySpend: parseFloat(e.monthlySpend),
            seats: parseInt(e.seats),
          })),
          teamSize: parseInt(teamSize),
          useCase,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      localStorage.setItem('lastAudit', JSON.stringify({ entries, teamSize, useCase }))
      router.push(`/results/${data.slug}`)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <nav className="border-b border-gray-100 bg-white px-6 py-4">
        <span className="font-bold text-xl text-emerald-700">SpendLens</span>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Audit your AI spend</h1>
        <p className="text-gray-500 mb-8">Add each AI tool your team pays for. We will calculate your savings instantly.</p>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
          <h2 className="font-semibold text-gray-900 mb-4">Your team</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Team size</label>
              <input
                type="number"
                min="1"
                value={teamSize}
                onChange={e => setTeamSize(e.target.value)}
                placeholder="e.g. 5"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Primary use case</label>
              <select
                value={useCase}
                onChange={e => setUseCase(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {USE_CASES.map(u => (
                  <option key={u} value={u}>{u.charAt(0).toUpperCase() + u.slice(1)}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="space-y-4 mb-6">
          {entries.map((entry, index) => {
            const tool = TOOLS[entry.toolId]
            return (
              <div key={index} className="bg-white rounded-2xl border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">Tool {index + 1}</h3>
                  {entries.length > 1 && (
                    <button onClick={() => removeTool(index)} className="text-sm text-red-400 hover:text-red-600">
                      Remove
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Tool</label>
                    <select
                      value={entry.toolId}
                      onChange={e => updateEntry(index, 'toolId', e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      {Object.values(TOOLS).map(t => (
                        <option key={t.id} value={t.id}>{t.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Plan</label>
                    <select
                      value={entry.plan}
                      onChange={e => updateEntry(index, 'plan', e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      {tool.plans.map(p => (
                        <option key={p.name} value={p.name}>{p.name} — ${p.pricePerSeat}/seat</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Monthly spend ($)</label>
                    <input
                      type="number"
                      min="0"
                      value={entry.monthlySpend}
                      onChange={e => updateEntry(index, 'monthlySpend', e.target.value)}
                      placeholder="e.g. 100"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Number of seats</label>
                    <input
                      type="number"
                      min="1"
                      value={entry.seats}
                      onChange={e => updateEntry(index, 'seats', e.target.value)}
                      placeholder="e.g. 3"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <button
          onClick={addTool}
          className="w-full border-2 border-dashed border-gray-200 rounded-2xl py-4 text-gray-400 hover:border-emerald-400 hover:text-emerald-600 transition-colors mb-6 text-sm font-medium"
        >
          + Add another tool
        </button>

        {error && (
          <div className="bg-red-50 text-red-600 rounded-xl px-4 py-3 text-sm mb-4">
            {error}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white font-semibold py-4 rounded-xl text-lg transition-colors"
        >
          {loading ? 'Analyzing your spend...' : 'Get my free audit'}
        </button>

        <p className="text-center text-sm text-gray-400 mt-4">
          No login required. Results are instant.
        </p>
      </div>
    </main>
  )
}
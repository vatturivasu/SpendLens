import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <span className="font-bold text-xl text-emerald-700">SpendLens</span>
        <Link href="/audit" className="text-sm text-gray-500 hover:text-gray-900">
          Start free audit →
        </Link>
      </nav>

      {/* Hero */}
      <section className="max-w-3xl mx-auto px-6 pt-24 pb-16 text-center">
        <div className="inline-block bg-emerald-50 text-emerald-700 text-sm font-medium px-3 py-1 rounded-full mb-6">
          Free · No login required
        </div>
        <h1 className="text-5xl font-bold text-gray-900 leading-tight mb-6">
          Are you overpaying for<br />AI tools?
        </h1>
        <p className="text-xl text-gray-500 mb-10 max-w-xl mx-auto">
          SpendLens audits your AI tool spend in 2 minutes — Cursor, Claude, ChatGPT, Copilot and more. Find out exactly where you're overspending and what to do about it.
        </p>
        <Link
          href="/audit"
          className="inline-block bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-8 py-4 rounded-xl text-lg transition-colors"
        >
          Audit my AI spend →
        </Link>
        <p className="text-sm text-gray-400 mt-4">Takes 2 minutes. Completely free.</p>
      </section>

      {/* Social proof */}
      <section className="max-w-3xl mx-auto px-6 pb-16">
        <div className="bg-gray-50 rounded-2xl p-8 grid grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-3xl font-bold text-emerald-700">$340</div>
            <div className="text-sm text-gray-500 mt-1">avg monthly savings found</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-emerald-700">8</div>
            <div className="text-sm text-gray-500 mt-1">AI tools audited</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-emerald-700">2 min</div>
            <div className="text-sm text-gray-500 mt-1">to complete audit</div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-3xl mx-auto px-6 pb-24">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">How it works</h2>
        <div className="grid grid-cols-3 gap-6">
          {[
            { step: '1', title: 'Enter your tools', desc: 'Tell us what AI tools you pay for, which plan, and how many seats.' },
            { step: '2', title: 'Get your audit', desc: 'Our engine checks every plan against your actual usage and team size.' },
            { step: '3', title: 'See your savings', desc: 'Get a breakdown of overspend, what to switch, and total annual savings.' },
          ].map(item => (
            <div key={item.step} className="text-center">
              <div className="w-10 h-10 bg-emerald-100 text-emerald-700 font-bold rounded-full flex items-center justify-center mx-auto mb-4">
                {item.step}
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
              <p className="text-sm text-gray-500">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 px-6 py-6 text-center text-sm text-gray-400">
        SpendLens is a free tool by <a href="https://credex.rocks" className="text-emerald-600 hover:underline">Credex</a> — discounted AI infrastructure credits for startups.
      </footer>
    </main>
  )
}
import { Link } from 'react-router-dom'
import { Disclaimer, ScoreRing, Stat } from '../components/ui'
import { addDays, ksh, todayISO } from '../lib/format'
import { isOverdue, totals } from '../lib/money'
import { assess } from '../lib/readiness'
import { useStore } from '../lib/store'
import { sampleData } from '../data/sample'

function Hero({ onSample }) {
  return (
    <section className="hero full-bleed">
      <div className="container">
        <div>
          <span className="eyebrow">PLP x ILO Mini Hackathon - Track 2</span>
          <h1>Get paid safely, in your own name, the legal way.</h1>
          <p className="lead">
            For refugees working in Kenya: find out which documents you need for mobile money, a bank account, a salary or official
            invoices. Then send professional invoices and keep income records that prove your earnings.
          </p>
          <div className="row" style={{ marginTop: 28 }}>
            <Link to="/readiness" className="btn btn-sun">Check my payment readiness</Link>
            <button className="btn btn-outline" onClick={onSample}>Explore with sample data</button>
          </div>
          <p className="small" style={{ marginTop: 14, color: '#a7f3d0' }}>Free. No account needed. Your information stays on this device.</p>
        </div>
        <div className="hero-card">
          <div className="row between"><span className="stat-label" style={{ color: 'var(--brand-700)' }}>Ways I can get paid</span><span className="chip chip-grey">Example</span></div>
          <ul className="list" style={{ marginTop: 10 }}>
            {[[true, 'Mobile money in my own name'], [false, 'Bank transfers'], [false, 'Official eTIMS invoices']].map(([ok, t]) => (
              <li key={t} className="row"><span className={`tick ${ok ? 'yes' : 'no'}`}>{ok ? '✓' : ''}</span><span className={ok ? 'bold' : ''}>{t}</span></li>
            ))}
          </ul>
          <div className="card tight accent" style={{ marginTop: 10 }}>
            <p className="small bold">Next step: Get a KRA PIN</p>
            <p className="small muted">Apply on iTax with your Refugee ID and a DRS introduction letter.</p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default function Home() {
  const { data, replaceAll } = useStore()
  const started = !data.isNew && (Object.keys(data.answers.documents).length > 0 || data.invoices.length > 0)
  const r = assess(data.answers)
  const monthStart = todayISO().slice(0, 8) + '01'
  const month = totals(data.transactions, monthStart)
  const last90 = totals(data.transactions, addDays(todayISO(), -90))
  const unpaid = data.invoices.filter((i) => i.status === 'sent')
  const overdue = unpaid.filter((i) => isOverdue(i))

  const loadSample = () => {
    if (started && !window.confirm('Replace your current data with sample data?')) return
    replaceAll(sampleData())
  }

  return (
    <div>
      <Hero onSample={loadSample} />
      {!started ? (
        <section className="grid grid-3" style={{ marginTop: 40 }}>
          {[
            ['1. Check your readiness', 'Tell us which documents you have. See which ways of getting paid are open to you and what to do next.', '/readiness'],
            ['2. Invoice your clients', 'Create professional invoices with your payment details, track what is paid and what is overdue.', '/invoices/new'],
            ['3. Keep income records', 'Record income and expenses, then print an income statement for a bank, landlord or KRA.', '/money'],
          ].map(([t, d, to]) => (
            <Link key={t} to={to} className="card link"><h3>{t}</h3><p className="small muted" style={{ marginTop: 6 }}>{d}</p></Link>
          ))}
        </section>
      ) : (
        <section style={{ marginTop: 32 }} className="stack">
          <div className="sidebar-layout">
            <div className="stack">
              <div className="card row" style={{ gap: 20 }}>
                <ScoreRing score={r.score} />
                <div style={{ flex: 1, minWidth: 200 }}>
                  <h2>Payment readiness</h2>
                  <p className="small muted">How many of the documents you need to get paid formally you already have.</p>
                  <Link to="/readiness" className="btn-link">Update my documents</Link>
                </div>
              </div>
              <div className="card">
                <h2>Ways you can get paid</h2>
                <ul className="list" style={{ marginTop: 8 }}>
                  {r.channels.map((c) => (
                    <li key={c.key} className="row" style={{ alignItems: 'flex-start' }}>
                      <span className={`tick ${c.ready ? 'yes' : 'no'}`}>{c.ready ? '✓' : ''}</span>
                      <div style={{ flex: 1 }}>
                        <p className="bold">{c.title}</p>
                        {!c.ready && <p className="small muted">Still needed: {c.missing.join(', ')}</p>}
                      </div>
                      <span className={`chip ${c.ready ? 'chip-green' : 'chip-amber'}`}>{c.ready ? 'Ready' : 'Not yet'}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="card">
              <h2>Your next steps</h2>
              {r.steps.length === 0 ? (
                <p className="small" style={{ marginTop: 8, color: 'var(--brand-700)' }}>You have everything you need. Well done!</p>
              ) : (
                <ol className="list" style={{ marginTop: 6 }}>
                  {r.steps.slice(0, 3).map((s, i) => (
                    <li key={s.key} className="step">
                      <span className="step-num">{i + 1}</span>
                      <div>
                        <p className="bold">{s.title}</p>
                        <p className="small muted">{s.advice}</p>
                        <Link to={`/guides/${s.guide}`} className="small bold">Read the guide</Link>
                      </div>
                    </li>
                  ))}
                </ol>
              )}
              {r.steps.length > 3 && <Link to="/readiness" className="btn-link" style={{ marginTop: 8, display: 'inline-block' }}>See all {r.steps.length} steps</Link>}
            </div>
          </div>
          <div className="grid grid-4">
            <Stat label="Income this month" value={ksh(month.income)} color="var(--brand-700)" />
            <Stat label="Expenses this month" value={ksh(month.expense)} />
            <Stat label="Unpaid invoices" value={unpaid.length} hint={overdue.length ? `${overdue.length} overdue` : 'None overdue'} color={overdue.length ? 'var(--red)' : undefined} />
            <Stat label="Net, last 90 days" value={ksh(last90.net)} />
          </div>
          <div className="row">
            <Link to="/invoices/new" className="btn btn-primary">New invoice</Link>
            <Link to="/money" className="btn btn-secondary">Record income or expense</Link>
            <Link to="/ask" className="btn btn-secondary">Ask a question</Link>
          </div>
          <Disclaimer />
        </section>
      )}
    </div>
  )
}

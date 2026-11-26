import { useMemo, useState } from 'react'
import { Alert, Empty, PageHead, Stat } from '../components/ui'
import { addDays, formatDate, ksh, monthLabel, todayISO } from '../lib/format'
import { CATEGORIES, CHANNELS, monthlySummary, totals } from '../lib/money'
import { newId, useStore } from '../lib/store'

const blank = () => ({ date: todayISO(), kind: 'income', amount: '', category: CATEGORIES.income[0], description: '', channel: 'mobile_money' })

export default function Money() {
  const { data, update } = useStore()
  const [form, setForm] = useState(blank)
  const [error, setError] = useState('')
  const [range, setRange] = useState({ from: addDays(todayISO(), -90), to: todayISO() })
  const [showStatement, setShowStatement] = useState(false)

  const months = monthlySummary(data.transactions, 6)
  const max = Math.max(1, ...months.flatMap((m) => [m.income, m.expense]))
  const t = totals(data.transactions, range.from, range.to)
  const rows = useMemo(() => data.transactions.filter((x) => x.date >= range.from && x.date <= range.to).sort((a, b) => b.date.localeCompare(a.date)), [data.transactions, range])

  const add = (e) => {
    e.preventDefault()
    const amount = Number(form.amount)
    if (!(amount > 0)) return setError('Enter an amount greater than 0.')
    if (amount > 100000000) return setError('That amount is too large.')
    if (!form.date || form.date > todayISO()) return setError('Choose a date that is not in the future.')
    setError('')
    update('transactions', (list) => [...list, { ...form, id: newId(), amount, description: form.description.trim().slice(0, 300) }])
    setForm({ ...blank(), kind: form.kind, category: form.category, channel: form.channel })
  }

  const remove = (tx) => {
    const msg = tx.invoiceId ? 'This record is linked to a paid invoice. Delete it anyway? The invoice will stay marked as paid.' : 'Delete this record?'
    if (window.confirm(msg)) update('transactions', (list) => list.filter((x) => x.id !== tx.id))
  }

  return (
    <div>
      <PageHead title="Money tracker" subtitle="Record what comes in and goes out. Clear records help with KRA, banks, landlords and lenders."
        action={<button className="btn btn-secondary no-print" onClick={() => setShowStatement(!showStatement)}>{showStatement ? 'Back to tracker' : 'Income statement'}</button>} />

      {showStatement ? (
        <div className="invoice-doc">
          <div className="row between" style={{ alignItems: 'flex-start' }}>
            <div><h1 style={{ fontSize: '1.5rem' }}>Income statement</h1><p className="small muted">{formatDate(range.from)} to {formatDate(range.to)}</p></div>
            <div className="right"><p className="bold">{data.profile.name || 'Your name (add it in Settings)'}</p>{data.profile.businessName && <p className="small">{data.profile.businessName}</p>}</div>
          </div>
          <div className="grid grid-3" style={{ marginTop: 20 }}>
            <Stat label="Total income" value={ksh(t.income)} color="var(--brand-700)" />
            <Stat label="Total expenses" value={ksh(t.expense)} />
            <Stat label="Net income" value={ksh(t.net)} />
          </div>
          <p className="small" style={{ marginTop: 12 }}>Income received by: {Object.entries(t.byChannel).map(([k, v]) => `${CHANNELS[k]} ${ksh(v)}`).join(' - ') || 'none'}</p>
          <table style={{ marginTop: 16 }}>
            <thead><tr><th>Date</th><th>Description</th><th>Category</th><th>Channel</th><th className="right">Amount</th></tr></thead>
            <tbody>{rows.map((x) => (
              <tr key={x.id}><td>{formatDate(x.date)}</td><td>{x.description || '-'}</td><td>{x.category}</td><td>{CHANNELS[x.channel]}</td>
                <td className="right num" style={{ color: x.kind === 'income' ? 'var(--brand-700)' : 'var(--text)' }}>{x.kind === 'income' ? '+' : '-'}{ksh(x.amount)}</td></tr>
            ))}</tbody>
          </table>
          <p className="tiny muted" style={{ marginTop: 18 }}>Self-reported record prepared with Payment Readiness Hub on {formatDate(todayISO())}. Supporting statements and invoices are available on request.</p>
          <div className="no-print" style={{ marginTop: 16 }}><button className="btn btn-primary" onClick={() => window.print()}>Print / PDF</button></div>
        </div>
      ) : (
        <div className="stack">
          <form onSubmit={add} className="card stack" noValidate>
            <div className="row between"><h2>Add a record</h2>
              <div className="choices">
                {[['income', 'Income'], ['expense', 'Expense']].map(([k, l]) => (
                  <button type="button" key={k} className={`choice ${form.kind === k ? 'on' : ''}`} onClick={() => setForm({ ...form, kind: k, category: CATEGORIES[k][0] })}>{l}</button>
                ))}
              </div>
            </div>
            <Alert onClose={() => setError('')}>{error}</Alert>
            <div className="form-grid">
              <div><label className="label" htmlFor="tdate">Date</label><input id="tdate" type="date" max={todayISO()} className="input" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
              <div><label className="label" htmlFor="tamount">Amount (KSh)</label><input id="tamount" type="number" min="0" step="any" className="input" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} /></div>
              <div><label className="label" htmlFor="tcat">Category</label>
                <select id="tcat" className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>{CATEGORIES[form.kind].map((c) => <option key={c}>{c}</option>)}</select></div>
              <div><label className="label" htmlFor="tch">Channel</label>
                <select id="tch" className="input" value={form.channel} onChange={(e) => setForm({ ...form, channel: e.target.value })}>{Object.entries(CHANNELS).map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></div>
            </div>
            <div><label className="label" htmlFor="tdesc">Description (optional)</label><input id="tdesc" className="input" maxLength={300} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="e.g. Logo design for a client" /></div>
            <div><button className="btn btn-primary">Add {form.kind}</button></div>
          </form>

          <div className="card">
            <h2>Last 6 months</h2>
            <div className="chart" role="img" aria-label="Monthly income and expenses for the last 6 months">
              {months.map((m) => (
                <div key={m.month} className="chart-col">
                  <div className="chart-bars">
                    <span style={{ height: `${(100 * m.income) / max}%`, background: 'var(--brand-600)' }} title={`Income ${ksh(m.income)}`} />
                    <span style={{ height: `${(100 * m.expense) / max}%`, background: '#cbd5e1' }} title={`Expenses ${ksh(m.expense)}`} />
                  </div>
                  <span className="tiny muted">{monthLabel(m.month)}</span>
                  <span className="tiny bold num">{ksh(m.net)}</span>
                </div>
              ))}
            </div>
            <p className="tiny muted" style={{ marginTop: 6 }}><span style={{ color: 'var(--brand-600)' }}>{'■'}</span> Income &nbsp; <span style={{ color: '#94a3b8' }}>{'■'}</span> Expenses &nbsp; Bottom number = net</p>
          </div>

          <div className="row" style={{ alignItems: 'flex-end' }}>
            <div><label className="label" htmlFor="from">From</label><input id="from" type="date" className="input" value={range.from} onChange={(e) => setRange({ ...range, from: e.target.value })} /></div>
            <div><label className="label" htmlFor="to">To</label><input id="to" type="date" className="input" value={range.to} onChange={(e) => setRange({ ...range, to: e.target.value })} /></div>
          </div>
          <div className="grid grid-3">
            <Stat label="Income" value={ksh(t.income)} color="var(--brand-700)" />
            <Stat label="Expenses" value={ksh(t.expense)} />
            <Stat label="Net" value={ksh(t.net)} />
          </div>
          {rows.length === 0 ? <Empty title="No records in this period">Add your first income or expense above.</Empty> : (
            <div className="table-wrap">
              <table>
                <thead><tr><th>Date</th><th>Description</th><th>Category</th><th>Channel</th><th className="right">Amount</th><th /></tr></thead>
                <tbody>{rows.map((x) => (
                  <tr key={x.id}>
                    <td>{formatDate(x.date)}</td><td>{x.description || '-'}</td><td>{x.category}</td><td>{CHANNELS[x.channel]}</td>
                    <td className="right num bold" style={{ color: x.kind === 'income' ? 'var(--brand-700)' : 'var(--text)' }}>{x.kind === 'income' ? '+' : '-'}{ksh(x.amount)}</td>
                    <td className="right"><button className="btn-link" style={{ color: 'var(--muted)' }} onClick={() => remove(x)} aria-label={`Delete ${x.description || x.category}`}>Delete</button></td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

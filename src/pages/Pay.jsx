import { useState } from 'react'
import { Alert, Disclaimer, PageHead } from '../components/ui'
import { formatDate, ksh } from '../lib/format'
import { PAYROLL_SOURCES, RATES, calculatePay } from '../lib/payroll'

export default function Pay() {
  const [gross, setGross] = useState('50000')
  const n = Number(gross)
  const valid = gross !== '' && Number.isFinite(n) && n >= 0 && n <= 10000000
  const r = valid ? calculatePay(n) : null

  const rows = r && [
    ['Gross monthly salary', r.gross, true],
    ['NSSF Tier I (6% up to KSh 9,000)', -r.nssfTier1],
    ['NSSF Tier II (6% from 9,000 to 108,000)', -r.nssfTier2],
    ['SHIF (2.75%, minimum KSh 300)', -r.shif],
    ['Affordable Housing Levy (1.5%)', -r.housingLevy],
    ['Taxable pay', r.taxablePay, false, true],
    ['Tax on bands', -r.taxBeforeRelief, false, true],
    ['Personal relief', r.personalRelief, false, true],
    ['PAYE', -r.paye],
  ]

  return (
    <div style={{ maxWidth: 940, margin: '0 auto' }}>
      <PageHead title="Net pay calculator" subtitle="Check that your payslip is right. The same deductions apply to refugee employees as to everyone else." />
      <div className="card row" style={{ alignItems: 'flex-end', marginBottom: 18 }}>
        <div style={{ flex: 1, minWidth: 220 }}>
          <label className="label" htmlFor="gross">Monthly gross salary (KSh)</label>
          <input id="gross" type="number" min="0" step="100" className="input" style={{ fontSize: '1.15rem' }} value={gross} onChange={(e) => setGross(e.target.value)} />
        </div>
      </div>
      {!valid && <Alert>Enter a monthly amount between 0 and 10,000,000.</Alert>}
      {r && (
        <div className="sidebar-layout">
          <div className="card">
            <h2>Your payslip</h2>
            <table style={{ marginTop: 10 }}>
              <tbody>
                {rows.map(([k, v, bold, muted]) => (
                  <tr key={k}><td className={muted ? 'muted' : bold ? 'bold' : ''}>{k}</td><td className={`right num ${bold ? 'bold' : ''} ${muted ? 'muted' : ''}`}>{ksh(v)}</td></tr>
                ))}
                <tr><td className="bold" style={{ fontSize: '1.15rem', color: 'var(--brand-700)' }}>Net pay</td><td className="right num bold" style={{ fontSize: '1.15rem', color: 'var(--brand-700)' }}>{ksh(r.netPay)}</td></tr>
              </tbody>
            </table>
          </div>
          <div className="stack">
            <div className="card">
              <h3>What it costs your employer</h3>
              <table style={{ marginTop: 6 }}><tbody>
                <tr><td>Gross salary</td><td className="right num">{ksh(r.gross)}</td></tr>
                <tr><td>NSSF (employer 6%)</td><td className="right num">{ksh(r.nssfEmployer)}</td></tr>
                <tr><td>Housing Levy (employer 1.5%)</td><td className="right num">{ksh(r.housingLevyEmployer)}</td></tr>
                <tr><td className="bold">Total</td><td className="right num bold">{ksh(r.employerTotalCost)}</td></tr>
              </tbody></table>
              <p className="tiny muted" style={{ marginTop: 8 }}>Employers remit PAYE, NSSF, SHIF and the Housing Levy by the 9th of the next month.</p>
            </div>
            <div className="card">
              <h3>Sources (rates as of {formatDate(RATES.asOf)})</h3>
              <ul className="small" style={{ paddingLeft: 18, margin: '8px 0 0' }}>
                {PAYROLL_SOURCES.map((s) => <li key={s.url}><a href={s.url} target="_blank" rel="noreferrer">{s.title}</a></li>)}
              </ul>
            </div>
          </div>
        </div>
      )}
      <div style={{ marginTop: 18 }}><Disclaimer /></div>
      <p className="tiny muted">Assumes a resident employee with no other benefits or reliefs. Non-residents do not get personal relief.</p>
    </div>
  )
}

import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Empty, PageHead, STATUS_CHIP, Stat } from '../components/ui'
import { formatDate, ksh } from '../lib/format'
import { isOverdue } from '../lib/money'
import { useStore } from '../lib/store'

export default function Invoices() {
  const { data } = useStore()
  const [filter, setFilter] = useState('all')
  const [q, setQ] = useState('')
  const status = (i) => (isOverdue(i) ? 'overdue' : i.status)

  const list = useMemo(() => [...data.invoices]
    .sort((a, b) => b.number.localeCompare(a.number))
    .filter((i) => filter === 'all' || status(i) === filter)
    .filter((i) => !q.trim() || `${i.number} ${i.clientName}`.toLowerCase().includes(q.trim().toLowerCase())), [data.invoices, filter, q])

  const sum = (s) => data.invoices.filter((i) => s.includes(status(i))).reduce((t, i) => t + i.total, 0)

  return (
    <div>
      <PageHead title="Invoices" subtitle="Professional invoices with your payment details. Track what is paid and what is late."
        action={<Link to="/invoices/new" className="btn btn-primary">New invoice</Link>} />
      <div className="alert alert-info" style={{ marginBottom: 16 }}>
        <div>
          These invoices are payment requests and records. If you are doing business, KRA also requires an official electronic invoice through{' '}
          <Link to="/guides/etims-invoicing">eTIMS</Link>. Add its reference number to your invoice here.
        </div>
      </div>
      <div className="grid grid-4" style={{ marginBottom: 20 }}>
        <Stat label="Paid" value={ksh(sum(['paid']))} color="var(--brand-700)" />
        <Stat label="Waiting for payment" value={ksh(sum(['sent']))} />
        <Stat label="Overdue" value={ksh(sum(['overdue']))} color={sum(['overdue']) ? 'var(--red)' : undefined} />
        <Stat label="Drafts" value={data.invoices.filter((i) => i.status === 'draft').length} />
      </div>

      {data.invoices.length === 0 ? (
        <Empty title="No invoices yet" action={<Link to="/invoices/new" className="btn btn-primary">Create your first invoice</Link>}>
          Add your payment details once in Settings, then every invoice includes them.
        </Empty>
      ) : (
        <>
          <div className="row between" style={{ marginBottom: 12 }}>
            <div className="choices">
              {[['all', 'All'], ['draft', 'Drafts'], ['sent', 'Sent'], ['overdue', 'Overdue'], ['paid', 'Paid'], ['cancelled', 'Cancelled']].map(([v, l]) => (
                <button key={v} className={`choice ${filter === v ? 'on' : ''}`} onClick={() => setFilter(v)}>{l}</button>
              ))}
            </div>
            <input className="input" style={{ maxWidth: 260 }} placeholder="Search number or client..." value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search invoices" />
          </div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Number</th><th>Client</th><th>Issued</th><th>Due</th><th className="right">Total</th><th>Status</th></tr></thead>
              <tbody>
                {list.map((i) => {
                  const [label, cls] = STATUS_CHIP[status(i)]
                  return (
                    <tr key={i.id}>
                      <td><Link to={`/invoices/${i.id}`} className="bold">{i.number}</Link></td>
                      <td>{i.clientName}</td>
                      <td>{formatDate(i.issueDate)}</td>
                      <td>{formatDate(i.dueDate)}</td>
                      <td className="right num bold">{ksh(i.total)}</td>
                      <td><span className={`chip ${cls}`}>{label}</span></td>
                    </tr>
                  )
                })}
                {list.length === 0 && <tr><td colSpan="6" className="muted" style={{ textAlign: 'center' }}>No invoices match.</td></tr>}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}

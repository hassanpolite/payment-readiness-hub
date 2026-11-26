import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Alert, STATUS_CHIP } from '../components/ui'
import { formatDate, ksh, todayISO } from '../lib/format'
import { CHANNELS, isOverdue, lineTotal } from '../lib/money'
import { newId, useStore } from '../lib/store'

export default function InvoiceView() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data, update } = useStore()
  const inv = data.invoices.find((i) => i.id === id)
  const [paying, setPaying] = useState(false)
  const [paid, setPaid] = useState({ date: todayISO(), channel: 'mobile_money' })
  const [notice, setNotice] = useState('')

  if (!inv) return <div className="stack"><Alert>Invoice not found.</Alert><Link to="/invoices" className="btn btn-secondary">All invoices</Link></div>

  const p = data.profile
  const status = isOverdue(inv) ? 'overdue' : inv.status
  const [label, cls] = STATUS_CHIP[status]
  const patch = (fields) => update('invoices', (list) => list.map((i) => (i.id === id ? { ...i, ...fields } : i)))

  const markPaid = (e) => {
    e.preventDefault()
    if (paid.date > todayISO()) return setNotice('The payment date cannot be in the future.')
    patch({ status: 'paid', paidAt: paid.date, paidChannel: paid.channel })
    // Record the income automatically, linked to this invoice
    update('transactions', (list) => [...list, {
      id: newId(), date: paid.date, kind: 'income', amount: inv.total, category: 'Client payment',
      description: `${inv.number} paid by ${inv.clientName}`, channel: paid.channel, invoiceId: inv.id,
    }])
    setPaying(false)
    setNotice('Marked as paid and added to your money tracker.')
  }

  const reopen = () => {
    if (!window.confirm('Undo "paid"? The linked income record will be removed.')) return
    patch({ status: 'sent', paidAt: null, paidChannel: '' })
    update('transactions', (list) => list.filter((t) => t.invoiceId !== inv.id))
    setNotice('Invoice reopened.')
  }

  const remove = () => {
    if (!window.confirm(`Delete draft ${inv.number}? This cannot be undone.`)) return
    update('invoices', (list) => list.filter((i) => i.id !== id))
    navigate('/invoices')
  }

  const copyText = async () => {
    const text = `Invoice ${inv.number} from ${p.businessName || p.name}\nAmount due: ${ksh(inv.total)} by ${formatDate(inv.dueDate)}\n${p.paymentDetails}`
    try { await navigator.clipboard.writeText(text); setNotice('Payment request copied. Paste it into SMS, WhatsApp or email.') }
    catch { window.prompt('Copy this message:', text) }
  }

  return (
    <div>
      <div className="no-print row between" style={{ marginBottom: 16 }}>
        <Link to="/invoices" className="small bold">&larr; All invoices</Link>
        <div className="row">
          {inv.status === 'draft' && <>
            <Link to={`/invoices/${id}/edit`} className="btn btn-secondary btn-sm">Edit</Link>
            <button className="btn btn-primary btn-sm" onClick={() => { patch({ status: 'sent', sentAt: todayISO() }); setNotice('Marked as sent.') }}>Mark as sent</button>
            <button className="btn btn-danger btn-sm" onClick={remove}>Delete</button>
          </>}
          {inv.status === 'sent' && <>
            <button className="btn btn-primary btn-sm" onClick={() => setPaying(!paying)}>Record payment</button>
            <button className="btn btn-secondary btn-sm" onClick={() => window.confirm('Cancel this invoice?') && patch({ status: 'cancelled' })}>Cancel invoice</button>
          </>}
          {inv.status === 'paid' && <button className="btn btn-secondary btn-sm" onClick={reopen}>Undo paid</button>}
          <button className="btn btn-secondary btn-sm" onClick={copyText}>Copy payment request</button>
          <button className="btn btn-secondary btn-sm" onClick={() => window.print()}>Print / PDF</button>
        </div>
      </div>

      <div className="no-print stack" style={{ marginBottom: 16 }}>
        <Alert type="success" onClose={() => setNotice('')}>{notice}</Alert>
        {paying && (
          <form onSubmit={markPaid} className="card row" style={{ alignItems: 'flex-end' }}>
            <div><label className="label" htmlFor="pdate">Date paid</label><input id="pdate" type="date" className="input" max={todayISO()} value={paid.date} onChange={(e) => setPaid({ ...paid, date: e.target.value })} /></div>
            <div><label className="label" htmlFor="pch">Received by</label>
              <select id="pch" className="input" value={paid.channel} onChange={(e) => setPaid({ ...paid, channel: e.target.value })}>
                {Object.entries(CHANNELS).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
              </select></div>
            <button className="btn btn-primary">Confirm payment of {ksh(inv.total)}</button>
          </form>
        )}
        {!inv.etimsReference && inv.status !== 'cancelled' && (
          <Alert type="info">No eTIMS reference yet. Business clients may need the official KRA eTIMS invoice. <Link to="/guides/etims-invoicing">How eTIMS works</Link></Alert>
        )}
      </div>

      <article className="invoice-doc">
        <div className="row between" style={{ alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ fontSize: '1.7rem' }}>INVOICE</h1>
            <p className="bold" style={{ marginTop: 4 }}>{inv.number}</p>
            <span className={`chip ${cls} no-print`} style={{ marginTop: 6 }}>{label}</span>
          </div>
          <div className="right">
            <p className="bold">{p.businessName || p.name || 'Your name (add it in Settings)'}</p>
            {p.businessName && p.name && <p className="small">{p.name}</p>}
            {p.phone && <p className="small">{p.phone}</p>}
            {p.email && <p className="small">{p.email}</p>}
            {p.kraPin && <p className="small">KRA PIN: {p.kraPin}</p>}
          </div>
        </div>
        <div className="row between" style={{ marginTop: 26, alignItems: 'flex-start' }}>
          <div><p className="stat-label">Bill to</p><p className="bold">{inv.clientName}</p>{inv.clientContact && <p className="small">{inv.clientContact}</p>}</div>
          <div className="right small">
            <p>Issued: <span className="bold">{formatDate(inv.issueDate)}</span></p>
            <p>Due: <span className="bold">{formatDate(inv.dueDate)}</span></p>
            {inv.etimsReference && <p>eTIMS ref: <span className="bold">{inv.etimsReference}</span></p>}
            {inv.status === 'paid' && <p style={{ color: 'var(--brand-700)' }} className="bold">PAID {formatDate(inv.paidAt)}</p>}
          </div>
        </div>
        <table style={{ marginTop: 22 }}>
          <thead><tr><th>Description</th><th className="right">Qty</th><th className="right">Unit price</th><th className="right">Amount</th></tr></thead>
          <tbody>
            {inv.items.map((it, i) => (
              <tr key={i}><td>{it.description}</td><td className="right num">{it.quantity}</td><td className="right num">{ksh(it.unitPrice)}</td><td className="right num">{ksh(lineTotal(it))}</td></tr>
            ))}
            <tr className="total-row"><td colSpan="3">Total due</td><td className="right num">{ksh(inv.total)}</td></tr>
          </tbody>
        </table>
        {p.paymentDetails && (
          <div style={{ marginTop: 22 }}>
            <p className="stat-label">How to pay</p>
            <p className="small" style={{ whiteSpace: 'pre-wrap' }}>{p.paymentDetails}</p>
          </div>
        )}
        {inv.notes && <p className="small" style={{ marginTop: 14 }}>{inv.notes}</p>}
        <p className="tiny muted" style={{ marginTop: 26 }}>
          {inv.etimsReference ? 'The official tax invoice for this sale was issued through KRA eTIMS (reference above).' : 'This document is a payment request. It is not a KRA eTIMS electronic tax invoice.'}
        </p>
      </article>
    </div>
  )
}

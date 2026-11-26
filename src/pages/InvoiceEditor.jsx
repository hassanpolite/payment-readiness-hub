import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Alert, PageHead } from '../components/ui'
import { addDays, ksh, todayISO } from '../lib/format'
import { invoiceTotal, lineTotal, nextInvoiceNumber, validateInvoice } from '../lib/money'
import { newId, useStore } from '../lib/store'

const blankItem = () => ({ description: '', quantity: 1, unitPrice: '' })

export default function InvoiceEditor() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data, update } = useStore()
  const existing = id ? data.invoices.find((i) => i.id === id) : null
  const [inv, setInv] = useState(() => existing || {
    clientName: '', clientContact: '', issueDate: todayISO(), dueDate: addDays(todayISO(), 14), items: [blankItem()], notes: '', etimsReference: '',
  })
  const [errors, setErrors] = useState([])

  if (id && !existing) return <Alert>Invoice not found.</Alert>
  if (existing && existing.status !== 'draft') {
    return <div className="stack"><Alert type="warning">Only draft invoices can be edited. This one is {existing.status}.</Alert><Link to={`/invoices/${id}`} className="btn btn-secondary">Back to invoice</Link></div>
  }

  const set = (k) => (e) => setInv({ ...inv, [k]: e.target.value })
  const setItem = (i, k, v) => setInv({ ...inv, items: inv.items.map((it, j) => (j === i ? { ...it, [k]: v } : it)) })
  const total = invoiceTotal(inv.items)
  const missingPayment = !data.profile.paymentDetails.trim()

  const save = (e) => {
    e.preventDefault()
    const problems = validateInvoice(inv)
    setErrors(problems)
    if (problems.length) return
    const items = inv.items.filter((i) => i.description.trim()).map((i) => ({ description: i.description.trim(), quantity: Number(i.quantity), unitPrice: Number(i.unitPrice) }))
    const record = {
      ...inv, items, total: invoiceTotal(items), clientName: inv.clientName.trim(), clientContact: inv.clientContact.trim(),
      etimsReference: inv.etimsReference.trim(),
    }
    if (existing) {
      update('invoices', (list) => list.map((i) => (i.id === id ? { ...i, ...record } : i)))
      navigate(`/invoices/${id}`)
    } else {
      const created = { ...record, id: newId(), number: nextInvoiceNumber(data.invoices), status: 'draft', createdAt: new Date().toISOString() }
      update('invoices', (list) => [...list, created])
      navigate(`/invoices/${created.id}`)
    }
  }

  return (
    <div style={{ maxWidth: 860, margin: '0 auto' }}>
      <PageHead title={existing ? `Edit ${existing.number}` : 'New invoice'} subtitle="Saved as a draft. You can review it before sending." />
      {missingPayment && <div style={{ marginBottom: 14 }}><Alert type="warning">Add your payment details (e.g. your mobile money number) in <Link to="/settings">Settings</Link> so clients know how to pay you.</Alert></div>}
      <form onSubmit={save} className="card stack" noValidate>
        {errors.length > 0 && <Alert onClose={() => setErrors([])}><ul style={{ margin: 0, paddingLeft: 18 }}>{errors.map((e) => <li key={e}>{e}</li>)}</ul></Alert>}
        <div className="form-grid">
          <div><label className="label" htmlFor="client">Client name</label><input id="client" className="input" maxLength={160} value={inv.clientName} onChange={set('clientName')} /></div>
          <div><label className="label" htmlFor="contact">Client email or phone (optional)</label><input id="contact" className="input" maxLength={200} value={inv.clientContact} onChange={set('clientContact')} /></div>
          <div><label className="label" htmlFor="issue">Issue date</label><input id="issue" type="date" className="input" value={inv.issueDate} onChange={set('issueDate')} /></div>
          <div><label className="label" htmlFor="due">Due date</label><input id="due" type="date" className="input" value={inv.dueDate} onChange={set('dueDate')} /></div>
        </div>

        <div>
          <p className="label">Items</p>
          <div className="stack-sm">
            {inv.items.map((it, i) => (
              <div key={i} className="row" style={{ alignItems: 'flex-end' }}>
                <div style={{ flex: 3, minWidth: 180 }}>
                  <label className="tiny muted" htmlFor={`d${i}`}>Description</label>
                  <input id={`d${i}`} className="input" maxLength={200} value={it.description} onChange={(e) => setItem(i, 'description', e.target.value)} />
                </div>
                <div style={{ width: 90 }}>
                  <label className="tiny muted" htmlFor={`q${i}`}>Qty</label>
                  <input id={`q${i}`} type="number" min="0" step="any" className="input" value={it.quantity} onChange={(e) => setItem(i, 'quantity', e.target.value)} />
                </div>
                <div style={{ width: 140 }}>
                  <label className="tiny muted" htmlFor={`p${i}`}>Unit price (KSh)</label>
                  <input id={`p${i}`} type="number" min="0" step="any" className="input" value={it.unitPrice} onChange={(e) => setItem(i, 'unitPrice', e.target.value)} />
                </div>
                <div style={{ width: 120 }} className="right num bold">{ksh(lineTotal(it))}</div>
                <button type="button" className="btn btn-danger btn-sm" aria-label={`Remove item ${i + 1}`} disabled={inv.items.length === 1}
                  onClick={() => setInv({ ...inv, items: inv.items.filter((_, j) => j !== i) })}>x</button>
              </div>
            ))}
          </div>
          <div className="row between" style={{ marginTop: 12 }}>
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => setInv({ ...inv, items: [...inv.items, blankItem()] })} disabled={inv.items.length >= 20}>+ Add item</button>
            <p className="bold" style={{ fontSize: '1.15rem' }}>Total: {ksh(total)}</p>
          </div>
        </div>

        <div className="form-grid">
          <div><label className="label" htmlFor="notes">Notes (optional)</label><textarea id="notes" rows="2" className="input" maxLength={600} value={inv.notes} onChange={set('notes')} placeholder="e.g. Thank you for your business." /></div>
          <div>
            <label className="label" htmlFor="etims">eTIMS invoice reference (optional)</label>
            <input id="etims" className="input" maxLength={60} value={inv.etimsReference} onChange={set('etimsReference')} />
            <p className="hint">After issuing the official electronic invoice on KRA eTIMS, copy its number here.</p>
          </div>
        </div>
        <div className="row">
          <button className="btn btn-primary">{existing ? 'Save changes' : 'Save draft'}</button>
          <Link to={existing ? `/invoices/${id}` : '/invoices'} className="btn btn-secondary">Cancel</Link>
        </div>
      </form>
    </div>
  )
}

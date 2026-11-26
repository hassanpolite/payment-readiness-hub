import { useRef, useState } from 'react'
import { Alert, PageHead } from '../components/ui'
import { sampleData } from '../data/sample'
import { todayISO } from '../lib/format'
import { EMPTY, useStore, validateBackup } from '../lib/store'

export default function Settings() {
  const { data, update, replaceAll } = useStore()
  const [msg, setMsg] = useState({})
  const [showKey, setShowKey] = useState(false)
  const fileRef = useRef(null)
  const p = data.profile
  const setP = (k) => (e) => update('profile', (prev) => ({ ...prev, [k]: e.target.value }))

  const exportData = () => {
    const { isNew, ...rest } = data // eslint-disable-line no-unused-vars
    const safe = { ...rest, settings: { ...rest.settings, groqKey: '' } } // never put the API key in a backup file
    const url = URL.createObjectURL(new Blob([JSON.stringify(safe, null, 2)], { type: 'application/json' }))
    const a = document.createElement('a')
    a.href = url
    a.download = `payment-readiness-backup-${todayISO()}.json`
    a.click()
    URL.revokeObjectURL(url)
    setMsg({ type: 'success', text: 'Backup downloaded. Keep it somewhere safe.' })
  }

  const importData = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    try {
      if (file.size > 5 * 1024 * 1024) throw new Error('This file is too large to be a backup.')
      const parsed = JSON.parse(await file.text())
      const problem = validateBackup(parsed)
      if (problem) throw new Error(problem)
      if (!window.confirm('Replace all current data with this backup?')) return
      replaceAll({ ...parsed, settings: { ...parsed.settings, groqKey: data.settings.groqKey } })
      setMsg({ type: 'success', text: 'Backup restored.' })
    } catch (err) {
      setMsg({ type: 'error', text: err instanceof SyntaxError ? 'This file is not valid JSON.' : err.message })
    }
  }

  return (
    <div style={{ maxWidth: 820, margin: '0 auto' }} className="stack">
      <PageHead title="Settings" subtitle="Your details for invoices, the optional AI assistant, and your data." />
      <Alert type={msg.type || 'error'} onClose={() => setMsg({})}>{msg.text}</Alert>

      <section className="card stack">
        <h2>My details (shown on invoices)</h2>
        <div className="form-grid">
          <div><label className="label" htmlFor="name">Full name</label><input id="name" className="input" maxLength={120} value={p.name} onChange={setP('name')} /></div>
          <div><label className="label" htmlFor="biz">Business name (optional)</label><input id="biz" className="input" maxLength={160} value={p.businessName} onChange={setP('businessName')} /></div>
          <div><label className="label" htmlFor="phone">Phone</label><input id="phone" className="input" maxLength={40} value={p.phone} onChange={setP('phone')} /></div>
          <div><label className="label" htmlFor="email">Email (optional)</label><input id="email" type="email" className="input" maxLength={160} value={p.email} onChange={setP('email')} /></div>
          <div><label className="label" htmlFor="kra">KRA PIN to show on invoices (optional)</label><input id="kra" className="input" maxLength={20} value={p.kraPin} onChange={setP('kraPin')} /></div>
        </div>
        <div>
          <label className="label" htmlFor="pay">How clients should pay you</label>
          <textarea id="pay" rows="3" className="input" maxLength={600} value={p.paymentDetails} onChange={setP('paymentDetails')}
            placeholder={'e.g. Mobile money: 07XX XXX XXX (your name)\nBank: account name, bank, branch'} />
          <p className="hint">Only use accounts registered in your own name. Saved automatically.</p>
        </div>
      </section>

      <section className="card stack">
        <h2>AI answers (optional)</h2>
        <p className="small muted">
          Add a free API key from <a href="https://console.groq.com/keys" target="_blank" rel="noreferrer">console.groq.com</a> to get written answers in
          5 languages. The key is stored only in this browser and sent only to Groq. Don't add it on a shared or public computer.
        </p>
        <div className="row" style={{ alignItems: 'flex-end' }}>
          <div style={{ flex: 1, minWidth: 240 }}>
            <label className="label" htmlFor="key">Groq API key</label>
            <input id="key" type={showKey ? 'text' : 'password'} autoComplete="off" className="input" value={data.settings.groqKey}
              onChange={(e) => update('settings', (s) => ({ ...s, groqKey: e.target.value.trim() }))} placeholder="gsk_..." />
          </div>
          <button type="button" className="btn btn-secondary" onClick={() => setShowKey(!showKey)}>{showKey ? 'Hide' : 'Show'}</button>
          {data.settings.groqKey && <button type="button" className="btn btn-danger" onClick={() => update('settings', (s) => ({ ...s, groqKey: '' }))}>Remove</button>}
        </div>
      </section>

      <section className="card stack">
        <h2>My data</h2>
        <p className="small muted">Everything is saved in this browser only. Nothing is sent to a server. Export a backup regularly, especially before clearing your browser or changing phones.</p>
        <div className="row">
          <button className="btn btn-primary" onClick={exportData}>Export backup</button>
          <button className="btn btn-secondary" onClick={() => fileRef.current?.click()}>Import backup</button>
          <input ref={fileRef} type="file" accept="application/json,.json" className="sr-only" onChange={importData} aria-label="Import backup file" />
          <button className="btn btn-secondary" onClick={() => window.confirm('Replace your data with fictional sample data?') && (replaceAll(sampleData()), setMsg({ type: 'success', text: 'Sample data loaded.' }))}>Load sample data</button>
          <button className="btn btn-danger" onClick={() => window.confirm('Delete ALL your data from this browser? This cannot be undone.') && (replaceAll({ ...EMPTY }), setMsg({ type: 'success', text: 'All data deleted.' }))}>Delete all data</button>
        </div>
      </section>
    </div>
  )
}

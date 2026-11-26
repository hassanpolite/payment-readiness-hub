import { Fragment, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Alert, Disclaimer } from '../components/ui'
import { GUIDES } from '../data/guides'
import { LANGUAGES, ask } from '../lib/assistant'
import { useStore } from '../lib/store'

const SUGGESTIONS = [
  'Can I register a SIM card and mobile money with my Refugee ID?',
  'How do I get a KRA PIN as a refugee?',
  'Do I need eTIMS to invoice my clients?',
  'What deductions will my employer take from my salary?',
]
const SLUGS = new Set(GUIDES.map((g) => g.slug))

function AnswerText({ text }) {
  const parts = text.split(/\[([a-z0-9-]+)\]/g)
  return parts.map((p, i) => (i % 2 === 1 && SLUGS.has(p)
    ? <Link key={i} to={`/guides/${p}`} className="cite">{p}</Link>
    : <Fragment key={i}>{i % 2 === 1 ? `[${p}]` : p}</Fragment>))
}

export default function Ask() {
  const { data, update } = useStore()
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [warning, setWarning] = useState('')
  const endRef = useRef(null)
  const lang = data.settings.language || 'en'
  const hasKey = Boolean(data.settings.groqKey)

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }) }, [messages, busy])

  const send = async (question) => {
    const q = question.trim()
    if (q.length < 3 || busy) return
    setInput('')
    setWarning('')
    const history = messages.slice(-6).map(({ role, content }) => ({ role, content }))
    setMessages((m) => [...m, { role: 'user', content: q }])
    setBusy(true)
    const res = await ask({ question: q, language: lang, history, apiKey: data.settings.groqKey })
    if (res.warning) setWarning(`AI unavailable: ${res.warning} Showing matching guides instead.`)
    setMessages((m) => [...m, { role: 'assistant', content: res.answer, by: res.by, guides: res.guides, lang }])
    setBusy(false)
  }

  return (
    <div style={{ maxWidth: 820, margin: '0 auto' }}>
      <div className="page-head">
        <div>
          <h1>Ask about getting paid</h1>
          <p>Answers come only from the sourced guides, with links you can check.</p>
        </div>
        {hasKey && (
          <div>
            <label className="label" htmlFor="lang">Answer language</label>
            <select id="lang" className="input" style={{ width: 'auto' }} value={lang} onChange={(e) => update('settings', (s) => ({ ...s, language: e.target.value }))}>
              {Object.entries(LANGUAGES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
        )}
      </div>
      {!hasKey && (
        <div style={{ marginBottom: 14 }}>
          <Alert type="info">You'll get the best-matching guides. For written AI answers in Kiswahili, Somali, Arabic or French, add a free Groq API key in <Link to="/settings">Settings</Link>.</Alert>
        </div>
      )}
      <div className="card chat" aria-live="polite">
        {messages.length === 0 && (
          <div>
            <p className="small bold">Try a question:</p>
            <div className="grid grid-2" style={{ marginTop: 10 }}>
              {SUGGESTIONS.map((s) => <button key={s} className="choice" style={{ textAlign: 'left' }} onClick={() => send(s)}>{s}</button>)}
            </div>
          </div>
        )}
        {messages.map((m, i) => (m.role === 'user'
          ? <div key={i} className="bubble-user">{m.content}</div>
          : (
            <div key={i}>
              <div className="bubble-bot" dir={m.lang === 'ar' && m.by === 'ai' ? 'rtl' : 'ltr'}><AnswerText text={m.content} /></div>
              <div className="row tiny muted" style={{ marginTop: 6, gap: 8 }}>
                <span className="chip chip-grey">{m.by === 'ai' ? 'AI answer (Groq Llama)' : 'Matching guides'}</span>
                {m.guides.map((g) => <Link key={g.slug} to={`/guides/${g.slug}`}>{g.title}</Link>)}
              </div>
            </div>
          )))}
        {busy && <p className="small muted">Searching the guides...</p>}
        <div ref={endRef} />
      </div>
      <form onSubmit={(e) => { e.preventDefault(); send(input) }} className="row" style={{ marginTop: 12 }}>
        <label htmlFor="q" className="sr-only">Your question</label>
        <input id="q" className="input" style={{ flex: 1 }} maxLength={1000} value={input} onChange={(e) => setInput(e.target.value)} placeholder="e.g. How can a client pay me safely?" />
        <button className="btn btn-primary" disabled={busy || input.trim().length < 3}>Ask</button>
      </form>
      <div className="stack-sm" style={{ marginTop: 12 }}>
        <Alert type="warning" onClose={() => setWarning('')}>{warning}</Alert>
        <Disclaimer />
        <p className="tiny muted">Don't type ID, PIN or account numbers - they aren't needed.</p>
      </div>
    </div>
  )
}

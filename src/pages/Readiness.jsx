import { Link } from 'react-router-dom'
import { Alert, Disclaimer, PageHead, ScoreRing } from '../components/ui'
import { DOCS, DOC_STATUS, WORK_TYPES, assess, effectiveStatus, relevantDocs } from '../lib/readiness'
import { useStore } from '../lib/store'

export default function Readiness() {
  const { data, update } = useStore()
  const a = data.answers
  const r = assess(a)
  const set = (patch) => update('answers', (prev) => ({ ...prev, ...patch }))
  const setDoc = (key, patch) => update('answers', (prev) => ({
    ...prev, documents: { ...prev.documents, [key]: { ...(prev.documents[key] || { status: 'none' }), ...patch } },
  }))

  return (
    <div>
      <PageHead title="My payment readiness" subtitle="Answer a few questions. Changes save automatically on this device." />
      <div className="sidebar-layout">
        <div className="stack">
          <div className="card stack">
            <h2>About you</h2>
            <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
              <legend className="label">Your status in Kenya</legend>
              <div className="choices">
                {[['recognised_refugee', 'Recognised refugee'], ['asylum_seeker', 'Asylum seeker (waiting for a decision)']].map(([v, l]) => (
                  <label key={v} className={`choice ${a.legalStatus === v ? 'on' : ''}`}>
                    <input type="radio" className="sr-only" name="status" checked={a.legalStatus === v} onChange={() => set({ legalStatus: v })} />{l}
                  </label>
                ))}
              </div>
            </fieldset>
            <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
              <legend className="label">How do you earn (or plan to)?</legend>
              <div className="choices">
                {Object.entries(WORK_TYPES).map(([v, l]) => (
                  <label key={v} className={`choice ${a.workType === v ? 'on' : ''}`}>
                    <input type="radio" className="sr-only" name="work" checked={a.workType === v} onChange={() => set({ workType: v })} />{l}
                  </label>
                ))}
              </div>
            </fieldset>
          </div>

          <div className="card">
            <h2>My documents</h2>
            <p className="small muted">Only the status is saved - never ID, PIN or account numbers.</p>
            <ul className="list" style={{ marginTop: 8 }}>
              {relevantDocs(a.workType).map((key) => {
                const doc = a.documents[key] || { status: 'none' }
                const eff = effectiveStatus(doc)
                return (
                  <li key={key} className="row between">
                    <div style={{ minWidth: 220, flex: 1 }}>
                      <p className="bold">{DOCS[key].label} {eff === 'expired' && doc.status === 'have' && <span className="chip chip-red">Expired</span>}</p>
                      <p className="tiny muted">{DOCS[key].hint}</p>
                    </div>
                    <div className="row" style={{ gap: 8 }}>
                      <select className="input" style={{ width: 'auto' }} aria-label={`${DOCS[key].label} status`} value={doc.status}
                        onChange={(e) => setDoc(key, { status: e.target.value, expiry: e.target.value === 'have' ? doc.expiry : null })}>
                        {Object.entries(DOC_STATUS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                      </select>
                      {DOCS[key].expiry && doc.status === 'have' && (
                        <input type="date" className="input" style={{ width: 'auto' }} aria-label={`${DOCS[key].label} expiry date`}
                          value={doc.expiry || ''} onChange={(e) => setDoc(key, { expiry: e.target.value || null })} />
                      )}
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>
          <Disclaimer />
        </div>

        <aside className="stack">
          <div className="card row" style={{ gap: 16 }}>
            <ScoreRing score={r.score} size={104} />
            <div><h2>Readiness score</h2><p className="small muted">Updates as you answer.</p></div>
          </div>
          <div className="card">
            <h3>Ways you can get paid</h3>
            <ul className="list" style={{ marginTop: 6 }}>
              {r.channels.map((c) => (
                <li key={c.key} className="row" style={{ alignItems: 'flex-start' }}>
                  <span className={`tick ${c.ready ? 'yes' : 'no'}`}>{c.ready ? '✓' : ''}</span>
                  <div><p className="small bold">{c.title}</p>{!c.ready && <p className="tiny muted">Needs: {c.missing.join(', ')}</p>}</div>
                </li>
              ))}
            </ul>
          </div>
          <div className="card">
            <h3>Next steps</h3>
            {r.steps.length === 0 ? <p className="small" style={{ marginTop: 6, color: 'var(--brand-700)' }}>All done!</p> : (
              <ol className="list" style={{ marginTop: 4 }}>
                {r.steps.map((s, i) => (
                  <li key={s.key} className="step">
                    <span className="step-num">{i + 1}</span>
                    <div>
                      <p className="small bold">{s.title}</p>
                      <p className="tiny muted">{s.advice}</p>
                      {s.waitFor && <p className="tiny" style={{ color: 'var(--amber)' }}>Usually needs a valid Refugee ID first.</p>}
                      <Link to={`/guides/${s.guide}`} className="tiny bold">Read the guide</Link>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </div>
          {a.legalStatus === 'asylum_seeker' && <Alert type="warning">Some services may need recognised refugee status. Check with DRS.</Alert>}
        </aside>
      </div>
    </div>
  )
}

import { Link, useParams } from 'react-router-dom'
import { Alert, Disclaimer } from '../components/ui'
import { GUIDES } from '../data/guides'
import { formatDate } from '../lib/format'

/** Blank line = new paragraph; lines starting with "- " = bullet list. */
function Body({ text }) {
  return text.split(/\n\n+/).map((block, i) => {
    const lines = block.split('\n')
    const bullets = lines.filter((l) => l.startsWith('- '))
    const intro = lines.filter((l) => !l.startsWith('- '))
    return (
      <div key={i} style={{ marginTop: 14 }}>
        {intro.length > 0 && <p>{intro.join(' ')}</p>}
        {bullets.length > 0 && <ul style={{ margin: '6px 0 0', paddingLeft: 22 }}>{bullets.map((b) => <li key={b}>{b.slice(2)}</li>)}</ul>}
      </div>
    )
  })
}

export default function Guide() {
  const { slug } = useParams()
  const g = GUIDES.find((x) => x.slug === slug)
  if (!g) return <div className="stack"><Alert>Guide not found.</Alert><Link to="/guides" className="btn btn-secondary">All guides</Link></div>
  return (
    <article style={{ maxWidth: 780, margin: '0 auto' }}>
      <Link to="/guides" className="small bold">&larr; All guides</Link>
      <div className="card" style={{ marginTop: 12 }}>
        <span className="chip chip-green">{g.category}</span>
        <h1 style={{ marginTop: 10 }}>{g.title}</h1>
        <p className="muted" style={{ marginTop: 8, fontSize: '1.08rem' }}>{g.summary}</p>
        <Body text={g.body} />
        <div className="card tight" style={{ marginTop: 24, background: '#f8fafc' }}>
          <p className="bold small">Sources</p>
          <ul className="small" style={{ paddingLeft: 18, margin: '6px 0 0' }}>
            {g.sources.map((s) => <li key={s.url}><a href={s.url} target="_blank" rel="noreferrer">{s.title}</a></li>)}
          </ul>
          <p className="tiny muted" style={{ marginTop: 8 }}>Last reviewed {formatDate(g.last_reviewed)}</p>
        </div>
      </div>
      <div className="row between" style={{ marginTop: 14 }}>
        <Disclaimer />
        <Link to="/ask" className="btn btn-secondary btn-sm">Ask a follow-up question</Link>
      </div>
    </article>
  )
}

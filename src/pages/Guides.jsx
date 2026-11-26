import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Disclaimer, Empty, PageHead } from '../components/ui'
import { GUIDES } from '../data/guides'
import { formatDate } from '../lib/format'
import { buildIndex } from '../lib/search'

const search = buildIndex(GUIDES)
const CATEGORIES = [...new Set(GUIDES.map((g) => g.category))].sort()

export default function Guides() {
  const [q, setQ] = useState('')
  const [category, setCategory] = useState('')
  const list = useMemo(() => {
    const base = q.trim() ? search(q, 20, 0.3).map((r) => r.guide) : [...GUIDES].sort((a, b) => a.category.localeCompare(b.category))
    return category ? base.filter((g) => g.category === category) : base
  }, [q, category])

  return (
    <div>
      <PageHead title="Guides" subtitle="Plain-language, sourced guides on getting paid in Kenya. Each shows when it was last checked." />
      <div className="row" style={{ marginBottom: 18 }}>
        <input className="input" style={{ flex: 1, minWidth: 220 }} placeholder="Search e.g. 'eTIMS', 'KRA PIN', 'M-Pesa'..." value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search guides" />
        <select className="input" style={{ width: 'auto' }} value={category} onChange={(e) => setCategory(e.target.value)} aria-label="Category">
          <option value="">All categories</option>
          {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
        </select>
      </div>
      {list.length === 0 ? <Empty title="No guides found">Try other words, or use Ask.</Empty> : (
        <div className="grid grid-2">
          {list.map((g) => (
            <Link key={g.slug} to={`/guides/${g.slug}`} className="card link">
              <span className="chip chip-green">{g.category}</span>
              <h3 style={{ marginTop: 8 }}>{g.title}</h3>
              <p className="small muted" style={{ marginTop: 4 }}>{g.summary}</p>
              <p className="tiny muted" style={{ marginTop: 10 }}>Last reviewed {formatDate(g.last_reviewed)} - {g.sources.length} source{g.sources.length > 1 ? 's' : ''}</p>
            </Link>
          ))}
        </div>
      )}
      <div style={{ marginTop: 18 }}><Disclaimer /></div>
    </div>
  )
}

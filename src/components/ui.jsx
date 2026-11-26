/* Small reusable UI pieces (plain CSS classes from styles.css). */
import { Link } from 'react-router-dom'

export function Alert({ type = 'error', children, onClose }) {
  if (!children) return null
  return (
    <div className={`alert alert-${type}`} role={type === 'error' ? 'alert' : 'status'}>
      <div>{children}</div>
      {onClose && <button onClick={onClose} aria-label="Dismiss">x</button>}
    </div>
  )
}

export function PageHead({ title, subtitle, action }) {
  return (
    <div className="page-head">
      <div>
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}

export function Stat({ label, value, hint, color }) {
  return (
    <div className="card tight">
      <p className="stat-label">{label}</p>
      <p className="stat-value" style={color ? { color } : undefined}>{value}</p>
      {hint && <p className="stat-hint">{hint}</p>}
    </div>
  )
}

export function Empty({ title, children, action }) {
  return (
    <div className="empty">
      <h3>{title}</h3>
      {children && <p>{children}</p>}
      {action && <div style={{ marginTop: 16 }}>{action}</div>}
    </div>
  )
}

export function ScoreRing({ score, size = 96, label = 'Payment readiness' }) {
  const color = score >= 80 ? '#059669' : score >= 50 ? '#d99a0b' : '#dc2626'
  return (
    <div className="ring" role="img" aria-label={`${label} ${score} out of 100`}
      style={{ width: size, height: size, background: `conic-gradient(${color} ${score * 3.6}deg, #e2e8f0 0deg)` }}>
      <div style={{ width: size * 0.78, height: size * 0.78, color, fontSize: size * 0.24 }}>{score}%</div>
    </div>
  )
}

export function Disclaimer() {
  return (
    <p className="disclaimer">
      General information based on Kenyan rules checked on 26 Nov 2026 - not legal or financial advice. Confirm with DRS, KRA, your bank or
      mobile money provider before acting.
    </p>
  )
}

export function GuideLink({ slug, children = 'Read the guide' }) {
  return <Link to={`/guides/${slug}`} className="small bold">{children}</Link>
}

export const STATUS_CHIP = {
  draft: ['Draft', 'chip-grey'],
  sent: ['Sent', 'chip-blue'],
  paid: ['Paid', 'chip-green'],
  cancelled: ['Cancelled', 'chip-grey'],
  overdue: ['Overdue', 'chip-red'],
}

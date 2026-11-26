import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { useStore } from '../lib/store'

const LINKS = [
  ['/', 'Home'],
  ['/readiness', 'My readiness'],
  ['/invoices', 'Invoices'],
  ['/money', 'Money tracker'],
  ['/pay', 'Net pay'],
  ['/guides', 'Guides'],
  ['/ask', 'Ask'],
  ['/settings', 'Settings'],
]

export default function Layout() {
  const [open, setOpen] = useState(false)
  const location = useLocation()
  const { saveError } = useStore()
  useEffect(() => setOpen(false), [location.pathname])

  return (
    <div className="app">
      <header className="header">
        {saveError && <div className="banner">{saveError}</div>}
        <div className="container">
          <Link to="/" className="logo"><img src="/favicon.svg" alt="" />Payment<span>Readiness</span></Link>
          <nav className="nav" aria-label="Main">
            {LINKS.map(([to, label]) => <NavLink key={to} to={to} end={to === '/'}>{label}</NavLink>)}
          </nav>
          <button className="menu-btn" onClick={() => setOpen(!open)} aria-label="Toggle menu" aria-expanded={open}>
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" d={open ? 'M6 6l12 12M6 18L18 6' : 'M4 7h16M4 12h16M4 17h16'} />
            </svg>
          </button>
        </div>
        {open && (
          <nav className="mobile-nav" aria-label="Mobile">
            {LINKS.map(([to, label]) => <NavLink key={to} to={to} end={to === '/'}>{label}</NavLink>)}
          </nav>
        )}
      </header>
      <main className="container">
        <Outlet />
      </main>
      <footer className="footer">
        <div className="container">
          <span>Payment Readiness Hub - PLP x ILO Mini Hackathon 2026, Track 2. Your data stays on this device.</span>
          <span>SDG 8 - SDG 10 - SDG 16</span>
        </div>
      </footer>
    </div>
  )
}

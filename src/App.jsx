import { Link, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import Ask from './pages/Ask'
import Guide from './pages/Guide'
import Guides from './pages/Guides'
import Home from './pages/Home'
import InvoiceEditor from './pages/InvoiceEditor'
import Invoices from './pages/Invoices'
import InvoiceView from './pages/InvoiceView'
import Money from './pages/Money'
import Pay from './pages/Pay'
import Readiness from './pages/Readiness'
import Settings from './pages/Settings'

function NotFound() {
  return (
    <div className="empty" style={{ marginTop: 40 }}>
      <h3>Page not found</h3>
      <p>The page you are looking for does not exist.</p>
      <div style={{ marginTop: 16 }}><Link className="btn btn-primary" to="/">Back to home</Link></div>
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/readiness" element={<Readiness />} />
        <Route path="/invoices" element={<Invoices />} />
        <Route path="/invoices/new" element={<InvoiceEditor />} />
        <Route path="/invoices/:id/edit" element={<InvoiceEditor />} />
        <Route path="/invoices/:id" element={<InvoiceView />} />
        <Route path="/money" element={<Money />} />
        <Route path="/pay" element={<Pay />} />
        <Route path="/guides" element={<Guides />} />
        <Route path="/guides/:slug" element={<Guide />} />
        <Route path="/ask" element={<Ask />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}

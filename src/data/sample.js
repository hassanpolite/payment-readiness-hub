/** Fictional sample data so the app can be explored quickly (Settings > Load sample data). */
import { addDays, todayISO } from '../lib/format'

export function sampleData() {
  const t = todayISO()
  const d = (n) => addDays(t, -n)
  return {
    profile: {
      name: 'Halima Yusuf', businessName: 'Halima Designs (sample)', phone: '07XX XXX XXX', email: 'halima@example.com', kraPin: '',
      paymentDetails: 'Mobile money: 07XX XXX XXX (Halima Yusuf)\nPlease use the invoice number as the reference.',
    },
    answers: {
      legalStatus: 'recognised_refugee', workType: 'freelance', location: 'Kakuma',
      documents: {
        refugee_id: { status: 'have', expiry: addDays(t, 900) }, sim_own_name: { status: 'have' }, mobile_money: { status: 'have' },
        kra_pin: { status: 'applied' }, bank_account: { status: 'none' }, etims: { status: 'none' },
      },
    },
    invoices: [
      { id: 's1', number: 'INV-2026-0001', clientName: 'Kakuma Youth Centre (sample)', clientContact: 'admin@example.org', issueDate: d(40), dueDate: d(26),
        items: [{ description: 'Poster design - 3 posters', quantity: 3, unitPrice: 2500 }], notes: '', status: 'paid', total: 7500, paidAt: d(30), paidChannel: 'mobile_money', etimsReference: '' },
      { id: 's2', number: 'INV-2026-0002', clientName: 'Green Shamba Co-op (sample)', clientContact: '', issueDate: d(18), dueDate: d(4),
        items: [{ description: 'Logo and brand colours', quantity: 1, unitPrice: 12000 }, { description: 'Business cards design', quantity: 1, unitPrice: 3000 }], notes: '', status: 'sent', total: 15000, etimsReference: '' },
      { id: 's3', number: 'INV-2026-0003', clientName: 'Tumaini School (sample)', clientContact: '', issueDate: d(2), dueDate: addDays(t, 12),
        items: [{ description: 'Certificate template design', quantity: 1, unitPrice: 4000 }], notes: '', status: 'draft', total: 4000, etimsReference: '' },
    ],
    transactions: [
      { id: 'tx1', date: d(30), kind: 'income', amount: 7500, category: 'Client payment', description: 'INV-2026-0001 paid', channel: 'mobile_money', invoiceId: 's1' },
      { id: 'tx2', date: d(25), kind: 'expense', amount: 1200, category: 'Airtime & data', description: 'Monthly data bundle', channel: 'mobile_money' },
      { id: 'tx3', date: d(60), kind: 'income', amount: 9000, category: 'Client payment', description: 'Flyers for a community event', channel: 'mobile_money' },
      { id: 'tx4', date: d(55), kind: 'expense', amount: 2000, category: 'Transport', description: 'Client meetings', channel: 'cash' },
      { id: 'tx5', date: d(90), kind: 'income', amount: 5000, category: 'Client payment', description: 'Menu design', channel: 'mobile_money' },
      { id: 'tx6', date: d(8), kind: 'expense', amount: 1500, category: 'Equipment', description: 'Drawing tablet pen', channel: 'mobile_money' },
    ],
  }
}

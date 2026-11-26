/** Invoice and money-tracker calculations (pure functions, easy to test). */

export const CATEGORIES = {
  income: ['Client payment', 'Salary', 'Sales', 'Other income'],
  expense: ['Materials / stock', 'Transport', 'Airtime & data', 'Rent', 'Equipment', 'Fees & charges', 'Other expense'],
}

export const CHANNELS = { mobile_money: 'Mobile money', bank: 'Bank', cash: 'Cash' }

const round2 = (x) => Math.round((x + Number.EPSILON) * 100) / 100

export function lineTotal(item) {
  return round2((Number(item.quantity) || 0) * (Number(item.unitPrice) || 0))
}

export function invoiceTotal(items) {
  return round2((items || []).reduce((sum, it) => sum + lineTotal(it), 0))
}

/** Next number like INV-2026-0003, per year, never reusing a number. */
export function nextInvoiceNumber(invoices, today = new Date()) {
  const year = today.getFullYear()
  const prefix = `INV-${year}-`
  const used = invoices.map((i) => i.number).filter((n) => n.startsWith(prefix)).map((n) => Number(n.slice(prefix.length)) || 0)
  return `${prefix}${String((used.length ? Math.max(...used) : 0) + 1).padStart(4, '0')}`
}

export function validateInvoice(inv) {
  const errors = []
  if (!inv.clientName?.trim()) errors.push('Add the client name.')
  if (!inv.issueDate) errors.push('Add the issue date.')
  if (!inv.dueDate) errors.push('Add the due date.')
  if (inv.issueDate && inv.dueDate && inv.dueDate < inv.issueDate) errors.push('The due date cannot be before the issue date.')
  const items = (inv.items || []).filter((i) => i.description?.trim())
  if (!items.length) errors.push('Add at least one item with a description.')
  if (items.some((i) => !(Number(i.quantity) > 0) || !(Number(i.unitPrice) >= 0))) errors.push('Each item needs a quantity above 0 and a price of 0 or more.')
  if (invoiceTotal(items) <= 0) errors.push('The invoice total must be more than 0.')
  return errors
}

export function isOverdue(inv, today = new Date().toISOString().slice(0, 10)) {
  return inv.status === 'sent' && inv.dueDate < today
}

/** Totals per month (YYYY-MM) for the last `months` months, oldest first. */
export function monthlySummary(transactions, months = 6, today = new Date()) {
  const keys = []
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1)
    keys.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
  }
  const map = Object.fromEntries(keys.map((k) => [k, { month: k, income: 0, expense: 0 }]))
  for (const t of transactions) {
    const k = t.date.slice(0, 7)
    if (map[k]) map[k][t.kind] = round2(map[k][t.kind] + Number(t.amount))
  }
  return keys.map((k) => ({ ...map[k], net: round2(map[k].income - map[k].expense) }))
}

export function totals(transactions, from, to) {
  const inRange = transactions.filter((t) => (!from || t.date >= from) && (!to || t.date <= to))
  const income = round2(inRange.filter((t) => t.kind === 'income').reduce((s, t) => s + Number(t.amount), 0))
  const expense = round2(inRange.filter((t) => t.kind === 'expense').reduce((s, t) => s + Number(t.amount), 0))
  const byChannel = {}
  for (const t of inRange.filter((x) => x.kind === 'income')) byChannel[t.channel] = round2((byChannel[t.channel] || 0) + Number(t.amount))
  return { income, expense, net: round2(income - expense), count: inRange.length, byChannel }
}

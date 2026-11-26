import { describe, expect, it } from 'vitest'
import { GUIDES } from '../src/data/guides'
import { ask, offlineAnswer } from '../src/lib/assistant'
import { invoiceTotal, isOverdue, lineTotal, monthlySummary, nextInvoiceNumber, totals, validateInvoice } from '../src/lib/money'
import { calculatePay } from '../src/lib/payroll'
import { assess, channels, nextSteps, score } from '../src/lib/readiness'
import { buildIndex } from '../src/lib/search'

const TODAY = '2026-11-26'

describe('payroll (2026 rates)', () => {
  it('matches the hand calculation for KSh 100,000', () => {
    const p = calculatePay(100000)
    expect(p.nssfTier1).toBe(540)
    expect(p.nssfTier2).toBe(5460)
    expect(p.shif).toBe(2750)
    expect(p.housingLevy).toBe(1500)
    expect(p.taxablePay).toBe(89750)
    expect(p.paye).toBeCloseTo(19308.35, 2)
    expect(p.netPay).toBeCloseTo(70441.65, 2)
    expect(p.employerTotalCost).toBe(107500)
  })
  it('caps NSSF, applies SHIF minimum and zero PAYE for low pay', () => {
    expect(calculatePay(500000).nssf).toBe(6480)
    const low = calculatePay(8000)
    expect(low.shif).toBe(300)
    expect(low.paye).toBe(0)
  })
  it('top band is 35%', () => {
    expect(calculatePay(1001000).paye - calculatePay(1000000).paye).toBeCloseTo(957.5 * 0.35, 1) // each PAYE is rounded to the cent
  })
  it('rejects negative pay', () => {
    expect(() => calculatePay(-1)).toThrow()
  })
})

describe('readiness rules', () => {
  const all = { refugee_id: { status: 'have', expiry: '2030-01-01' }, sim_own_name: { status: 'have' }, mobile_money: { status: 'have' }, kra_pin: { status: 'have' }, bank_account: { status: 'have' }, etims: { status: 'have' }, class_m: { status: 'have' } }

  it('a fully documented freelancer scores 100 with every channel open', () => {
    const r = assess({ legalStatus: 'recognised_refugee', workType: 'freelance', documents: all }, TODAY)
    expect(r.score).toBe(100)
    expect(r.steps).toEqual([])
    expect(r.channels.every((c) => c.ready)).toBe(true)
    expect(r.channels.map((c) => c.key)).toEqual(['mobile_money', 'bank', 'invoice'])
  })

  it('employed people get the salary channel and Class M instead of eTIMS', () => {
    const a = { legalStatus: 'recognised_refugee', workType: 'employed', documents: { refugee_id: { status: 'have' } } }
    expect(channels(a, TODAY).map((c) => c.key)).toContain('salary')
    const keys = nextSteps(a, TODAY).map((s) => s.key)
    expect(keys).toContain('class_m')
    expect(keys).not.toContain('etims')
  })

  it('half credit for applied, none for expired (including a past expiry date)', () => {
    expect(score({ workType: 'freelance', documents: { refugee_id: { status: 'applied' } } }, TODAY)).toBe(13)
    expect(score({ workType: 'freelance', documents: { refugee_id: { status: 'have', expiry: '2025-01-01' } } }, TODAY)).toBe(0)
    const steps = nextSteps({ workType: 'freelance', documents: { refugee_id: { status: 'have', expiry: '2025-01-01' } } }, TODAY)
    expect(steps[0].title).toBe('Renew your Refugee ID card')
    expect(steps[0].advice).toMatch(/expired/)
  })

  it('steps follow dependency order and flag waiting on the Refugee ID', () => {
    const steps = nextSteps({ workType: 'freelance', documents: {} }, TODAY)
    expect(steps.map((s) => s.key)).toEqual(['refugee_id', 'sim_own_name', 'mobile_money', 'kra_pin', 'etims', 'bank_account'])
    expect(steps[1].waitFor).toBe('refugee_id')
    expect(steps.every((s) => GUIDES.some((g) => g.slug === s.guide))).toBe(true)
  })

  it('asylum seekers are capped at 20 and told to follow up status', () => {
    const r = assess({ legalStatus: 'asylum_seeker', workType: 'job_seeker', documents: all }, TODAY)
    expect(r.score).toBe(20)
    expect(r.steps[0].key).toBe('status')
    expect(r.channels.find((c) => c.key === 'salary').ready).toBe(false)
  })

  it('channels explain what is missing', () => {
    const c = channels({ workType: 'freelance', documents: { refugee_id: { status: 'have' } } }, TODAY)
    expect(c[0].missing).toEqual(['SIM card registered in my own name', 'Mobile money account'])
  })
})

describe('invoices and money', () => {
  it('computes line and invoice totals with decimals', () => {
    expect(lineTotal({ quantity: 3, unitPrice: 333.333 })).toBe(1000)
    expect(invoiceTotal([{ quantity: 2, unitPrice: 1500 }, { quantity: 1, unitPrice: 0.1 }])).toBe(3000.1)
  })
  it('numbers invoices per year without reuse', () => {
    const d = new Date(2026, 10, 26)
    expect(nextInvoiceNumber([], d)).toBe('INV-2026-0001')
    expect(nextInvoiceNumber([{ number: 'INV-2026-0001' }, { number: 'INV-2026-0007' }, { number: 'INV-2025-0099' }], d)).toBe('INV-2026-0008')
  })
  it('validates invoices', () => {
    expect(validateInvoice({ clientName: '', items: [] }).length).toBeGreaterThan(1)
    const ok = { clientName: 'A', issueDate: '2026-11-01', dueDate: '2026-11-15', items: [{ description: 'Design', quantity: 1, unitPrice: 5000 }] }
    expect(validateInvoice(ok)).toEqual([])
    expect(validateInvoice({ ...ok, dueDate: '2026-10-01' })).toContain('The due date cannot be before the issue date.')
    expect(validateInvoice({ ...ok, items: [{ description: 'x', quantity: 0, unitPrice: 5 }] }).length).toBeGreaterThan(0)
  })
  it('detects overdue sent invoices only', () => {
    expect(isOverdue({ status: 'sent', dueDate: '2026-11-01' }, TODAY)).toBe(true)
    expect(isOverdue({ status: 'paid', dueDate: '2026-11-01' }, TODAY)).toBe(false)
  })
  it('summarises months and totals', () => {
    const tx = [
      { date: '2026-11-03', kind: 'income', amount: 10000, channel: 'mobile_money' },
      { date: '2026-11-10', kind: 'expense', amount: 2500, channel: 'cash' },
      { date: '2026-10-15', kind: 'income', amount: 4000, channel: 'bank' },
      { date: '2025-01-01', kind: 'income', amount: 999, channel: 'bank' },
    ]
    const m = monthlySummary(tx, 3, new Date(2026, 10, 26))
    expect(m.map((x) => x.month)).toEqual(['2026-09', '2026-10', '2026-11'])
    expect(m[2]).toEqual({ month: '2026-11', income: 10000, expense: 2500, net: 7500 })
    const t = totals(tx, '2026-10-01', '2026-11-30')
    expect(t).toMatchObject({ income: 14000, expense: 2500, net: 11500, byChannel: { mobile_money: 10000, bank: 4000 } })
  })
})

describe('guide search and assistant', () => {
  const search = buildIndex(GUIDES)
  it.each([
    ['How do I get a KRA PIN as a refugee?', 'kra-pin-refugees'],
    ['Can I register a SIM card with my Refugee ID for M-Pesa?', 'payments-banking'],
    ['Do I need eTIMS to invoice my clients?', 'etims-invoicing'],
    ['How do I apply for a Class M permit?', 'class-m-permit'],
    ['What NSSF rate applies in 2026?', 'nssf'],
    ['Do I have to declare all my income to KRA?', 'declaring-income'],
    ['How do I get paid as a freelancer?', 'getting-paid-freelance'],
  ])('"%s" -> %s', (q, slug) => {
    expect(search(q)[0]?.guide.slug).toBe(slug)
  })
  it('ignores unrelated questions', () => {
    expect(search('best pizza recipe in Mombasa')).toEqual([])
    expect(offlineAnswer('x', [])).toMatch(/couldn't find/)
  })
  it('uses AI when a key is set, grounded in the matched guides', async () => {
    let sent
    const fetchImpl = async (url, opts) => {
      sent = JSON.parse(opts.body)
      return { ok: true, json: async () => ({ choices: [{ message: { content: 'Register on eTIMS [etims-invoicing].' } }] }) }
    }
    const r = await ask({ question: 'Do I need eTIMS?', language: 'sw', apiKey: 'k', fetchImpl })
    expect(r.by).toBe('ai')
    expect(sent.messages[0].content).toContain('[etims-invoicing]')
    expect(sent.messages[0].content).toContain('Kiswahili')
  })
  it('falls back to guides when the AI call fails', async () => {
    const r = await ask({ question: 'Do I need eTIMS?', apiKey: 'bad', fetchImpl: async () => ({ ok: false, status: 401 }) })
    expect(r.by).toBe('guides')
    expect(r.warning).toMatch(/rejected/)
    expect(r.answer).toMatch(/etims-invoicing/)
  })
  it('does not call AI without a key', async () => {
    const r = await ask({ question: 'Do I need eTIMS?', fetchImpl: () => { throw new Error('should not be called') } })
    expect(r.by).toBe('guides')
  })
})

import { ksh } from '../src/lib/format'
describe('formatting', () => {
  it('shows cents only when needed', () => {
    expect(ksh(1500.5)).toBe('KSh 1,500.50')
    expect(ksh(15001)).toBe('KSh 15,001')
    expect(ksh(70441.65)).toBe('KSh 70,441.65')
  })
})

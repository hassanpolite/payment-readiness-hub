/**
 * Kenyan monthly payroll estimate for a resident employee. Rates checked 26 Nov 2026.
 *
 * Order (KRA guidance since the Tax Laws (Amendment) Act 2024):
 *   1. NSSF employee  = 6% of pensionable pay, capped at the Upper Earnings Limit
 *   2. SHIF           = 2.75% of gross, minimum KSh 300
 *   3. Housing Levy   = 1.5% of gross (employer matches)
 *   4. Taxable pay    = gross - NSSF - SHIF - Housing Levy
 *   5. PAYE           = tax on bands - personal relief (never below zero)
 *   6. Net pay        = gross - all deductions
 */
export const RATES = {
  asOf: '2026-11-26',
  payeBands: [
    [24000, 0.1],
    [8333, 0.25],
    [467667, 0.3],
    [300000, 0.325],
    [Infinity, 0.35],
  ],
  personalRelief: 2400,
  nssfRate: 0.06,
  nssfLel: 9000, // Year 4, from 1 Feb 2026
  nssfUel: 108000,
  shifRate: 0.0275,
  shifMinimum: 300,
  housingLevyRate: 0.015,
}

export const PAYROLL_SOURCES = [
  { title: 'KRA - PAYE bands and personal relief', url: 'https://www.kra.go.ke/en/individual/filing-paying/types-of-taxes/paye' },
  { title: 'NSSF - Year 4 (2026) contribution rates', url: 'https://www.nssf.or.ke/notice-to-employers-year-4-2026-nssf-contribution-rates' },
  { title: 'PwC Tax Summaries - SHIF', url: 'https://taxsummaries.pwc.com/Kenya/Individual/Other-taxes' },
  { title: 'KRA PAYE Brochure 2026 - Housing Levy deductibility', url: 'https://www.kra.go.ke/images/publications/PAYE-Brochure-2026.pdf' },
]

const round2 = (x) => Math.round((x + Number.EPSILON) * 100) / 100

export function payeOn(taxable) {
  let tax = 0
  let remaining = Math.max(taxable, 0)
  for (const [width, rate] of RATES.payeBands) {
    const portion = Math.min(remaining, width)
    tax += portion * rate
    remaining -= portion
    if (remaining <= 0) break
  }
  return tax
}

export function calculatePay(gross) {
  if (!Number.isFinite(gross) || gross < 0) throw new Error('Gross pay must be a positive number.')
  const r = RATES
  const pensionable = Math.min(gross, r.nssfUel)
  const nssfTier1 = Math.min(pensionable, r.nssfLel) * r.nssfRate
  const nssfTier2 = Math.max(pensionable - r.nssfLel, 0) * r.nssfRate
  const nssf = nssfTier1 + nssfTier2
  const shif = gross > 0 ? Math.max(gross * r.shifRate, r.shifMinimum) : 0
  const housingLevy = gross * r.housingLevyRate
  const taxablePay = Math.max(gross - nssf - shif - housingLevy, 0)
  const taxBeforeRelief = payeOn(taxablePay)
  const personalRelief = Math.min(r.personalRelief, taxBeforeRelief)
  const paye = taxBeforeRelief - personalRelief
  const totalDeductions = nssf + shif + housingLevy + paye
  const out = {
    gross, nssfTier1, nssfTier2, nssf, shif, housingLevy, taxablePay, taxBeforeRelief, personalRelief, paye,
    totalDeductions, netPay: gross - totalDeductions, nssfEmployer: nssf, housingLevyEmployer: housingLevy,
    employerTotalCost: gross + nssf + housingLevy,
  }
  return Object.fromEntries(Object.entries(out).map(([k, v]) => [k, round2(v)]))
}

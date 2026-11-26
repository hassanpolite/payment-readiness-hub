/**
 * Payment readiness rules.
 *
 * Input: the member's answers (status, work type, which documents they hold).
 * Output: a 0-100 score, which payment channels they can use now, and an ordered list of next steps.
 * Deterministic on purpose: the same answers always give the same result, and every step links to a sourced guide.
 * We only store whether a document exists, never document numbers.
 */

export const WORK_TYPES = {
  employed: 'Employed (or about to start a job)',
  job_seeker: 'Looking for a job',
  freelance: 'Freelancer / consultant',
  business: 'Running a small business',
}

export const DOCS = {
  refugee_id: { label: 'Refugee ID card', hint: 'From the Department of Refugee Services (DRS).', expiry: true },
  sim_own_name: { label: 'SIM card registered in my own name', hint: 'Registered with my Refugee ID.' },
  mobile_money: { label: 'Mobile money account', hint: 'On my own SIM.' },
  kra_pin: { label: 'KRA PIN', hint: 'Tax number from KRA iTax.' },
  bank_account: { label: 'Bank account in my name', hint: 'Requirements vary by bank.' },
  class_m: { label: 'Class M work permit', hint: 'Needed for formal employment.', expiry: true, for: ['employed', 'job_seeker'] },
  etims: { label: 'Registered on KRA eTIMS', hint: 'To issue official electronic tax invoices.', for: ['freelance', 'business'] },
}

export const DOC_STATUS = {
  have: 'I have it',
  applied: 'Applied / waiting',
  expired: 'Expired',
  none: "Don't have it",
}

const WEIGHTS = { refugee_id: 25, sim_own_name: 15, mobile_money: 15, kra_pin: 15, bank_account: 10, class_m: 20, etims: 20 }

export function relevantDocs(workType) {
  return Object.keys(DOCS).filter((k) => !DOCS[k].for || DOCS[k].for.includes(workType))
}

/** Treats a document whose expiry date has passed as expired. */
export function effectiveStatus(doc, today = new Date().toISOString().slice(0, 10)) {
  const status = doc?.status || 'none'
  if (status === 'have' && doc.expiry && doc.expiry < today) return 'expired'
  return status
}

export function score(answers, today) {
  const docs = answers.documents || {}
  let total = 0
  for (const key of relevantDocs(answers.workType)) {
    const st = effectiveStatus(docs[key], today)
    total += WEIGHTS[key] * (st === 'have' ? 1 : st === 'applied' ? 0.5 : 0)
  }
  if (answers.legalStatus === 'asylum_seeker') total = Math.min(total, 20)
  return Math.round(total)
}

const ADVICE = {
  refugee_id: ['Get a Refugee ID', 'Apply at the Department of Refugee Services (DRS). You need a valid Refugee ID for a SIM card, a KRA PIN, a bank account and a work permit.', 'kra-pin-refugees'],
  sim_own_name: ['Register a SIM card in your own name', 'Since 2025 the Refugee ID is accepted for SIM registration (Legal Notice 90 of 2025). Stop using a SIM registered with someone else\'s ID: money on it legally belongs to them.', 'payments-banking'],
  mobile_money: ['Open mobile money on your own SIM', 'Once your SIM is registered in your name, activate mobile money at an agent or shop with your Refugee ID.', 'payments-banking'],
  kra_pin: ['Get a KRA PIN', 'Apply on iTax with a valid Refugee ID and an introduction letter from DRS (plus an employer letter if employed, or a business registration certificate for a business).', 'kra-pin-refugees'],
  bank_account: ['Open a bank account in your own name', 'Requirements vary by bank. Many ask for a Refugee ID and a KRA PIN. Ask two or three banks near you and compare.', 'payments-banking'],
  class_m: ['Get a Class M work permit', 'The free permit for recognised refugees. Apply on eCitizen (eFNS) with a valid Refugee ID, recognition letters from UNHCR and DRS, and a cover letter.', 'class-m-permit'],
  etims: ['Register on KRA eTIMS', 'Anyone doing business, VAT-registered or not, must issue electronic tax invoices through eTIMS. You need a KRA PIN first.', 'etims-invoicing'],
}

// Order in which documents unlock each other
const ORDER = ['refugee_id', 'sim_own_name', 'mobile_money', 'kra_pin', 'class_m', 'etims', 'bank_account']

export function nextSteps(answers, today) {
  const docs = answers.documents || {}
  const steps = []
  if (answers.legalStatus === 'asylum_seeker') {
    steps.push({
      key: 'status', title: 'Follow up your refugee status',
      advice: 'Formal employment needs recognised refugee status. Follow up your status determination with DRS. Free legal aid organisations can help if it is delayed.',
      guide: 'asylum-seekers',
    })
  }
  const relevant = relevantDocs(answers.workType)
  for (const key of ORDER) {
    if (!relevant.includes(key)) continue
    const st = effectiveStatus(docs[key], today)
    if (st === 'have') continue
    const [title, advice, guide] = ADVICE[key]
    const prefix = st === 'applied' ? 'You applied - keep your receipt and follow up. ' : st === 'expired' ? 'Yours has expired - renew it. ' : ''
    const waitFor = key !== 'refugee_id' && effectiveStatus(docs.refugee_id, today) !== 'have' ? 'refugee_id' : null
    steps.push({ key, title: st === 'expired' ? `Renew your ${DOCS[key].label}` : title, advice: prefix + advice, guide, waitFor })
  }
  return steps
}

/** Which ways of getting paid are open right now, and what blocks the others. */
export function channels(answers, today) {
  const docs = answers.documents || {}
  const has = (k) => effectiveStatus(docs[k], today) === 'have'
  const missing = (keys) => keys.filter((k) => !has(k)).map((k) => DOCS[k].label)
  const out = []
  const mm = missing(['refugee_id', 'sim_own_name', 'mobile_money'])
  out.push({ key: 'mobile_money', title: 'Receive mobile money in your own name', ready: mm.length === 0, missing: mm })
  const bank = missing(['bank_account'])
  out.push({ key: 'bank', title: 'Receive bank transfers', ready: bank.length === 0, missing: bank })
  const payout = has('mobile_money') && has('sim_own_name') ? [] : has('bank_account') ? [] : ['Mobile money or bank account in your name']
  if (['employed', 'job_seeker'].includes(answers.workType)) {
    const m = [...missing(['refugee_id', 'class_m', 'kra_pin']), ...payout]
    if (answers.legalStatus === 'asylum_seeker') m.unshift('Recognised refugee status')
    out.push({ key: 'salary', title: 'Be paid a salary in a formal job', ready: m.length === 0, missing: m })
  } else {
    const m = [...missing(['kra_pin', 'etims']), ...payout]
    out.push({ key: 'invoice', title: 'Invoice business clients officially (eTIMS)', ready: m.length === 0, missing: m })
  }
  return out
}

export function assess(answers, today) {
  return { score: score(answers, today), steps: nextSteps(answers, today), channels: channels(answers, today) }
}

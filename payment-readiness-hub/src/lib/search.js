/**
 * Guide search (BM25) - finds the guides that best answer a question.
 * Words in a guide's title count 3x, in its summary 2x. Rare words (e.g. "eTIMS") matter more than common ones.
 */

const STOPWORDS = new Set(
  ('a an the and or of to in on for is are be can do does i my we our you your it this that with as at by from how what when where ' +
    'who which should need needs must will if not have has their they he she them there any about into than then so me us was were am ' +
    'get getting got like also just want know tell please would could').split(' '),
)

const SYNONYMS = {
  permit: ['work'], classm: ['permit'], pin: ['pin', 'kra'], tax: ['tax', 'paye'], salary: ['salary', 'pay', 'payroll'],
  pension: ['nssf'], health: ['shif', 'sha'], nhif: ['shif', 'sha'], mpesa: ['mobile', 'money', 'sim'], bank: ['bank', 'account'],
  id: ['refugee', 'id'], asylum: ['asylum', 'seeker'], contract: ['contract', 'written'], court: ['court', 'ruling'],
  housing: ['housing', 'levy'], privacy: ['data', 'protection'], invoice: ['invoice', 'etim'], receipt: ['invoice', 'etim'],
  freelance: ['freelancer', 'client'], freelancer: ['client', 'invoice'], client: ['invoice'], records: ['record', 'income'],
  declare: ['declare', 'income', 'return'], loan: ['income', 'record'],
}

const stem = (w) => (w.length > 4 ? w.replace(/(ing|es|s)$/, '') : w)

export function tokenize(text) {
  const words = (text || '').toLowerCase().replaceAll('class m', 'classm').replaceAll('m-pesa', 'mpesa').match(/[a-z0-9]+/g) || []
  return words.filter((w) => w.length >= 2 && !STOPWORDS.has(w)).map(stem)
}

function expand(tokens) {
  const out = [...tokens]
  for (const t of tokens) for (const s of SYNONYMS[t] || []) out.push(stem(s))
  return out
}

export function buildIndex(guides, k1 = 1.4, b = 0.75) {
  const docs = guides.map((g) => {
    const counts = new Map()
    const add = (text, times) => tokenize(text).forEach((t) => counts.set(t, (counts.get(t) || 0) + times))
    add(g.title, 3)
    add(g.summary, 2)
    add(g.body, 1)
    add(g.category, 1)
    return counts
  })
  const lengths = docs.map((d) => [...d.values()].reduce((a, v) => a + v, 0))
  const avg = lengths.reduce((a, v) => a + v, 0) / Math.max(1, lengths.length)
  const df = new Map()
  docs.forEach((d) => d.forEach((_, t) => df.set(t, (df.get(t) || 0) + 1)))
  const n = docs.length
  const idf = (t) => Math.log(1 + (n - (df.get(t) || 0) + 0.5) / ((df.get(t) || 0) + 0.5))

  return function search(query, topK = 3, minScore = 0.5) {
    const terms = [...new Set(expand(tokenize(query)))]
    if (!terms.length) return []
    return guides
      .map((g, i) => {
        let s = 0
        for (const t of terms) {
          const tf = docs[i].get(t) || 0
          if (tf) s += idf(t) * (tf * (k1 + 1)) / (tf + k1 * (1 - b + (b * lengths[i]) / avg))
        }
        return { guide: g, score: s }
      })
      .filter((r) => r.score >= minScore)
      .sort((a, z) => z.score - a.score)
      .slice(0, topK)
  }
}

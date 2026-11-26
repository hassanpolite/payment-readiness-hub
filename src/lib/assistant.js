/**
 * The assistant answers ONLY from the sourced guides.
 *   - Always: finds the best-matching guides (works offline, no key needed).
 *   - Optional: if the user adds their own free Groq API key in Settings, an AI writes a short answer
 *     grounded in those guides, with citations. If the AI call fails, the guide results are shown instead.
 * The key stays in this browser; it is sent only to Groq.
 */
import { GUIDES } from '../data/guides'
import { buildIndex } from './search'

const search = buildIndex(GUIDES)
export const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions'
export const LANGUAGES = { en: 'English', sw: 'Kiswahili', so: 'Somali', ar: 'Arabic', fr: 'French' }

const PROMPT = `You are the Payment Readiness assistant for refugees in Kenya. You help them get paid safely and legally:
SIM and mobile money, bank accounts, KRA PIN, eTIMS invoices, work permits, payslips and records.
STRICT RULES
1. Use ONLY the facts in the CONTEXT guides. Do not use outside knowledge about laws, fees, rates or deadlines.
2. Cite the guides you used with their tag, e.g. [etims-invoicing]. Every factual sentence needs a citation.
3. If the CONTEXT does not answer the question, say you don't have verified information and suggest the right office (DRS, KRA, Directorate of Immigration Services, the bank or mobile money provider) or a legal aid organisation.
4. Give short numbered steps for "how" questions. Under 200 words.
5. Never ask for ID, PIN or account numbers. Never advise using someone else's SIM or account, or avoiding tax.
6. Reply in {language}. Keep official names (KRA PIN, eTIMS, iTax, eCitizen, Class M, DRS) unchanged.
7. End with one short line: general information, not legal or financial advice (in {language}).

CONTEXT
{context}`

export function findGuides(question, history = []) {
  const lastUser = [...history].reverse().find((t) => t.role === 'user')?.content || ''
  return search(`${question} ${lastUser}`, 3).map((r) => r.guide)
}

export function offlineAnswer(question, guides) {
  if (!guides.length) {
    return "I couldn't find verified information about that in the guides. Please ask the Department of Refugee Services, KRA, your bank or mobile money provider, or a free legal aid organisation."
  }
  return ['These verified guides match your question:', ...guides.map((g) => `- ${g.title}: ${g.summary} [${g.slug}]`), 'General information, not legal or financial advice.'].join('\n')
}

export async function aiAnswer({ question, guides, language, history, apiKey, model = 'llama-3.3-70b-versatile', fetchImpl = fetch }) {
  const context = guides.map((g) => `[${g.slug}] ${g.title} (last reviewed ${g.last_reviewed})\n${g.body}`).join('\n\n')
  const messages = [
    { role: 'system', content: PROMPT.replaceAll('{language}', LANGUAGES[language] || 'English').replace('{context}', context) },
    ...history.slice(-4).map((t) => ({ role: t.role, content: String(t.content).slice(0, 1500) })),
    { role: 'user', content: question },
  ]
  const res = await fetchImpl(GROQ_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ model, temperature: 0.2, messages }),
  })
  if (!res.ok) throw new Error(res.status === 401 ? 'Your Groq API key was rejected. Check it in Settings.' : res.status === 429 ? 'Groq free-tier limit reached. Try again shortly.' : `AI service error (${res.status}).`)
  const data = await res.json()
  const text = data?.choices?.[0]?.message?.content
  if (!text) throw new Error('Empty answer from the AI service.')
  return text.trim()
}

export async function ask({ question, language = 'en', history = [], apiKey = '', fetchImpl }) {
  const guides = findGuides(question, history)
  if (apiKey && guides.length) {
    try {
      return { answer: await aiAnswer({ question, guides, language, history, apiKey, fetchImpl }), by: 'ai', guides }
    } catch (err) {
      return { answer: offlineAnswer(question, guides), by: 'guides', guides, warning: err.message }
    }
  }
  return { answer: offlineAnswer(question, guides), by: 'guides', guides }
}

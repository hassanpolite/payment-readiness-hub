# Hackathon submission pack

Fill in the two URLs after deploying, then copy each section into the form.

**1. Project name:** Payment Readiness Hub

**2. Track:** Track 2 - Legal, Regulatory & Financial Access

**3. Problem statement**
Refugees in Kenya who find work or clients often can't get paid safely in their own name. Many use SIM cards or accounts registered to other people, so the money legally belongs to someone else. They don't know which documents unlock which payment channel, and they lack invoices and income records to prove their earnings to clients, banks, landlords or KRA. Since 2026, KRA also checks declared income against electronic invoice (eTIMS) data, which raises the stakes for anyone doing business.

**4. Proposed solution**
A free, privacy-first web app that tells each refugee exactly which ways of getting paid are open to them now and what to do next, then helps them invoice clients and keep income records. It also explains salary deductions and answers questions from sourced guides in five languages.

**5. Project description**
Users answer a short readiness check: their status, how they earn, and which documents they hold. A rules engine returns a readiness score, the payment channels they can use now (own-name mobile money, bank transfers, a formal salary, official eTIMS invoicing) with what's missing for each, and ordered next steps linked to guides. Users then create invoices with their payment details, track them from draft to paid, and see income recorded automatically. A money tracker produces a printable income statement as proof of income. A net pay calculator applies 2026 PAYE, NSSF, SHIF and Housing Levy rules. All data stays on the user's device.

**6. Main features**
- Payment readiness score, open/blocked payment channels, ordered next steps
- Invoice builder: totals, statuses, overdue detection, print/PDF, payment-request text, eTIMS reference
- Money tracker with 6-month chart and printable income statement
- 2026 net pay calculator with employer cost
- 16 sourced guides with search; multilingual AI answers grounded in those guides
- Backup export/import, sample data, privacy by design (no server, no document numbers)

**7. Technologies used**
HTML, CSS, JavaScript, React 19, React Router, Vite, Vitest; optional Groq API (Llama 3.3 70B). Hosted free on Vercel.

**8. AI integration**
- *Grounded, multilingual Q&A:* the question is matched to the guides with BM25 search, and only those guides are sent to the LLM, which must answer from them, cite them and reply in English, Kiswahili, Somali, Arabic or French.
- *Responsible design:* eligibility and calculations come from deterministic, unit-tested rules, not the LLM. If AI is unavailable, the app shows the matching guides instead. Users supply their own free key, stored only in their browser.

**9. SDG alignment**
- **SDG 8 Decent Work:** being paid formally, in your own name, with correct deductions.
- **SDG 10 Reduced Inequalities:** opens financial channels refugees are often excluded from.
- **SDG 16 Strong Institutions:** makes KRA, DRS and permit rules clear and actionable.

**10. Expected social impact**
Fewer refugees relying on borrowed SIMs or accounts; more refugees with KRA PINs, own-name accounts and records that prove income, which helps them access credit, housing and formal clients. Programmes and NGOs can use the app in onboarding sessions at no cost.

**Evaluation benchmarks**
| Benchmark | How the Hub addresses it |
|---|---|
| Credential & skills verification | Tracks the identity and tax documents that make a worker verifiable; income statement as documented proof of earnings |
| Access & compliance readiness | Core of the product: channels unlocked by each document, KRA PIN, eTIMS, Class M, payroll deductions |
| Practical & market fit | Real invoices with payment instructions, paid/overdue tracking, printable records for clients and banks |
| Social & SDG impact | SDG 8/10/16; multilingual; privacy by design |
| Sustainability & scalability | No server costs; rules and rates in one tested place; works for any refugee, anywhere in Kenya, on any phone browser |

**11. GitHub repository URL:** `https://github.com/YOUR-USERNAME/payment-readiness-hub`

**12. Live application URL:** `https://YOUR-APP.vercel.app`

**13. Brief summary (≈50 words)**
Payment Readiness Hub helps refugees in Kenya get paid safely in their own name. A readiness check shows which payment channels are open and the next steps (SIM, mobile money, KRA PIN, eTIMS, bank). Users create invoices, track income and print proof of earnings, with multilingual AI answers grounded in sourced guides.

---

## Demo script (3 minutes)

1. **Problem (20 s):** "Halima designs logos in Kakuma. Her clients pay to a SIM registered to her neighbour. That money legally isn't hers."
2. **Readiness (45 s):** Check my payment readiness → Freelancer → set documents → score 63%, mobile money ready, eTIMS blocked → next step: KRA PIN.
3. **Invoice (45 s):** New invoice → two items → Save → Mark as sent → Record payment → it appears in the Money tracker.
4. **Proof of income (20 s):** Money tracker → Income statement → Print.
5. **Ask (30 s):** in Kiswahili, "Je, ninahitaji eTIMS kutuma ankara?" → cited answer → open the guide's KRA source.
6. **Close (20 s):** no server, data stays on the phone, SDG 8/10/16, free to run.

Before presenting: add your Groq key in Settings on the demo laptop, and keep a screen recording as backup.

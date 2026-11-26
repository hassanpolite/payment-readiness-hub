# Payment Readiness Hub

**Helps refugees in Kenya get paid safely, in their own name, the legal way.**
PLP x ILO Mini Hackathon 2026 - **Track 2: Legal, Regulatory & Financial Access** (SDG 8, 10, 16)

Built with **HTML, CSS, JavaScript and React** only. There is no backend and no database: everything is saved in the user's browser (localStorage), so it is free to host and private by design.

> General information based on Kenyan rules checked on **26 November 2026** - not legal or financial advice.

## Features

- **Payment readiness check**: status, how you earn (employed, job seeker, freelancer, business) and which documents you hold (Refugee ID, own-name SIM, mobile money, KRA PIN, bank account, Class M permit or eTIMS). You get:
  - a **readiness score** (0-100)
  - **which ways of getting paid are open now** (mobile money, bank transfers, formal salary, official eTIMS invoicing) and exactly what is missing
  - **ordered next steps**, each linked to a sourced guide
- **Invoices**: create invoices with your payment details, totals calculated automatically, draft → sent → paid or cancelled, overdue detection, print/PDF, "copy payment request" for SMS/WhatsApp, and an eTIMS reference field. Marking an invoice paid records the income automatically.
- **Money tracker**: income and expenses by category and channel, a 6-month chart, date filters, and a printable **income statement** (proof of income for banks, landlords, lenders or KRA).
- **Net pay calculator**: 2026 PAYE, NSSF Year 4, SHIF and Housing Levy, plus employer cost, with sources.
- **16 sourced guides** with last-reviewed dates: Refugee ID, SIM and mobile money (LN 90 of 2025), KRA PIN, eTIMS, declaring income, Class M, the 2026 High Court ruling, payroll deductions, and more.
- **Ask**: finds the best-matching guides (BM25 search, works offline). Optional **AI answers in 5 languages** (English, Kiswahili, Somali, Arabic, French) if the user adds their own free Groq API key. Answers are grounded only in the guides, with citations, and fall back to the guides if AI fails.
- **Your data**: export/import a JSON backup, load sample data, delete everything. The API key is never included in backups.

## Tech

| Part | Technology |
|---|---|
| UI | React 19 + React Router, plain CSS (`src/styles.css`) |
| Build | Vite |
| Tests | Vitest (unit) |
| Storage | Browser localStorage |
| AI (optional) | Groq API called from the browser with the user's own key |
| Hosting | Vercel or Netlify (free) |

## Project structure

```
payment-readiness-hub/
├── index.html
├── src/
│   ├── main.jsx  App.jsx  styles.css
│   ├── components/   Layout.jsx, ui.jsx
│   ├── pages/        Home, Readiness, Invoices, InvoiceEditor, InvoiceView, Money, Pay, Guides, Guide, Ask, Settings
│   ├── lib/          readiness.js (rules), payroll.js, money.js, search.js, assistant.js, store.jsx (localStorage), format.js
│   └── data/         guides.js (sourced content), sample.js (fictional demo data)
├── tests/logic.test.js   27 unit tests
├── public/           favicon.svg, _redirects (Netlify)
├── vercel.json       (Vercel: lets page refreshes work)
├── docs/             DEPLOYMENT.md, TESTING_CHECKLIST.md, SUBMISSION.md
├── package.json  vite.config.js  .gitignore  LICENSE  README.md
```

## Run locally

Prerequisite: Node.js 20 or newer.

```bash
npm install
npm run dev        # open http://localhost:5173
npm test           # run the 27 unit tests
npm run build      # production build into dist/
```

Click **Explore with sample data** on the home page to see a filled-in example (fictional).

## Deploy

See **[docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)**: push to GitHub, then import the repo on Vercel. No environment variables are needed.

## Keeping rules current

- Payroll rates: `src/lib/payroll.js` (`RATES`, with an `asOf` date).
- Readiness rules: `src/lib/readiness.js`.
- Guides: `src/data/guides.js`. Update `last_reviewed` whenever you re-check a source.
- Run `npm test` after any change.

## Limitations

- Data lives in one browser. Clearing browser data deletes it, so export backups. There is no sync between devices.
- Invoices here are payment requests and records, not KRA eTIMS tax invoices.
- AI answers need the user's own Groq key, and the key is visible to anyone using that browser. Don't add it on shared computers.
- Assumes a resident employee for net pay; does not file returns or move money.

## License

MIT - see [LICENSE](LICENSE).

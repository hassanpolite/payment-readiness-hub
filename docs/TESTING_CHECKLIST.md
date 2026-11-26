# Testing checklist

Tick each item on the **live** site before submitting.

## Automated
- [ ] `npm test` → 27 passed
- [ ] `npm run build` succeeds

## Readiness
- [ ] Choose "Freelancer", Refugee ID = have (with expiry), SIM = have, Mobile money = have, KRA PIN = applied → score **63%**
- [ ] "Receive mobile money in your own name" shows **Ready**; eTIMS invoicing shows what is missing
- [ ] Switch to "Employed" → Class M appears instead of eTIMS, and a salary channel appears
- [ ] An expiry date in the past makes the Refugee ID count as expired
- [ ] "Asylum seeker" caps the score at 20% and adds a "Follow up your refugee status" step
- [ ] Refreshing the page keeps all answers

## Invoices
- [ ] Saving with no client shows "Add the client name."
- [ ] Two items (12,000 + 2 × 1,500.50) total **KSh 15,001**; number is INV-YYYY-0001
- [ ] Draft → Mark as sent → Record payment → "Paid", and an income record appears in the Money tracker
- [ ] "Undo paid" removes the linked income record
- [ ] A sent invoice past its due date shows **Overdue**
- [ ] Print / PDF shows a clean invoice with "How to pay" from Settings
- [ ] Copy payment request works (paste it into a note)

## Money tracker
- [ ] Add an expense → totals and chart update; a future date is refused
- [ ] Income statement shows the period totals and prints cleanly

## Net pay
- [ ] KSh 100,000 → net pay **KSh 70,441.65**; KSh 8,000 → SHIF KSh 300 and PAYE 0

## Guides & Ask
- [ ] Search "eTIMS" finds the eTIMS guide; each guide shows sources and a last-reviewed date
- [ ] Ask without a key → "Matching guides" answer with links
- [ ] Add a Groq key in Settings → choose Kiswahili → AI answer with clickable guide citations
- [ ] With a wrong key → warning shown, and guide results still appear

## Data
- [ ] Export backup downloads a .json file without the API key inside
- [ ] Delete all data → empty; Import backup → everything restored
- [ ] "Explore with sample data" fills the app with fictional data

## General
- [ ] Mobile (390px): menu button works, tables scroll sideways inside their box, no page-wide sideways scroll
- [ ] Unknown URL shows "Page not found"; refreshing any page on the live site works

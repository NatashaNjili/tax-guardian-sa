# Tax Companion Pro

TaxGuard SA — Lovable Build Prompt

(Working name — rename freely. Paste this whole document into Lovable as your build prompt / project brief.)

1. WHAT YOU ARE BUILDING

Build TaxGuard SA, a South African personal and small-business tax companion. It has three jobs that work together as one product:

Explain — a plain-language chat assistant that tells someone whether they need to file with SARS, and roughly what they'll owe or get back.

Track — a monthly salary/PAYE tracker that catches under-deduction or missing PAYE early, instead of the employee finding out a year later.

Protect — an AI bookkeeper for small business owners and side-hustlers who get paid in lump sums or cash deposits, so that when SARS eventually looks at their bank account, there is already a clean, evidence-backed record proving what was actually income versus what was a business expense — built up one photographed receipt at a time.

The third job is the core differentiator. Most South African micro and small business owners don't keep books because they can't afford a bookkeeper. SARS taxes based on what lands in the bank account. If someone earning R50,000 a month actually spends R45,000 of that on stock, transport, and running the business, and they have no records, SARS can — and does — assess them as if the whole R50,000 was profit. By the time SARS raises a query or an audit, months or years have passed and the paperwork is gone. This app exists so that record is being built automatically, in real time, from day one — not reconstructed in a panic after an assessment arrives.

This is not SARS. It is not a registered tax practitioner or a law firm, and it doesn't file or dispute anything on the user's behalf. It is the record-keeping, categorisation, and explanation layer that a bookkeeper and accountant would normally provide, kept current so the user (or the practitioner they eventually hire) has evidence ready the moment SARS asks.

2. WHO THIS IS FOR

Two user types, one app:

Employees — salaried, want to know if PAYE is being deducted correctly and whether they'll owe or get a refund. May have never filed before, may not understand SARS terms, may be anxious about "getting in trouble."

Small business owners / freelancers / side-hustlers — spaza shop owners, hairdressers, nail techs, delivery drivers, freelancers, small traders. Get paid via cash, EFT, or app transfers, often in irregular lump sums (e.g. two months' worth of stipends landing at once). Rarely have formal bookkeeping. Most financially literate about running their business day-to-day, but not about what SARS considers taxable income versus what's deductible, or what records they're legally required to keep.

Assume low-to-medium financial literacy across both groups. Never assume the user knows tax jargon, has an accountant, or has ever filed before. Never make anyone feel judged for that.

3. CORE PRINCIPLE THAT SHAPES EVERY FEATURE

Money arriving in a bank account is not automatically taxable profit, and money spent is not automatically deductible — but South African taxpayers get assessed as if it is, because they have no evidence either way. Every feature in this app exists to close that evidence gap, continuously, at the moment a transaction happens — not months later when SARS has already sent an audit letter.

That means the product must always be able to answer, for any period SARS asks about:

What actually came in, and where each deposit came from (sales, a loan, a refund, a transfer between own accounts — these are not all "income")

What was spent, on what, backed by a photo of the slip

How that nets down to actual taxable income, using real accounting categories (cost of sales, operating expenses, capital items) — not a guess

Why the user believes each number, in a form SARS can actually receive as a response to a query

4. LANGUAGE, TONE & ACCESSIBILITY (applies to every screen and every AI response)

Support English, isiZulu, isiXhosa, Afrikaans, Sepedi, Setswana, Sesotho, Xitsonga, siSwati, Tshivenda, and isiNdebele. Detect from user input or let them choose; respond in that language throughout.

Plain, short sentences. No subordinate clauses stacked on subordinate clauses.

Every SARS or accounting term gets a one-line plain-English gloss the first time it's used per session, e.g. "your provisional tax (tax you estimate and pay twice a year if you earn business income, instead of it being deducted monthly like a salary)."

Use everyday analogies (e.g. tax brackets as a staircase — you only pay the higher rate on the portion of income on that step).

One question at a time in any conversational flow. Never ask for five fields in one chat message.

If a user's phrasing suggests low literacy or reading difficulty, simplify further rather than repeating yourself louder. Offer a different explanation, voice input, or "show me on an example" rather than more text.

No shame, ever, for never having filed, having missed deadlines, or not understanding a term.

Be reassuring about deadlines and penalties without minimising them — state facts plainly, don't fear-monger.

Confirm understanding periodically ("Does that make sense so far?") instead of assuming it.

5. CORE USER JOURNEY

Register / Login
   ↓
Quick profile: Employee only / Business or side-income / Both
   ↓
[Employee path]                          [Business / side-income path]
Add monthly salary + PAYE deducted        Set up business profile (turnover
   ↓                                      tax vs standard, VAT status)
System estimates PAYE, compares to           ↓
actual, flags shortfall/over/no-PAYE      Log income deposits + snap receipts
   ↓                                      for every expense as they happen
Dashboard + alerts update                    ↓
   ↓                                      AI categorises, builds ledger,
Continue monthly                          flags anything unusual
   ↓                                          ↓
Annual Tax Summary + filing guidance      Running profit & loss, provisional
                                           tax estimate, money-to-set-aside
                                              ↓
                                           Continuous audit-ready record
                                              ↓
                                           If SARS ever queries: generate
                                           Audit Response Pack in minutes


Both paths share the same dashboard shell, alert centre, and annual summary — a user with both a salary and a side hustle sees both sections.

6. FEATURE SET

A. Tax Filing Chat Assistant

A conversational guide (not just a form) that figures out, through simple back-and-forth questions, whether someone needs to file at all, and estimates their position.

Collects, one topic per message:

Employment status: employed, self-employed/freelance, both, unemployed, retired, other

Whether PAYE was deducted monthly by an employer

Other income: rental, investment/interest, side business, freelance

Age (for rebate/threshold purposes)

Dependants and medical aid contributions (medical tax credit)

Retirement annuity / pension fund contributions

Other deductions: donations to registered charities, home office (if self-employed), travel logbook

Whether they've already received a SARS auto-assessment notice

Produces an end-of-conversation summary:

Plain-language summary (2–3 sentences)

Step-by-step calculation: bracket → rebate(s) → net tax → compared to PAYE/provisional tax already paid

Result: likely refund of approximately R___, may owe approximately R___, or likely doesn't need to file, stated as an estimate — never as certainty

Their specific filing deadline, with a countdown

Concrete next steps (e.g. "Gather your IRP5 from your employer," "Log into SARS eFiling," "Consider a registered tax practitioner if [reason]")

A confidence/limitations note: this is an estimate from self-reported information and must be checked against official documents before submission

Filing season dates (2026 filing season — update every year, these change annually):

Auto-assessment notices issued: 1–12 July

Filing opens for individuals not auto-assessed: 13 July

Non-provisional individuals must file by: 23 October

Provisional taxpayers and trusts must file by: 22 January (following year)

Always tell the user which category applies to them and show their specific deadline with a countdown. Mention late-filing penalty risk honestly (a fixed monthly administrative penalty scaling with taxable income, which keeps accruing while the return is outstanding) — as information, never as a threat.

B. Monthly Salary & PAYE Tracker

For the employee side. For every salary period, capture basic salary, bonus, overtime, other taxable income, PAYE deducted, UIF, other deductions, and the resulting net pay. Allow a payslip photo/PDF to be attached as proof.

The system estimates what PAYE should have been (using the configurable tax engine in section 7), compares it to what was actually deducted, and assigns a status:

PAYE appears aligned ✓ — actual is reasonably close to estimate

Possible PAYE shortfall ⚠️ — actual is lower than estimate; show estimated PAYE, actual, difference, and running total for the tax year

Possible over-deduction — actual is higher than estimate; show the difference, but never promise a refund

No PAYE deduction detected 🚨 — PAYE deducted is R0 but estimated PAYE is greater than R0. This is the highest-priority alert. Show gross income, estimated PAYE, R0 deducted, and the potential difference, with the explanation: "No PAYE was recorded for this period, while your recorded income indicates income tax may be applicable." Recommended actions: review the payslip, confirm with the employer/payroll, verify the tax position, consider setting aside the estimated difference while checking.

Never say "you owe SARS R___." Always frame it as "you may have a potential tax obligation based on what's recorded" or "consider setting aside approximately R___ while you verify this."

C. AI Bookkeeper & Accountant (the core new module, for business/side-income users)

This is the module that answers Tasha's original problem: a small business owner shouldn't have to discover a huge SARS bill a year later with no way to prove what their real profit was.

6.1 Snap-and-log expense capture

User photographs a slip, or screenshots a proof of payment/EFT confirmation, for every purchase — no manual data entry required as the primary flow.

The AI reads the image (OCR + vision), extracts: vendor, date, amount, VAT (if a VAT invoice), and a best-guess description of what was bought.

The AI classifies the expense into standard accounting/SARS categories: cost of sales/stock, transport and vehicle costs, rent, utilities, salaries/wages paid, professional fees, marketing, repairs and maintenance, bank charges, insurance, telephone/data, small tools/equipment (vs. capital assets), home office portion (if applicable), and "other — needs review."

Every classification is shown to the user in plain language with a one-line reason ("Filed as transport because it's a fuel purchase") and the user can correct it. Corrections should improve future categorisation for that user.

The original photo stays attached to the ledger entry permanently — this is the proof, not just the number.

6.2 Income vs. deposit reconciliation

Every bank deposit gets logged and the user (or, where a bank/statement connector is available, an imported statement) tags what it actually was: business sale, loan received, refund, reimbursement, transfer between own accounts, gift, or other. This is critical — it stops the system (and eventually SARS) from treating every rand that lands in the account as taxable turnover.

Lump sums that represent multiple periods (e.g. two months of stipends paid at once) can be split and allocated back to the periods they relate to, with a note explaining why, so income isn't bunched into one artificially high month.

Flag anything untagged after a set period so nothing sits unexplained.

6.3 Automated bookkeeping output

From logged income and categorised expenses, generate, continuously and per tax year:

A simple income statement (income − cost of sales − operating expenses = profit)

A running expense ledger by category, exportable

A basic asset register for anything bought that should be depreciated rather than expensed in one go (equipment, vehicles), flagged separately from ordinary expenses

Apply real accounting principles, explained simply as needed: matching income to the period it relates to, keeping capital purchases separate from running expenses, not double-counting money moved between the user's own accounts as both income and expense.

Everything is presented in tables the user can actually read, plus a plain-language paragraph summarising the period ("This month you brought in R50,000. R45,000 went to stock, transport, and other running costs, backed by 23 receipts. Estimated taxable profit: R5,000.")

6.4 Provisional tax & set-aside tracking

For business/freelance income, estimate provisional tax obligations (first period ~August, second period ~February — confirm current SARS dates, these shift slightly year to year) using the running profit figure, not the whole turnover.

Extend the "money set aside" tracker from PAYE shortfalls to cover provisional tax: show estimated obligation, amount set aside, and what's still needed — always visually distinct from tax already paid.

6.5 Turnover tax / VAT eligibility helper

Using the business's actual turnover, tell the user in plain language whether they currently qualify for the simplified turnover tax regime, and whether they're approaching or past the VAT registration threshold (see section 7 for current figures — these change at Budget time, so keep them in the configurable tax-rules table, not hardcoded in the app logic).

Explain what each option means for them in one paragraph, not a legal treatise, and recommend a registered tax practitioner for the actual registration decision.

6.6 SARS Audit / Verification Response Pack This is the "it fights for you" feature, reframed honestly: the app doesn't fight SARS — it makes sure the user isn't fighting empty-handed.

One-tap generation of a document bundle covering any date range SARS has queried, containing:

Cover summary: who the taxpayer is, the period covered, total income and total expenses claimed, net taxable income for the period

Full expense ledger for that period with category, amount, vendor, and a thumbnail of each attached receipt

Income/deposit reconciliation for that period, explaining every deposit

A plain-language narrative explanation a non-expert wrote in real time, not reconstructed after the fact

Clearly label this as supporting evidence prepared by the taxpayer, not an official accounting or legal submission, and note SARS's real process and deadlines so the user knows what they're actually dealing with:

SARS can request supporting documents as part of a verification or audit, and there's a Request for Relevant Material process with its own deadline to respond

Records generally need to be kept for 5 years from the date the return was submitted (longer if there's an open audit, objection, or appeal, or if the business is a company/CC, which face longer Companies Act retention periods)

If someone disagrees with an assessment, a Notice of Objection must generally be lodged within 80 business days of the assessment (or of SARS's response to a Request for Reasons), and SARS operates a "pay now, argue later" approach in the meantime — these are exactly the moments this pack is meant to make easier to respond to in time, not exactly the moments to attempt alone if the amounts are large

Always recommend a registered tax practitioner for anything beyond straightforward record-sharing — a real audit or dispute with significant amounts at stake needs a human professional, and the app should say so plainly rather than implying it can represent the user.

D. Shared Dashboard

Show, depending on which paths the user has active:

Total gross income (employment + business, split out)

Total PAYE deducted / total provisional tax paid

Estimated PAYE / estimated provisional tax

Possible difference

Total net income

Current tax year

Months/periods recorded

Active tax alerts

For business users: this month's profit snapshot (income − expenses, with receipt count)

Simple charts only: monthly gross vs. net, estimated vs. actual PAYE/provisional tax, and — for business users — income vs. expenses over time. Don't overload it.

E. Tax Alert Centre

One place listing every alert across both employee and business tracking: no PAYE/provisional tax deducted or paid, possible under/over-deduction, missing months, missing payslips or receipts, untagged deposits, significant estimate-vs-actual differences. Each alert: period, type, estimated amount, actual amount, difference, recommended action, status (New / Reviewing / Resolved). Show the active count prominently on the dashboard.

F. Tax Calculator (standalone, no saving required)

Let anyone estimate tax without creating a record: input monthly or annual salary/business profit, bonus, other income → show annualised taxable income, estimated annual tax, estimated monthly PAYE or provisional tax, estimated take-home, and applicable marginal bracket. One line explaining that SA uses progressive brackets (the staircase analogy).

7. TAX CALCULATION ENGINE

Build this as data, not hardcoded logic — a configurable tax-rules table the app reads from, because these figures change every year (usually announced at the February Budget Speech, sometimes revised mid-year as happened in 2026). Structure:

Tax year

Income bracket minimum / maximum

Rate for that bracket

Base tax amount for that bracket

Rebates (primary / secondary age 65+ / tertiary age 75+)

Tax thresholds by age band

Turnover tax bands and tax-free threshold

VAT compulsory and voluntary registration thresholds

SARS interest rate on late/underpaid tax and on refunds

Reference figures to seed the table with (verify against SARS's site before going live, and rebuild the yearly-update process into the roadmap — don't ship this frozen):

2026/27 individual brackets were adjusted ~3.4% for inflation at the February 2026 Budget — pull the actual published bracket table rather than reusing 2025/26 numbers.

From 1 April 2026: compulsory VAT registration threshold increased from R1 million to R2.3 million; voluntary registration threshold increased from R50,000 to R120,000.

From 1 April 2026: turnover tax qualifying threshold increased from R1 million to R2.3 million annual turnover, with a new tax-free band up to R600,000.

SARS interest from 2 March 2026: 10.25% p.a. on late/underpaid tax; 6.25% p.a. refund of overpaid provisional tax; 10.25% p.a. refund after successful appeal.

Do the actual arithmetic in backend code, not by trusting the AI model to calculate — pass the computed result to the AI layer purely for plain-language explanation. This is both more accurate and easier to audit if a user or SARS ever questions a number.

Do not:

Apply one flat percentage to an entire salary or entire turnover

Treat marginal rate as if it were the effective rate

Label any estimate as an official SARS assessment, IRP5, IT3(a), or "amount owed to SARS"

Promise a refund

Invent a figure when the underlying tax-year configuration data is missing — say what's missing instead

8. DATA MODELS

User — id, name, email, preferred language, created date, user type (employee / business / both).

Business Profile — user id, business name, turnover tax vs. standard election, VAT registered (y/n), estimated annual turnover, tax year start (turnover tax allows flexible year-ends now).

Salary Record — user id, month, tax year, basic salary, bonus, overtime, other taxable income, gross salary, PAYE deducted, estimated PAYE, PAYE difference, UIF, other deductions, net salary, tax status, payslip reference, created/updated date.

Income Deposit — user id, date, amount, source description, category (business sale / loan / refund / transfer between own accounts / reimbursement / other), linked period, notes, evidence attachment.

Expense Record — user id, date, vendor, amount, VAT amount (if applicable), category, AI-suggested category, user-confirmed category, description, receipt image reference, capital item flag, created/updated date.

Tax Alert — user id, related record id (salary or expense/income period), alert type, description, estimated amount, actual amount, difference, recommended action, status, created date.

Tax/Cash Provision — user id, tax year, obligation type (PAYE shortfall / provisional tax), amount set aside, date, notes.

Audit Response Pack — user id, period covered, generated date, included record ids, narrative summary text, export file reference.

Tax Rate Configuration — tax year, bracket min/max, rate, base tax, rebates, thresholds, turnover tax bands, VAT thresholds, interest rates.

9. GUARDRAILS (STRICT — do not deviate)

Estimates only, always labelled as such. Never claim certainty about a final SARS-determined amount.

Never submit anything to SARS on the user's behalf. The app prepares and explains; the user (or their practitioner) reviews and personally submits via eFiling, MobiApp, or in person. State this at the end of every relevant flow.

Never fabricate figures. If there isn't enough information to calculate something, say what's missing.

Escalate real complexity. Foreign income, capital gains, trust structures, amounts that look unusually large or inconsistent, or an actual audit with significant money at stake → recommend a registered tax practitioner or SARS branch rather than pushing through a full calculation or defense pack alone.

Protect sensitive data. Never ask for a full ID number, bank account number, or SARS eFiling password/PIN. If a user shares this unprompted, tell them it isn't needed and shouldn't be pasted into a chat.

POPIA awareness. Treat all financial and personal data as confidential. Don't repeat sensitive figures back more than needed for the summary being shown.

No shame, ever.

Accessibility first, per section 4.

Currency of information. If the app detects it's operating outside the tax year window its configuration was written for, say so and prompt a check of current SARS figures rather than silently using stale numbers.

Money set aside is never counted as tax already paid. Keep these visually and structurally separate everywhere in the UI.

Don't present as SARS. No SARS branding, no look-alike styling to the official eFiling site, no generated documents named IRP5, SARS Certificate, Tax Assessment, or Official Tax Statement — the audit pack is a Personal Tax Summary / Supporting Evidence Pack only.

10. DISCLAIMER (display in-app and on every generated report/pack)

TaxGuard SA is an independent personal tax and bookkeeping tool and is not affiliated with or endorsed by the South African Revenue Service (SARS). Calculations and evidence packs are estimates and summaries based on information the user recorded, and are not official tax assessments or accounting sign-offs. Users should verify their tax position with a registered tax practitioner, their employer, or SARS directly, especially before relying on any figure for a filing, dispute, or audit response. Official IRP5/IT3 certificates and SARS assessments remain the authoritative records.

11. DESIGN & UX

Feel: professional, trustworthy, calm, simple — like a good community advice-desk, not a call-centre script or a legal-disclaimer generator, and not a generic admin dashboard either.

Clean dashboard cards, strong visual hierarchy, generous whitespace, consistent Rand formatting everywhere.

Status colours used consistently: green = aligned/positive, amber/orange = needs attention, red = urgent (e.g. no PAYE/provisional tax detected).

The dashboard should read left to right as a story: Income → Deducted/Paid → Expected → Difference → Action needed.

Receipt capture should be the fastest possible action from anywhere in the app — a persistent camera/upload button, not buried in a menu.

Responsive for mobile first — this is the primary device for the target user, and receipts get photographed on a phone.

Clear empty states, helpful inline form validation, accessible labels.

No SARS branding or visual mimicry of the official SARS site.

Navigation (sidebar desktop / bottom nav mobile): Dashboard · Add Salary · Snap Expense/Receipt · Business Ledger · Salary History · Tax Calculator · Tax Alerts · Payslips & Receipts · Tax Provision · Annual Summary · Settings.

12. BUILD PRIORITY (MVP order)

User authentication, own-data isolation

Business profile + salary/employee profile setup

Monthly salary entry → estimated PAYE → actual vs. estimated comparison

No-PAYE detection and shortfall alerts

Receipt/slip photo capture → AI extraction and categorisation → expense ledger

Income deposit logging and reconciliation (income vs. loan/transfer/refund tagging)

Dashboard combining both sides

Tax Alert Centre

Tax/cash provision tracker (PAYE + provisional tax)

Salary history and business ledger detail views

Annual Tax Summary

Personal Tax Summary Report / Audit Response Pack generation and export

Tax Calculator (standalone)

Multilingual chat assistant layer over the above

Use realistic demo data to show the dashboard working, clearly separated from real user-entered records. Automatic payslip/receipt data extraction should work in the MVP (this is core to the value proposition, not a later add-on) — but keep the AI extraction logic modular so the model or provider can be swapped later without rebuilding the ledger.

13. SUCCESS CRITERIA

A user can open TaxGuard SA and, at any point, answer:

How much have I actually earned, and where did each deposit come from?

How much tax has been deducted or paid so far?

Roughly how much should have been deducted or paid?

Is there a gap, and how big is it?

Do I need to investigate, set money aside, or talk to a practitioner?

If SARS asks me to prove any of this tomorrow, can I generate the proof right now?

That last question is the real product. Everything else in this spec exists to make the answer "yes."

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://tax-guardian-sa.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/eae44513-7513-4266-aeb1-71b03d32ee72).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

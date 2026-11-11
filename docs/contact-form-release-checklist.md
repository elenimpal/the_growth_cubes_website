# TGC Contact Form — Implementation & Release Checklist

**Scope:** TSK-025 / TSK-018 / PRJ-001. Draft implementation, **not production-approved**.

## Implemented in this branch
- English and Greek contact forms now submit JSON to `/api/contact` without opening the visitor's email application.
- `api/contact.mjs` provides a Vercel Node.js POST endpoint with same-origin check, request size limits, server-side field validation, a supplementary honeypot, and Resend HTTP API delivery.
- Server-only environment variables: `RESEND_API_KEY`, `CONTACT_FROM_EMAIL`, `CONTACT_TO_EMAIL`. Configure these in Vercel, **never in GitHub**. The proposed sender must be an approved and verified domain identity; receiver is the authorized corporate inbox.
- The form displays accessible bilingual validation, pending/success/failure feedback, and prevents double-submit while a request is in progress.
- After a confirmed provider-accepted submission, a consent-aware `dataLayer` event `contact_form_success` is emitted with only `form_id: contact` and `form_language: en|el`. It does **not** directly call GA4 and does not contain the submitted values.
- Bilingual privacy pages drafted for the proposed changed processing model (not legally approved).

## Before staging deployment
1. Founder approval of the proposed provider (Resend), account billing, processing terms, retention and appropriate data processing/transfer safeguards.
2. Configure verified **sender** domain identity and the environment variables in an authorized Vercel project. Check SPF/DKIM carefully without damaging existing Google Workspace mail authentication. No keys or SMTP credentials in repository.
3. Add effective public-endpoint abuse controls, e.g. verified challenge (Turnstile or equivalent) and/or enforceable IP-based server-side rate limiting with privacy review. The honeypot is **not sufficient** for public production.
4. Confirm domain/origin handling on the actual Vercel preview/production hosts and that the `.mjs` function is deployed correctly; ensure preview and production keys are separated.
5. Check and approve both privacy policies: they currently describe an intended provider and are draft text, not privacy/legal signoff.
6. Verify route return codes, large requests, invalid and malicious input, timeout, network failure, provider rejection, repeat submission/idempotency and accessible success/failure UX.
7. Send synthetic test leads on both languages; independently verify that messages actually arrive at the company mailbox and reply-to works. Never use actual customer personal data for QA.

## GA4 / GTM measurement gate
1. Do **not** publish a new GTM tag yet. First inspect the published tags for duplicates.
2. Configure exactly one GA4 Event tag on the custom dataLayer event `contact_form_success`, with GA4 event name `generate_lead`.
3. Fire only with appropriate statistics/analytics consent; verify Denied vs Granted and that no name, company, email, message, or identifiers are included in GA4 or GTM event parameters.
4. Test successful/failed submission and repeated submit in Tag Assistant, Realtime and DebugView; count one `generate_lead` per actual accepted inquiry in consented scenario.
5. Mark `generate_lead` as the primary GA4 key event after approval.

## Evidence / release
- Capture approved source diff, preview deployment, EN/EL desktop and mobile tests, accessibility checks, error scenarios, consent behavior and mail inbox receipt.
- Record an explicit owner go/no-go decision and rollback plan before merging/deploying. Keep the existing `main` branch and production site unchanged until approved.


## Approved direction — staged rollout (11 November 2026)

**Status:** Founder agreed to begin implementation gradually. These are architecture and preparation checkpoints; not approval to create accounts, spend money, change DNS, merge code, or activate production email sending.

### Phase 1 — Provider setup and readiness
- Confirm Resend's free plan is sufficient, and assess account owner, verification, data processing/retention, and technical obligations.
- Founder creates/authorizes an agency-controlled Resend account as a separate step. Never share API keys in chat or commit them to Git.
- Determine a suitable sending subdomain and review DNS changes against existing Google Workspace SPF, DKIM, DMARC and MX setup. No DNS modifications without explicit approval.
- Verify Vercel production/preview ownership and environment variable permissions.

### Phase 2 — Contact inquiry transaction
- Keep one bilingual form; send inquiry to the existing corporate inbox through a server-side Resend call.
- Only after the provider accepts the inquiry, show submission acknowledgment in the website and queue/send an **acknowledgment email to the visitor**. An accepted API request is not proof of delivery; inbox receipt must be tested.
- Suppress duplicate acknowledgment emails and abuse from repeated, automated, or forged submissions. Enforce robust server-side rate limiting/challenge, not solely a honeypot.
- Failure to send the visitor acknowledgment must not falsely state that their inquiry failed when the company submission succeeded; report the correct status.

### Phase 3 — Optional newsletter workflow
- Keep newsletter checkbox **unchecked and optional**, with clear bilingual consent copy and linked privacy information.
- The proposed preferred flow is **one visitor acknowledgment email** containing a conditional newsletter section with a confirmation link only if the newsletter box was checked. This verifies ownership of the email address without sending a separate verification email.
- **Decision pending founder sign-off:** single opt-in with unsubscribe notice vs confirmation-link (double opt-in) inside the acknowledgment. Do not activate newsletter registration before selecting and testing one approach.
- For confirmation-link flow, save a short-lived, protected pending opt-in and consent evidence; activate a Resend contact only after successful verification. Ensure tokens are one-time and have short expiration, with no token leaked into analytics.
- Unsubscribes/suppression must be respected across future imports; keep an independently exportable consent record. Do not put personal data in GA4.

### Phase 4 — Staging and release gates
- Test both languages, successful and failed inquiries, acknowledgment email delivery, opt-in/no opt-in, duplicate submission, link replay and expiry, unsubscribe, anti-abuse, and consented GA4 event behavior.
- Confirm privacy notices and provider processing terms with appropriate review; ensure any data stores and retention are described.
- Merge or deploy only after founder's explicit approval and a tested rollback path.

### Next practical checkpoint
**Resend account readiness:** read-only comparison of the approved plan, domain strategy and Vercel ownership, then guided agency-controlled account setup. No live changes at this checkpoint.

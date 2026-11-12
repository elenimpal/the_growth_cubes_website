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


---

## Integrated workflow scope and completion gates — 12 November 2026

**Founder direction:** Handle the website inquiry, optional visitor acknowledgment, newsletter double opt-in, measurement, security, and privacy together as one coherent workstream. Avoid leaving partially specified work; preserve the existing form UX and implement only confirmed necessary changes. This addendum **supersedes outdated proposed/pending decisions above** where explicitly resolved. It is a design and QA checklist, NOT blanket approval to enable sending to visitors, publish tracking, create broad credentials or storage, or deploy to Production.

### Current evidence and scope lock

- **PASSED (Preview):** EN and EL direct inquiry to corporate mailbox via Resend; founder confirmed successful UI and inbox receipt in both languages. Mobile appearance accepted by founder. Resend sending-domain DNS verified. Branch-only Preview variables `RESEND_API_KEY`, `CONTACT_FROM_EMAIL`, `CONTACT_TO_EMAIL` configured; the API key is restricted to Sending access. No secret values in source or documentation.
- **PASSED (source/read-only):** Frontend avoids mailto for submission, uses one in-flight request guard and accepted-response condition; API validates origin, MIME, size, email/fields and UUID, with honeypot and email-provider idempotency. Founder-approved `method="post"` JS-fallback safeguard on both HTML forms. Preview-only WAF applies 5 POST /api/contact requests per ten minutes per IP.
- **OPEN:** Real 429 enforcement behavior, origin/error/timeout/retry and accessibility behavior, reply-to test, BotID/anti-abuse decision, Cookiebot withdrawal/data protection checks, current GTM container duplicate audit, lead event reception, Resend customer acknowledgment, newsletter confirmation backend, privacy policy sign-off, hosting-plan commercial eligibility and final Production go/no-go.
- **NOT IMPLEMENTED / NOT LIVE:** Visitor acknowledgment email; active newsletter registration/confirm/unsubscribe; GTM `generate_lead` event tag; new Production contact flow. The newsletter checkbox is intentionally disabled. Draft PR #1 remains unmerged.

### Stream A — GA4 / GTM event measurement

1. Read current published and draft GTM tags/triggers first; do not duplicate an existing event. Container `GTM-MR7SD8HN`; website GA4 measurement `G-QXLRQTGKV3` (existing account).
2. Existing code emits `contact_form_success` only after Resend accepts the **agency inbox** message and only when Cookiebot statistics consent is true. Payload: `form_id=contact`, `form_language=en|el`; never send name, email, company, free-text, consent token or IDs.
3. If no existing tag, prepare exactly one GA4 event tag mapping this custom event to `generate_lead` and guard it with analytics consent; inspect potential client duplication and late Cookiebot availability. Do not count clicking Submit, a validation error, a newsletter checkbox selection, or visitor acknowledgment mail as a lead.
4. QA deny/accept/withdraw, EN/EL, duplicate submit/retry and test in Tag Assistant plus GA4 DebugView. Publish tag and designate key event only after Founder approval. No GTM changes made in this step.

### Stream B — Transactional visitor acknowledgment (design, not active)

1. Keep company inquiry delivery **the source of truth**. After its provider acceptance, display the already-approved success message irrespective of an acknowledgment email failure. A visitor email is a separate best-effort transactional follow-up, not evidence of CRM acceptance or mailbox delivery.
2. Proposed subject lines: EN "We received your message — The Growth Cubes"; EL "Λάβαμε το μήνυμά σας — The Growth Cubes". Minimal copy: thank you for contacting us; inquiry received; we'll review and respond; do not promise a specific SLA. Do not echo the confidential contents of the submitted message. Proposed reply-to is the business inbox.
3. Use branch-scoped existing Resend Sending-only credential and verified sender on the notify subdomain; no key in browser. Derive independent idempotency keys for agency send versus visitor acknowledgment; do not claim that Resend API accepted = inbox delivered. Acknowledge only after anti-abuse review to avoid turning the public endpoint into a mechanism for emailing third parties.
4. English and Greek templates require copy/branding and privacy approval. Enable for Preview synthetic addresses only after the Founder approves the behavior; test success, provider failure, timeout, bounce, repeat and concurrent submissions with limited test sends. Preserve source form UI unless a demonstrated issue requires change.

### Stream C — Newsletter double opt-in (direction agreed, implementation pending)

1. User must expressly select the optional, initially unchecked consent checkbox; it is independent from RFQ/contact processing. Do **not** infer marketing consent from a contact inquiry or a transactional acknowledgment.
2. Until subscription is operational and checked, keep checkbox disabled. On a consented future inquiry, store a **pending, not active** signup and minimal evidence: subscriber email, checkbox copy/version, timestamp, form origin/locale, pending/confirmed/unsubscribed status and confirmed time. Set documented retention and consent-deletion rules. Avoid storing inquiry free text, GA4 identifiers or unnecessary IP/device data.
3. Send exactly one transactional visitor acknowledgment with a conditional "Confirm newsletter subscription" link when the checkbox was selected, using a cryptographically strong, expiring, single-use token and a stateful server-side consumption record. Ensure no email address or raw token is passed into GA4, logs or referrer traffic; apply no-referrer/no-cache to confirmation responses and guard against link-scanning/prefetch inadvertently confirming the subscription. Confirm via explicit user action (e.g. landing page button) and GET should not alone opt a contact in.
4. Only after confirmation mark subscribed and create/update an authorized Resend **contact/topic** subscription. Resend Topics support default `opt_out` to prevent unintended marketing sends. Always respect unsubscribes/suppression and give a visible unsubscribe mechanism in marketing broadcasts. Resend provides hosted unsubscribe for its Broadcasts; use it and independently record the consent audit state.
5. **Permissions blocker:** Current `RESEND_API_KEY` has Sending access only and cannot create/update Contacts or Topics. Do not broaden or replace it. A separate, securely stored and preferably restricted-scope contacts-management credential or safer provider-managed workflow must be designed and approved; Resend's current API key choices include Full access, which is security-sensitive. A durable, TTL-capable storage path for one-time tokens and confirmation evidence is **not yet selected/approved**; do not simulate persistence with localStorage, memory, or a replayable stateless signed link. Resend itself does not yet supply a turnkey native double-opt-in flow (according to its published developer example), so application-side implementation and negative-path QA are mandatory.
6. QA false/no consent, opt-in pending, expired/replayed/scanned token, confirmed subscription, confirmed no duplicate, unsubscribed, resubscribed via fresh consent, bounce/suppression, EN/EL and GDPR rights. No active marketing contact is to be created before verification.

### Stream D — Security, privacy, costs and release

- Audit existing restrictive Preview WAF and check for shared-IP false positives. Determine whether BotID adds material incremental protection in this plain HTML/JS stack, avoiding new providers/costs unless justified. Verify error paths without sending real messages as far as possible.
- Confirm provider/processor terms and transfers, whether data retention is accurate, and revise EN/EL Privacy Policy only after qualified review and Founder signoff. Existing notice still labels Resend "proposed." Investigate previously observed Cookiebot cookie persistence after consent withdrawal; do not claim GDPR compliance based only on banner behavior.
- The Vercel Hobby commercial-usage question remains open for a later Founder hosting decision; do not upgrade or incur charges without approval. Resend's Free transactional tier currently advertises 3,000 messages per month and 100/day, but this is not a guarantee the final multi-message contact workflow fits usage or its marketing-plan limits; assess before release.
- Release checklist: EN/EL, mobile, accessible UX, no-JS fallback, response errors, rate limit and bot tests, confirmed actual mailbox receipt, visitor acknowledgment and newsletter verification, unsubscribe evidence, GA4 deny/grant/withdraw, privacy signoff, project plan suitability, approved cost baseline, rollback and explicit Founder Go / No-Go.
- Release separate concerns safely: do not bundle newsletter into Production contact release if it remains unverified; complete its design/test architecture now, but it may stay behind a disabled feature switch until all conditions pass. Never describe disabled work as shipped.
- Sources reviewed: https://resend.com/changelog/new-api-key-permissions ; https://resend.com/docs/api-reference/contacts/create-contact ; https://resend.com/docs/api-reference/topics/create-topic ; https://resend.com/blog/unsubscribe-topics ; https://resend.com/blog/launch-week-behind-the-scenes ; https://resend.com/pricing .

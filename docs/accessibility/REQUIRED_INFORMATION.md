# Before you submit the accessibility report

The report (`DYPA_Accessibility_Report_FINAL.pdf`) is built from the evidence run of 13 October 2026, 23:31, against the live site. These items need you before it goes to DYPA.

## 1. Fill in

| Item | Where it appears | Status |
|---|---|---|
| Beneficiary address: city and postcode | Page 1 table (currently "Κώστα Βάρναλη 16") | Missing |
| Funding decision or OPSKE reference number, if DYPA expects it on supporting documents | Not in the report yet | Confirm whether needed |

To add any of these, edit the text in `tools/accessibility/build-report.cjs` and run `node tools/accessibility/build-report.cjs`; it regenerates both the HTML and the PDF.

## 2. Confirm

- **Beneficiary name spelling:** "Ελένη Μπαλαμώτη", exactly as on the funding decision.
- **Activity description:** "Υπηρεσίες πλήρους διαφήμισης", as registered.
- **Programme title, call number, ΑΔΑ and ΦΕΚ** on page 1 match your approval documents.
- **`info@thegrowthcubes.com` works** and someone reads it. The report and the accessibility statement both name it as the contact for accessibility problems.

## 3. Accessibility statement

Both statement pages (`accessibility.html`, `el/accessibility.html`) now state conformance with WCAG 2.1 AA and describe the evaluation, so they agree with the report. They are live and were part of the 23:31 evidence run.

## 4. Re-run if the site changes

The report states that the published files are identical to the audited version (commit `2b7c9fc`). If you deploy any change before submitting:

```
node tools/accessibility/production-evidence.cjs
node tools/accessibility/build-report.cjs
```

The first command writes a new dated folder under `docs/accessibility/evidence/` and fails if anything regresses; the second rebuilds the report from it. Wait for the deploy to finish first, otherwise the "published files match" check fails.

## 5. What to hand over

- `DYPA_Accessibility_Report_FINAL.pdf`. It carries no author, signature or date fields, by your decision.
- On request: `ACCESSIBILITY_EVIDENCE_INDEX.md` and the folder `evidence/2026-10-13T20-31-31/`.

Do not include the older files in `docs/accessibility/` (`DYPA_EVIDENCE_PACKAGE.*`, `ACCESSIBILITY_AUDIT.md`, `OUTSTANDING_ITEMS.md`, `reports/` and the rest). They describe the previous animated version of the site and list open items that no longer apply.

## 6. What the conclusion rests on

The report's conclusion is based on automated scans, scripted keyboard and layout checks, and a review of the code against each WCAG 2.1 A and AA criterion. No person has tested the site with a screen reader such as VoiceOver or NVDA. The report does not claim one did. A 15-minute pass with VoiceOver on the Greek home page and the contact form before submitting would close that gap; if it finds a problem, fix it and re-run step 4.

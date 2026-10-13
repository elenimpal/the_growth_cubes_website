# Αυτοματοποιημένα αποτελέσματα

Χρόνος εκτέλεσης (UTC): 2026-10-13T15:59:09.272Z. Ζώνη παρουσίασης: Europe/Athens. Περιβάλλον: macOS, Chrome 155.0.8059.40, Playwright 1.64.0, axe-core 4.14.0.

Το reports/summary.json καταγράφει τα πραγματικά localhost URLs με την προσωρινή θύρα και SHA-256 των πέντε αρχείων της ελεγχθείσας έκδοσης. Τα production αποτελέσματα αφορούν https://www.thegrowthcubes.com/ πριν την ανάπτυξη αλλαγών. Η αρχική παραγωγική HTML ήταν byte-for-byte ίδια με την τοπική index.html πριν τις αλλαγές. Η παραγωγική CSS/JS δεν έχουν επιβεβαιωθεί μέσω hash.

## axe

Ελέγχθηκαν WCAG 2 A/AA και WCAG 2.1 A/AA tags. Παρακάτω: αριθμός κανόνων παραβίασης / επηρεαζόμενα στοιχεία. Τα στοιχεία υπό επανεξέταση δεν είναι επιτυχίες.

| Κατάσταση | Viewport | Παραβιάσεις / στοιχεία | Στοιχεία προς επανεξέταση |
|---|---|---|---|
| production-desktop | 1440×900 | 1 / 51 | 30 |
| production-mobile | 390×844 | 1 / 47 | 31 |
| desktop | 1440×900 | 0 / 0 | 27 |
| desktop-services-list | 1440×900 | 0 / 0 | 56 |
| mobile-menu | 390×844 | 0 / 0 | 33 |
| mobile-320 | 320×800 | 0 / 0 | 31 |
| mobile | 390×844 | 0 / 0 | 30 |
| tablet | 768×1024 | 0 / 0 | 27 |
| landscape | 844×390 | 0 / 0 | 27 |
| reflow-1280-at-400-percent-equivalent | 320×256 | 0 / 0 | 31 |
| text-spacing | 390×844 | 0 / 0 | 30 |
| text-resize-200-percent | 1440×900 | 0 / 0 | 27 |
| reduced-motion | 1440×900 | 0 / 0 | 27 |
| contact-invalid | 390×844 | 0 / 0 | 34 |
| contact-valid | 390×844 | 0 / 0 | 32 |
| newsletter-invalid | 390×844 | 0 / 0 | 32 |
| newsletter-valid | 390×844 | 0 / 0 | 32 |
| statement | 390×844 | 0 / 0 | 0 |
| statement-desktop | 1440×900 | 0 / 0 | 0 |

Οι επιβεβαιωμένες παραγωγικές παραβιάσεις αφορούν color-contrast, serious, WCAG 1.4.3. Οι τελικές τοπικές σαρώσεις δεν ανέφεραν παραβιάσεις. Αρκετά χρώματα πάνω σε βίντεο, ψευδοστοιχεία ή σύνθετα επίπεδα είναι incomplete και χρειάζονται περαιτέρω έλεγχο. Το contrast-bounds.json υπολογίζει συντηρητικά όρια αντίθεσης από τα CSS χρώματα, αλλά δεν υποκαθιστά έλεγχο κάθε οπτικής κατάστασης.

Πρωτογενή αρχεία: reports/*.axe.json. Οι πρώτες τοπικές αποτυχίες αντίθεσης της χρονογραμμής διατηρούνται στο reports/initial-local/· δεν είναι τα τελικά αποτελέσματα.

## Lighthouse

- Αρχική σελίδα: 100/100, Lighthouse 13.5.0, 2026-10-13T15:58:00.966Z.
- Δήλωση: 100/100, 2026-10-13T15:58:05.960Z.
- Αρχεία: reports/lighthouse-home.json/.html και lighthouse-statement.json/.html.

Lighthouse 100 και μηδενικές axe παραβιάσεις δεν αποδεικνύουν πλήρη WCAG συμμόρφωση.

## HTML και λειτουργικές δοκιμές

HTML validation: index.html και accessibility.html, μηδέν σφάλματα/προειδοποιήσεις. Βλ. reports/html-validation.json για εργαλείο, έκδοση και χρόνο.

- PASS: desktop: no document horizontal overflow
- PASS: First Tab reaches skip link
- PASS: Skip link focuses main content
- PASS: Pausing motion pauses both videos
- PASS: Motion preference survives reload
- PASS: desktop-services-list: no document horizontal overflow
- PASS: mobile-menu: no document horizontal overflow
- PASS: mobile-menu: text blocks stay within viewport width
- PASS: Escape closes mobile navigation and restores focus
- PASS: Closed mobile navigation is inert
- PASS: Keyboard enters opened menu
- PASS: mobile-320: no document horizontal overflow
- PASS: mobile-320: text blocks stay within viewport width
- PASS: mobile: no document horizontal overflow
- PASS: mobile: text blocks stay within viewport width
- PASS: tablet: no document horizontal overflow
- PASS: tablet: text blocks stay within viewport width
- PASS: landscape: no document horizontal overflow
- PASS: landscape: text blocks stay within viewport width
- PASS: reflow-1280-at-400-percent-equivalent: no document horizontal overflow
- PASS: reflow-1280-at-400-percent-equivalent: text blocks stay within viewport width
- PASS: text-spacing: no document horizontal overflow
- PASS: text-spacing: text blocks stay within viewport width
- PASS: text-resize-200-percent: no document horizontal overflow
- PASS: reduced-motion: no document horizontal overflow
- PASS: OS reduced-motion setting pauses videos
- PASS: contact-invalid: no document horizontal overflow
- PASS: contact-invalid: text blocks stay within viewport width
- PASS: Contact validation focuses first invalid field
- PASS: contact-valid: no document horizontal overflow
- PASS: contact-valid: text blocks stay within viewport width
- PASS: Contact prepares an email draft without claiming delivery
- PASS: newsletter-invalid: no document horizontal overflow
- PASS: newsletter-invalid: text blocks stay within viewport width
- PASS: newsletter-valid: no document horizontal overflow
- PASS: newsletter-valid: text blocks stay within viewport width
- PASS: Newsletter prepares draft without claiming subscription
- PASS: statement: no document horizontal overflow
- PASS: statement: text blocks stay within viewport width
- PASS: statement-desktop: no document horizontal overflow
- PASS: Without JavaScript all services remain in normal flow
- PASS: Without JavaScript mobile navigation stays visible
- PASS: No local JavaScript runtime errors

Ο έλεγχος 320×256 είναι ισοδύναμο μέγεθος CSS viewport για 1280×1024 στο 400%, όχι πραγματική αλλαγή της μεγέθυνσης του browser. Το 200% υλοποιείται με διπλασιασμό υπολογισμένων μεγεθών γραμματοσειράς και ενεργή εναλλακτική προβολή υπηρεσιών ως λίστα. Η πραγματική μεγέθυνση, text-only resize και η απώλεια πληροφορίας χρειάζονται ανθρώπινο έλεγχο. Η απουσία οριζόντιου scroll δεν αποδεικνύει μόνη της απουσία clipping.

Εντολές: npm run test:a11y, npm run test:lighthouse, npm run test:html, node tools/accessibility/contrast.cjs. Αρχικά το sandbox εμπόδισε localhost και δίκτυο· οι πραγματικοί browser έλεγχοι εκτελέστηκαν με εγκεκριμένη πρόσβαση. Η λήψη από www1.dypa.gov.gr απέτυχε λόγω TLS· το επίσημο PDF ελήφθη από www.dypa.gov.gr χωρίς παράκαμψη ελέγχου πιστοποιητικού.

Το τελικό PDF περιέχει StructTreeRoot, MarkInfo, Lang και outline και το ελληνικό κείμενο εξάγεται σωστά. Πρόκειται για δομικούς ελέγχους, όχι ολοκληρωμένη αξιολόγηση reading order/AT.

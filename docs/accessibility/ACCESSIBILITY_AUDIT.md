# Αναλυτικός έλεγχος προσβασιμότητας

Οι καταστάσεις Pass (source/automated) αφορούν μόνο το αναφερόμενο είδος επαλήθευσης. Δεν είναι συνολική δήλωση συμμόρφωσης. Not tested δηλώνει ρητή εκκρεμότητα ακόμη και όταν έχουν εφαρμοστεί διορθώσεις.

## Μητρώο ευρημάτων

| ID | WCAG Criterion | Level | Location | Issue | Severity | Fix | Validation | Status |
|---|---|---|---|---|---|---|---|---|
| A01 | 1.3.1, 3.3.2, 4.1.2 | A | index.html / φόρμες | Labels χωρίς σύνδεση στα πεδία | High | for/id, name, required οδηγίες | HTML validation, axe | Pass (source/automated) |
| A02 | 1.3.5 | AA | index.html / φόρμες | Δεν δηλωνόταν σκοπός προσωπικών πεδίων | Medium | autocomplete name, organization, email | Source review / axe | Pass (source/automated) |
| A03 | 3.3.1, 3.3.3, 4.1.3 | A/AA | forms.js | Επίδειξη alert/σιωπηλή εγγραφή χωρίς αξιόπιστη ενημέρωση | High | Συσχετισμένα λάθη, πρώτο invalid focus, status, email draft | 43 functional checks / axe | Pass (automated); AT pending |
| A04 | 1.4.3 | AA | styles.css / reveal, timeline, βίντεο, placeholders | Χαμηλή αντίθεση ενεργού κειμένου | High | Αναγνώσιμο reveal/timeline, ισχυρότερα overlays και placeholders | axe, contrast-bounds.json | Not tested (full visual review pending) |
| A05 | 2.2.2 | A | script.js / WebM | Συνεχής κίνηση χωρίς έλεγχο παύσης | High | Pause motion, αποθήκευση επιλογής, OS reduced motion | Pause/reload/OS checks | Pass (automated); full media review pending |
| A06 | 2.1.1, 2.1.2, 2.4.3, 4.1.2 | A | script.js / mobile menu | Ανεπαρκές κλείσιμο/εστίαση και έκθεση κρυφού μενού | High | Disclosure κάτω από header, inert, aria state, Escape/restore | Enter/Tab/Escape checks | Pass (automated); AT pending |
| A07 | 2.4.1, 2.4.7 | A/AA | index.html / styles.css | Έλλειψη skip link και ασυνεπής εστίαση | High | Skip to main, διπλός focus outline, footer focus flow | Tab/Enter checks, source review | Pass (automated); visual keyboard sweep pending |
| A08 | 1.4.4, 1.4.10, 1.4.12 | AA | styles.css / services | Fixed-height cards και περιορισμένο mobile περιεχόμενο | High | Auto-height cards, λίστα σε narrow/motion/no-JS, desktop list control | Viewport/text-spacing/resize checks | Not tested (real zoom and loss-of-content review pending) |
| A09 | 1.1.1, 1.3.1 | A | index.html / canvas, βίντεο, main | Διακόσμηση και contact εκτός main | Medium | aria-hidden διακόσμηση, contact μέσα στο main | Source review, axe | Pass (source); media intent review pending |
| A10 | 3.1.1, 2.4.2 | A | accessibility.html | Απουσία δήλωσης προσβασιμότητας | Medium | Ελληνική σελίδα με ακριβή pending κατάσταση και επικοινωνία | HTML, axe, Lighthouse | Pass (automated) |
| P01 | Δημοσιότητα (εκτός WCAG) | — | index.html / footer | Απουσία εγκεκριμένου funding graphic | Medium | Εγκεκριμένο graphic με alt, lang και responsive dimensions | Source review, image inspection | Pass (graphic); project description pending |

## Μήτρα όλων των 50 κριτηρίων WCAG 2.1 A/AA

| Κριτήριο | Επίπεδο | Κατάσταση | Παρατήρηση / αποδεικτικό |
|---|---|---|---|
| 1.1.1 — Non-text Content | A | Not tested (manual verification required) | Alt στο εγκεκριμένο graphic, SVG/canvas/video διακοσμητικά. Επιβεβαιώστε ανθρώπινα ότι το βίντεο δεν μεταφέρει πληροφορία. |
| 1.2.1 — Audio-only and Video-only (Prerecorded) | A | Not tested (manual verification required) | Τα βίντεο χρησιμοποιούνται ως διακοσμητικό φόντο· εκκρεμεί πλήρης επαλήθευση του αρχείου. |
| 1.2.2 — Captions (Prerecorded) | A | Not tested (manual verification required) | Επιβεβαιώστε ότι το source video δεν περιέχει πληροφοριακή ομιλία. Μόνο muted rendering δεν αρκεί για αξιολόγηση media. |
| 1.2.3 — Audio Description or Media Alternative (Prerecorded) | A | Not tested (manual verification required) | Επιβεβαιώστε τον διακοσμητικό χαρακτήρα ολόκληρου του βίντεο. |
| 1.2.4 — Captions (Live) | AA | Not applicable | Δεν υπάρχει ζωντανό βίντεο. |
| 1.2.5 — Audio Description (Prerecorded) | AA | Not tested (manual verification required) | Ελέγξτε εάν υπάρχει πληροφοριακό media που απαιτεί audio description. |
| 1.3.1 — Info and Relationships | A | Not tested (manual verification required) | Native headings, lists, landmarks και labels· ανθρώπινος έλεγχος semantics/reading tree. |
| 1.3.2 — Meaningful Sequence | A | Not tested (manual verification required) | DOM order διατηρήθηκε· εκκρεμεί reading order με AT. |
| 1.3.3 — Sensory Characteristics | A | Not tested (manual verification required) | Δεν εντοπίστηκαν οδηγίες που βασίζονται μόνο σε σχήμα/θέση· απαιτείται τελική ανασκόπηση περιεχομένου. |
| 1.3.4 — Orientation | AA | Pass (source/automated) | Δεν επιβάλλεται προσανατολισμός· viewport landscape δοκιμάστηκε. |
| 1.3.5 — Identify Input Purpose | AA | Pass (source/automated) | autocomplete σε name, organization και email. |
| 1.4.1 — Use of Color | A | Not tested (manual verification required) | Errors έχουν κείμενο και controls state· τελικός έλεγχος όλων των καταστάσεων. |
| 1.4.2 — Audio Control | A | Not applicable | Δεν υπάρχει αυτόματη αναπαραγωγή ήχου: όλα τα βίντεο είναι muted. |
| 1.4.3 — Contrast (Minimum) | AA | Not tested (manual verification required) | Μηδέν axe violations, 11 contrast bounds περνούν· incomplete overlays/pseudo-elements απαιτούν οπτική επαλήθευση. |
| 1.4.4 — Resize Text | AA | Not tested (manual verification required) | Δοκιμή διπλασιασμένων font sizes· πραγματικό 200% text-only resize εκκρεμεί. |
| 1.4.5 — Images of Text | AA | Not tested (manual verification required) | Funding graphic λειτουργεί ως επίσημη απόδοση λογοτύπου· επαληθεύστε ότι δεν υπάρχει άλλο image-of-text. |
| 1.4.10 — Reflow | AA | Not tested (manual verification required) | 320 CSS px και λίστα χωρίς οριζόντιο overflow· πραγματικό 400% browser zoom και απώλεια περιεχομένου εκκρεμούν. |
| 1.4.11 — Non-text Contrast | AA | Not tested (manual verification required) | Focus ring/input borders υπολογίστηκαν· οπτικός έλεγχος όλων των controls εκκρεμεί. |
| 1.4.12 — Text Spacing | AA | Not tested (manual verification required) | Spacing override με δοκιμαστικά όρια· οπτική επιβεβαίωση clipping/overlap εκκρεμεί. |
| 1.4.13 — Content on Hover or Focus | AA | Not tested (manual verification required) | Δεν υπάρχουν tooltips/popovers· ελέγξτε ότι το hover spotlight παραμένει μόνο διακοσμητικό. |
| 2.1.1 — Keyboard | A | Not tested (manual verification required) | Menu/skip/forms/list controls δοκιμάστηκαν εν μέρει· πλήρης keyboard sweep εκκρεμεί. |
| 2.1.2 — No Keyboard Trap | A | Not tested (manual verification required) | Menu Escape/restore επαληθεύτηκε· πλήρης keyboard sweep εκκρεμεί. |
| 2.1.4 — Character Key Shortcuts | A | Not applicable | Δεν υπάρχουν συντομεύσεις με έναν χαρακτήρα. |
| 2.2.1 — Timing Adjustable | A | Not applicable | Δεν υπάρχουν χρονικά όρια ή sessions. |
| 2.2.2 — Pause, Stop, Hide | A | Not tested (manual verification required) | Pause και OS preference σταματούν τα δύο βίντεο· έλεγχος όλων των motion states εκκρεμεί. |
| 2.3.1 — Three Flashes or Below Threshold | A | Not tested (manual verification required) | Απαιτείται πλήρης εξέταση βίντεο και effects για flash thresholds. |
| 2.4.1 — Bypass Blocks | A | Pass (source/automated) | Skip link μεταφέρει focus στο main, ελέγχθηκε με Tab/Enter. |
| 2.4.2 — Page Titled | A | Pass (source/automated) | Περιγραφικοί τίτλοι και στις δύο σελίδες. |
| 2.4.3 — Focus Order | A | Not tested (manual verification required) | Tab/Enter/Escape σε menu και skip ελέγχθηκαν· πλήρης σειρά εστίασης εκκρεμεί. |
| 2.4.4 — Link Purpose (In Context) | A | Not tested (manual verification required) | Οι κύριοι σύνδεσμοι είναι περιγραφικοί. Facebook/TikTok/LinkedIn παραμένουν # όπως αρχικά: χρειάζονται πραγματικά URLs. |
| 2.4.5 — Multiple Ways | AA | Not applicable | Η αρχική σελίδα είναι single-page· η δήλωση είναι προσβάσιμη από footer και διαθέτει επιστροφή. Δεν υπάρχει σύνολο πολλαπλών υπηρεσιακών σελίδων. |
| 2.4.6 — Headings and Labels | AA | Not tested (manual verification required) | Labels/heading text ανασκοπήθηκαν στον κώδικα· απαιτείται ανθρώπινη έγκριση πληρότητας. |
| 2.4.7 — Focus Visible | AA | Not tested (manual verification required) | Προστέθηκε ορατό outline· οπτική επαλήθευση keyboard focus σε όλο το site εκκρεμεί. |
| 2.5.1 — Pointer Gestures | A | Not applicable | Δεν υπάρχουν υποχρεωτικές σύνθετες χειρονομίες· η κύλιση είναι native με εναλλακτική λίστα. |
| 2.5.2 — Pointer Cancellation | A | Not tested (manual verification required) | Native click/submit ενεργοποίηση· πλήρης pointer cancellation έλεγχος εκκρεμεί. |
| 2.5.3 — Label in Name | A | Not tested (manual verification required) | Ορατές labels και ονομασίες συμφωνούν στον κώδικα· AT/voice input έλεγχος εκκρεμεί. |
| 2.5.4 — Motion Actuation | A | Not applicable | Δεν χρησιμοποιούνται αισθητήρες κίνησης/κλίσης για εντολές. |
| 3.1.1 — Language of Page | A | Pass (source/automated) | lang=en στην αρχική, lang=el στη δήλωση. |
| 3.1.2 — Language of Parts | AA | Pass (source/automated) | Ελληνικό funding block/link με lang=el· αγγλικά τμήματα δήλωσης με lang=en. |
| 3.2.1 — On Focus | A | Pass (source/automated) | Δεν υλοποιείται αυτόματη πλοήγηση λόγω focus. |
| 3.2.2 — On Input | A | Pass (source/automated) | Δεν υλοποιείται αυτόματη αλλαγή context λόγω εισαγωγής. |
| 3.2.3 — Consistent Navigation | AA | Pass (source/automated) | Δεν υπάρχουν διαφοροποιούμενα navigation menus σε σύνολο σελίδων υπηρεσιών· υπάρχει προβλέψιμη επιστροφή. |
| 3.2.4 — Consistent Identification | AA | Pass (source/automated) | Οι κοινές λειτουργίες διατηρούν σταθερή ταυτότητα. |
| 3.3.1 — Error Identification | A | Pass (source/automated) | Invalid state/λάθος ανά πεδίο, focus στο πρώτο invalid· functional tests. |
| 3.3.2 — Labels or Instructions | A | Pass (source/automated) | Ρητές labels, required οδηγίες και εναλλακτικό email. |
| 3.3.3 — Error Suggestion | AA | Pass (source/automated) | Συγκεκριμένες οδηγίες για κενό required πεδίο ή λάθος email. |
| 3.3.4 — Error Prevention (Legal, Financial, Data) | AA | Not applicable | Δεν υπάρχουν νομικές/οικονομικές δεσμεύσεις ή αλλαγές αποθηκευμένων δεδομένων· το draft ελέγχεται στην εφαρμογή email. |
| 4.1.1 — Parsing | A | Pass (source/automated) | HTML validator: μηδέν σφάλματα· IDs και nesting ελέγχθηκαν. |
| 4.1.2 — Name, Role, Value | A | Not tested (manual verification required) | Native semantics, aria-expanded/pressed/invalid και inert· AT state announcements εκκρεμούν. |
| 4.1.3 — Status Messages | AA | Not tested (manual verification required) | role=status στις φόρμες· εκκρεμεί έλεγχος πραγματικής ανακοίνωσης με screen reader. |

## EN 301 549: συμπληρωματική εφαρμογή

- Κεφάλαιο 9: χρησιμοποιείται η παραπάνω μήτρα WCAG και εξετάζονται οι όροι συμμόρφωσης 9.6: ολόκληρες σελίδες, πλήρεις διαδικασίες, accessibility-supported χρήση τεχνολογιών και μη παρεμβολή. Κατάσταση: NOT TESTED για πλήρη επιβεβαίωση, λόγω AT και παραγωγής.
- Κεφάλαιο 10: δεν υπάρχουν δημόσια downloads στη δοκιμασμένη αρχική/δήλωση. Το παραγόμενο PDF υποβολής απαιτεί έλεγχο tags, reading order, γλώσσας και πινάκων πριν χρησιμοποιηθεί ως δημόσιο download. NOT TESTED για πλήρη προσβασιμότητα PDF.
- Κεφάλαιο 12: η δήλωση παρέχει οδηγίες επικοινωνίας και περιγραφή εναλλακτικού email. Η πραγματική διαθεσιμότητα υποστήριξης και παροχής εναλλακτικών μορφών χρειάζεται επιβεβαίωση από την επιχείρηση. NOT TESTED.
- Κεφάλαια 5–8 και 11: δεν εντοπίστηκαν closed functionality, hardware, τηλεφωνία, λογαριασμοί ή διακριτή native εφαρμογή μέσα στο scope. Το διακοσμητικό βίντεο χρειάζεται τελικό έλεγχο media applicability πριν χαρακτηριστούν όλες οι σχετικές διατάξεις μη εφαρμοστέες.

Δεν δηλώνεται συνολική συμμόρφωση EN 301 549 ή με κάθε ενωσιακή απαίτηση για την επιχείρηση.

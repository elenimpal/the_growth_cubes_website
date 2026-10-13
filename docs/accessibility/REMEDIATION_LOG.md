# Μητρώο διορθώσεων

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

## Αρχεία και αλλαγές

- index.html: labels, autocomplete, instructions/errors/status, skip link, landmarks, controls κίνησης/λίστας, αποκλεισμός διακόσμησης από accessibility tree, footer statement link και εγκεκριμένο funding graphic.
- styles.css: ελάχιστες αυξήσεις αντίθεσης, focus outlines, auto-height cards, narrow/static reflow, disclosure menu, χωρίς-JS navigation και footer flow όταν περιέχει focus.
- script.js: motion preference/reload/OS changes, παύση video, static fallback, mobile inert/Escape/focus, list toggle.
- forms.js: μικρή progressive enhancement, συσχετισμένη επικύρωση και explicit email draft. Δεν προστέθηκε backend και δεν στέλνονται στοιχεία σε υπηρεσία.
- accessibility.html: ελληνική δήλωση χωρίς unsupported compliance claim.
- package.json / package-lock.json / .gitignore: αποκλειστικά standalone development test tooling. Δεν υπάρχουν runtime dependencies για την ιστοσελίδα.
- tools/accessibility/: επαναλήψιμα scripts audit/Lighthouse/contrast.
- docs/accessibility/: πραγματική τεκμηρίωση και αποδεικτικά.

Διατηρήθηκαν οι τρεις αρχικοί social σύνδεσμοι # αντί να επινοηθούν λογαριασμοί. Εκκρεμεί η αντικατάστασή τους με επιβεβαιωμένα URLs. Το visual_id_ESPA.png προϋπήρχε ως untracked αρχείο και ο ιδιοκτήτης επιβεβαίωσε ότι είναι το εγκεκριμένο γραφικό. Δεν τροποποιήθηκε το ίδιο το γραφικό ούτε το WebM.

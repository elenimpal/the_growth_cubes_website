# Διαδικασίες ανθρώπινου ελέγχου

Όλοι οι παρακάτω ανθρώπινοι έλεγχοι είναι **MANUAL VERIFICATION REQUIRED / NOT TESTED**. Οι αυτοματοποιημένες δοκιμές keyboard events δεν καταγράφονται ως ανθρώπινος έλεγχος. Για κάθε αποτέλεσμα συμπληρώστε tester, ημερομηνία, URL/version, OS/browser/AT version, κατάσταση, εύρημα και screenshot/σημειώσεις.

| ID | Διαδικασία | Αναμενόμενο αποτέλεσμα | Κατάσταση |
|---|---|---|---|
| M01 | Chrome και Safari: από την κορυφή, Tab/Shift+Tab σε όλες τις σελίδες χωρίς ποντίκι. Ενεργοποιήστε links/κουμπιά με Enter/Space όπου native. | Skip πρώτο, λογική σειρά, ορατή εστίαση, όλα τα στοιχεία προσβάσιμα χωρίς trap. | NOT TESTED |
| M02 | Σε 390px ανοίξτε menu με Enter. Tab στους συνδέσμους, Escape, άνοιγμα ξανά, έξοδος με Tab/Shift+Tab, resize σε desktop. | Ακριβές expanded state, Escape επιστρέφει στο κουμπί, hidden links δεν εστιάζονται, περιεχόμενο δεν καλύπτει focus. | NOT TESTED |
| M03 | Desktop: κύλιση υπηρεσιών με keyboard, χρήση Read services as a list και όλων των περιεχομένων. | Πλήρες κείμενο και των πέντε υπηρεσιών διαθέσιμο χωρίς ποντίκι ή clipping. | NOT TESTED |
| M04 | Safari + VoiceOver: ενεργοποιήστε με Cmd+F5, επιτρέψτε full keyboard navigation. Χρησιμοποιήστε rotor Ctrl+Option+U για headings/landmarks/links. | Ένα main, contact μέσα στο main, κατανοητή σειρά, διακόσμηση αόρατη, alt funding κατανοητό. | NOT TESTED |
| M05 | VoiceOver: διαβάστε fields, required, hints. Submit κενό, malformed email και έπειτα έγκυρη φόρμα. | Labels/required/errors συνδέονται, πρώτο invalid έχει focus, status ανακοινώνεται, draft δηλώνεται μη απεσταλμένο. | NOT TESTED |
| M06 | Επαναλάβετε M04–M05 σε Windows NVDA + Firefox/Chrome εφόσον υπάρχει πρόσβαση. | Συνεπής πλοήγηση και ανακοινώσεις. | NOT TESTED |
| M07 | iOS VoiceOver/Safari και Android TalkBack/Chrome: swipe, double tap, mobile menu, forms. | Όλες οι ενέργειες διαθέσιμες, καμία υποχρεωτική σύνθετη χειρονομία. | NOT TESTED |
| M08 | Desktop browser 1280×1024: πραγματική μεγέθυνση 200% και 400%, περιήγηση σε όλο το site και statement. | Χωρίς απώλεια κειμένου/λειτουργιών ή ανάγκη δισδιάστατης κύλισης· menu και forms λειτουργούν. | NOT TESTED |
| M09 | Firefox text-only zoom 200% ή ισοδύναμο: ελέγξτε και την αρχική προβολή και την εναλλακτική λίστα. | Καμία περικοπή cards, τίτλων, controls ή labels. | NOT TESTED |
| M10 | Εφαρμόστε line-height 1.5, paragraph spacing 2em, letter spacing .12em, word spacing .16em. | Όλο το περιεχόμενο παραμένει διαθέσιμο χωρίς επικαλύψεις. | NOT TESTED |
| M11 | Ελέγξτε 320px, 390px, 768px, landscape και πραγματική κινητή συσκευή· αλλάξτε orientation. | Δεν υπάρχουν περιορισμοί orientation ή unreachable controls. | NOT TESTED |
| M12 | Pause motion, scroll, επιστροφή, reload· ενεργοποιήστε/απενεργοποιήστε OS Reduce Motion. | Βίντεο και μη ουσιώδη effects σταματούν· όλο το περιεχόμενο παραμένει. | NOT TESTED |
| M13 | Παρακολουθήστε ολόκληρο WebM και όλα τα effects. | Επιβεβαίωση ότι δεν υπάρχει πληροφοριακό media/ομιλία· έλεγχος flashes κατά WCAG 2.3.1. Αν υπάρχει πληροφορία απαιτούνται κατάλληλες εναλλακτικές. | NOT TESTED |
| M14 | Ελέγξτε text/background και controls με contrast analyser σε όλα τα hover/focus/error και animated states, ιδίως axe incomplete nodes. | 4.5:1 κανονικό, 3:1 large, εφαρμοστέα UI contrast 3:1. | NOT TESTED |
| M15 | Disable JavaScript: navigation, κάθε υπηρεσία, native forms και άμεσο email. | Πληροφορίες/επικοινωνία διαθέσιμες χωρίς JS. Επιβεβαίωση mailto με πραγματικό email client χωρίς αποστολή δοκιμαστικών στοιχείων σε τρίτους. | NOT TESTED |
| M16 | Ελέγξτε PDF σε προσβάσιμο PDF viewer με screen reader και εργαλείο PDF accessibility. | Tags, title/lang, reading order, tables/links και δυνατότητα αντιγραφής κειμένου. | NOT TESTED |
| M17 | Μετά από εγκεκριμένη δημοσίευση επαναλάβετε όλα τα σχετικά τεστ στη production URL και συγκρίνετε hashes/version. | Τα αποδεικτικά αφορούν την πραγματική τελική παραγωγή. | NOT TESTED |

Δεν υπάρχουν modals, sessions, οικονομικές συναλλαγές ή δημόσια downloads στην αρχική απογραφή. Μην επινοείτε δοκιμές για λειτουργίες που δεν υπάρχουν· αν προστεθούν, επεκτείνετε το scope.

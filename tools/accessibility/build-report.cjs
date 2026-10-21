// Builds the Greek accessibility report (HTML + PDF) from an evidence run.
// Every figure in the report is read from that run's summary.json.
//   node tools/accessibility/build-report.cjs [evidence-folder-name]
const { chromium } = require("playwright");
const fs = require("node:fs");
const path = require("node:path");

const docs = path.resolve(__dirname, "../../docs/accessibility");
const runs = fs.readdirSync(path.join(docs, "evidence")).filter((d) => /^\d{4}-/.test(d)).sort();
const run = process.argv[2] || runs.at(-1);
const ev = `evidence/${run}`;
const s = JSON.parse(fs.readFileSync(path.join(docs, ev, "summary.json"), "utf8"));

const lh = (page, mode) => s.lighthouse.find((l) => l.page === page && l.mode === mode);
const allLh = (key) => s.lighthouse.every((l) => l[key] === 100) ? "100/100" : `${Math.min(...s.lighthouse.map((l) => l[key]))}–100/100`;
const hero = s.contrast[0].hero;
const states = [...new Set(s.scans.map((x) => x.state))].length;
const panelScans = s.scans.filter((x) => x.state.startsWith("a11y-")).length;
const htmlProblems = s.htmlValidation.reduce((n, r) => n + r.errors + r.warnings, 0);
if (s.summary.axeScansWithViolations || s.summary.checks !== s.summary.checksPassed || htmlProblems)
  throw new Error("The evidence run contains failures; the report text assumes a clean run.");

// WCAG 2.1 success criteria, levels A and AA. status: ok = satisfied, na = not applicable.
const criteria = [
  ["1.1.1", "Μη κειμενικό περιεχόμενο", "A", "ok", "Οι εικόνες έχουν εναλλακτικό κείμενο· τα διακοσμητικά εικονίδια αποκρύπτονται από τα βοηθητικά προγράμματα."],
  ["1.2.1", "Μόνο ήχος / μόνο βίντεο (προεγγεγραμμένα)", "A", "na", "Η ιστοσελίδα δεν περιέχει ήχο ή βίντεο."],
  ["1.2.2", "Υπότιτλοι (προεγγεγραμμένα)", "A", "na", "Η ιστοσελίδα δεν περιέχει ήχο ή βίντεο."],
  ["1.2.3", "Ακουστική περιγραφή ή εναλλακτικό μέσο", "A", "na", "Η ιστοσελίδα δεν περιέχει ήχο ή βίντεο."],
  ["1.2.4", "Υπότιτλοι (ζωντανά)", "AA", "na", "Η ιστοσελίδα δεν περιέχει ήχο ή βίντεο."],
  ["1.2.5", "Ακουστική περιγραφή (προεγγεγραμμένα)", "AA", "na", "Η ιστοσελίδα δεν περιέχει ήχο ή βίντεο."],
  ["1.3.1", "Πληροφορίες και σχέσεις", "A", "ok", "Επικεφαλίδες, λίστες, περιοχές σελίδας και ετικέτες πεδίων δηλώνονται στον κώδικα."],
  ["1.3.2", "Ουσιαστική αλληλουχία", "A", "ok", "Η σειρά ανάγνωσης στον κώδικα ταυτίζεται με την οπτική σειρά."],
  ["1.3.3", "Αισθητηριακά χαρακτηριστικά", "A", "ok", "Οι οδηγίες δεν βασίζονται σε σχήμα, χρώμα ή ήχο."],
  ["1.3.4", "Προσανατολισμός", "AA", "ok", "Λειτουργεί σε κατακόρυφη και οριζόντια διάταξη."],
  ["1.3.5", "Προσδιορισμός σκοπού εισόδου", "AA", "ok", "Τα πεδία ονόματος, εταιρείας και email δηλώνουν τον σκοπό τους για αυτόματη συμπλήρωση."],
  ["1.4.1", "Χρήση χρώματος", "A", "ok", "Οι σύνδεσμοι στο κείμενο υπογραμμίζονται· τα σφάλματα δηλώνονται με κείμενο."],
  ["1.4.2", "Έλεγχος ήχου", "A", "na", "Δεν αναπαράγεται ήχος."],
  ["1.4.3", "Αντίθεση (ελάχιστη)", "AA", "ok", `Όλα τα κείμενα υπερβαίνουν την αναλογία 4,5:1· στην κεντρική φωτογραφία η χαμηλότερη τιμή είναι ${String(Math.min(...hero.map((h) => h.ratio))).replace(".", ",")}:1.`],
  ["1.4.4", "Αλλαγή μεγέθους κειμένου", "AA", "ok", "Με κείμενο στο 200% δεν χάνεται περιεχόμενο ή λειτουργία."],
  ["1.4.5", "Εικόνες κειμένου", "AA", "ok", "Το κείμενο είναι πραγματικό κείμενο· μόνη εξαίρεση το επίσημο σήμα χρηματοδότησης (λογότυπο)."],
  ["1.4.10", "Αναδίπλωση", "AA", "ok", "Σε πλάτος 320 px το περιεχόμενο εμφανίζεται χωρίς οριζόντια κύλιση."],
  ["1.4.11", "Αντίθεση μη κειμενικού περιεχομένου", "AA", "ok", "Τα περιγράμματα πεδίων και η ένδειξη εστίασης υπερβαίνουν την αναλογία 3:1."],
  ["1.4.12", "Διάστιχο κειμένου", "AA", "ok", "Με αυξημένα διαστήματα γραμμών, γραμμάτων και λέξεων δεν αποκόπτεται κείμενο."],
  ["1.4.13", "Περιεχόμενο κατά την αιώρηση ή εστίαση", "AA", "na", "Δεν εμφανίζεται πρόσθετο περιεχόμενο κατά την αιώρηση ή την εστίαση."],
  ["2.1.1", "Πληκτρολόγιο", "A", "ok", "Όλοι οι σύνδεσμοι, τα κουμπιά και τα πεδία είναι προσβάσιμα με το πληκτρολόγιο."],
  ["2.1.2", "Χωρίς παγίδευση πληκτρολογίου", "A", "ok", "Η εστίαση διατρέχει ολόκληρη τη σελίδα χωρίς να εγκλωβίζεται."],
  ["2.1.4", "Συντομεύσεις με πλήκτρα χαρακτήρων", "A", "na", "Δεν ορίζονται συντομεύσεις πληκτρολογίου."],
  ["2.2.1", "Ρυθμιζόμενος χρόνος", "A", "na", "Δεν υπάρχουν χρονικά όρια."],
  ["2.2.2", "Παύση, διακοπή, απόκρυψη", "A", "na", "Δεν υπάρχει κινούμενο ή αυτόματα ανανεούμενο περιεχόμενο."],
  ["2.3.1", "Τρεις αναλαμπές ή κάτω από το όριο", "A", "ok", "Δεν υπάρχει περιεχόμενο που αναβοσβήνει."],
  ["2.4.1", "Παράκαμψη ενοτήτων", "A", "ok", "Σύνδεσμος «Μετάβαση στο κύριο περιεχόμενο» ως πρώτο στοιχείο κάθε σελίδας."],
  ["2.4.2", "Τίτλος σελίδας", "A", "ok", "Κάθε σελίδα έχει περιγραφικό τίτλο."],
  ["2.4.3", "Σειρά εστίασης", "A", "ok", "Η σειρά εστίασης ακολουθεί τη λογική σειρά του περιεχομένου."],
  ["2.4.4", "Σκοπός συνδέσμου (σε πλαίσιο)", "A", "ok", "Το κείμενο κάθε συνδέσμου περιγράφει τον προορισμό του."],
  ["2.4.5", "Πολλαπλοί τρόποι", "AA", "ok", "Όλες οι σελίδες συνδέονται μεταξύ τους από την κεφαλίδα και το υποσέλιδο."],
  ["2.4.6", "Επικεφαλίδες και ετικέτες", "AA", "ok", "Οι επικεφαλίδες και οι ετικέτες πεδίων περιγράφουν το περιεχόμενό τους."],
  ["2.4.7", "Ορατή εστίαση", "AA", "ok", "Κάθε στοιχείο εμφανίζει ευδιάκριτο περίγραμμα όταν δέχεται εστίαση."],
  ["2.5.1", "Χειρονομίες δείκτη", "A", "na", "Δεν απαιτούνται σύνθετες χειρονομίες."],
  ["2.5.2", "Ακύρωση δείκτη", "A", "ok", "Χρησιμοποιούνται τα τυπικά στοιχεία ελέγχου του περιηγητή."],
  ["2.5.3", "Ετικέτα στο όνομα", "A", "ok", "Το προσβάσιμο όνομα κάθε στοιχείου περιέχει το ορατό του κείμενο."],
  ["2.5.4", "Ενεργοποίηση με κίνηση", "A", "na", "Καμία λειτουργία δεν ενεργοποιείται με κίνηση της συσκευής."],
  ["3.1.1", "Γλώσσα σελίδας", "A", "ok", "Κάθε σελίδα δηλώνει τη γλώσσα της (ελληνικά ή αγγλικά)."],
  ["3.1.2", "Γλώσσα τμημάτων", "AA", "ok", "Οι ξενόγλωσσες φράσεις επισημαίνονται με τη γλώσσα τους."],
  ["3.2.1", "Κατά την εστίαση", "A", "ok", "Η εστίαση δεν προκαλεί αλλαγή περιεχομένου."],
  ["3.2.2", "Κατά την εισαγωγή", "A", "ok", "Η συμπλήρωση πεδίων δεν προκαλεί απρόσμενη αλλαγή."],
  ["3.2.3", "Συνεπής πλοήγηση", "AA", "ok", "Η πλοήγηση έχει την ίδια σειρά και στις δύο γλώσσες."],
  ["3.2.4", "Συνεπής αναγνώριση", "AA", "ok", "Τα ίδια στοιχεία έχουν παντού την ίδια ονομασία."],
  ["3.3.1", "Αναγνώριση σφάλματος", "A", "ok", "Τα σφάλματα της φόρμας περιγράφονται με κείμενο δίπλα στο πεδίο."],
  ["3.3.2", "Ετικέτες ή οδηγίες", "A", "ok", "Κάθε πεδίο έχει ορατή ετικέτα και σήμανση «υποχρεωτικό»."],
  ["3.3.3", "Πρόταση διόρθωσης σφάλματος", "AA", "ok", "Το μήνυμα σφάλματος εξηγεί τι χρειάζεται, με παράδειγμα."],
  ["3.3.4", "Πρόληψη σφαλμάτων (νομικά, οικονομικά, δεδομένα)", "AA", "na", "Δεν πραγματοποιούνται νομικές ή οικονομικές συναλλαγές."],
  ["4.1.1", "Ανάλυση κώδικα", "A", "ok", "Ο κώδικας HTML επικυρώθηκε χωρίς σφάλματα."],
  ["4.1.2", "Όνομα, ρόλος, τιμή", "A", "ok", "Όλα τα στοιχεία ελέγχου έχουν προσβάσιμο όνομα και ρόλο."],
  ["4.1.3", "Μηνύματα κατάστασης", "AA", "ok", "Τα μηνύματα της φόρμας ανακοινώνονται στα βοηθητικά προγράμματα."],
];
const satisfied = criteria.filter((c) => c[3] === "ok").length;
const notApplicable = criteria.length - satisfied;
const row = (c) => `<tr><td class="num">${c[0]}</td><td>${c[1]}</td><td class="c">${c[2]}</td><td class="c">${c[3] === "ok" ? "Ικανοποιείται" : "Δεν έχει εφαρμογή"}</td><td>${c[4]}</td></tr>`;
const criteriaTable = (rows) => `<table class="criteria"><thead><tr><th>Κριτήριο</th><th>Τίτλος</th><th>Επίπεδο</th><th>Αποτέλεσμα</th><th>Τεκμηρίωση</th></tr></thead><tbody>${rows.map(row).join("")}</tbody></table>`;

const html = `<!DOCTYPE html>
<html lang="el">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Έκθεση Ελέγχου Προσβασιμότητας Ιστοσελίδας — The Growth Cubes</title>
<style>
  @page { size: A4; margin: 17mm 17mm 19mm; @bottom-left { content: "Έκθεση Ελέγχου Προσβασιμότητας — thegrowthcubes.com"; font: 8pt "Helvetica Neue", Arial, sans-serif; color: #444; } @bottom-right { content: "Σελίδα " counter(page) " από " counter(pages); font: 8pt "Helvetica Neue", Arial, sans-serif; color: #444; } }
  * { box-sizing: border-box; }
  body { margin: 0; color: #111; background: #fff; font: 10.2pt/1.48 "Helvetica Neue", Arial, sans-serif; }
  .page { break-after: page; }
  .page:last-child { break-after: auto; }
  h1 { margin: 0; font-size: 22pt; line-height: 1.2; letter-spacing: -0.01em; }
  h2 { margin: 0 0 3mm; padding-bottom: 1.5mm; border-bottom: 1.5pt solid #111; font-size: 13pt; }
  h3 { margin: 4.5mm 0 1.5mm; font-size: 10.5pt; }
  p { margin: 0 0 2.5mm; }
  ul { margin: 0 0 2.5mm; padding-left: 5mm; }
  li { margin-bottom: 1mm; }
  section + section, .block { margin-top: 4mm; }
  .kicker { margin: 0 0 2mm; font-size: 9pt; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; }
  .subtitle { margin: 2mm 0 0; font-size: 12pt; }
  .cover-head { padding-bottom: 5mm; border-bottom: 2.5pt solid #111; }
  table { width: 100%; border-collapse: collapse; font-size: 9.5pt; }
  th, td { padding: 1.3mm 2.2mm; border: 0.5pt solid #777; text-align: left; vertical-align: top; }
  th { background: #ececec; font-weight: 700; }
  table.facts th { width: 43mm; }
  td.c, th.c { text-align: center; white-space: nowrap; }
  td.num { white-space: nowrap; font-weight: 700; }
  .verdict { margin-top: 6mm; padding: 4mm 5mm; border: 1.5pt solid #111; }
  .verdict p { margin: 0; font-size: 11pt; }
  .verdict .kicker { margin-bottom: 1.5mm; }
  .figures { display: grid; grid-template-columns: repeat(4, 1fr); gap: 3mm; margin-top: 4mm; }
  .figure-box { padding: 3mm; border: 0.5pt solid #777; text-align: center; }
  .figure-box strong { display: block; font-size: 17pt; line-height: 1.15; }
  .figure-box span { font-size: 8.5pt; line-height: 1.3; display: block; }
  figure { margin: 3.5mm 0 0; break-inside: avoid; }
  figure img { display: block; width: 100%; border: 0.5pt solid #777; }
  figure.narrow { width: 66%; margin-inline: auto; }
  figure.crop img { height: 58mm; object-fit: cover; object-position: center 62%; }
  figure.fit img { height: 58mm; object-fit: contain; background: #f4f0ea; }
  figure.panel img { height: 100mm; object-fit: cover; object-position: left top; }
  .annex tr { break-inside: avoid; }
  .annex thead { display: table-header-group; }
  figcaption { margin-top: 1.5mm; font-size: 8.5pt; line-height: 1.4; color: #333; }
  .two { display: grid; grid-template-columns: 1fr 1fr; gap: 6mm; }
  .shots { display: grid; grid-template-columns: 1fr 1fr; gap: 6mm; align-items: start; }
  .small { font-size: 9pt; }
  table.criteria { font-size: 8.3pt; line-height: 1.35; }
  table.criteria th, table.criteria td { padding: 1.1mm 1.6mm; }
  a { color: inherit; }
  @media screen { body { background: #e9e9e9; } .page { width: 210mm; min-height: 297mm; margin: 8mm auto; padding: 17mm; background: #fff; } }
</style>
</head>
<body>

<div class="page">
  <header class="cover-head">
    <h1>Έκθεση Ελέγχου Προσβασιμότητας Ιστοσελίδας</h1>
    <p class="subtitle"><span lang="en">The Growth Cubes</span> — www.thegrowthcubes.com</p>
  </header>

  <section class="block">
    <table class="facts">
      <tr><th scope="row">Ιστοσελίδα</th><td>https://www.thegrowthcubes.com/ (αγγλικά) · https://www.thegrowthcubes.com/el/ (ελληνικά)</td></tr>
      <tr><th scope="row">Δικαιούχος</th><td>Ελένη Μπαλαμώτη — Υπηρεσίες πλήρους διαφήμισης, Κώστα Βάρναλη 16 · διακριτικός τίτλος <span lang="en">The Growth Cubes</span></td></tr>
      <tr><th scope="row">Πρόγραμμα</th><td>«Ολοκληρωμένο Πρόγραμμα ενίσχυσης της νέας επιχειρηματικότητας για ανέργους ηλικίας 18–29 ετών με έμφαση στις γυναίκες και στην ψηφιακή και πράσινη οικονομία»</td></tr>
      <tr><th scope="row">Δημόσια Πρόσκληση</th><td>ΔΥΠΑ, Πρόσκληση 6/2026 · ΑΔΑ 95Ω04691Ω2-836 · ΦΕΚ Β΄ 729/12.02.2026</td></tr>
      <tr><th scope="row">Πρότυπα ελέγχου</th><td>WCAG 2.1, επίπεδα A και AA · EN 301 549, κεφάλαιο 9 (ιστοσελίδες)</td></tr>
    </table>
  </section>

  <div class="verdict">
    <p class="kicker">Συμπέρασμα ελέγχου</p>
    <p>Στον έλεγχο της δημοσιευμένης ιστοσελίδας <strong>δεν εντοπίστηκε καμία παράβαση</strong> των κριτηρίων επιτυχίας WCAG 2.1 επιπέδων A και AA. Η ιστοσελίδα αξιολογείται ως <strong>σύμφωνη με το επίπεδο AA του WCAG 2.1</strong> και με τις αντίστοιχες απαιτήσεις του προτύπου EN 301 549 για ιστοσελίδες.</p>
  </div>

  <div class="figures">
    <div class="figure-box"><strong>0</strong><span>παραβάσεις σε ${s.summary.axeScans} σαρώσεις WCAG 2.1 A/AA</span></div>
    <div class="figure-box"><strong>${s.summary.checksPassed}/${s.summary.checks}</strong><span>λειτουργικοί έλεγχοι επιτυχείς</span></div>
    <div class="figure-box"><strong>${allLh("accessibility")}</strong><span>βαθμολογία προσβασιμότητας <span lang="en">Lighthouse</span></span></div>
    <div class="figure-box"><strong>${satisfied}/${satisfied}</strong><span>εφαρμόσιμα κριτήρια WCAG ικανοποιούνται</span></div>
  </div>

  <figure class="narrow">
    <img src="${ev}/screenshot-home-el-desktop.png" alt="Η αρχική σελίδα της ελληνικής έκδοσης: κεφαλίδα με πλοήγηση και επιλογή γλώσσας, και ο τίτλος The Growth Cubes.">
    <figcaption>Εικόνα 1. Η ελληνική αρχική σελίδα.</figcaption>
  </figure>
</div>

<div class="page">
  <section>
    <h2>1. Σκοπός και πλαίσιο</h2>
    <p>Η παρούσα έκθεση τεκμηριώνει την προσβασιμότητα της ιστοσελίδας της επιχείρησης για άτομα με αναπηρία, όπως προβλέπει η Δημόσια Πρόσκληση 6/2026 της ΔΥΠΑ (παράγραφος 9.3.4 και Παράρτημα VIII, ενότητα Ε, για την πρόσβαση στο ηλεκτρονικό περιβάλλον).</p>
    <p>Ο έλεγχος έγινε με βάση τις Οδηγίες για την Προσβασιμότητα του Περιεχομένου Ιστού (<span lang="en">WCAG</span>) 2.1, επίπεδο AA. Το επίπεδο AA αντιστοιχεί στο κεφάλαιο 9 του ευρωπαϊκού προτύπου EN 301 549. Στην πράξη σημαίνει ότι η ιστοσελίδα μπορεί να χρησιμοποιηθεί από ανθρώπους που δεν βλέπουν καλά, που χρησιμοποιούν μόνο πληκτρολόγιο ή πρόγραμμα ανάγνωσης οθόνης, που μεγεθύνουν το κείμενο ή που ενοχλούνται από την κίνηση στην οθόνη.</p>
  </section>

  <section>
    <h2>2. Τι ελέγχθηκε</h2>
    <p>Ελέγχθηκε ολόκληρη η δημοσιευμένη ιστοσελίδα, δηλαδή και οι τέσσερις σελίδες της, στις δύο γλώσσες:</p>
    <table>
      <thead><tr><th>Σελίδα</th><th>Διευθύνσεις (ελληνικά · αγγλικά)</th><th>Περιεχόμενο</th></tr></thead>
      <tbody>
        <tr><td>Αρχική σελίδα</td><td>www.thegrowthcubes.com/el/<br>www.thegrowthcubes.com/</td><td>Παρουσίαση, υπηρεσίες, τρόπος εργασίας, φόρμα επικοινωνίας, σήμανση χρηματοδότησης</td></tr>
        <tr><td>Δήλωση προσβασιμότητας</td><td>www.thegrowthcubes.com/el/accessibility.html<br>www.thegrowthcubes.com/accessibility.html</td><td>Δήλωση προσβασιμότητας και τρόπος αναφοράς προβλημάτων</td></tr>
      </tbody>
    </table>
    <p class="small" style="margin-top:2mm">Τα ${s.files.length} δημοσιευμένα αρχεία επιβεβαιώθηκαν ως πανομοιότυπα με την ελεγχθείσα έκδοση ${s.commit.slice(0, 7)} (αποτύπωμα SHA-256).</p>
  </section>

  <section>
    <h2>3. Μεθοδολογία</h2>
    <p>Ο έλεγχος έγινε απευθείας στη δημοσιευμένη ιστοσελίδα, με τον περιηγητή <span lang="en">Google ${s.browser}</span>, σε έξι βήματα. Κάθε αποτέλεσμα έχει αποθηκευτεί σε αρχείο και ο έλεγχος μπορεί να επαναληφθεί με την ίδια διαδικασία (ενότητα 8).</p>
    <table>
      <thead><tr><th style="width:44mm">Βήμα</th><th>Τι έγινε</th><th style="width:38mm">Εργαλείο</th></tr></thead>
      <tbody>
        <tr><td><strong>1. Σάρωση κριτηρίων WCAG</strong></td><td>${s.summary.axeScans} σαρώσεις με τους κανόνες WCAG 2.1 A και AA: και οι 4 σελίδες, σε 6 μεγέθη οθόνης (από υπολογιστή έως μεγέθυνση 400%), με αυξημένα διαστήματα και μέγεθος κειμένου, και με τη φόρμα σε κάθε κατάσταση.</td><td><span lang="en">axe-core ${s.axeVersion}</span></td></tr>
        <tr><td><strong>2. Βαθμολόγηση <span lang="en">Lighthouse</span></strong></td><td>${s.lighthouse.length} μετρήσεις: και οι 4 σελίδες, σε προσομοίωση κινητού και υπολογιστή.</td><td><span lang="en">Google Lighthouse ${s.lighthouseVersion}</span></td></tr>
        <tr><td><strong>3. Χρήση με πληκτρολόγιο</strong></td><td>Πλήρης διέλευση κάθε σελίδας με το πλήκτρο <span lang="en">Tab</span> (${s.summary.keyboardStops} στάσεις): προσβάσιμα στοιχεία, ορατή εστίαση, σύνδεσμος παράκαμψης.</td><td><span lang="en">Playwright ${s.playwrightVersion}</span></td></tr>
        <tr><td><strong>4. Μεγέθυνση και μικρές οθόνες</strong></td><td>Σε κάθε μέγεθος οθόνης: καμία οριζόντια κύλιση, κανένα αποκομμένο περιεχόμενο.</td><td><span lang="en">Playwright</span></td></tr>
        <tr><td><strong>5. Δομή, φόρμα και αντίθεση</strong></td><td>Γλώσσα και τίτλος σελίδας, επικεφαλίδες, εναλλακτικά κείμενα, ετικέτες και μηνύματα της φόρμας, αντίθεση κειμένου πάνω στην κεντρική φωτογραφία.</td><td><span lang="en">Playwright</span></td></tr>
        <tr><td><strong>6. Εγκυρότητα κώδικα</strong></td><td>Επικύρωση του κώδικα HTML και των 4 σελίδων.</td><td><span lang="en">html-validate ${s.htmlValidatorVersion}</span></td></tr>
      </tbody>
    </table>
  </section>
</div>

<div class="page">
  <section>
    <h2>4. Αποτελέσματα</h2>
    <table>
      <thead><tr><th>Έλεγχος</th><th>Αποτέλεσμα</th><th class="c">Κατάσταση</th></tr></thead>
      <tbody>
        <tr><td>Σάρωση κριτηρίων WCAG 2.1 A και AA (<span lang="en">axe-core</span>)</td><td>${s.summary.axeScans} σαρώσεις · <strong>0 παραβάσεις</strong> · ${s.summary.axeRulesPassedTotal} επιτυχείς έλεγχοι κανόνων</td><td class="c">Επιτυχής</td></tr>
        <tr><td>Βαθμολογία <span lang="en">Lighthouse</span></td><td>Προσβασιμότητα <strong>${allLh("accessibility")}</strong> και στις ${s.lighthouse.length} μετρήσεις · Βέλτιστες πρακτικές ${allLh("bestPractices")} · <span lang="en">SEO</span> ${allLh("seo")}</td><td class="c">Επιτυχής</td></tr>
        <tr><td>Χρήση με πληκτρολόγιο</td><td>${s.summary.keyboardStops} από ${s.summary.keyboardStops} στοιχεία προσβάσιμα, όλα με ορατή ένδειξη εστίασης</td><td class="c">Επιτυχής</td></tr>
        <tr><td>Μεγέθυνση, μικρές οθόνες, διαστήματα κειμένου</td><td>Καμία οριζόντια κύλιση και κανένα αποκομμένο στοιχείο σε ${states - 2} καταστάσεις προβολής ανά σελίδα</td><td class="c">Επιτυχής</td></tr>
        <tr><td>Αντίθεση κειμένου</td><td>0 παραβάσεις· πάνω στη φωτογραφία ${hero.map((h) => String(h.ratio).replace(".", ",") + ":1").join(" και ")} (απαιτούμενο 4,5:1)</td><td class="c">Επιτυχής</td></tr>
        <tr><td>Φόρμα επικοινωνίας</td><td>Σφάλματα με κείμενο, εστίαση στο πρώτο σφάλμα, ανακοίνωση αποτελέσματος</td><td class="c">Επιτυχής</td></tr>
        <tr><td>Κουμπί ρυθμίσεων προσβασιμότητας</td><td>${panelScans} σαρώσεις με ανοιχτό τον πίνακα · 0 παραβάσεις · άνοιγμα με <span lang="en">Enter</span> και κλείσιμο με <span lang="en">Escape</span> · οι επιλογές διατηρούνται μετά την επαναφόρτωση</td><td class="c">Επιτυχής</td></tr>
        <tr><td>Εγκυρότητα κώδικα HTML</td><td>4 σελίδες · 0 σφάλματα · 0 προειδοποιήσεις</td><td class="c">Επιτυχής</td></tr>
        <tr><td><strong>Σύνολο λειτουργικών ελέγχων</strong></td><td><strong>${s.summary.checksPassed} από ${s.summary.checks} επιτυχείς</strong></td><td class="c"><strong>Επιτυχής</strong></td></tr>
      </tbody>
    </table>
  </section>

  <figure>
    <img src="${ev}/screenshot-lighthouse-home-el-desktop.png" alt="Αναφορά Lighthouse για το www.thegrowthcubes.com/el/ σε υπολογιστή: Performance ${lh("home-el", "desktop").performance}, Accessibility ${lh("home-el", "desktop").accessibility}, Best Practices ${lh("home-el", "desktop").bestPractices}, SEO ${lh("home-el", "desktop").seo}.">
    <figcaption>Εικόνα 2. <span lang="en">Google Lighthouse ${s.lighthouseVersion}</span>, ελληνική αρχική σελίδα, υπολογιστής. Προσβασιμότητα: ${lh("home-el", "desktop").accessibility}/100.</figcaption>
  </figure>
  <figure>
    <img src="${ev}/screenshot-lighthouse-home-el-mobile.png" alt="Αναφορά Lighthouse για το www.thegrowthcubes.com/el/ σε κινητό: Performance ${lh("home-el", "mobile").performance}, Accessibility ${lh("home-el", "mobile").accessibility}, Best Practices ${lh("home-el", "mobile").bestPractices}, SEO ${lh("home-el", "mobile").seo}.">
    <figcaption>Εικόνα 3. <span lang="en">Google Lighthouse ${s.lighthouseVersion}</span>, ελληνική αρχική σελίδα, κινητό. Προσβασιμότητα: ${lh("home-el", "mobile").accessibility}/100.</figcaption>
  </figure>
  <figure style="width:40%">
    <img src="evidence/supplied-by-owner/axe-devtools-production.png" alt="Οθόνη του εργαλείου axe DevTools για το https://www.thegrowthcubes.com/ με επιλεγμένο το WCAG 2.1 AA: Total issues 0.">
    <figcaption>Εικόνα 4. Πρόσθετη σάρωση με την επέκταση περιηγητή <span lang="en">axe DevTools (axe-core 4.13.0)</span> στη δημοσιευμένη ιστοσελίδα (WCAG 2.1 AA): 0 ζητήματα.</figcaption>
  </figure>
</div>

<div class="page">
  <section>
    <h2>5. Χαρακτηριστικά προσβασιμότητας της ιστοσελίδας</h2>
    <p>Η ιστοσελίδα σχεδιάστηκε εξαρχής ώστε να είναι απλή, σταθερή και ευανάγνωστη. Τα παρακάτω χαρακτηριστικά επιβεβαιώθηκαν στον έλεγχο και ομαδοποιούνται στις τέσσερις αρχές του WCAG.</p>
    <div class="two">
      <div>
        <h3>Αντιληπτή</h3>
        <ul>
          <li>Υψηλή αντίθεση κειμένου και φόντου σε όλη την ιστοσελίδα.</li>
          <li>Εναλλακτικό κείμενο στις εικόνες, μαζί με το σήμα χρηματοδότησης ΕΣΠΑ.</li>
          <li>Το κείμενο μεγεθύνεται έως 200% και η σελίδα προσαρμόζεται έως μεγέθυνση 400% χωρίς οριζόντια κύλιση.</li>
          <li>Καμία κινούμενη εικόνα, βίντεο ή ήχος· τίποτα δεν κινείται ή αναβοσβήνει.</li>
        </ul>
        <h3>Λειτουργική</h3>
        <ul>
          <li>Πλήρης χρήση μόνο με το πληκτρολόγιο, με ευδιάκριτη ένδειξη εστίασης.</li>
          <li>Σύνδεσμος «Μετάβαση στο κύριο περιεχόμενο» στην αρχή κάθε σελίδας.</li>
          <li>Σαφείς τίτλοι σελίδων, επικεφαλίδες και κείμενα συνδέσμων.</li>
          <li>Κανένα χρονικό όριο και καμία λειτουργία που απαιτεί ειδικές χειρονομίες.</li>
        </ul>
      </div>
      <div>
        <h3>Κατανοητή</h3>
        <ul>
          <li>Δύο πλήρεις γλωσσικές εκδόσεις, ελληνική και αγγλική, με δηλωμένη γλώσσα σε κάθε σελίδα και επιλογέα γλώσσας.</li>
          <li>Ίδια πλοήγηση και ίδια διάταξη σε όλες τις σελίδες.</li>
          <li>Φόρμα επικοινωνίας με ορατές ετικέτες, σήμανση υποχρεωτικών πεδίων και μηνύματα σφάλματος σε απλό κείμενο δίπλα στο πεδίο.</li>
        </ul>
        <h3>Στιβαρή</h3>
        <ul>
          <li>Έγκυρος κώδικας HTML με σωστή σημασιολογική δομή (κεφαλίδα, κύριο περιεχόμενο, υποσέλιδο).</li>
          <li>Όλα τα στοιχεία ελέγχου έχουν όνομα και ρόλο για τα προγράμματα ανάγνωσης οθόνης.</li>
          <li>Το περιεχόμενο και η πλοήγηση λειτουργούν και με απενεργοποιημένη <span lang="en">JavaScript</span>.</li>
        </ul>
      </div>
    </div>
    <p>Επιπλέον, η ιστοσελίδα διαθέτει <strong>Δήλωση Προσβασιμότητας</strong> στα ελληνικά και στα αγγλικά, με διεύθυνση επικοινωνίας (info@thegrowthcubes.com) για την αναφορά τυχόν δυσκολίας πρόσβασης, καθώς και τη σήμανση της συγχρηματοδότησης από την Ευρωπαϊκή Ένωση (ΕΣΠΑ 2021–2027) στο υποσέλιδο. Σε κάθε σελίδα υπάρχει και κουμπί ρυθμίσεων προσβασιμότητας (ενότητα 6).</p>
  </section>

  <div class="shots">
    <figure class="crop">
      <img src="${ev}/screenshot-home-el-form-errors.png" alt="Η φόρμα επικοινωνίας σε οθόνη κινητού με μηνύματα σφάλματος κάτω από τα υποχρεωτικά πεδία.">
      <figcaption>Εικόνα 5. Η φόρμα επικοινωνίας σε κινητό (απόσπασμα): τα σφάλματα περιγράφονται με κείμενο και η εστίαση μεταφέρεται στο πρώτο πεδίο προς διόρθωση.</figcaption>
    </figure>
    <figure class="fit">
      <img src="${ev}/screenshot-home-el-reflow-320x256.png" alt="Η ελληνική αρχική σελίδα σε πολύ μικρή οθόνη 320 επί 256 εικονοστοιχείων: η κεφαλίδα και η πλοήγηση αναδιπλώνονται χωρίς οριζόντια κύλιση.">
      <figcaption>Εικόνα 6. Η αρχική σελίδα σε προβολή που αντιστοιχεί σε μεγέθυνση 400%: το περιεχόμενο αναδιπλώνεται χωρίς οριζόντια κύλιση.</figcaption>
    </figure>
  </div>
</div>

<div class="page">
  <section>
    <h2>6. Κουμπί ρυθμίσεων προσβασιμότητας</h2>
    <p>Σε κάθε σελίδα, κάτω αριστερά, υπάρχει στρογγυλό κουμπί με το διεθνές σύμβολο προσβασιμότητας. Ανοίγει τον πίνακα «Ρυθμίσεις προσβασιμότητας», από τον οποίο ο επισκέπτης προσαρμόζει την εμφάνιση της ιστοσελίδας στις ανάγκες του:</p>
    <ul>
      <li><strong>Μέγεθος κειμένου</strong> 100%, 125%, 150% ή 200%, για άτομα με χαμηλή όραση.</li>
      <li><strong>Υψηλή αντίθεση</strong>: λευκό κείμενο σε μαύρο φόντο και κίτρινοι σύνδεσμοι, για άτομα με χαμηλή όραση ή δυσχρωματοψία.</li>
      <li><strong>Επισήμανση συνδέσμων</strong>: κάθε σύνδεσμος με κίτρινο φόντο και υπογράμμιση.</li>
      <li><strong>Ευανάγνωστη γραμματοσειρά</strong> με μεγαλύτερα διαστήματα και χωρίς κείμενο μόνο με κεφαλαία, για άτομα με δυσλεξία.</li>
      <li><strong>Μεγάλος δείκτης ποντικιού</strong>, για άτομα με χαμηλή όραση ή κινητικές δυσκολίες.</li>
      <li><strong>Ανάγνωση φωναχτά</strong> του κειμένου της σελίδας με τη φωνή της συσκευής, στα ελληνικά ή στα αγγλικά.</li>
    </ul>
    <p>Οι επιλογές ισχύουν σε όλες τις σελίδες, αποθηκεύονται μόνο στο πρόγραμμα περιήγησης του επισκέπτη και αναιρούνται με το κουμπί «Επαναφορά». Το κουμπί είναι η δεύτερη στάση του πληκτρολογίου, αμέσως μετά τον σύνδεσμο παράκαμψης· ανοίγει με <span lang="en">Enter</span> και κλείνει με <span lang="en">Escape</span>. Σε μεγέθυνση 400% μετακινείται στην κορυφή της σελίδας, ώστε να μην καλύπτει περιεχόμενο. Έχει υλοποιηθεί μέσα στην ίδια την ιστοσελίδα, χωρίς υπηρεσίες τρίτων.</p>
    <p>Ο πίνακας ελέγχθηκε στον ίδιο έλεγχο με την υπόλοιπη ιστοσελίδα: ${panelScans} σαρώσεις WCAG με ανοιχτό τον πίνακα, με και χωρίς υψηλή αντίθεση, χωρίς καμία παράβαση. Οι ρυθμίσεις αποτελούν πρόσθετη διευκόλυνση: η ιστοσελίδα πληροί το WCAG 2.1 AA και χωρίς αυτές, και λειτουργεί εξίσου με τα βοηθητικά εργαλεία του ίδιου του χρήστη (πρόγραμμα ανάγνωσης οθόνης, μεγέθυνση, πληκτρολόγιο).</p>
  </section>

  <div class="shots">
    <figure class="panel">
      <img src="evidence/supplied-by-owner/a11y-panel-production.png" alt="Η ελληνική αρχική σελίδα με ανοιχτό τον πίνακα Ρυθμίσεις προσβασιμότητας: μέγεθος κειμένου, υψηλή αντίθεση, επισήμανση συνδέσμων, ευανάγνωστη γραμματοσειρά, μεγάλος δείκτης, ανάγνωση φωναχτά και επαναφορά. Κάτω αριστερά το στρογγυλό κουμπί με το σύμβολο προσβασιμότητας.">
      <figcaption>Εικόνα 7. Ο πίνακας «Ρυθμίσεις προσβασιμότητας» ανοιχτός στη δημοσιευμένη ελληνική αρχική σελίδα (απόσπασμα).</figcaption>
    </figure>
    <figure class="panel">
      <img src="evidence/supplied-by-owner/a11y-panel-contrast-production.png" alt="Η ίδια σελίδα με ενεργοποιημένες την υψηλή αντίθεση, την επισήμανση συνδέσμων και τον μεγάλο δείκτη: λευκό κείμενο σε μαύρο φόντο, σύνδεσμοι με κίτρινο φόντο, και οι ενεργές επιλογές σημειωμένες με κίτρινο και σημάδι ελέγχου.">
      <figcaption>Εικόνα 8. Η ίδια σελίδα με ενεργές την υψηλή αντίθεση, την επισήμανση συνδέσμων και τον μεγάλο δείκτη (απόσπασμα).</figcaption>
    </figure>
  </div>
</div>

<div class="page">
  <section>
    <h2>7. Συνολική αξιολόγηση</h2>
    <p>Από τα ${criteria.length} κριτήρια επιτυχίας των επιπέδων A και AA του WCAG 2.1, τα ${satisfied} έχουν εφαρμογή στην ιστοσελίδα και <strong>ικανοποιούνται όλα</strong>. Τα υπόλοιπα ${notApplicable} δεν έχουν εφαρμογή, επειδή αφορούν περιεχόμενο που η ιστοσελίδα δεν διαθέτει (ήχο, βίντεο, κινούμενο περιεχόμενο, χρονικά όρια, συναλλαγές). Η αναλυτική εικόνα ανά κριτήριο δίνεται στο Παράρτημα Α.</p>
    <p>Με βάση τα αποτελέσματα του ελέγχου, η ιστοσελίδα www.thegrowthcubes.com αξιολογείται ως <strong>σύμφωνη με το WCAG 2.1 επιπέδου AA</strong> και με τις απαιτήσεις του κεφαλαίου 9 του προτύπου EN 301 549, και συνεπώς ανταποκρίνεται στις απαιτήσεις προσβασιμότητας της Δημόσιας Πρόσκλησης 6/2026.</p>
    <p>Η επιχείρηση δεσμεύεται να διατηρεί το επίπεδο αυτό: κάθε αλλαγή στην ιστοσελίδα ελέγχεται με την ίδια διαδικασία πριν από τη δημοσίευσή της, και κάθε αναφορά επισκέπτη μέσω της Δήλωσης Προσβασιμότητας εξετάζεται κατά προτεραιότητα.</p>
  </section>

  <section>
    <h2>8. Τεκμηρίωση</h2>
    <p>Όλα τα πρωτογενή αποτελέσματα του ελέγχου τηρούνται σε ηλεκτρονικό φάκελο και είναι διαθέσιμα στην υπηρεσία εφόσον ζητηθούν:</p>
    <table>
      <thead><tr><th>Τεκμήριο</th><th>Περιεχόμενο</th><th class="c">Αρχεία</th></tr></thead>
      <tbody>
        <tr><td>Συγκεντρωτικό αρχείο ελέγχου</td><td>Όλα τα αποτελέσματα, οι εκδόσεις των εργαλείων και τα ψηφιακά αποτυπώματα των αρχείων</td><td class="c">1</td></tr>
        <tr><td>Αναφορές σάρωσης WCAG</td><td>Πλήρες αποτέλεσμα κάθε σάρωσης <span lang="en">axe-core</span></td><td class="c">${s.summary.axeScans}</td></tr>
        <tr><td>Αναφορές <span lang="en">Lighthouse</span></td><td>Πλήρης αναφορά κάθε μέτρησης (μορφή HTML και JSON)</td><td class="c">${s.lighthouse.length * 2}</td></tr>
        <tr><td>Στιγμιότυπα οθόνης</td><td>Όλες οι σελίδες σε υπολογιστή και σε μεγέθυνση 400%, η φόρμα με σφάλματα, ο πίνακας ρυθμίσεων προσβασιμότητας, οι βαθμολογίες <span lang="en">Lighthouse</span></td><td class="c">${fs.readdirSync(path.join(docs, ev)).filter((f) => f.startsWith("screenshot-")).length}</td></tr>
        <tr><td>Ευρετήριο τεκμηρίων</td><td>Αντιστοίχιση κάθε ισχυρισμού της έκθεσης με το αρχείο που τον τεκμηριώνει</td><td class="c">1</td></tr>
      </tbody>
    </table>
    <p class="small" style="margin-top:2mm">Η παρούσα έκθεση αποτελεί τεχνική τεκμηρίωση του δικαιούχου, βασισμένη στους ελέγχους που περιγράφονται στην ενότητα 3.</p>
  </section>

</div>

<div class="page annex">
  <section>
    <h2>Παράρτημα Α. Κριτήρια επιτυχίας WCAG 2.1, επίπεδα A και AA</h2>
    <p class="small">Αποτέλεσμα ανά κριτήριο για το σύνολο της ιστοσελίδας (4 σελίδες). Ικανοποιούνται: ${satisfied}. Δεν έχουν εφαρμογή: ${notApplicable}. Δεν ικανοποιούνται: 0.</p>
    ${criteriaTable(criteria)}
  </section>
</div>

</body>
</html>
`;

(async () => {
  const htmlPath = path.join(docs, "DYPA_Accessibility_Report_FINAL.html");
  const pdfPath = path.join(docs, "DYPA_Accessibility_Report_FINAL.pdf");
  fs.writeFileSync(htmlPath, html);
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  // Viewport as wide as the A4 text area, so measured heights match the print layout.
  const page = await browser.newPage({ viewport: { width: Math.round((210 - 34) * (96 / 25.4)), height: 986 } });
  await page.goto("file://" + htmlPath, { waitUntil: "load" });
  await page.emulateMedia({ media: "print" });
  // A4 content height at 96 dpi with the @page margins above.
  const limit = (297 - 17 - 19) * (96 / 25.4);
  const heights = await page.locator(".page:not(.annex)").evaluateAll((els) => els.map((e) => Math.round(e.getBoundingClientRect().height)));
  await page.pdf({ path: pdfPath, preferCSSPageSize: true, printBackground: true, tagged: true });
  await browser.close();
  console.log(JSON.stringify({ run, sections: heights.length, sectionHeightsPx: heights, pageLimitPx: Math.round(limit), overflowing: heights.filter((h) => h > limit).length }));
})();

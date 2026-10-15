// Cookie consent for Google Analytics (loaded through Google Tag Manager).
// The snippet at the top of each page's <head> sets Google's consent defaults
// to denied and only loads GTM once the visitor has accepted ("basic" consent
// mode). This file asks the question, stores the answer and lets the visitor
// change it from the "Cookie settings" button in the footer.
const strings = {
  en: {
    title: 'Cookies and your privacy',
    purpose: 'We would like to use Google Analytics to see how visitors use this website, so we can improve it. It places cookies on your device and sends information about your visit to Google.',
    choice: 'Google Analytics only starts if you accept. Rejecting does not affect how the website works. You can change your choice at any time with “Cookie settings” at the bottom of every page.',
    policy: 'Read our privacy policy',
    policyUrl: '/privacy.html',
    accept: 'Accept',
    reject: 'Reject',
    accepted: 'Your current choice: Google Analytics accepted.',
    rejected: 'Your current choice: Google Analytics rejected.',
  },
  el: {
    title: 'Cookies και απόρρητο',
    purpose: 'Θα θέλαμε να χρησιμοποιούμε το Google Analytics για να βλέπουμε πώς χρησιμοποιούν οι επισκέπτες τον ιστότοπο, ώστε να τον βελτιώνουμε. Το Google Analytics αποθηκεύει cookies στη συσκευή σας και στέλνει στην Google πληροφορίες για την επίσκεψή σας.',
    choice: 'Το Google Analytics ενεργοποιείται μόνο αν το αποδεχτείτε. Η απόρριψη δεν επηρεάζει τη λειτουργία του ιστότοπου. Μπορείτε να αλλάξετε την επιλογή σας οποιαδήποτε στιγμή από τις «Ρυθμίσεις cookies» στο κάτω μέρος κάθε σελίδας.',
    policy: 'Διαβάστε την πολιτική απορρήτου',
    policyUrl: '/el/privacy.html',
    accept: 'Αποδοχή',
    reject: 'Απόρριψη',
    accepted: 'Η τρέχουσα επιλογή σας: αποδοχή του Google Analytics.',
    rejected: 'Η τρέχουσα επιλογή σας: απόρριψη του Google Analytics.',
  },
};
const text = strings[document.documentElement.lang] || strings.en;
const consent = window.gtcConsent;

const dialog = document.createElement('dialog');
dialog.className = 'consent-dialog';
dialog.setAttribute('aria-labelledby', 'consent-title');
dialog.setAttribute('aria-describedby', 'consent-text');
dialog.innerHTML = `
  <h2 id="consent-title" tabindex="-1">${text.title}</h2>
  <div id="consent-text">
    <p>${text.purpose}</p>
    <p>${text.choice}</p>
  </div>
  <p class="consent-current" hidden></p>
  <p><a href="${text.policyUrl}">${text.policy}</a></p>
  <div class="consent-actions">
    <button type="button" value="accept">${text.accept}</button>
    <button type="button" value="reject">${text.reject}</button>
  </div>`;
document.body.append(dialog);
const current = dialog.querySelector('.consent-current');

// Google Analytics sets its cookies on the site's domain and its parents
// (e.g. .thegrowthcubes.com); remove them from each when consent is withdrawn.
const clearAnalyticsCookies = () => {
  const host = location.hostname.split('.');
  document.cookie.split('; ').map(cookie => cookie.split('=')[0]).filter(name => name.startsWith('_ga')).forEach(name => {
    document.cookie = `${name}=; Max-Age=0; path=/`;
    for (let i = 0; i < host.length - 1; i++)
      document.cookie = `${name}=; Max-Age=0; path=/; domain=.${host.slice(i).join('.')}`;
  });
};

// A first visit must end with a choice: Escape cannot dismiss the dialog then.
let required = false;
const open = isRequired => {
  required = isRequired;
  const choice = consent.read();
  current.hidden = !choice;
  if (choice) current.textContent = choice.analytics ? text.accepted : text.rejected;
  dialog.showModal();
  dialog.querySelector('h2').focus();
};
const save = analytics => {
  try { localStorage.setItem(consent.key, JSON.stringify({ analytics, date: Date.now() })); } catch {}
  if (analytics) consent.loadGtm();
  else {
    gtag('consent', 'update', { analytics_storage: 'denied' });
    clearAnalyticsCookies();
  }
  required = false;
  dialog.close();
};
dialog.querySelectorAll('.consent-actions button').forEach(button =>
  button.addEventListener('click', () => save(button.value === 'accept')));
dialog.addEventListener('cancel', event => { if (required) event.preventDefault(); });
// Some browsers close a modal on a repeated Escape regardless; ask again.
dialog.addEventListener('close', () => { if (required) open(true); });

document.querySelectorAll('.consent-settings').forEach(button => {
  button.hidden = false;
  button.addEventListener('click', () => open(false));
});
// The privacy policy itself stays readable before a choice is made.
if (!consent.read() && document.body.dataset.consentPrompt !== 'off') open(true);

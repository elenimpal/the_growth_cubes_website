// There is no delivery backend: a valid form opens the visitor's email app with
// the message filled in. Never report an inquiry or subscription as sent.
// Native validation remains without JS.
const messages = {
  en: {
    required: 'Please complete this required field.',
    email: 'Please enter a valid email address, such as name@example.com.',
    fix: count => `Please correct ${count} ${count === 1 ? 'field' : 'fields'} before continuing.`,
    ready: 'Your email app should now open with the message ready. Nothing is sent until you press send there. If it did not open, use the link below or email info@thegrowthcubes.com directly.',
    contactSubject: 'Website inquiry',
    newsletterSubject: 'Request for growth updates',
    name: 'Name', company: 'Company', emailLabel: 'Email',
    newsletterBody: 'Please send information about subscribing to growth updates to:',
  },
  el: {
    required: 'Συμπληρώστε αυτό το υποχρεωτικό πεδίο.',
    email: 'Εισαγάγετε μια έγκυρη διεύθυνση email, για παράδειγμα name@example.com.',
    fix: count => count === 1 ? 'Διορθώστε 1 πεδίο για να συνεχίσετε.' : `Διορθώστε ${count} πεδία για να συνεχίσετε.`,
    ready: 'Η εφαρμογή email σας θα πρέπει να ανοίξει με το μήνυμα έτοιμο. Δεν στέλνεται τίποτα μέχρι να πατήσετε αποστολή εκεί. Αν δεν άνοιξε, χρησιμοποιήστε τον παρακάτω σύνδεσμο ή γράψτε απευθείας στο info@thegrowthcubes.com.',
    contactSubject: 'Μήνυμα από τον ιστότοπο',
    newsletterSubject: 'Αίτημα για ενημερώσεις',
    name: 'Ονοματεπώνυμο', company: 'Εταιρεία', emailLabel: 'Email',
    newsletterBody: 'Παρακαλώ στείλτε πληροφορίες για την εγγραφή στις ενημερώσεις στη διεύθυνση:',
  },
};
const text = messages[document.documentElement.lang] || messages.en;

document.querySelectorAll('#contact-form, #newsletter-form').forEach(form => {
  form.noValidate = true;
  const controls = [...form.querySelectorAll('input, textarea')];
  const prefix = form.id === 'contact-form' ? 'contact' : 'newsletter';
  const validate = control => {
    const error = document.getElementById(`${control.id}-error`);
    const invalid = !control.validity.valid;
    control.setAttribute('aria-invalid', String(invalid));
    error.textContent = invalid ? (control.validity.valueMissing ? text.required : text.email) : '';
    return !invalid;
  };
  controls.forEach(control => control.addEventListener('input', () => {
    if (control.getAttribute('aria-invalid') === 'true') validate(control);
    document.getElementById(`${prefix}-email-draft`).hidden = true;
    document.getElementById(`${prefix}-status`).textContent = '';
  }));
  form.addEventListener('submit', event => {
    event.preventDefault();
    const invalid = controls.filter(control => !validate(control));
    const status = document.getElementById(`${prefix}-status`);
    const draft = document.getElementById(`${prefix}-email-draft`);
    draft.hidden = true;
    if (invalid.length) {
      status.textContent = text.fix(invalid.length);
      invalid[0].focus();
      return;
    }
    const values = new FormData(form);
    const subject = prefix === 'contact' ? text.contactSubject : text.newsletterSubject;
    const body = prefix === 'contact'
      ? `${text.name}: ${values.get('name')}\n${text.company}: ${values.get('company')}\n${text.emailLabel}: ${values.get('email')}\n\n${values.get('message')}`
      : `${text.newsletterBody} ${values.get('email')}`;
    draft.href = `mailto:info@thegrowthcubes.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    draft.hidden = false;
    status.textContent = text.ready;
    window.location.href = draft.href;
  });
});

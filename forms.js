// Direct website inquiry submission; the browser never opens an email client.
// Server/API credentials are not exposed to visitors.
const translations = {
  en: {
    required: 'Please complete this required field.',
    email: 'Please enter a valid email address, such as name@example.com.',
    messageTooShort: 'Please write at least 10 characters describing your inquiry.',
    invalid: 'Please check this field and try again.',
    rateLimited: 'Too many submissions. Please try again in a few minutes.'
    fix: count => `Please correct ${count} ${count === 1 ? 'field' : 'fields'} before continuing.`,
    sending: 'Sending your message…',
    sent: 'Your inquiry has been submitted. Thank you — we will get back to you.',
    failed: 'We could not submit your message. Please try again, or email info@thegrowthcubes.com directly.',
    unavailable: 'The contact form is temporarily unavailable. Please email info@thegrowthcubes.com directly.',
    button: 'Send message',
  },
  el: {
    required: 'Συμπληρώστε αυτό το υποχρεωτικό πεδίο.',
    email: 'Εισαγάγετε μια έγκυρη διεύθυνση email, για παράδειγμα name@example.com.',
    messageTooShort: 'Περιγράψτε το αίτημά σας με τουλάχιστον 10 χαρακτήρες.',
    invalid: 'Ελέγξτε αυτό το πεδίο και δοκιμάστε ξανά.',
    rateLimited: 'Έχουν γίνει πολλές υποβολές. Δοκιμάστε ξανά σε λίγα λεπτά.'
    fix: count => count === 1 ? 'Διορθώστε 1 πεδίο για να συνεχίσετε.' : `Διορθώστε ${count} πεδία για να συνεχίσετε.`,
    sending: 'Αποστολή μηνύματος…',
    sent: 'Το αίτημά σας υποβλήθηκε. Ευχαριστούμε — θα επικοινωνήσουμε μαζί σας.',
    failed: 'Δεν ήταν δυνατή η αποστολή. Δοκιμάστε ξανά ή γράψτε στο info@thegrowthcubes.com.',
    unavailable: 'Η φόρμα επικοινωνίας δεν είναι προσωρινά διαθέσιμη. Γράψτε στο info@thegrowthcubes.com.',
    button: 'Αποστολή μηνύματος',
  }
};
const locale = document.documentElement.lang === 'el' ? 'el' : 'en';
const copy = translations[locale];
const form = document.getElementById('contact-form');
if (form) {
  const status = document.getElementById('contact-status');
  const button = form.querySelector('button[type="submit"]');
  const controls = [...form.querySelectorAll('input:not([name="website"]), textarea')].filter(control => !control.disabled);
  let isSending = false;
  let submissionId = null;

  form.noValidate = true;
  const validate = control => {
    const error = document.getElementById(`${control.id}-error`);
    const value = typeof control.value === 'string' ? control.value.trim() : '';
    const isBlankRequired = control.required && !value;
    const isShortMessage = control.name === 'message' && value.length < 10;
    const invalid = !control.validity.valid || isBlankRequired || isShortMessage;
    control.setAttribute('aria-invalid', String(invalid));
    if (error) {
      error.textContent = !invalid ? '' :
        (isBlankRequired || control.validity.valueMissing) ? copy.required :
        (isShortMessage || control.validity.tooShort) ? copy.messageTooShort :
        control.validity.typeMismatch ? copy.email : copy.invalid;
    }
    return !invalid;
  };
  controls.forEach(control => {
    control.addEventListener('focus', () => control.scrollIntoView({ block: 'nearest' }));
    control.addEventListener('input', () => {
      submissionId = null;
      if (control.getAttribute('aria-invalid') === 'true') validate(control);
      status.textContent = '';
    });
  });

  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (isSending) return;

    const invalid = controls.filter(control => !validate(control));
    if (invalid.length) {
      status.textContent = copy.fix(invalid.length);
      invalid[0].focus();
      return;
    }

    const values = new FormData(form);
    submissionId ||= crypto.randomUUID();
    const payload = {
      name: values.get('name'),
      company: values.get('company'),
      email: values.get('email'),
      message: values.get('message'),
      website: values.get('website'),
      submission_id: submissionId,
      locale
    };

    isSending = true;
    button.disabled = true;
    button.setAttribute('aria-busy', 'true');
    status.textContent = copy.sending;

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(12000)
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || result.ok !== true || result.accepted !== true) {
        status.textContent = response.status === 429 ? copy.rateLimited :
          response.status === 503 ? copy.unavailable : copy.failed;
        return;
      }

      status.textContent = copy.sent;
      form.reset();
      controls.forEach(control => {
        control.setAttribute('aria-invalid', 'false');
        const error = document.getElementById(`${control.id}-error`);
        if (error) error.textContent = '';
      });
      submissionId = null;

      // Only non-identifying metadata, and only with statistics consent.
      // Configure exactly one GTM GA4 event tag for this event after QA/approval.
      if (window.Cookiebot?.consent?.statistics === true) {
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({ event: 'contact_form_success', form_id: 'contact', form_language: locale });
      }
    } catch {
      status.textContent = copy.failed;
    } finally {
      isSending = false;
      button.disabled = false;
      button.removeAttribute('aria-busy');
    }
  });
}

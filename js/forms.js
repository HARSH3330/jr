// ===================================
// Form Validation & Handling with EmailJS Integration
// 
// This module handles:
// - Real-time form field validation
// - Form submission via EmailJS
// - Error display and recovery
// - File upload preview
// ===================================

// === VALIDATION RULES ===
const validationRules = {
  required: (value) => value.trim() !== '',
  email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
  phone: (value) => {
    const digitsOnly = value.replace(/\D/g, '');
    return /^[\d\s\-\+\(\)]+$/.test(value) && digitsOnly.length >= 10;
  },
  minLength: (value, min) => value.length >= min,
  maxLength: (value, max) => value.length <= max
};

const errorMessages = {
  required: 'This field is required',
  email: 'Please enter a valid email address',
  phone: 'Please enter a valid phone number',
  minLength: (min) => `Minimum ${min} characters required`,
  maxLength: (max) => `Maximum ${max} characters allowed`,
  file: 'Please upload a file'
};

// === VALIDATION ENGINE ===
function validateField(field) {
  const value = field.value;
  const rules = field.dataset.validate ? field.dataset.validate.split(',') : [];

  // Check file field requirements
  if (field.type === 'file' && field.hasAttribute('required')) {
    if (!field.files?.length) {
      return { isValid: false, errorMessage: errorMessages.file };
    }
  }

  // Validate against rules
  for (const rule of rules) {
    const [ruleName, ruleValue] = rule.split(':');
    let isValid = true;
    let message = '';

    switch (ruleName) {
      case 'required':
        isValid = validationRules.required(value);
        message = errorMessages.required;
        break;
      case 'email':
        isValid = !value || validationRules.email(value);
        message = errorMessages.email;
        break;
      case 'phone':
        isValid = !value || validationRules.phone(value);
        message = errorMessages.phone;
        break;
      case 'minLength':
        isValid = !value || validationRules.minLength(value, parseInt(ruleValue));
        message = errorMessages.minLength(ruleValue);
        break;
      case 'maxLength':
        isValid = !value || validationRules.maxLength(value, parseInt(ruleValue));
        message = errorMessages.maxLength(ruleValue);
        break;
    }

    if (!isValid) return { isValid: false, errorMessage: message };
  }

  return { isValid: true, errorMessage: '' };
}

// === ERROR MANAGEMENT ===
function showError(field, message) {
  field.classList.add('error');
  const existingError = field.parentElement.querySelector('.form-error');
  if (existingError) existingError.remove();

  const errorElement = document.createElement('span');
  errorElement.className = 'form-error';
  errorElement.textContent = message;
  field.parentElement.appendChild(errorElement);
}

function clearError(field) {
  field.classList.remove('error');
  field.parentElement.querySelector('.form-error')?.remove();
}

// === FORM VALIDATION SETUP ===
function setupRealtimeValidation(form) {
  const fields = form.querySelectorAll('input, textarea, select');

  fields.forEach(field => {
    const validateAndDisplay = () => {
      const { isValid, errorMessage } = validateField(field);
      isValid ? clearError(field) : showError(field, errorMessage);
    };

    field.addEventListener('blur', validateAndDisplay);
    field.addEventListener('input', () => {
      if (field.classList.contains('error')) validateAndDisplay();
    });
  });
}

// === FULL FORM VALIDATION ===
function validateForm(form) {
  const fields = form.querySelectorAll('input, textarea, select');
  let isFormValid = true;

  fields.forEach(field => {
    const { isValid, errorMessage } = validateField(field);
    if (isValid) {
      clearError(field);
    } else {
      showError(field, errorMessage);
      isFormValid = false;
    }
  });

  return isFormValid;
}

// === FILE UPLOAD PREVIEW ===
function setupFileUpload(fileInput) {
  const label = fileInput.nextElementSibling || fileInput.parentElement.querySelector('.form-file-label');
  if (!label) return;

  fileInput.addEventListener('change', (e) => {
    const files = e.target.files;
    if (files.length === 0) return;

    const file = files[0];
    const fileSize = (file.size / 1024 / 1024).toFixed(2);
    
    label.innerHTML = `
      <div style="text-align: center;">
        <div style="font-weight: 600; color: var(--color-primary);">✓ File Selected</div>
        <div style="font-size: var(--font-size-sm); margin-top: 4px;">${file.name}</div>
        <div style="font-size: var(--font-size-xs); color: var(--color-gray-500);">${fileSize} MB</div>
      </div>
    `;
    clearError(fileInput);
  });
}

// === EMAIL.JS SUBMISSION ===
async function submitViaEmailJS(formData, formType = 'contact') {
  // EmailJS Configuration - Update these with your actual values from emailjs.com
  const EMAILJS_CONFIG = {
    publicKey: 'zc3lL5TeiW8ATXkjL',
    serviceId: 'service_4flkctt',
    contactTemplateId: 'template_f1ywxhd'
  };

  if (!EMAILJS_CONFIG.publicKey || EMAILJS_CONFIG.publicKey === 'EMAILJS_PUBLIC_KEY_PLACEHOLDER') {
    throw new Error('EmailJS not configured. Add your keys to forms.js');
  }

  // Check if EmailJS library is loaded
  if (typeof emailjs === 'undefined') {
    throw new Error('EmailJS library not loaded. Check that script tag is in HTML head.');
  }

  // Initialize EmailJS with public key
  emailjs.init(EMAILJS_CONFIG.publicKey);

  const templateData = {
    from_name: formData.name || formData.fullName || 'Visitor',
    from_email: formData.email || 'unknown@example.com',
    phone: formData.phone || 'Not provided',
    company: formData.company || 'Not provided',
    inquiry_type: formData['inquiry-type'] || formData.service || 'General Inquiry',
    message: formData.message || formData.coverLetter || '',
    form_type: formType,
    submission_time: new Date().toLocaleString(),
    reply_to: formData.email || 'noreply@example.com'
  };

  const templateId = EMAILJS_CONFIG.contactTemplateId;
  const result = await emailjs.send(EMAILJS_CONFIG.serviceId, templateId, templateData);

  return result;
}

// === UI MESSAGE HELPERS ===
function createMessageElement(message, className, bgColor, textColor, borderColor) {
  const element = document.createElement('div');
  element.className = className;
  element.style.cssText = `
    padding: var(--spacing-4);
    background-color: ${bgColor};
    border: 2px solid ${borderColor};
    border-radius: var(--radius-md);
    color: ${textColor};
    font-weight: var(--font-weight-medium);
    margin-bottom: var(--spacing-4);
    text-align: center;
  `;
  element.textContent = message;
  return element;
}

function showFormSuccess(form) {
  const successMsg = createMessageElement(
    '✓ Thank you! Your message has been sent successfully.',
    'form-success',
    '#d1fae5',
    '#065f46',
    'var(--color-success)'
  );

  form.insertBefore(successMsg, form.firstChild);
  form.reset();

  form.querySelectorAll('.form-file-label').forEach(label => {
    label.innerHTML = `
      <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="margin-right: 8px;">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
      </svg>
      <span>Click to upload file</span>
    `;
  });

  setTimeout(() => successMsg.remove(), 5000);
  successMsg.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function showFormError(form, message) {
  const errorMsg = createMessageElement(
    message,
    'form-error-message',
    '#fee2e2',
    '#991b1b',
    'var(--color-error)'
  );

  form.insertBefore(errorMsg, form.firstChild);
  setTimeout(() => errorMsg.remove(), 5000);
}

// === FORM SUBMISSION HANDLER ===
function handleFormSubmit(form, callback) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!validateForm(form)) {
      const firstError = form.querySelector('.error');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    // Check reCAPTCHA on production (skip on localhost for easier testing)
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    if (!isLocalhost && typeof grecaptcha !== 'undefined') {
      const recaptchaResponse = grecaptcha?.getResponse?.();
      if (!recaptchaResponse) {
        showFormError(form, 'Please verify that you are not a robot.');
        return;
      }
    }

    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    const formType = form.dataset.formType || 'contact';
    const submitButton = form.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;

    submitButton.disabled = true;
    submitButton.textContent = 'Sending...';

    try {
      if (callback) {
        await callback(data, formData);
      } else if (typeof emailjs !== 'undefined') {
        await submitViaEmailJS(data, formType);
        showFormSuccess(form);
        // Reset reCAPTCHA on success (unless on localhost)
        if (!isLocalhost && typeof grecaptcha !== 'undefined') {
          grecaptcha?.reset?.();
        }
      } else {
        showFormError(form, 'Email service not available. Please try again or contact us directly.');
        console.error('EmailJS not loaded. Verify the EmailJS script tag is included in HTML.');
      }
    } catch (error) {
      console.error('Form submission error:', error);
      showFormError(form, error.message || 'An error occurred. Please try again.');
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = originalText;
    }
  });
}

// === INITIALIZE ALL FORMS ===
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('form[data-validate-form]').forEach(form => {
    setupRealtimeValidation(form);
    handleFormSubmit(form);
  });

  document.querySelectorAll('.form-file-input').forEach(setupFileUpload);
});

// === PUBLIC API ===
window.SolvixForms = {
  validateField,
  validateForm,
  showError,
  clearError,
  handleFormSubmit,
  setupFileUpload,
  submitViaEmailJS
};

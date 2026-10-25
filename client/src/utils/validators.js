/**
 * ResQNet Authentication & Form Validation Helpers
 * Client-side validation mirroring server security rules in server/middleware/validation.js
 */

export const validateName = (name) => {
  if (!name || !name.trim()) {
    return { isValid: false, error: 'Full name is required.' };
  }
  const trimmed = name.trim();
  if (trimmed.length < 2) {
    return { isValid: false, error: 'Name must be at least 2 characters long.' };
  }
  if (trimmed.length > 60) {
    return { isValid: false, error: 'Name must not exceed 60 characters.' };
  }
  return { isValid: true };
};

export const validateEmail = (email) => {
  if (!email || !email.trim()) {
    return { isValid: false, error: 'Email address is required.' };
  }
  const trimmed = email.trim();
  // Standard email format verification
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  if (!emailRegex.test(trimmed)) {
    return { isValid: false, error: 'Please enter a valid email address (e.g. name@example.com).' };
  }
  return { isValid: true };
};

export const validatePhone = (phone) => {
  if (!phone || !phone.trim()) {
    return { isValid: true }; // Optional field
  }
  const trimmed = phone.trim();
  // Accepts standard Indian mobile format: +91 98220 12345, 98220-12345, 9822012345
  const phoneRegex = /^(\+91[\s-]?)?[6-9]\d{4}[\s-]?\d{5}$/;
  if (!phoneRegex.test(trimmed)) {
    return {
      isValid: false,
      error: 'Please enter a valid 10-digit Indian phone number (e.g. +91 98220 12345).'
    };
  }
  return { isValid: true };
};

export const validatePassword = (password) => {
  if (!password) {
    return { isValid: false, error: 'Password is required.' };
  }
  if (password.length < 8) {
    return { isValid: false, error: 'Password must be at least 8 characters long.' };
  }
  // Must contain at least one letter and one number
  const letterAndNumRegex = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;
  if (!letterAndNumRegex.test(password)) {
    return {
      isValid: false,
      error: 'Password must contain at least one letter and one number.'
    };
  }
  return { isValid: true };
};

export const validateConfirmPassword = (password, confirmPassword) => {
  if (!confirmPassword) {
    return { isValid: false, error: 'Please confirm your password.' };
  }
  if (password !== confirmPassword) {
    return { isValid: false, error: 'Passwords do not match.' };
  }
  return { isValid: true };
};

export const calculatePasswordStrength = (pass = '') => {
  const hasMinLength = pass.length >= 8;
  const hasLetter = /[A-Za-z]/.test(pass);
  const hasNumber = /\d/.test(pass);
  const hasSymbol = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(pass);
  const isLong = pass.length >= 12;

  let score = 0;
  if (hasMinLength) score++;
  if (hasLetter) score++;
  if (hasNumber) score++;
  if (hasSymbol) score++;
  if (isLong) score++;

  if (score <= 1) {
    return {
      score: 1,
      label: 'Weak',
      color: 'danger',
      percent: 25,
      checklist: { hasMinLength, hasLetter, hasNumber, hasSymbol }
    };
  }
  if (score <= 3) {
    return {
      score: 2,
      label: 'Fair',
      color: 'warning',
      percent: 50,
      checklist: { hasMinLength, hasLetter, hasNumber, hasSymbol }
    };
  }
  if (score === 4) {
    return {
      score: 3,
      label: 'Good',
      color: 'primary',
      percent: 75,
      checklist: { hasMinLength, hasLetter, hasNumber, hasSymbol }
    };
  }
  return {
    score: 4,
    label: 'Strong',
    color: 'success',
    percent: 100,
    checklist: { hasMinLength, hasLetter, hasNumber, hasSymbol }
  };
};

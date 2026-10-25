import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { FormField } from './FormField';
import { PasswordInput } from './PasswordInput';
import { PasswordStrength } from './PasswordStrength';
import {
  validateName,
  validateEmail,
  validatePhone,
  validatePassword,
  validateConfirmPassword,
  calculatePasswordStrength
} from '../../utils/validators';
import { UserPlus, Loader2, AlertCircle, ShieldCheck } from 'lucide-react';

export const RegisterForm = ({ onSwitchToLogin, onRegisterSuccess }) => {
  const { registerCitizen } = useApp();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreed, setAgreed] = useState(false);

  const [touched, setTouched] = useState({});
  const [serverErrors, setServerErrors] = useState({});
  const [generalError, setGeneralError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Live Field Validations
  const nameVal = validateName(name);
  const emailVal = validateEmail(email);
  const phoneVal = validatePhone(phone);
  const passwordVal = validatePassword(password);
  const confirmVal = validateConfirmPassword(password, confirmPassword);
  const strength = calculatePasswordStrength(password);

  const isFormValid =
    nameVal.isValid &&
    emailVal.isValid &&
    phoneVal.isValid &&
    passwordVal.isValid &&
    confirmVal.isValid &&
    agreed;

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerErrors({});
    setGeneralError('');

    if (!isFormValid) {
      setTouched({
        name: true,
        email: true,
        phone: true,
        password: true,
        confirm: true,
        agreed: true
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await registerCitizen(name.trim(), email.trim(), phone.trim(), password);
      const savedEmail = res?.email || email.trim();
      onRegisterSuccess(savedEmail);
    } catch (err) {
      const errorMsg = err.message || 'Registration failed.';

      // Specific duplicate email handling
      if (
        errorMsg.toLowerCase().includes('already exists') ||
        errorMsg.toLowerCase().includes('duplicate')
      ) {
        setServerErrors((prev) => ({
          ...prev,
          email: 'An account with this email already exists. Try signing in.'
        }));
      } else {
        setGeneralError(errorMsg);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="resq-form-card">
      <div className="mb-3">
        <h4 className="fw-bold text-dark mb-1">Create Citizen Account</h4>
        <p className="text-secondary small mb-0">
          Register to report urgent emergencies and coordinate live municipal rescue response across Pune.
        </p>
      </div>

      {generalError && (
        <div
          className="alert alert-danger d-flex align-items-center gap-2 small mb-3 py-2"
          role="alert"
          aria-live="polite"
        >
          <AlertCircle size={16} className="text-danger flex-shrink-0" />
          <span>{generalError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        {/* Full Name */}
        <FormField
          id="reg-name"
          label="Full Name"
          required
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (serverErrors.name) setServerErrors((p) => ({ ...p, name: null }));
          }}
          onBlur={() => handleBlur('name')}
          error={serverErrors.name || (touched.name && !nameVal.isValid ? nameVal.error : null)}
          placeholder="Priya Sharma"
          autoComplete="name"
          autoFocus
          disabled={isSubmitting}
        />

        {/* Email Address */}
        <FormField
          id="reg-email"
          label="Email Address"
          required
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (serverErrors.email) setServerErrors((p) => ({ ...p, email: null }));
          }}
          onBlur={() => handleBlur('email')}
          error={serverErrors.email || (touched.email && !emailVal.isValid ? emailVal.error : null)}
          placeholder="name@example.com"
          autoComplete="email"
          disabled={isSubmitting}
        />

        {/* Phone Number (Optional) */}
        <FormField
          id="reg-phone"
          label="Phone Number"
          type="tel"
          value={phone}
          onChange={(e) => {
            setPhone(e.target.value);
            if (serverErrors.phone) setServerErrors((p) => ({ ...p, phone: null }));
          }}
          onBlur={() => handleBlur('phone')}
          error={serverErrors.phone || (touched.phone && !phoneVal.isValid ? phoneVal.error : null)}
          placeholder="+91 98220 12345 (Optional)"
          hint="Useful for rescue teams to reach you directly on site."
          autoComplete="tel"
          disabled={isSubmitting}
        />

        {/* Password */}
        <PasswordInput
          id="reg-password"
          label="Password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onBlur={() => handleBlur('password')}
          error={touched.password && !passwordVal.isValid ? passwordVal.error : null}
          autoComplete="new-password"
          disabled={isSubmitting}
        />

        {/* Live Password Strength Meter */}
        {password && <PasswordStrength strength={strength} />}

        {/* Confirm Password */}
        <div className="mt-3">
          <PasswordInput
            id="reg-confirm-password"
            label="Confirm Password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            onBlur={() => handleBlur('confirm')}
            error={touched.confirm && !confirmVal.isValid ? confirmVal.error : null}
            autoComplete="new-password"
            disabled={isSubmitting}
          />
        </div>

        {/* Terms & Emergency Disclaimer Agreement */}
        <div className="form-check mt-3 mb-4">
          <input
            type="checkbox"
            id="reg-agreement"
            className={`form-check-input ${touched.agreed && !agreed ? 'is-invalid' : ''}`}
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            disabled={isSubmitting}
            required
          />
          <label
            htmlFor="reg-agreement"
            className="form-check-label small text-secondary"
            style={{ cursor: 'pointer', lineHeight: '1.4' }}
          >
            I agree to use this service responsibly and understand that ResQNet does not replace calling{' '}
            <strong className="text-danger">112 / 101 / 108</strong> in an immediate life-threatening crisis.
          </label>
          {touched.agreed && !agreed && (
            <div className="resq-field-error">
              <AlertCircle size={14} className="flex-shrink-0" />
              <span>You must accept the emergency service agreement to continue.</span>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="btn-auth-submit"
          disabled={!isFormValid || isSubmitting}
          aria-label="Create citizen account"
        >
          {isSubmitting ? (
            <>
              <Loader2 size={18} className="spin-anim" />
              <span>Creating citizen account...</span>
            </>
          ) : (
            <>
              <UserPlus size={18} />
              <span>Create Account</span>
            </>
          )}
        </button>
      </form>

      {/* Switch to Login */}
      <div className="text-center mt-4 pt-2 border-top">
        <span className="small text-secondary">Already registered with ResQNet? </span>
        <button
          type="button"
          className="btn btn-link p-0 text-decoration-none small fw-bold text-danger"
          onClick={onSwitchToLogin}
        >
          Sign in
        </button>
      </div>
    </div>
  );
};

export default RegisterForm;

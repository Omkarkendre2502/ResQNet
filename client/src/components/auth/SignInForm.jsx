import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { FormField } from './FormField';
import { PasswordInput } from './PasswordInput';
import { ForgotPasswordPanel } from './ForgotPasswordPanel';
import { validateEmail } from '../../utils/validators';
import { LogIn, Loader2, AlertCircle, Info } from 'lucide-react';

const REMEMBER_EMAIL_KEY = 'resqnet_remembered_email';

export const SignInForm = ({ onSwitchToRegister, initialEmail = '', onMustChangePassword }) => {
  const { login, redirectAfterLogin } = useApp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberEmail, setRememberEmail] = useState(false);

  const [touched, setTouched] = useState({});
  const [errorBanner, setErrorBanner] = useState('');
  const [isShaking, setIsShaking] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForgotPanel, setShowForgotPanel] = useState(false);

  // Load remembered email on mount or use initialEmail from registration
  useEffect(() => {
    if (initialEmail) {
      setEmail(initialEmail);
      return;
    }
    try {
      const savedEmail = localStorage.getItem(REMEMBER_EMAIL_KEY);
      if (savedEmail) {
        setEmail(savedEmail);
        setRememberEmail(true);
      }
    } catch (e) {
      // Ignore in restricted environments
    }
  }, [initialEmail]);

  const emailValidation = validateEmail(email);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorBanner('');
    setShowForgotPanel(false);

    if (!emailValidation.isValid || !password) {
      setTouched({ email: true, password: true });
      triggerShake();
      return;
    }

    setIsSubmitting(true);
    try {
      // Remember or clear email in localStorage
      try {
        if (rememberEmail && email.trim()) {
          localStorage.setItem(REMEMBER_EMAIL_KEY, email.trim());
        } else {
          localStorage.removeItem(REMEMBER_EMAIL_KEY);
        }
      } catch (err) {}

      const res = await login(email, password);

      if (res?.mustChangePassword) {
        if (onMustChangePassword) {
          onMustChangePassword();
        }
      }
    } catch (err) {
      triggerShake();
      const msg = err.message || 'Invalid email or password.';
      // Differentiate locked or disabled accounts vs generic credentials failure
      if (msg.toLowerCase().includes('locked')) {
        setErrorBanner(msg);
      } else if (msg.toLowerCase().includes('disabled')) {
        setErrorBanner(msg);
      } else {
        setErrorBanner('Invalid email or password.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const triggerShake = () => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 450);
  };

  return (
    <div className={`resq-form-card ${isShaking ? 'resq-shake' : ''}`}>
      {/* Friendly notice when arriving from a protected page */}
      {redirectAfterLogin && (
        <div className="alert alert-info d-flex align-items-center gap-2 small mb-3 py-2" role="status">
          <Info size={16} className="text-info flex-shrink-0" />
          <span>Please sign in to access this emergency response section.</span>
        </div>
      )}

      {/* Error Banner with aria-live */}
      {errorBanner && (
        <div
          className="alert alert-danger d-flex align-items-center gap-2 small mb-3 py-2"
          role="alert"
          aria-live="polite"
        >
          <AlertCircle size={16} className="text-danger flex-shrink-0" />
          <span>{errorBanner}</span>
        </div>
      )}

      {/* Forgot Password Guidance Panel */}
      {showForgotPanel && (
        <ForgotPasswordPanel onClose={() => setShowForgotPanel(false)} />
      )}

      <form onSubmit={handleSubmit} noValidate>
        {/* Email Field */}
        <FormField
          id="signin-email"
          label="Email Address"
          required
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={() => setTouched((p) => ({ ...p, email: true }))}
          error={touched.email && !emailValidation.isValid ? emailValidation.error : null}
          placeholder="officer@example.com or citizen@example.com"
          autoComplete="email"
          autoFocus={!initialEmail}
          disabled={isSubmitting}
        />

        {/* Password Field */}
        <PasswordInput
          id="signin-password"
          label="Password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onBlur={() => setTouched((p) => ({ ...p, password: true }))}
          error={touched.password && !password ? 'Password is required.' : null}
          autoComplete="current-password"
          autoFocus={Boolean(initialEmail)}
          disabled={isSubmitting}
        />

        {/* Remember Email & Forgot Password */}
        <div className="d-flex align-items-center justify-content-between mb-4 mt-2">
          <div className="form-check">
            <input
              type="checkbox"
              id="remember-email-check"
              className="form-check-input"
              checked={rememberEmail}
              onChange={(e) => setRememberEmail(e.target.checked)}
              disabled={isSubmitting}
            />
            <label
              htmlFor="remember-email-check"
              className="form-check-label small text-secondary"
              style={{ cursor: 'pointer' }}
            >
              Remember my email
            </label>
          </div>

          <button
            type="button"
            className="btn btn-link p-0 text-decoration-none small text-danger fw-semibold"
            onClick={() => setShowForgotPanel((prev) => !prev)}
          >
            Forgot password?
          </button>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="btn-auth-submit"
          disabled={isSubmitting}
          aria-label="Sign in to ResQNet"
        >
          {isSubmitting ? (
            <>
              <Loader2 size={18} className="spin-anim" />
              <span>Verifying credentials...</span>
            </>
          ) : (
            <>
              <LogIn size={18} />
              <span>Sign In</span>
            </>
          )}
        </button>
      </form>

      {/* Switch to Register */}
      <div className="text-center mt-4 pt-2 border-top">
        <span className="small text-secondary">New to Pune Emergency Network? </span>
        <button
          type="button"
          className="btn btn-link p-0 text-decoration-none small fw-bold text-danger"
          onClick={onSwitchToRegister}
        >
          Create a citizen account
        </button>
      </div>
    </div>
  );
};

export default SignInForm;

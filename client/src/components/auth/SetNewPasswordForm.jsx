import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PasswordInput } from './PasswordInput';
import { PasswordStrength } from './PasswordStrength';
import { validatePassword, validateConfirmPassword, calculatePasswordStrength } from '../../utils/validators';
import { ShieldAlert, CheckCircle2, Lock, Loader2 } from 'lucide-react';

export const SetNewPasswordForm = ({ onPasswordChanged }) => {
  const { changePassword, currentUser } = useApp();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [touched, setTouched] = useState({});
  const [errorBanner, setErrorBanner] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const newPassValidation = validatePassword(newPassword);
  const confirmPassValidation = validateConfirmPassword(newPassword, confirmPassword);
  const strength = calculatePasswordStrength(newPassword);

  const isFormValid =
    Boolean(currentPassword) &&
    newPassValidation.isValid &&
    confirmPassValidation.isValid;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorBanner('');

    if (!isFormValid) {
      setTouched({ current: true, new: true, confirm: true });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await changePassword(currentPassword, newPassword);
      if (res && res.success) {
        if (onPasswordChanged) onPasswordChanged();
      } else {
        setErrorBanner(res.error || 'Failed to update password. Please check your current password.');
      }
    } catch (err) {
      setErrorBanner(err.message || 'Error updating password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="resq-form-card">
      <div className="text-center mb-4">
        <div className="d-inline-flex p-3 rounded-circle bg-warning-subtle text-warning mb-2">
          <Lock size={28} />
        </div>
        <h4 className="fw-bold text-dark mb-1">Set a New Password</h4>
        <p className="text-secondary small mb-0">
          Your account was flagged for a mandatory password update. Please choose a strong, secure password to continue.
        </p>
      </div>

      {errorBanner && (
        <div className="alert alert-danger d-flex align-items-center gap-2 small mb-3" role="alert">
          <ShieldAlert size={16} className="flex-shrink-0" />
          <span>{errorBanner}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <PasswordInput
          id="current-password"
          label="Current Temporary Password"
          required
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          onBlur={() => setTouched((p) => ({ ...p, current: true }))}
          error={touched.current && !currentPassword ? 'Current password is required.' : null}
          autoComplete="current-password"
          autoFocus
          disabled={isSubmitting}
        />

        <PasswordInput
          id="new-password"
          label="New Password"
          required
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          onBlur={() => setTouched((p) => ({ ...p, new: true }))}
          error={touched.new && !newPassValidation.isValid ? newPassValidation.error : null}
          autoComplete="new-password"
          disabled={isSubmitting}
        />

        {newPassword && <PasswordStrength strength={strength} />}

        <div className="mt-3">
          <PasswordInput
            id="confirm-new-password"
            label="Confirm New Password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            onBlur={() => setTouched((p) => ({ ...p, confirm: true }))}
            error={touched.confirm && !confirmPassValidation.isValid ? confirmPassValidation.error : null}
            autoComplete="new-password"
            disabled={isSubmitting}
          />
        </div>

        <button
          type="submit"
          className="btn-auth-submit mt-4"
          disabled={!isFormValid || isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 size={18} className="spin-anim" />
              <span>Updating Password...</span>
            </>
          ) : (
            <>
              <CheckCircle2 size={18} />
              <span>Update Password & Proceed</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default SetNewPasswordForm;

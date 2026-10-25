import React, { useState } from 'react';
import { Eye, EyeOff, AlertCircle, Lock } from 'lucide-react';

export const PasswordInput = ({
  id,
  label,
  required = false,
  name,
  value,
  onChange,
  onBlur,
  placeholder = '••••••••',
  autoComplete = 'current-password',
  error,
  hint,
  autoFocus = false,
  disabled = false
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [capsLockActive, setCapsLockActive] = useState(false);

  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;

  const handleKeyActivity = (e) => {
    if (e.getModifierState) {
      setCapsLockActive(e.getModifierState('CapsLock'));
    }
  };

  return (
    <div className="resq-field-group">
      <label htmlFor={id} className="resq-field-label">
        <span>
          {label}
          {required && <span className="resq-required-star" aria-hidden="true">*</span>}
        </span>
      </label>

      <div className="resq-password-wrap">
        <input
          id={id}
          name={name || id}
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          onKeyDown={handleKeyActivity}
          onKeyUp={handleKeyActivity}
          placeholder={placeholder}
          autoComplete={autoComplete}
          autoFocus={autoFocus}
          disabled={disabled}
          aria-required={required}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : hint ? hintId : undefined}
          className={`resq-input ${error ? 'is-invalid' : ''}`}
        />

        <button
          type="button"
          className="resq-eye-toggle"
          onClick={() => setShowPassword((prev) => !prev)}
          aria-label={showPassword ? `Hide ${label}` : `Show ${label} in plain text`}
          tabIndex={0}
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>

      {/* CapsLock Warning */}
      {capsLockActive && (
        <div className="resq-caps-warning" role="status" aria-live="polite">
          <Lock size={12} />
          <span>Caps Lock is ON</span>
        </div>
      )}

      {/* Error or Hint */}
      {error ? (
        <div id={errorId} className="resq-field-error" role="alert">
          <AlertCircle size={14} className="flex-shrink-0" />
          <span>{error}</span>
        </div>
      ) : hint ? (
        <div id={hintId} className="resq-field-hint">
          {hint}
        </div>
      ) : null}
    </div>
  );
};

export default PasswordInput;

import React from 'react';
import { AlertCircle } from 'lucide-react';

export const FormField = ({
  id,
  label,
  required = false,
  type = 'text',
  name,
  value,
  onChange,
  onBlur,
  placeholder,
  autoComplete,
  error,
  hint,
  autoFocus = false,
  disabled = false,
  inputRef
}) => {
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;

  return (
    <div className="resq-field-group">
      <label htmlFor={id} className="resq-field-label">
        <span>
          {label}
          {required && <span className="resq-required-star" aria-hidden="true">*</span>}
        </span>
      </label>

      <input
        ref={inputRef}
        id={id}
        name={name || id}
        type={type}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        autoComplete={autoComplete}
        autoFocus={autoFocus}
        disabled={disabled}
        aria-required={required}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : hint ? hintId : undefined}
        className={`resq-input ${error ? 'is-invalid' : ''}`}
      />

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

export default FormField;

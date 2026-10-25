import React from 'react';
import { Check, Dot } from 'lucide-react';

export const PasswordStrength = ({ strength }) => {
  if (!strength) return null;

  const { label, color, percent, checklist } = strength;

  const getColorClass = (col) => {
    switch (col) {
      case 'danger':
        return '#dc2626';
      case 'warning':
        return '#ea580c';
      case 'primary':
        return '#2563eb';
      case 'success':
        return '#16a34a';
      default:
        return '#dc2626';
    }
  };

  return (
    <div className="resq-strength-box" role="region" aria-label="Password Security Strength">
      <div className="d-flex align-items-center justify-content-between mb-1 small">
        <span className="text-secondary" style={{ fontSize: '0.75rem' }}>Password Strength:</span>
        <span
          className="fw-bold"
          style={{ color: getColorClass(color), fontSize: '0.75rem' }}
        >
          {label}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="resq-strength-bar">
        <div
          className="resq-strength-bar-fill"
          style={{
            width: `${percent}%`,
            backgroundColor: getColorClass(color)
          }}
        />
      </div>

      {/* Checklist */}
      <ul className="resq-strength-checklist">
        <li className={`resq-strength-check-item ${checklist?.hasMinLength ? 'met' : ''}`}>
          {checklist?.hasMinLength ? <Check size={13} /> : <Dot size={13} />}
          <span>8+ characters</span>
        </li>
        <li className={`resq-strength-check-item ${checklist?.hasLetter ? 'met' : ''}`}>
          {checklist?.hasLetter ? <Check size={13} /> : <Dot size={13} />}
          <span>At least one letter</span>
        </li>
        <li className={`resq-strength-check-item ${checklist?.hasNumber ? 'met' : ''}`}>
          {checklist?.hasNumber ? <Check size={13} /> : <Dot size={13} />}
          <span>At least one number</span>
        </li>
        <li className={`resq-strength-check-item ${checklist?.hasSymbol ? 'met' : ''}`}>
          {checklist?.hasSymbol ? <Check size={13} /> : <Dot size={13} />}
          <span>Symbol (recommended)</span>
        </li>
      </ul>
    </div>
  );
};

export default PasswordStrength;

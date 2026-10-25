import React from 'react';
import { ShieldCheck, PhoneCall, X, KeyRound } from 'lucide-react';

export const ForgotPasswordPanel = ({ onClose }) => {
  return (
    <div
      className="p-3 mb-4 rounded border bg-light text-dark shadow-sm position-relative"
      role="region"
      aria-label="Forgot Password Assistance"
    >
      <button
        type="button"
        className="btn btn-sm btn-link text-secondary position-absolute top-0 end-0 m-2 p-1"
        onClick={onClose}
        aria-label="Close message"
      >
        <X size={16} />
      </button>

      <div className="d-flex align-items-start gap-3">
        <div className="p-2 rounded bg-danger-subtle text-danger mt-1">
          <KeyRound size={20} />
        </div>
        <div>
          <h6 className="fw-bold mb-1">Reset Your Password</h6>
          <p className="small text-secondary mb-2" style={{ lineHeight: '1.45' }}>
            To safeguard municipal emergency security, automated email resets are disabled.
            Please contact your <strong>ResQNet Pune Control Room Administrator</strong> to reset your password.
          </p>
          <div className="d-flex flex-wrap gap-3 small text-muted">
            <span className="d-inline-flex align-items-center gap-1">
              <ShieldCheck size={14} className="text-danger" /> Admin clearance required
            </span>
            <span className="d-inline-flex align-items-center gap-1">
              <PhoneCall size={14} className="text-danger" /> Control Room: +91 (020) 2550-1111
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPanel;

import React from 'react';
import { CheckCircle2, ArrowRight } from 'lucide-react';

export const AuthSuccess = ({ email, onProceedToLogin }) => {
  return (
    <div className="resq-auth-success-card" role="status">
      <div className="resq-success-icon-wrap">
        <CheckCircle2 size={32} />
      </div>

      <h3 className="h5 fw-bold text-dark mb-2">Account Created Successfully!</h3>
      <p className="text-secondary small mb-4" style={{ lineHeight: '1.5' }}>
        Your citizen account for <strong>{email}</strong> has been registered. Please sign in with your credentials to access the Pune Emergency Response Portal.
      </p>

      <button
        type="button"
        className="btn-auth-submit"
        onClick={() => onProceedToLogin(email)}
      >
        <span>Sign In Now</span>
        <ArrowRight size={16} />
      </button>
    </div>
  );
};

export default AuthSuccess;

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  User,
  Shield,
  Key,
  LogOut,
  X,
  CheckCircle,
  AlertTriangle,
  Eye,
  EyeOff,
  Phone,
  Mail,
  Calendar,
  Lock,
  Clock,
  Ambulance
} from 'lucide-react';

export const UserProfileModal = () => {
  const {
    currentUser,
    showProfileModal,
    setShowProfileModal,
    changePassword,
    logout
  } = useApp();

  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'password' | 'logout'

  // Change Password Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  if (!showProfileModal || !currentUser) return null;

  // Password strength calculations
  const calculatePasswordStrength = (pass) => {
    if (!pass) return { score: 0, label: 'None', color: 'bg-secondary' };
    let score = 0;
    if (pass.length >= 8) score += 1;
    if (pass.length >= 12) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[a-z]/.test(pass)) score += 1;
    if (/\d/.test(pass)) score += 1;
    if (/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(pass)) score += 1;

    if (score <= 2) return { score: 25, label: 'Weak', color: 'bg-danger' };
    if (score <= 4) return { score: 65, label: 'Moderate', color: 'bg-warning' };
    return { score: 100, label: 'Strong', color: 'bg-success' };
  };

  const strength = calculatePasswordStrength(newPassword);

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (!currentPassword) {
      setPasswordError('Please enter your current password.');
      return;
    }

    if (currentUser.role === 'admin') {
      const adminRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{12,}$/;
      if (!adminRegex.test(newPassword)) {
        setPasswordError(
          'Administrator passwords must be at least 12 characters and include uppercase, lowercase, number, and symbol.'
        );
        return;
      }
    } else {
      if (newPassword.length < 8) {
        setPasswordError('New password must be at least 8 characters long.');
        return;
      }
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    const result = await changePassword(currentPassword, newPassword);
    setIsSubmitting(false);

    if (result.success) {
      setPasswordSuccess('Password has been changed successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      setPasswordError(result.error || 'Failed to update password.');
    }
  };

  const handleClose = () => {
    setShowProfileModal(false);
    setPasswordError('');
    setPasswordSuccess('');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <div
      className="modal fade show d-block"
      tabIndex="-1"
      style={{ backgroundColor: 'rgba(15, 23, 42, 0.7)', zIndex: 1060 }}
    >
      <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '520px' }}>
        <div className="modal-content shadow border-0 overflow-hidden">
          {/* Header */}
          <div className="modal-header bg-dark text-white border-0 py-3 px-4">
            <div className="d-flex align-items-center gap-2">
              <div
                className="d-flex align-items-center justify-content-center bg-danger rounded-circle text-white"
                style={{ width: '36px', height: '36px' }}
              >
                <User size={18} />
              </div>
              <div>
                <h6 className="modal-title fw-bold text-white mb-0">My Account Profile</h6>
                <small className="text-white-50" style={{ fontSize: '0.75rem' }}>
                  ResQNet Pune Emergency System
                </small>
              </div>
            </div>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={handleClose}
              aria-label="Close"
            />
          </div>

          {/* Navigation Pills */}
          <div className="bg-light border-bottom px-4 pt-2">
            <ul className="nav nav-pills gap-2 small fw-semibold">
              <li className="nav-item">
                <button
                  className={`nav-link py-1 px-3 ${activeTab === 'profile' ? 'active bg-danger text-white' : 'text-dark'}`}
                  onClick={() => setActiveTab('profile')}
                >
                  <User size={14} className="d-inline me-1" /> Profile Info
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link py-1 px-3 ${activeTab === 'password' ? 'active bg-danger text-white' : 'text-dark'}`}
                  onClick={() => setActiveTab('password')}
                >
                  <Key size={14} className="d-inline me-1" /> Change Password
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link py-1 px-3 ${activeTab === 'logout' ? 'active bg-danger text-white' : 'text-danger'}`}
                  onClick={() => setActiveTab('logout')}
                >
                  <LogOut size={14} className="d-inline me-1" /> Sign Out
                </button>
              </li>
            </ul>
          </div>

          {/* Modal Body */}
          <div className="modal-body p-4">
            {/* TAB 1: Profile Info */}
            {activeTab === 'profile' && (
              <div>
                <div className="text-center pb-3 border-bottom mb-3">
                  <div
                    className="mx-auto d-flex align-items-center justify-content-center rounded-circle bg-danger-subtle text-danger mb-2"
                    style={{ width: '64px', height: '64px' }}
                  >
                    <User size={32} />
                  </div>
                  <h5 className="fw-bold text-dark mb-1">{currentUser.name}</h5>
                  <div className="d-flex align-items-center justify-content-center gap-2">
                    <span className="badge bg-danger text-uppercase">
                      {currentUser.role}
                    </span>
                    <span className="badge bg-success-subtle text-success border border-success-subtle">
                      Active Account
                    </span>
                  </div>
                </div>

                <div className="list-group list-group-flush small">
                  <div className="list-group-item d-flex align-items-center justify-content-between px-0 py-2">
                    <span className="text-muted d-flex align-items-center gap-2">
                      <Mail size={15} /> Email Address
                    </span>
                    <span className="fw-semibold text-dark">{currentUser.email}</span>
                  </div>

                  <div className="list-group-item d-flex align-items-center justify-content-between px-0 py-2">
                    <span className="text-muted d-flex align-items-center gap-2">
                      <Phone size={15} /> Phone Contact
                    </span>
                    <span className="fw-semibold text-dark">
                      {currentUser.phone || 'Not registered'}
                    </span>
                  </div>

                  {currentUser.teamId && (
                    <div className="list-group-item d-flex align-items-center justify-content-between px-0 py-2">
                      <span className="text-muted d-flex align-items-center gap-2">
                        <Ambulance size={15} /> Assigned Rescue Unit
                      </span>
                      <span className="fw-bold text-primary">{currentUser.teamId}</span>
                    </div>
                  )}

                  <div className="list-group-item d-flex align-items-center justify-content-between px-0 py-2">
                    <span className="text-muted d-flex align-items-center gap-2">
                      <Clock size={15} /> Last Sign In
                    </span>
                    <span className="text-secondary">
                      {currentUser.lastLogin
                        ? new Date(currentUser.lastLogin).toLocaleString()
                        : 'Current session active'}
                    </span>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-light rounded border text-muted small">
                  <div className="fw-semibold text-dark mb-1">
                    <Shield size={14} className="text-danger d-inline me-1" />
                    Security Clearance
                  </div>
                  Your account is secured with bcrypt password encryption and JWT session tokens.
                  To update your access credentials, select <strong>Change Password</strong>.
                </div>
              </div>
            )}

            {/* TAB 2: Change Password */}
            {activeTab === 'password' && (
              <form onSubmit={handlePasswordSubmit}>
                {passwordError && (
                  <div className="alert alert-danger py-2 px-3 small d-flex align-items-center gap-2 mb-3">
                    <AlertTriangle size={16} className="flex-shrink-0" />
                    <span>{passwordError}</span>
                  </div>
                )}

                {passwordSuccess && (
                  <div className="alert alert-success py-2 px-3 small d-flex align-items-center gap-2 mb-3">
                    <CheckCircle size={16} className="flex-shrink-0" />
                    <span>{passwordSuccess}</span>
                  </div>
                )}

                <div className="mb-3">
                  <label className="form-label small fw-semibold text-dark mb-1">
                    Current Password:
                  </label>
                  <div className="input-group input-group-sm">
                    <span className="input-group-text bg-light">
                      <Lock size={14} className="text-muted" />
                    </span>
                    <input
                      type={showCurrentPass ? 'text' : 'password'}
                      className="form-control"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter current password"
                      required
                    />
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => setShowCurrentPass(!showCurrentPass)}
                    >
                      {showCurrentPass ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-semibold text-dark mb-1">
                    New Password:
                  </label>
                  <div className="input-group input-group-sm">
                    <span className="input-group-text bg-light">
                      <Key size={14} className="text-muted" />
                    </span>
                    <input
                      type={showNewPass ? 'text' : 'password'}
                      className="form-control"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter strong new password"
                      required
                    />
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => setShowNewPass(!showNewPass)}
                    >
                      {showNewPass ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>

                  {/* Password Strength Indicator */}
                  {newPassword && (
                    <div className="mt-2">
                      <div className="d-flex justify-content-between small text-muted mb-1" style={{ fontSize: '0.72rem' }}>
                        <span>Strength: <strong>{strength.label}</strong></span>
                        <span>{currentUser.role === 'admin' ? 'Min 12 chars + symbol' : 'Min 8 chars'}</span>
                      </div>
                      <div className="progress" style={{ height: '5px' }}>
                        <div
                          className={`progress-bar ${strength.color}`}
                          role="progressbar"
                          style={{ width: `${strength.score}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-semibold text-dark mb-1">
                    Confirm New Password:
                  </label>
                  <input
                    type="password"
                    className="form-control form-control-sm"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    required
                  />
                </div>

                <div className="d-grid mt-4">
                  <button
                    type="submit"
                    className="btn btn-resq-danger btn-sm py-2 fw-semibold"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Updating Password...' : 'Update Password'}
                  </button>
                </div>
              </form>
            )}

            {/* TAB 3: Sign Out Confirmation */}
            {activeTab === 'logout' && (
              <div className="text-center py-3">
                <div
                  className="mx-auto d-flex align-items-center justify-content-center rounded-circle bg-danger-subtle text-danger mb-3"
                  style={{ width: '56px', height: '56px' }}
                >
                  <LogOut size={28} />
                </div>
                <h5 className="fw-bold text-dark mb-2">Confirm Sign Out</h5>
                <p className="text-secondary small mb-4">
                  Are you sure you want to log out of ResQNet? Your active session token will be cleared
                  from this device.
                </p>
                <div className="d-flex justify-content-center gap-2">
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm px-4"
                    onClick={() => setActiveTab('profile')}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger btn-sm px-4 fw-semibold"
                    onClick={() => {
                      setShowProfileModal(false);
                      logout();
                    }}
                  >
                    Yes, Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

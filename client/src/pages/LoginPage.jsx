import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  ShieldCheck,
  Mail,
  Lock,
  User,
  Phone,
  AlertCircle,
  LogIn,
  UserPlus,
  Eye,
  EyeOff,
  CheckCircle
} from 'lucide-react';

const calculateStrength = (pass) => {
  if (!pass) return { score: 0, label: '', color: 'secondary', percent: 0 };
  let score = 0;
  if (pass.length >= 8) score++;
  if (pass.length >= 12) score++;
  if (/[a-z]/.test(pass) && /[A-Z]/.test(pass)) score++;
  if (/\d/.test(pass)) score++;
  if (/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(pass)) score++;

  if (score <= 1) return { score: 1, label: 'Weak', color: 'danger', percent: 25 };
  if (score === 2) return { score: 2, label: 'Fair', color: 'warning', percent: 50 };
  if (score === 3 || score === 4) return { score: 3, label: 'Good', color: 'primary', percent: 75 };
  return { score: 5, label: 'Strong', color: 'success', percent: 100 };
};

export const LoginPage = () => {
  const { login, registerCitizen } = useApp();

  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'register'

  // Login Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [regSuccessMessage, setRegSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Register Form State
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regError, setRegError] = useState('');
  const [isRegSubmitting, setIsRegSubmitting] = useState(false);

  const regStrength = calculateStrength(regPassword);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');
    setRegSuccessMessage('');

    if (!email || !password) {
      setLoginError('Please enter both email and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      await login(email, password);
    } catch (err) {
      setLoginError(err.message || 'Login failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setRegError('');
    setRegSuccessMessage('');

    if (!regName.trim() || !regEmail.trim() || !regPassword) {
      setRegError('Please provide your name, email, and password.');
      return;
    }

    if (regPassword.length < 8) {
      setRegError('Password must be at least 8 characters long.');
      return;
    }

    setIsRegSubmitting(true);
    try {
      const res = await registerCitizen(regName, regEmail, regPhone, regPassword);
      const savedEmail = res.email || regEmail;
      // Clear registration inputs
      setRegName('');
      setRegEmail('');
      setRegPhone('');
      setRegPassword('');
      // Set success notification and switch tab to login
      setRegSuccessMessage('Account created successfully! Please sign in with your credentials.');
      setEmail(savedEmail);
      setPassword('');
      setActiveTab('login');
    } catch (err) {
      setRegError(err.message || 'Registration failed.');
    } finally {
      setIsRegSubmitting(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-md-8 col-lg-6 col-xl-5">
          {/* Header */}
          <div className="text-center mb-4">
            <div
              className="d-inline-flex align-items-center justify-content-center mb-2"
              style={{
                width: '50px',
                height: '50px',
                borderRadius: '10px',
                backgroundColor: '#dc2626',
                color: '#fff'
              }}
            >
              <ShieldCheck size={28} />
            </div>
            <h3 className="fw-bold text-dark mb-1">ResQNet Portal Access</h3>
            <p className="text-secondary small">
              Pune Smart Emergency Response & Disaster Management System
            </p>
          </div>

          <div className="resq-card shadow-sm border">
            {/* Tabs */}
            <div className="d-flex border-bottom bg-light">
              <button
                type="button"
                className={`flex-fill py-3 border-0 bg-transparent fw-semibold text-center small d-flex align-items-center justify-content-center gap-1 ${
                  activeTab === 'login'
                    ? 'text-danger border-bottom border-2 border-danger bg-white'
                    : 'text-secondary'
                }`}
                onClick={() => {
                  setActiveTab('login');
                  setRegError('');
                }}
              >
                <LogIn size={15} /> Sign In
              </button>
              <button
                type="button"
                className={`flex-fill py-3 border-0 bg-transparent fw-semibold text-center small d-flex align-items-center justify-content-center gap-1 ${
                  activeTab === 'register'
                    ? 'text-danger border-bottom border-2 border-danger bg-white'
                    : 'text-secondary'
                }`}
                onClick={() => {
                  setActiveTab('register');
                  setLoginError('');
                  setRegSuccessMessage('');
                }}
              >
                <UserPlus size={15} /> Register Citizen
              </button>
            </div>

            <div className="resq-card-body p-4">
              {activeTab === 'login' ? (
                /* LOGIN FORM */
                <form onSubmit={handleLoginSubmit}>
                  {regSuccessMessage && (
                    <div className="alert alert-success py-2 small mb-3 d-flex align-items-center gap-2">
                      <CheckCircle size={16} />
                      <span>{regSuccessMessage}</span>
                    </div>
                  )}

                  {loginError && (
                    <div className="alert alert-danger py-2 small mb-3 d-flex align-items-center gap-2">
                      <AlertCircle size={16} />
                      <span>{loginError}</span>
                    </div>
                  )}

                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-dark">
                      Email Address
                    </label>
                    <div className="input-group">
                      <span className="input-group-text bg-light text-muted border-end-0">
                        <Mail size={16} />
                      </span>
                      <input
                        type="email"
                        className="form-control border-start-0"
                        placeholder="name@resqnet.org"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        autoComplete="email"
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="form-label small fw-semibold text-dark">
                      Password
                    </label>
                    <div className="input-group">
                      <span className="input-group-text bg-light text-muted border-end-0">
                        <Lock size={16} />
                      </span>
                      <input
                        type={showLoginPassword ? 'text' : 'password'}
                        className="form-control border-start-0 border-end-0"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        autoComplete="current-password"
                      />
                      <button
                        type="button"
                        className="btn btn-outline-secondary border-start-0 bg-light"
                        onClick={() => setShowLoginPassword((prev) => !prev)}
                        tabIndex="-1"
                        aria-label="Toggle password visibility"
                      >
                        {showLoginPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-resq-danger w-100 py-2 mb-3 fw-semibold d-flex align-items-center justify-content-center gap-2"
                    disabled={isSubmitting}
                  >
                    <LogIn size={16} />
                    <span>{isSubmitting ? 'Signing In...' : 'Sign In'}</span>
                  </button>

                  <div className="text-center">
                    <button
                      type="button"
                      className="btn btn-link btn-sm text-secondary text-decoration-none p-0"
                      onClick={() => {
                        setActiveTab('register');
                        setLoginError('');
                      }}
                    >
                      New citizen? <strong>Create an Account</strong>
                    </button>
                  </div>
                </form>
              ) : (
                /* CITIZEN REGISTRATION FORM */
                <form onSubmit={handleRegisterSubmit}>
                  {regError && (
                    <div className="alert alert-danger py-2 small mb-3 d-flex align-items-center gap-2">
                      <AlertCircle size={16} />
                      <span>{regError}</span>
                    </div>
                  )}

                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-dark">
                      Full Name
                    </label>
                    <div className="input-group">
                      <span className="input-group-text bg-light text-muted border-end-0">
                        <User size={16} />
                      </span>
                      <input
                        type="text"
                        className="form-control border-start-0"
                        placeholder="e.g. Priya Sharma"
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-dark">
                      Email Address
                    </label>
                    <div className="input-group">
                      <span className="input-group-text bg-light text-muted border-end-0">
                        <Mail size={16} />
                      </span>
                      <input
                        type="email"
                        className="form-control border-start-0"
                        placeholder="e.g. priya.sharma@example.com"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        required
                        autoComplete="email"
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-dark">
                      Phone Number (Pune/India)
                    </label>
                    <div className="input-group">
                      <span className="input-group-text bg-light text-muted border-end-0">
                        <Phone size={16} />
                      </span>
                      <input
                        type="tel"
                        className="form-control border-start-0"
                        placeholder="+91 98220 12345"
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <label className="form-label small fw-semibold text-dark mb-0">
                        Password
                      </label>
                      {regPassword && (
                        <span className={`small fw-semibold text-${regStrength.color}`}>
                          {regStrength.label}
                        </span>
                      )}
                    </div>
                    <div className="input-group">
                      <span className="input-group-text bg-light text-muted border-end-0">
                        <Lock size={16} />
                      </span>
                      <input
                        type={showRegPassword ? 'text' : 'password'}
                        className="form-control border-start-0 border-end-0"
                        placeholder="Create secure password (min 8 chars)"
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        required
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        className="btn btn-outline-secondary border-start-0 bg-light"
                        onClick={() => setShowRegPassword((prev) => !prev)}
                        tabIndex="-1"
                        aria-label="Toggle password visibility"
                      >
                        {showRegPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>

                    {/* Live Password Strength Meter */}
                    {regPassword && (
                      <div className="mt-2">
                        <div className="progress" style={{ height: '4px' }}>
                          <div
                            className={`progress-bar bg-${regStrength.color}`}
                            role="progressbar"
                            style={{ width: `${regStrength.percent}%` }}
                            aria-valuenow={regStrength.percent}
                            aria-valuemin="0"
                            aria-valuemax="100"
                          ></div>
                        </div>
                        <small className="text-muted d-block mt-1" style={{ fontSize: '0.72rem' }}>
                          Tip: Use 8+ characters combining uppercase, lowercase, numbers & symbols.
                        </small>
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="btn btn-resq-danger w-100 py-2 mb-3 fw-semibold d-flex align-items-center justify-content-center gap-2"
                    disabled={isRegSubmitting}
                  >
                    <UserPlus size={16} />
                    <span>{isRegSubmitting ? 'Registering...' : 'Register Citizen Account'}</span>
                  </button>

                  <div className="text-center">
                    <button
                      type="button"
                      className="btn btn-link btn-sm text-secondary text-decoration-none p-0"
                      onClick={() => {
                        setActiveTab('login');
                        setRegError('');
                      }}
                    >
                      Already have an account? <strong>Sign In instead</strong>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

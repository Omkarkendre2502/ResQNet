import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  ShieldCheck,
  Users,
  Ambulance,
  Mail,
  Lock,
  User,
  Phone,
  AlertCircle,
  SlidersHorizontal,
  LogIn,
  UserPlus
} from 'lucide-react';

export const LoginPage = () => {
  const { login, registerCitizen, switchRole } = useApp();

  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'register'

  // Login Form State
  const [email, setEmail] = useState('citizen@resqnet.org');
  const [password, setPassword] = useState('password123');
  const [role, setRole] = useState('citizen');
  const [loginError, setLoginError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Register Form State
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regError, setRegError] = useState('');

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');

    if (!email || !password) {
      setLoginError('Please enter both email and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      await login(email, password, role);
    } catch (err) {
      setLoginError(err.message || 'Login failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setRegError('');

    if (!regName.trim() || !regEmail.trim() || !regPassword) {
      setRegError('Please provide your name, email, and password.');
      return;
    }

    try {
      await registerCitizen(regName, regEmail, regPhone, regPassword);
    } catch (err) {
      setRegError(err.message || 'Registration failed.');
    }
  };

  const handleRoleSelection = (selectedRole) => {
    setRole(selectedRole);
    if (selectedRole === 'admin') {
      setEmail('admin@resqnet.org');
      setPassword('adminpassword');
    } else if (selectedRole === 'rescue') {
      setEmail('rescue@resqnet.org');
      setPassword('rescuepassword');
    } else {
      setEmail('citizen@resqnet.org');
      setPassword('password123');
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
                onClick={() => setActiveTab('login')}
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
                onClick={() => setActiveTab('register')}
              >
                <UserPlus size={15} /> Register Citizen
              </button>
            </div>

            <div className="resq-card-body p-4">
              {activeTab === 'login' ? (
                /* LOGIN FORM */
                <form onSubmit={handleLoginSubmit}>
                  {loginError && (
                    <div className="alert alert-danger py-2 small mb-3 d-flex align-items-center gap-2">
                      <AlertCircle size={16} />
                      <span>{loginError}</span>
                    </div>
                  )}

                  {/* Role Selection */}
                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-dark">
                      Select Access Role
                    </label>
                    <div className="btn-group w-100" role="group">
                      <button
                        type="button"
                        className={`btn btn-sm ${
                          role === 'citizen'
                            ? 'btn-danger fw-bold'
                            : 'btn-outline-secondary'
                        }`}
                        onClick={() => handleRoleSelection('citizen')}
                      >
                        Citizen
                      </button>
                      <button
                        type="button"
                        className={`btn btn-sm ${
                          role === 'admin'
                            ? 'btn-danger fw-bold'
                            : 'btn-outline-secondary'
                        }`}
                        onClick={() => handleRoleSelection('admin')}
                      >
                        Admin (Rahul Patil)
                      </button>
                      <button
                        type="button"
                        className={`btn btn-sm ${
                          role === 'rescue'
                            ? 'btn-danger fw-bold'
                            : 'btn-outline-secondary'
                        }`}
                        onClick={() => handleRoleSelection('rescue')}
                      >
                        Rescue Squad
                      </button>
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
                        placeholder="name@resqnet.org"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
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
                        type="password"
                        className="form-control border-start-0"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-resq-danger w-100 py-2 mb-3 fw-semibold d-flex align-items-center justify-content-center gap-2"
                    disabled={isSubmitting}
                  >
                    <LogIn size={16} />
                    <span>Sign In to {role.toUpperCase()}</span>
                  </button>

                  <div className="text-center">
                    <button
                      type="button"
                      className="btn btn-link btn-sm text-secondary text-decoration-none p-0"
                      onClick={() => setActiveTab('register')}
                    >
                      New user? <strong>Register Citizen Account</strong>
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

                  <div className="mb-4">
                    <label className="form-label small fw-semibold text-dark">
                      Password
                    </label>
                    <div className="input-group">
                      <span className="input-group-text bg-light text-muted border-end-0">
                        <Lock size={16} />
                      </span>
                      <input
                        type="password"
                        className="form-control border-start-0"
                        placeholder="Create secure password"
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-resq-danger w-100 py-2 mb-3 fw-semibold d-flex align-items-center justify-content-center gap-2"
                  >
                    <UserPlus size={16} />
                    <span>Register Citizen</span>
                  </button>

                  <div className="text-center">
                    <button
                      type="button"
                      className="btn btn-link btn-sm text-secondary text-decoration-none p-0"
                      onClick={() => setActiveTab('login')}
                    >
                      Already have an account? <strong>Sign In instead</strong>
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Quick 1-Click Role Switcher */}
            <div className="bg-light p-3 border-top text-center">
              <div className="small text-muted fw-semibold mb-2 d-flex align-items-center justify-content-center gap-1">
                <SlidersHorizontal size={14} /> 1-CLICK DEMO LOGIN (PUNE)
              </div>
              <div className="d-flex flex-wrap gap-2 justify-content-center">
                <button
                  type="button"
                  className="btn btn-sm btn-outline-dark"
                  onClick={() => switchRole('citizen')}
                >
                  Priya Sharma (Citizen)
                </button>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-primary"
                  onClick={() => switchRole('admin')}
                >
                  Rahul Patil (Admin)
                </button>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-danger"
                  onClick={() => switchRole('rescue')}
                >
                  PERT-01 (Rescue)
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

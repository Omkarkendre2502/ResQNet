import React from 'react';
import { useApp } from '../context/AppContext';
import {
  LayoutDashboard,
  Siren,
  MapPin,
  Users,
  ShieldCheck,
  Ambulance,
  LogOut,
  X,
  User
} from 'lucide-react';

export const Sidebar = ({ mobileOpen, setMobileOpen }) => {
  const {
    activePage,
    navigateTo,
    currentUser,
    logout,
    setRedirectAfterLogin,
    showToast,
    setShowProfileModal
  } = useApp();

  const handleNav = (page) => {
    if (!currentUser && page !== 'home' && page !== 'login') {
      setRedirectAfterLogin(page);
      navigateTo('login');
      showToast('Please sign in to access this section.', 'warning');
    } else {
      navigateTo(page);
    }
    if (setMobileOpen) setMobileOpen(false);
  };

  const currentRole = currentUser ? currentUser.role : 'guest';

  return (
    <>
      {mobileOpen && (
        <div
          className="sidebar-backdrop"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <aside className={`resq-sidebar ${mobileOpen ? 'show-mobile' : ''}`}>
        {/* Brand */}
        <div className="sidebar-brand">
          <div className="brand-icon-box">
            <ShieldCheck size={24} />
          </div>
          <div className="brand-text">
            <h4>ResQNet</h4>
            <small>Pune Disaster Management</small>
          </div>
          {setMobileOpen && (
            <button
              className="btn btn-sm btn-link text-white-50 ms-auto d-lg-none p-0"
              onClick={() => setMobileOpen(false)}
              aria-label="Close Sidebar"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {(!currentUser || currentRole === 'citizen' || currentRole === 'admin') && (
            <button
              className={`sidebar-link emergency-action-btn ${
                activePage === 'report-emergency' ? 'active' : ''
              }`}
              onClick={() => handleNav('report-emergency')}
            >
              <Siren size={18} />
              <span>Report Emergency</span>
            </button>
          )}

          <div className="nav-section-title">Navigation</div>
          <button
            className={`sidebar-link ${activePage === 'home' ? 'active' : ''}`}
            onClick={() => handleNav('home')}
          >
            <LayoutDashboard size={18} />
            <span>Home</span>
          </button>

          {currentUser && (
            <button
              className={`sidebar-link ${activePage === 'map' ? 'active' : ''}`}
              onClick={() => handleNav('map')}
            >
              <MapPin size={18} />
              <span>Pune Incident Map</span>
            </button>
          )}

          {currentUser && <div className="nav-section-title">Dashboards</div>}

          {currentUser && (currentRole === 'citizen' || currentRole === 'admin') && (
            <button
              className={`sidebar-link ${
                activePage === 'citizen-dashboard' ? 'active' : ''
              }`}
              onClick={() => handleNav('citizen-dashboard')}
            >
              <Users size={18} />
              <span>Citizen Dashboard</span>
            </button>
          )}

          {currentUser && currentRole === 'admin' && (
            <button
              className={`sidebar-link ${
                activePage === 'admin-dashboard' ? 'active' : ''
              }`}
              onClick={() => handleNav('admin-dashboard')}
            >
              <ShieldCheck size={18} />
              <span>Admin Dashboard</span>
            </button>
          )}

          {currentUser && (currentRole === 'rescue' || currentRole === 'admin') && (
            <button
              className={`sidebar-link ${
                activePage === 'rescue-dashboard' ? 'active' : ''
              }`}
              onClick={() => handleNav('rescue-dashboard')}
            >
              <Ambulance size={18} />
              <span>Rescue Team Dashboard</span>
            </button>
          )}

          <div className="mt-auto"></div>
        </nav>

        {/* Footer User Info */}
        <div className="sidebar-footer">
          {currentUser ? (
            <div className="d-flex align-items-center justify-content-between">
              <button
                type="button"
                className="btn btn-link text-start text-decoration-none p-0 overflow-hidden flex-grow-1 me-2"
                style={{ lineHeight: '1.2' }}
                onClick={() => {
                  if (setMobileOpen) setMobileOpen(false);
                  setShowProfileModal(true);
                }}
                title="View My Profile & Security Settings"
              >
                <div className="text-white text-truncate fw-semibold small d-flex align-items-center gap-1">
                  <User size={13} className="text-danger flex-shrink-0" />
                  <span className="text-truncate">{currentUser.name}</span>
                </div>
                <span className="badge bg-secondary text-uppercase mt-1" style={{ fontSize: '0.65rem' }}>
                  {currentUser.role}
                </span>
              </button>
              <button
                className="btn btn-sm btn-link text-white-50 p-1"
                title="Log Out"
                onClick={logout}
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <button
              className="btn btn-sm btn-outline-light w-100"
              onClick={() => handleNav('login')}
            >
              Sign In
            </button>
          )}
        </div>
      </aside>
    </>
  );
};

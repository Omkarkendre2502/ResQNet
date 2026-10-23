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
  SlidersHorizontal
} from 'lucide-react';

export const Sidebar = ({ mobileOpen, setMobileOpen }) => {
  const { activePage, navigateTo, currentUser, switchRole, logout } = useApp();

  const handleNav = (page) => {
    navigateTo(page);
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
          <button
            className={`sidebar-link emergency-action-btn ${
              activePage === 'report-emergency' ? 'active' : ''
            }`}
            onClick={() => handleNav('report-emergency')}
          >
            <Siren size={18} />
            <span>Report Emergency</span>
          </button>

          <div className="nav-section-title">Navigation</div>
          <button
            className={`sidebar-link ${activePage === 'home' ? 'active' : ''}`}
            onClick={() => handleNav('home')}
          >
            <LayoutDashboard size={18} />
            <span>Home</span>
          </button>

          <button
            className={`sidebar-link ${activePage === 'map' ? 'active' : ''}`}
            onClick={() => handleNav('map')}
          >
            <MapPin size={18} />
            <span>Pune Incident Map</span>
          </button>

          <div className="nav-section-title">Dashboards</div>
          <button
            className={`sidebar-link ${
              activePage === 'citizen-dashboard' ? 'active' : ''
            }`}
            onClick={() => handleNav('citizen-dashboard')}
          >
            <Users size={18} />
            <span>Citizen Dashboard</span>
          </button>

          <button
            className={`sidebar-link ${
              activePage === 'admin-dashboard' ? 'active' : ''
            }`}
            onClick={() => handleNav('admin-dashboard')}
          >
            <ShieldCheck size={18} />
            <span>Admin Dashboard</span>
          </button>

          <button
            className={`sidebar-link ${
              activePage === 'rescue-dashboard' ? 'active' : ''
            }`}
            onClick={() => handleNav('rescue-dashboard')}
          >
            <Ambulance size={18} />
            <span>Rescue Team Dashboard</span>
          </button>

          <div className="mt-auto"></div>

          {/* Quick Demo Role Switcher for Pune Testing */}
          <div className="p-2 mb-2 rounded bg-white bg-opacity-10 border border-white border-opacity-10">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-secondary small fw-semibold d-flex align-items-center gap-1" style={{ fontSize: '0.68rem' }}>
                <SlidersHorizontal size={12} /> TEST ROLE
              </span>
              <span className="badge bg-danger text-uppercase" style={{ fontSize: '0.6rem' }}>
                Pune Demo
              </span>
            </div>
            <div className="btn-group btn-group-sm w-100" role="group">
              <button
                type="button"
                className={`btn btn-sm ${
                  currentRole === 'citizen' ? 'btn-danger fw-bold' : 'btn-outline-light text-white-50'
                }`}
                style={{ fontSize: '0.72rem', padding: '0.2rem 0.4rem' }}
                onClick={() => switchRole('citizen')}
                title="Priya Sharma (Citizen)"
              >
                Citizen
              </button>
              <button
                type="button"
                className={`btn btn-sm ${
                  currentRole === 'admin' ? 'btn-danger fw-bold' : 'btn-outline-light text-white-50'
                }`}
                style={{ fontSize: '0.72rem', padding: '0.2rem 0.4rem' }}
                onClick={() => switchRole('admin')}
                title="Rahul Patil (Admin)"
              >
                Admin
              </button>
              <button
                type="button"
                className={`btn btn-sm ${
                  currentRole === 'rescue' ? 'btn-danger fw-bold' : 'btn-outline-light text-white-50'
                }`}
                style={{ fontSize: '0.72rem', padding: '0.2rem 0.4rem' }}
                onClick={() => switchRole('rescue')}
                title="Pune Emergency Response Team 01"
              >
                Rescue
              </button>
            </div>
          </div>
        </nav>

        {/* Footer User Info */}
        <div className="sidebar-footer">
          {currentUser ? (
            <div className="d-flex align-items-center justify-content-between">
              <div className="overflow-hidden" style={{ lineHeight: '1.2' }}>
                <div className="text-white text-truncate fw-semibold small">
                  {currentUser.name}
                </div>
                <span className="badge bg-secondary text-uppercase" style={{ fontSize: '0.65rem' }}>
                  {currentUser.role}
                </span>
              </div>
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

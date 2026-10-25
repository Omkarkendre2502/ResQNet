import React, { useState } from 'react';
import { useApp } from './context/AppContext';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { Toast } from './components/Toast';
import { IncidentDetailModal } from './components/IncidentDetailModal';
import { AssignTeamModal } from './components/AssignTeamModal';
import { UserProfileModal } from './components/UserProfileModal';

// Pages
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { CitizenDashboard } from './pages/CitizenDashboard';
import { ReportEmergencyPage } from './pages/ReportEmergencyPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { RescueTeamDashboard } from './pages/RescueTeamDashboard';
import { MapPage } from './pages/MapPage';

import { ShieldAlert } from 'lucide-react';

export function AppContent() {
  const { activePage, currentUser, navigateTo, setRedirectAfterLogin } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [assignTargetIncident, setAssignTargetIncident] = useState(null);

  const renderActivePage = () => {
    // 1. Public Pages
    if (activePage === 'home') return <HomePage />;
    if (activePage === 'login') return <LoginPage />;

    // 2. Authentication Guard for Protected Pages
    if (!currentUser) {
      return (
        <div className="container py-5 text-center">
          <div className="resq-card p-5 mx-auto shadow-sm border" style={{ maxWidth: '500px' }}>
            <div className="d-inline-flex p-3 rounded-circle bg-danger-subtle text-danger mb-3">
              <ShieldAlert size={48} />
            </div>
            <h4 className="fw-bold text-dark mb-2">Authentication Required</h4>
            <p className="text-secondary small mb-4">
              Please sign in to your ResQNet account to access this emergency response portal.
            </p>
            <button
              className="btn btn-resq-danger w-100 py-2 fw-semibold"
              onClick={() => {
                setRedirectAfterLogin(activePage);
                navigateTo('login');
              }}
            >
              Sign In to Continue
            </button>
          </div>
        </div>
      );
    }

    // 3. Role Authorization Guards
    if (activePage === 'admin-dashboard') {
      if (currentUser.role !== 'admin') {
        return (
          <div className="container py-5 text-center">
            <div className="resq-card p-5 mx-auto shadow-sm border" style={{ maxWidth: '500px' }}>
              <div className="d-inline-flex p-3 rounded-circle bg-danger-subtle text-danger mb-3">
                <ShieldAlert size={48} />
              </div>
              <h4 className="fw-bold text-dark mb-2">Access Denied</h4>
              <p className="text-secondary small mb-4">
                Administrator clearance is required for the Pune Disaster Control Center dashboard.
                Your current account role is <strong>{currentUser.role}</strong>.
              </p>
              <button
                className="btn btn-resq-danger w-100 py-2 fw-semibold"
                onClick={() =>
                  navigateTo(currentUser.role === 'rescue' ? 'rescue-dashboard' : 'citizen-dashboard')
                }
              >
                Return to My Dashboard
              </button>
            </div>
          </div>
        );
      }
      return (
        <AdminDashboard
          onOpenAssignModal={(inc) => setAssignTargetIncident(inc)}
        />
      );
    }

    if (activePage === 'rescue-dashboard') {
      if (currentUser.role !== 'rescue' && currentUser.role !== 'admin') {
        return (
          <div className="container py-5 text-center">
            <div className="resq-card p-5 mx-auto shadow-sm border" style={{ maxWidth: '500px' }}>
              <div className="d-inline-flex p-3 rounded-circle bg-danger-subtle text-danger mb-3">
                <ShieldAlert size={48} />
              </div>
              <h4 className="fw-bold text-dark mb-2">Access Denied</h4>
              <p className="text-secondary small mb-4">
                This dashboard is restricted to authorized Pune Emergency Response Squad teams.
              </p>
              <button
                className="btn btn-resq-danger w-100 py-2 fw-semibold"
                onClick={() => navigateTo('citizen-dashboard')}
              >
                Return to Citizen Dashboard
              </button>
            </div>
          </div>
        );
      }
      return <RescueTeamDashboard />;
    }

    if (activePage === 'citizen-dashboard') {
      return <CitizenDashboard />;
    }

    if (activePage === 'report-emergency') {
      return <ReportEmergencyPage />;
    }

    if (activePage === 'map') {
      return <MapPage />;
    }

    return <HomePage />;
  };

  // Full-width edge-to-edge layout for public Home landing page and Login/Register portal
  if (activePage === 'home' || activePage === 'login') {
    return (
      <div className={activePage === 'home' ? 'resq-home-page-container' : 'resq-auth-page-container'}>
        {renderActivePage()}

        {/* Modals & Overlays */}
        <IncidentDetailModal
          onOpenAssignModal={(inc) => setAssignTargetIncident(inc)}
        />

        {assignTargetIncident && (
          <AssignTeamModal
            incident={assignTargetIncident}
            onClose={() => setAssignTargetIncident(null)}
          />
        )}

        <UserProfileModal />
        <Toast />
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      {/* Main Content Area */}
      <div className="main-content">
        <Navbar setMobileOpen={setMobileOpen} />

        <main className="flex-grow-1" style={{ minWidth: 0 }}>{renderActivePage()}</main>

        {/* Footer */}
        <footer className="py-3 px-4 bg-white border-top text-center text-muted small">
          <div className="d-flex flex-wrap align-items-center justify-content-between gap-2">
            <div>
              <strong>ResQNet</strong> &copy; {new Date().getFullYear()} – Smart Emergency Response & Disaster Management System (Pune Zone).
            </div>
            <div className="d-flex align-items-center gap-2">
              <span className="badge bg-danger text-white">Pune Municipal Area</span>
              {currentUser ? (
                <span className="badge bg-light text-dark border">
                  {currentUser.role.toUpperCase()}: {currentUser.name}
                </span>
              ) : (
                <span className="badge bg-light text-muted border">Official Portal</span>
              )}
            </div>
          </div>
        </footer>
      </div>

      {/* Modals & Overlays */}
      <IncidentDetailModal
        onOpenAssignModal={(inc) => setAssignTargetIncident(inc)}
      />

      {assignTargetIncident && (
        <AssignTeamModal
          incident={assignTargetIncident}
          onClose={() => setAssignTargetIncident(null)}
        />
      )}

      {/* User Profile & Security Settings Modal */}
      <UserProfileModal />

      {/* Toast Alerts */}
      <Toast />
    </div>
  );
}

export default function App() {
  return <AppContent />;
}

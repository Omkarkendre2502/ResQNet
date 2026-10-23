import React, { useState } from 'react';
import { useApp } from './context/AppContext';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { Toast } from './components/Toast';
import { IncidentDetailModal } from './components/IncidentDetailModal';
import { AssignTeamModal } from './components/AssignTeamModal';

// Pages
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { CitizenDashboard } from './pages/CitizenDashboard';
import { ReportEmergencyPage } from './pages/ReportEmergencyPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { RescueTeamDashboard } from './pages/RescueTeamDashboard';
import { MapPage } from './pages/MapPage';

export function AppContent() {
  const { activePage } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [assignTargetIncident, setAssignTargetIncident] = useState(null);

  const renderActivePage = () => {
    switch (activePage) {
      case 'home':
        return <HomePage />;
      case 'login':
        return <LoginPage />;
      case 'citizen-dashboard':
        return <CitizenDashboard />;
      case 'report-emergency':
        return <ReportEmergencyPage />;
      case 'admin-dashboard':
        return (
          <AdminDashboard
            onOpenAssignModal={(inc) => setAssignTargetIncident(inc)}
          />
        );
      case 'rescue-dashboard':
        return <RescueTeamDashboard />;
      case 'map':
        return <MapPage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      {/* Main Content Area */}
      <div className="main-content">
        <Navbar setMobileOpen={setMobileOpen} />

        <main className="flex-grow-1">{renderActivePage()}</main>

        {/* Footer */}
        <footer className="py-3 px-4 bg-white border-top text-center text-muted small">
          <div className="d-flex flex-wrap align-items-center justify-content-between gap-2">
            <div>
              <strong>ResQNet</strong> &copy; {new Date().getFullYear()} – Smart Emergency Response & Disaster Management System (Pune Zone).
            </div>
            <div className="d-flex align-items-center gap-2">
              <span className="badge bg-danger text-white">Pune Municipal Area</span>
              <span className="badge bg-light text-dark border">Admin: Rahul Patil</span>
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

      {/* Toast Alerts */}
      <Toast />
    </div>
  );
}

export default function App() {
  return <AppContent />;
}

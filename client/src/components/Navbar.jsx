import React from 'react';
import { useApp } from '../context/AppContext';
import { Menu, RotateCcw, PhoneCall, AlertCircle, Plus } from 'lucide-react';

export const Navbar = ({ setMobileOpen }) => {
  const { currentUser, navigateTo, resetDemoData, incidents } = useApp();

  const activeIncidentsCount = incidents.filter(
    (inc) => inc.status !== 'Completed' && inc.status !== 'Resolved'
  ).length;

  return (
    <header className="resq-navbar">
      <div className="d-flex align-items-center gap-3">
        <button
          className="btn btn-outline-secondary d-lg-none p-1 px-2"
          onClick={() => setMobileOpen((prev) => !prev)}
          aria-label="Toggle navigation"
        >
          <Menu size={18} />
        </button>

        <div className="d-none d-sm-flex align-items-center gap-2">
          <span className="navbar-badge-emergency">
            <span className="pulse-dot"></span>
            <span>PUNE EMERGENCY DISPATCH</span>
          </span>
          <span className="badge bg-danger-subtle text-danger border border-danger-subtle">
            {activeIncidentsCount} Active
          </span>
        </div>
      </div>

      <div className="d-flex align-items-center gap-2">
        {/* Pune Emergency Helpline */}
        <div className="d-none d-md-flex align-items-center gap-2 px-2 py-1 rounded bg-light border text-muted small">
          <PhoneCall size={14} className="text-danger" />
          <span>Pune Control: </span>
          <span className="fw-bold text-dark">112 / 101</span>
        </div>

        {/* Reset Demo State Button */}
        <button
          className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1"
          onClick={resetDemoData}
          title="Reset to 2 clean Pune incidents"
        >
          <RotateCcw size={14} />
          <span className="d-none d-md-inline">Reset Sample</span>
        </button>

        {currentUser ? (
          <button
            className="btn btn-resq-danger btn-sm d-flex align-items-center gap-1"
            onClick={() => navigateTo('report-emergency')}
          >
            <Plus size={16} />
            <span>Report</span>
          </button>
        ) : (
          <button
            className="btn btn-resq-primary btn-sm"
            onClick={() => navigateTo('login')}
          >
            Sign In
          </button>
        )}
      </div>
    </header>
  );
};

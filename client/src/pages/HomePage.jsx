import React from 'react';
import { useApp } from '../context/AppContext';
import { IncidentMap } from '../components/IncidentMap';
import {
  Siren,
  PhoneCall,
  Activity,
  Ambulance,
  Clock,
  Radio,
  ShieldCheck,
  CheckCircle,
  MapPin,
  ArrowRight,
  Users
} from 'lucide-react';

export const HomePage = () => {
  const { navigateTo, currentUser, incidents, rescueTeams } = useApp();

  const activeIncidents = incidents.filter(
    (i) => i.status !== 'Completed' && i.status !== 'Resolved'
  ).length;
  const criticalCount = incidents.filter(
    (i) => i.severity === 'Critical' && i.status !== 'Completed' && i.status !== 'Resolved'
  ).length;
  const availableTeams = rescueTeams.filter((t) => t.status === 'Available').length;

  return (
    <div className="container-fluid p-3 p-lg-4">
      {/* Hero Section */}
      <div
        className="p-4 p-md-5 mb-4 shadow-sm"
        style={{
          backgroundColor: '#0b1329',
          color: '#ffffff',
          borderRadius: '8px'
        }}
      >
        <div className="row align-items-center">
          <div className="col-lg-8 mb-4 mb-lg-0">
            <div className="d-inline-flex align-items-center gap-2 px-3 py-1 rounded-pill bg-white bg-opacity-10 border border-white border-opacity-10 mb-3">
              <span className="pulse-dot"></span>
              <span className="small text-white fw-semibold">
                Pune Smart Emergency Response & Disaster Management
              </span>
            </div>
            <h1 className="display-6 fw-bold text-white mb-3">
              Rapid Emergency Reporting & Dispatch Coordination for Pune.
            </h1>
            <p className="text-white-50 mb-4" style={{ maxWidth: '650px', fontSize: '0.98rem' }}>
              ResQNet connects Pune citizens facing urgent crises directly with municipal
              control authorities and specialized field squads. Report incidents in seconds with
              accurate Pune locations, track live triage, and coordinate rapid response.
            </p>

            <div className="d-flex flex-wrap gap-3">
              <button
                className="btn btn-resq-danger px-4 py-2 d-flex align-items-center gap-2 shadow-sm"
                onClick={() => navigateTo('report-emergency')}
              >
                <Siren size={18} />
                <span className="fw-bold">Report Emergency Now</span>
              </button>

              {!currentUser ? (
                <button
                  className="btn btn-outline-light px-4 py-2 d-flex align-items-center gap-2"
                  onClick={() => navigateTo('login')}
                >
                  <span>Portal Login</span>
                </button>
              ) : (
                <button
                  className="btn btn-outline-light px-4 py-2 d-flex align-items-center gap-2"
                  onClick={() =>
                    navigateTo(
                      currentUser.role === 'admin'
                        ? 'admin-dashboard'
                        : currentUser.role === 'rescue'
                        ? 'rescue-dashboard'
                        : 'citizen-dashboard'
                    )
                  }
                >
                  <span>Go to Dashboard ({currentUser.role})</span>
                  <ArrowRight size={16} />
                </button>
              )}
            </div>
          </div>

          <div className="col-lg-4 text-center">
            {/* Direct Helpline Card */}
            <div className="bg-white bg-opacity-10 rounded-3 p-4 border border-white border-opacity-10 text-start">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <span className="text-white-50 small text-uppercase fw-bold">
                  Pune Emergency Hotlines
                </span>
                <span className="badge bg-danger">24/7 Active</span>
              </div>
              <div className="d-flex flex-column gap-2 mb-3">
                <div className="d-flex align-items-center justify-content-between p-2 rounded bg-white bg-opacity-10">
                  <span className="text-white small d-flex align-items-center gap-2">
                    <ShieldCheck size={16} className="text-info" /> Police Control
                  </span>
                  <span className="fw-bold text-white">112</span>
                </div>
                <div className="d-flex align-items-center justify-content-between p-2 rounded bg-white bg-opacity-10">
                  <span className="text-white small d-flex align-items-center gap-2">
                    <Siren size={16} className="text-warning" /> Pune Fire Brigade
                  </span>
                  <span className="fw-bold text-white">101</span>
                </div>
                <div className="d-flex align-items-center justify-content-between p-2 rounded bg-white bg-opacity-10">
                  <span className="text-white small d-flex align-items-center gap-2">
                    <Ambulance size={16} className="text-danger" /> 108 Emergency Medical
                  </span>
                  <span className="fw-bold text-white">108</span>
                </div>
              </div>
              <small className="text-white-50 d-block text-center">
                Pune Municipal Corporation Control Room
              </small>
            </div>
          </div>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="row g-3 mb-4">
        <div className="col-sm-6 col-xl-3">
          <div className="stat-card">
            <div>
              <div className="text-muted small fw-semibold">Critical Incidents</div>
              <div className="h3 fw-bold mb-0 text-danger">{criticalCount}</div>
              <small className="text-muted">High priority triage</small>
            </div>
            <div className="stat-icon bg-danger-subtle">
              <Siren size={22} />
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-xl-3">
          <div className="stat-card">
            <div>
              <div className="text-muted small fw-semibold">Active Emergencies</div>
              <div className="h3 fw-bold mb-0 text-dark">{activeIncidents}</div>
              <small className="text-muted">In dispatch & rescue</small>
            </div>
            <div className="stat-icon bg-primary-subtle">
              <Activity size={22} />
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-xl-3">
          <div className="stat-card">
            <div>
              <div className="text-muted small fw-semibold">Available Rescue Units</div>
              <div className="h3 fw-bold mb-0 text-success">{availableTeams}</div>
              <small className="text-muted">On standby in Pune zone</small>
            </div>
            <div className="stat-icon bg-success-subtle">
              <Ambulance size={22} />
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-xl-3">
          <div className="stat-card">
            <div>
              <div className="text-muted small fw-semibold">Avg. Response Time</div>
              <div className="h3 fw-bold mb-0 text-info">6.2 min</div>
              <small className="text-muted">Pune urban target &lt; 10 min</small>
            </div>
            <div className="stat-icon bg-info-subtle">
              <Clock size={22} />
            </div>
          </div>
        </div>
      </div>

      {/* Workflow Section */}
      <div className="resq-card mb-4">
        <div className="resq-card-header d-flex align-items-center justify-content-between">
          <h5 className="mb-0 fw-bold text-dark d-flex align-items-center gap-2">
            <Radio size={18} className="text-danger" />
            Pune Emergency Response Workflow
          </h5>
          <span className="badge bg-light text-secondary border">Lifecycle</span>
        </div>
        <div className="resq-card-body">
          <div className="row g-3 text-center">
            <div className="col-md-3">
              <div className="p-3 bg-light rounded h-100 border">
                <div className="stat-icon bg-danger-subtle mx-auto mb-2">
                  <Radio size={20} />
                </div>
                <h6 className="fw-bold mb-1">1. Citizen Reports</h6>
                <p className="text-secondary small mb-0">
                  Citizen (e.g. Priya Sharma) submits incident type, Pune location, and severity.
                </p>
              </div>
            </div>
            <div className="col-md-3">
              <div className="p-3 bg-light rounded h-100 border">
                <div className="stat-icon bg-primary-subtle mx-auto mb-2">
                  <ShieldCheck size={20} />
                </div>
                <h6 className="fw-bold mb-1">2. Admin Triage</h6>
                <p className="text-secondary small mb-0">
                  Admin Rahul Patil reviews incident on the dashboard and assigns a rescue team.
                </p>
              </div>
            </div>
            <div className="col-md-3">
              <div className="p-3 bg-light rounded h-100 border">
                <div className="stat-icon bg-info-subtle mx-auto mb-2">
                  <Ambulance size={20} />
                </div>
                <h6 className="fw-bold mb-1">3. Team Dispatched</h6>
                <p className="text-secondary small mb-0">
                  Assigned team (e.g. PERT-01) updates status: On the Way &rarr; Reached &rarr; In Progress.
                </p>
              </div>
            </div>
            <div className="col-md-3">
              <div className="p-3 bg-light rounded h-100 border">
                <div className="stat-icon bg-success-subtle mx-auto mb-2">
                  <CheckCircle size={20} />
                </div>
                <h6 className="fw-bold mb-1">4. Mission Completed</h6>
                <p className="text-secondary small mb-0">
                  Team marks mission completed. Citizen and Admin see real-time completed status.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Map Section */}
      <div className="resq-card mb-4">
        <div className="resq-card-header d-flex flex-wrap align-items-center justify-content-between gap-2">
          <div>
            <h5 className="mb-0 fw-bold text-dark d-flex align-items-center gap-2">
              <MapPin size={18} className="text-danger" />
              Pune Live Incident Map
            </h5>
            <small className="text-muted">
              Spatial emergency markers across Pune locations (Shivajinagar, Hinjawadi, etc.)
            </small>
          </div>
          <button
            className="btn btn-outline-secondary btn-sm"
            onClick={() => navigateTo('map')}
          >
            Full Map View &rarr;
          </button>
        </div>
        <div className="resq-card-body p-0">
          <IncidentMap height="360px" />
        </div>
      </div>
    </div>
  );
};

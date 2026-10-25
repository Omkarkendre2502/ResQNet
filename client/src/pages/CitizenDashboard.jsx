import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Users,
  Plus,
  Eye,
  MapPin,
  ClipboardList,
  AlertTriangle,
  Flame,
  Waves,
  Car,
  Building2,
  Ambulance,
  CheckCircle,
  Search,
  Clock,
  ArrowRight
} from 'lucide-react';

const STATUS_STEPS = ['Reported', 'Assigned', 'On the Way', 'Reached', 'In Progress', 'Completed'];

export const CitizenDashboard = () => {
  const { currentUser, incidents, navigateTo, setSelectedIncident } = useApp();
  const [filter, setFilter] = useState('all'); // 'all' | 'active' | 'completed'
  const [searchQuery, setSearchQuery] = useState('');

  const activeIncidents = incidents.filter(
    (inc) => inc.status !== 'Completed' && inc.status !== 'Resolved'
  );
  const completedIncidents = incidents.filter(
    (inc) => inc.status === 'Completed' || inc.status === 'Resolved'
  );

  const displayedIncidents = incidents.filter((inc) => {
    if (filter === 'active' && (inc.status === 'Completed' || inc.status === 'Resolved')) return false;
    if (filter === 'completed' && inc.status !== 'Completed' && inc.status !== 'Resolved') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchId = inc.id && inc.id.toLowerCase().includes(q);
      const matchLoc = inc.location && inc.location.toLowerCase().includes(q);
      const matchType = inc.type && inc.type.toLowerCase().includes(q);
      if (!matchId && !matchLoc && !matchType) return false;
    }
    return true;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Reported':
        return 'badge-status-reported';
      case 'Assigned':
        return 'badge-status-assigned';
      case 'In Progress':
      case 'On the Way':
      case 'Reached':
        return 'badge-status-in-progress';
      case 'Completed':
      case 'Resolved':
        return 'badge-status-completed';
      default:
        return 'bg-secondary text-white';
    }
  };

  const getSeverityBadge = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'critical':
        return 'badge-severity-critical';
      case 'high':
        return 'badge-severity-high';
      case 'medium':
        return 'badge-severity-medium';
      default:
        return 'badge-severity-low';
    }
  };

  const getIncidentIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'fire':
        return <Flame size={16} className="text-danger" />;
      case 'flood':
        return <Waves size={16} className="text-primary" />;
      case 'accident':
        return <Car size={16} className="text-warning" />;
      case 'building collapse':
        return <Building2 size={16} className="text-danger" />;
      default:
        return <AlertTriangle size={16} className="text-secondary" />;
    }
  };

  const getStepIndex = (status) => {
    if (status === 'Resolved') return STATUS_STEPS.indexOf('Completed');
    return STATUS_STEPS.indexOf(status);
  };

  return (
    <div className="container-fluid p-3 p-lg-4">
      {/* Welcome Section */}
      <div className="resq-card p-4 mb-4 bg-white border shadow-sm">
        <div className="row align-items-center">
          <div className="col-md-8 mb-3 mb-md-0">
            <span className="badge bg-primary-subtle text-primary border border-primary-subtle mb-2">
              Citizen Portal • Pune Zone
            </span>
            <h4 className="fw-bold text-dark mb-1">
              Welcome back, {currentUser?.name || 'Citizen'}
            </h4>
            <p className="text-secondary small mb-0">
              Track live response status for your reported emergencies across Pune municipal sectors.
            </p>
          </div>
          <div className="col-md-4 text-md-end">
            <button
              className="btn btn-resq-danger d-inline-flex align-items-center gap-2 shadow-sm"
              onClick={() => navigateTo('report-emergency')}
            >
              <Plus size={16} />
              <span>Report Emergency</span>
            </button>
          </div>
        </div>
      </div>

      {/* Reported Emergencies Table & Filter Bar */}
      <div className="resq-card shadow-sm border">
        <div className="resq-card-header d-flex flex-wrap align-items-center justify-content-between gap-3">
          <div className="d-flex align-items-center gap-2">
            <ClipboardList size={18} className="text-danger" />
            <h6 className="mb-0 fw-bold text-dark">My Reported Incidents</h6>
            <span className="badge bg-dark rounded-pill">{displayedIncidents.length}</span>
          </div>

          <div className="d-flex flex-wrap align-items-center gap-2">
            {/* Search */}
            <div className="input-group input-group-sm" style={{ width: '210px' }}>
              <span className="input-group-text bg-light border-end-0">
                <Search size={14} className="text-muted" />
              </span>
              <input
                type="text"
                className="form-control border-start-0"
                placeholder="Search ID, locality..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Filter buttons */}
            <div className="btn-group btn-group-sm" role="group">
              <button
                type="button"
                className={`btn ${filter === 'all' ? 'btn-dark' : 'btn-outline-secondary'}`}
                onClick={() => setFilter('all')}
              >
                All ({incidents.length})
              </button>
              <button
                type="button"
                className={`btn ${filter === 'active' ? 'btn-danger' : 'btn-outline-secondary'}`}
                onClick={() => setFilter('active')}
              >
                Active ({activeIncidents.length})
              </button>
              <button
                type="button"
                className={`btn ${filter === 'completed' ? 'btn-success' : 'btn-outline-secondary'}`}
                onClick={() => setFilter('completed')}
              >
                Completed ({completedIncidents.length})
              </button>
            </div>
          </div>
        </div>

        <div className="resq-card-body p-0">
          {displayedIncidents.length === 0 ? (
            <div className="text-center p-5 text-muted">
              <ClipboardList size={36} className="text-secondary opacity-50 mb-2 mx-auto d-block" />
              <h6 className="fw-semibold text-dark">No emergency records found</h6>
              <p className="small mb-3 text-secondary">
                {incidents.length === 0
                  ? "You have not reported any emergencies yet."
                  : "No incidents match your search or filter selection."}
              </p>
              <button
                className="btn btn-sm btn-resq-danger"
                onClick={() => navigateTo('report-emergency')}
              >
                Report Emergency Now
              </button>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light small text-uppercase text-secondary">
                  <tr>
                    <th className="ps-4">Incident ID</th>
                    <th>Type</th>
                    <th>Pune Location</th>
                    <th>Severity</th>
                    <th>Current Progress</th>
                    <th>Assigned Squad</th>
                    <th className="text-end pe-4">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedIncidents.map((inc) => {
                    const stepIdx = getStepIndex(inc.status);
                    return (
                      <tr key={inc.id}>
                        <td className="ps-4 fw-bold text-danger small">#{inc.id}</td>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            {getIncidentIcon(inc.type)}
                            <span className="fw-semibold text-dark">{inc.type}</span>
                          </div>
                        </td>
                        <td>
                          <div className="text-dark small fw-medium text-truncate" style={{ maxWidth: '220px' }}>
                            <MapPin size={13} className="text-danger me-1 d-inline" />
                            {inc.location}
                          </div>
                          <small className="text-muted">
                            {new Date(inc.reportedAt).toLocaleDateString('en-IN', {
                              day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                            })}
                          </small>
                        </td>
                        <td>
                          <span className={`badge ${getSeverityBadge(inc.severity)}`}>
                            {inc.severity}
                          </span>
                        </td>
                        <td>
                          <div>
                            <span className={`badge mb-1 ${getStatusBadge(inc.status)}`}>
                              {inc.status}
                            </span>
                            {/* Visual Progress Bar for Citizen Tracking */}
                            <div className="progress" style={{ height: '4px', width: '130px' }}>
                              <div
                                className={`progress-bar ${
                                  inc.status === 'Completed' || inc.status === 'Resolved'
                                    ? 'bg-success'
                                    : 'bg-danger'
                                }`}
                                role="progressbar"
                                style={{
                                  width: `${Math.max(15, ((stepIdx + 1) / STATUS_STEPS.length) * 100)}%`
                                }}
                              ></div>
                            </div>
                          </div>
                        </td>
                        <td>
                          {inc.assignedTeamName ? (
                            <span className="badge bg-primary-subtle text-primary border border-primary-subtle small d-inline-flex align-items-center gap-1">
                              <Ambulance size={12} />
                              {inc.assignedTeamName}
                            </span>
                          ) : (
                            <span className="badge bg-light text-muted border">Triage Queue</span>
                          )}
                        </td>
                        <td className="text-end pe-4">
                          <button
                            className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1"
                            onClick={() => setSelectedIncident(inc)}
                          >
                            <Eye size={13} />
                            <span>Track Timeline</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

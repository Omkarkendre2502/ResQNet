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
  CheckCircle
} from 'lucide-react';

export const CitizenDashboard = () => {
  const { currentUser, incidents, navigateTo, setSelectedIncident } = useApp();
  const [filter, setFilter] = useState('all'); // 'all' | 'active' | 'completed'

  const activeIncidents = incidents.filter(
    (inc) => inc.status !== 'Completed' && inc.status !== 'Resolved'
  );
  const completedIncidents = incidents.filter(
    (inc) => inc.status === 'Completed' || inc.status === 'Resolved'
  );

  const displayedIncidents = incidents.filter((inc) => {
    if (filter === 'active') return inc.status !== 'Completed' && inc.status !== 'Resolved';
    if (filter === 'completed') return inc.status === 'Completed' || inc.status === 'Resolved';
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
              Welcome back, {currentUser ? currentUser.name : 'Priya Sharma'}
            </h4>
            <p className="text-secondary small mb-0">
              Track real-time response updates for emergencies reported in Pune or report a new crisis.
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

      {/* Reported Emergencies Table */}
      <div className="resq-card">
        <div className="resq-card-header d-flex flex-wrap align-items-center justify-content-between gap-2">
          <div className="d-flex align-items-center gap-2">
            <ClipboardList size={18} className="text-danger" />
            <h6 className="mb-0 fw-bold text-dark">Reported Emergencies</h6>
            <span className="badge bg-dark rounded-pill">{displayedIncidents.length}</span>
          </div>

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

        <div className="resq-card-body p-0">
          {displayedIncidents.length === 0 ? (
            <div className="text-center p-5 text-muted">
              <ClipboardList size={36} className="text-secondary opacity-50 mb-2 mx-auto d-block" />
              <h6 className="fw-semibold text-dark">No incidents reported</h6>
              <p className="small mb-3 text-secondary">
                There are currently no active emergencies recorded in this category.
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
                    <th>Status</th>
                    <th>Assigned Squad</th>
                    <th className="text-end pe-4">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedIncidents.map((inc) => (
                    <tr key={inc.id}>
                      <td className="ps-4 fw-bold text-dark">{inc.id}</td>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          {getIncidentIcon(inc.type)}
                          <span className="fw-semibold text-dark">{inc.type}</span>
                        </div>
                      </td>
                      <td>
                        <div className="text-dark small fw-medium text-truncate" style={{ maxWidth: '240px' }}>
                          <MapPin size={13} className="text-danger me-1 d-inline" />
                          {inc.location}
                        </div>
                        <small className="text-muted">
                          Affected: {inc.peopleAffected} people
                        </small>
                      </td>
                      <td>
                        <span className={getSeverityBadge(inc.severity)}>
                          {inc.severity}
                        </span>
                      </td>
                      <td>
                        <span className={getStatusBadge(inc.status)}>
                          {inc.status}
                        </span>
                      </td>
                      <td>
                        {inc.assignedTeamName ? (
                          <span className="badge bg-light text-dark border small">
                            <Ambulance size={12} className="text-primary me-1 d-inline" />
                            {inc.assignedTeamName}
                          </span>
                        ) : (
                          <span className="text-muted small">Pending Assignment</span>
                        )}
                      </td>
                      <td className="text-end pe-4">
                        <button
                          className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1"
                          onClick={() => setSelectedIncident(inc)}
                        >
                          <Eye size={13} />
                          <span>Track</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

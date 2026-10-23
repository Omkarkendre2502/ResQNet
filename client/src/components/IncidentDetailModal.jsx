import React from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  MapPin,
  Users,
  Clock,
  ShieldCheck,
  Ambulance,
  CheckCircle,
  FileText,
  AlertTriangle,
  UserPlus
} from 'lucide-react';

export const IncidentDetailModal = ({ onOpenAssignModal }) => {
  const { selectedIncident, setSelectedIncident, currentUser, updateIncidentStatus } = useApp();

  if (!selectedIncident) return null;

  const inc = selectedIncident;

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

  const getStatusBadge = (status) => {
    const s = status?.toLowerCase().replace(/\s+/g, '-');
    return `badge-status-${s}`;
  };

  const stages = ['Reported', 'Assigned', 'In Progress', 'Completed'];
  const currentStageIndex = () => {
    if (inc.status === 'Completed' || inc.status === 'Resolved') return 3;
    if (inc.status === 'In Progress' || inc.status === 'Reached' || inc.status === 'On the Way') return 2;
    if (inc.status === 'Assigned') return 1;
    return 0;
  };

  return (
    <div
      className="modal fade show d-block"
      tabIndex="-1"
      style={{ backgroundColor: 'rgba(11, 19, 41, 0.65)', zIndex: 1050 }}
    >
      <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
        <div className="modal-content border-0 shadow" style={{ borderRadius: '8px' }}>
          {/* Header */}
          <div className="modal-header bg-light border-bottom">
            <div className="d-flex align-items-center gap-2">
              <span className="badge bg-dark fw-bold">{inc.id}</span>
              <h5 className="modal-title mb-0 fw-bold">{inc.title || `${inc.type} Incident`}</h5>
            </div>
            <button
              type="button"
              className="btn-close"
              onClick={() => setSelectedIncident(null)}
              aria-label="Close"
            ></button>
          </div>

          {/* Body */}
          <div className="modal-body p-4">
            {/* Status & Severity Bar */}
            <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 p-3 bg-light rounded mb-3 border">
              <div>
                <span className="text-muted small me-2">Severity:</span>
                <span className={getSeverityBadge(inc.severity)}>
                  <AlertTriangle size={13} />
                  {inc.severity}
                </span>
              </div>
              <div>
                <span className="text-muted small me-2">Status:</span>
                <span className={getStatusBadge(inc.status)}>
                  {inc.status}
                </span>
              </div>
              <div className="d-flex align-items-center gap-1 text-muted small">
                <Users size={14} />
                <span>Affected:</span>
                <strong className="text-dark">{inc.peopleAffected}</strong>
              </div>
            </div>

            {/* Status Step Tracker */}
            <div className="status-tracker px-3">
              {stages.map((stage, idx) => {
                const isCurrent = currentStageIndex() === idx;
                const isPassed = currentStageIndex() > idx;
                return (
                  <div
                    key={stage}
                    className={`tracker-item ${isCurrent ? 'active' : ''} ${isPassed ? 'done' : ''}`}
                  >
                    <div className="tracker-circle">
                      {isPassed ? <CheckCircle size={14} /> : idx + 1}
                    </div>
                    <span className="tracker-label">{stage}</span>
                  </div>
                );
              })}
            </div>

            {/* Description */}
            <div className="mb-4">
              <h6 className="fw-semibold text-dark mb-2 d-flex align-items-center gap-1">
                <FileText size={16} className="text-danger" /> Situation Description
              </h6>
              <div className="p-3 bg-light rounded border text-secondary small">
                {inc.description}
              </div>
            </div>

            {/* Location & Photo */}
            <div className="row g-3 mb-4">
              <div className="col-md-7">
                <div className="p-3 bg-light rounded border h-100">
                  <h6 className="fw-semibold text-dark mb-2 d-flex align-items-center gap-1">
                    <MapPin size={16} className="text-danger" /> Location Details
                  </h6>
                  <div className="fw-medium text-dark">{inc.location}</div>
                  {inc.coordinates && (
                    <div className="text-muted small mt-1">
                      GPS: {inc.coordinates[0].toFixed(4)}, {inc.coordinates[1].toFixed(4)}
                    </div>
                  )}
                  <hr className="my-2" />
                  <div className="text-muted small">
                    <strong>Reported by:</strong> {inc.reportedBy} ({inc.reporterPhone})
                  </div>
                  <div className="text-muted small">
                    <strong>Reported at:</strong> {new Date(inc.reportedAt).toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="col-md-5">
                <div className="p-3 bg-light rounded border h-100">
                  <h6 className="fw-semibold text-dark mb-2">Scene Photo</h6>
                  {inc.photoUrl ? (
                    <img
                      src={inc.photoUrl}
                      alt="Emergency Scene"
                      className="img-fluid rounded border w-100"
                      style={{ maxHeight: '140px', objectFit: 'cover' }}
                    />
                  ) : (
                    <div className="text-center text-muted p-4 bg-white rounded border small">
                      No scene photo attached
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Assigned Rescue Team */}
            <div className="p-3 rounded border mb-4 bg-light">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <h6 className="fw-semibold text-dark mb-1 d-flex align-items-center gap-1">
                    <Ambulance size={16} className="text-primary" /> Assigned Rescue Squad
                  </h6>
                  <div className="fw-medium text-primary">
                    {inc.assignedTeamName || 'Awaiting Squad Assignment from Admin'}
                  </div>
                </div>
                {currentUser?.role === 'admin' && (
                  <button
                    className="btn btn-sm btn-resq-primary d-flex align-items-center gap-1"
                    onClick={() => {
                      if (onOpenAssignModal) onOpenAssignModal(inc);
                    }}
                  >
                    <UserPlus size={14} />
                    <span>{inc.assignedTeamId ? 'Reassign' : 'Assign Team'}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Event Timeline */}
            <div>
              <h6 className="fw-semibold text-dark mb-3 d-flex align-items-center gap-1">
                <Clock size={16} className="text-muted" /> Dispatch & Incident Timeline
              </h6>
              <div className="resq-timeline">
                {inc.timeline && inc.timeline.length > 0 ? (
                  inc.timeline.map((item, idx) => (
                    <div
                      key={idx}
                      className={`timeline-step ${
                        idx === inc.timeline.length - 1 ? 'active' : 'completed'
                      }`}
                    >
                      <div className="timeline-node"></div>
                      <div className="d-flex align-items-center justify-content-between">
                        <strong className="text-dark small">{item.status}</strong>
                        <span className="text-muted" style={{ fontSize: '0.72rem' }}>
                          {new Date(item.time).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      <div className="text-secondary small mt-1">{item.note}</div>
                    </div>
                  ))
                ) : (
                  <div className="text-muted small">No timeline events recorded.</div>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="modal-footer bg-light border-top">
            {/* Rescue team quick updater */}
            {currentUser?.role === 'rescue' && inc.status !== 'Completed' && inc.status !== 'Resolved' && (
              <div className="me-auto d-flex align-items-center gap-1 flex-wrap">
                <span className="small text-muted me-1">Update Status:</span>
                <button
                  className="btn btn-sm btn-outline-danger"
                  onClick={() => updateIncidentStatus(inc.id, 'Assigned')}
                >
                  Assigned
                </button>
                <button
                  className="btn btn-sm btn-outline-primary"
                  onClick={() => updateIncidentStatus(inc.id, 'On the Way')}
                >
                  On the Way
                </button>
                <button
                  className="btn btn-sm btn-outline-info"
                  onClick={() => updateIncidentStatus(inc.id, 'Reached')}
                >
                  Reached
                </button>
                <button
                  className="btn btn-sm btn-outline-warning"
                  onClick={() => updateIncidentStatus(inc.id, 'In Progress')}
                >
                  In Progress
                </button>
                <button
                  className="btn btn-sm btn-success"
                  onClick={() => updateIncidentStatus(inc.id, 'Completed')}
                >
                  Completed
                </button>
              </div>
            )}

            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setSelectedIncident(null)}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

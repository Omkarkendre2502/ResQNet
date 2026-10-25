import React, { useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  MapPin,
  Users,
  ShieldCheck,
  Ambulance,
  FileText,
  UserPlus,
  Phone,
  Mail,
  Calendar,
  Camera,
  Navigation
} from 'lucide-react';
import StatusBadge from './dashboard/StatusBadge';
import SeverityBadge from './dashboard/SeverityBadge';
import ProgressTimeline from './dashboard/ProgressTimeline';
import { IncidentMap } from './IncidentMap';

/**
 * Control-room Incident Detail & Tracking Modal.
 * Used across Citizen, Admin, and Rescue Team dashboards.
 *
 * @param {Object} props
 * @param {Function} [props.onOpenAssignModal] - Callback to open AssignTeamModal (Admin only)
 */
export const IncidentDetailModal = ({ onOpenAssignModal }) => {
  const {
    selectedIncident,
    setSelectedIncident,
    currentUser,
    rescueTeams
  } = useApp();

  const modalRef = useRef(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setSelectedIncident(null);
      }
    };
    if (selectedIncident) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedIncident, setSelectedIncident]);

  if (!selectedIncident) return null;

  const inc = selectedIncident;

  // Look up assigned rescue team details if available
  const assignedSquad = rescueTeams.find(
    (t) =>
      t.id === inc.assignedTeamId ||
      (inc.assignedTeamName && t.name.toLowerCase() === inc.assignedTeamName.toLowerCase())
  );

  const isAdmin = currentUser?.role === 'admin';

  return (
    <div
      className="modal fade show d-block"
      tabIndex="-1"
      role="dialog"
      aria-modal="true"
      aria-labelledby="incident-detail-modal-title"
      style={{
        backgroundColor: 'rgba(11, 19, 41, 0.72)',
        zIndex: 1050,
        backdropFilter: 'blur(3px)'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          setSelectedIncident(null);
        }
      }}
    >
      <div
        className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable"
        ref={modalRef}
      >
        <div className="modal-content border-0 shadow-lg rounded-3 overflow-hidden">
          {/* Header */}
          <div className="modal-header bg-navy text-white py-3 px-4 d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center gap-2">
              <span className="badge bg-danger fw-bold font-monospace px-2.5 py-1">
                {inc.id}
              </span>
              <h5 className="modal-title mb-0 fw-bold fs-6" id="incident-detail-modal-title">
                {inc.title || `${inc.type} Incident`} • {inc.location}
              </h5>
            </div>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={() => setSelectedIncident(null)}
              aria-label="Close"
            ></button>
          </div>

          {/* Modal Body */}
          <div className="modal-body p-4 bg-light-subtle">
            {/* Top Status & Metrics Strip */}
            <div className="resq-card p-3 mb-4 bg-white shadow-sm border d-flex flex-wrap align-items-center justify-content-between gap-3">
              <div className="d-flex align-items-center gap-2">
                <span className="text-secondary small fw-medium">Severity:</span>
                <SeverityBadge severity={inc.severity} />
              </div>
              <div className="d-flex align-items-center gap-2">
                <span className="text-secondary small fw-medium">Status:</span>
                <StatusBadge status={inc.status} />
              </div>
              <div className="d-flex align-items-center gap-1.5 text-secondary small">
                <Users size={15} className="text-danger" />
                <span>People affected:</span>
                <strong className="text-dark">{inc.peopleAffected || 0}</strong>
              </div>
              <div className="d-flex align-items-center gap-1.5 text-secondary small">
                <Calendar size={14} className="text-muted" />
                <span>Reported:</span>
                <strong className="text-dark">
                  {new Date(inc.reportedAt).toLocaleString('en-IN', {
                    dateStyle: 'medium',
                    timeStyle: 'short'
                  })}
                </strong>
              </div>
            </div>

            {/* 6-Step Progress Timeline Tracker */}
            <div className="resq-card p-3 p-md-4 mb-4 bg-white shadow-sm border">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <h6 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2 small text-uppercase tracking-wider">
                  <ShieldCheck size={16} className="text-primary" />
                  Mission Progression & Lifecycle
                </h6>
                <span className="badge bg-light text-secondary border small">
                  Forward Only (6 Stages)
                </span>
              </div>
              <ProgressTimeline
                currentStatus={inc.status}
                timeline={inc.timeline || []}
                assignedSquad={inc.assignedTeamName}
                orientation="horizontal"
              />
            </div>

            {/* Assigned Squad Info */}
            <div className="resq-card p-3 p-md-4 mb-4 bg-white shadow-sm border">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <h6 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2 small text-uppercase tracking-wider">
                  <Ambulance size={16} className="text-danger" />
                  Assigned Emergency Squad
                </h6>
                {isAdmin && (
                  <button
                    type="button"
                    className="btn btn-sm btn-resq-danger d-inline-flex align-items-center gap-1.5 px-3 py-1 fw-semibold"
                    onClick={() => {
                      setSelectedIncident(null);
                      if (onOpenAssignModal) onOpenAssignModal(inc);
                    }}
                  >
                    <UserPlus size={14} />
                    <span>{inc.assignedTeamId ? 'Reassign Squad' : 'Dispatch Squad'}</span>
                  </button>
                )}
              </div>

              {assignedSquad ? (
                <div className="p-3 rounded bg-light border">
                  <div className="row g-2">
                    <div className="col-sm-6">
                      <div className="small text-muted">Squad Call Sign:</div>
                      <div className="fw-bold text-dark">{assignedSquad.name} ({assignedSquad.id})</div>
                      <div className="small text-muted mt-1">Squad Leader:</div>
                      <div className="text-dark small fw-medium">{assignedSquad.leader || 'Command Officer'}</div>
                    </div>
                    <div className="col-sm-6">
                      <div className="small text-muted">Base / Depot:</div>
                      <div className="text-dark small fw-medium">{assignedSquad.currentLocation || 'Pune Municipal Command'}</div>
                      <div className="small text-muted mt-1">Vehicle & Crew:</div>
                      <div className="text-dark small fw-medium">
                        {assignedSquad.vehicle || 'Heavy Rescue Unit'} • Crew Size: {assignedSquad.membersCount || 6}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded bg-warning-subtle border border-warning-subtle text-warning-emphasis small d-flex align-items-center justify-content-between">
                  <span>Awaiting squad assignment from Pune Emergency Dispatch Control.</span>
                  {isAdmin && (
                    <button
                      type="button"
                      className="btn btn-sm btn-warning text-dark fw-bold px-2.5 py-1"
                      onClick={() => {
                        setSelectedIncident(null);
                        if (onOpenAssignModal) onOpenAssignModal(inc);
                      }}
                    >
                      Assign Now
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Situation Description & Photo */}
            <div className="row g-3 mb-4">
              <div className={inc.photoUrl ? 'col-md-7' : 'col-12'}>
                <div className="resq-card p-3 p-md-4 h-100 bg-white shadow-sm border">
                  <h6 className="fw-bold text-dark mb-2 d-flex align-items-center gap-1.5 small text-uppercase tracking-wider">
                    <FileText size={15} className="text-danger" /> Situation Description
                  </h6>
                  <p className="text-secondary small mb-3 lh-base">
                    {inc.description || 'No additional narrative reported.'}
                  </p>

                  <div className="border-top pt-2">
                    <div className="d-flex align-items-center gap-1 text-muted small">
                      <MapPin size={13} className="text-danger" />
                      <span>Location:</span>
                      <strong className="text-dark ms-1">{inc.location}</strong>
                    </div>
                    {inc.coordinates && (
                      <div className="text-muted small mt-1 font-monospace" style={{ fontSize: '0.72rem' }}>
                        Coordinates: {inc.coordinates[0]?.toFixed(5)}, {inc.coordinates[1]?.toFixed(5)}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {inc.photoUrl && (
                <div className="col-md-5">
                  <div className="resq-card p-3 h-100 bg-white shadow-sm border d-flex flex-column">
                    <h6 className="fw-bold text-dark mb-2 d-flex align-items-center gap-1.5 small text-uppercase tracking-wider">
                      <Camera size={15} className="text-primary" /> Incident Scene Photo
                    </h6>
                    <div className="flex-grow-1 d-flex align-items-center justify-content-center bg-light rounded overflow-hidden border">
                      <img
                        src={inc.photoUrl}
                        alt="Incident scene"
                        className="img-fluid rounded"
                        style={{ maxHeight: '180px', objectFit: 'cover', width: '100%' }}
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Reporter Details (Admin Only) */}
            {isAdmin && (inc.reportedBy || inc.reporterPhone || inc.reporterEmail) && (
              <div className="resq-card p-3 mb-4 bg-white shadow-sm border border-danger-subtle">
                <div className="d-flex align-items-center gap-1.5 mb-2">
                  <span className="badge bg-danger-subtle text-danger border border-danger-subtle small">
                    Admin Eyes Only
                  </span>
                  <h6 className="fw-bold text-dark mb-0 small">Reporter Contact & Identity</h6>
                </div>
                <div className="row g-2 small">
                  <div className="col-sm-4">
                    <span className="text-muted">Name:</span>{' '}
                    <strong className="text-dark">{inc.reportedBy || 'Citizen'}</strong>
                  </div>
                  {inc.reporterPhone && (
                    <div className="col-sm-4">
                      <span className="text-muted">Phone:</span>{' '}
                      <a href={`tel:${inc.reporterPhone}`} className="text-danger fw-semibold text-decoration-none">
                        <Phone size={12} className="me-1 inline" />
                        {inc.reporterPhone}
                      </a>
                    </div>
                  )}
                  {inc.reporterEmail && (
                    <div className="col-sm-4">
                      <span className="text-muted">Email:</span>{' '}
                      <a href={`mailto:${inc.reporterEmail}`} className="text-primary text-decoration-none">
                        <Mail size={12} className="me-1 inline" />
                        {inc.reporterEmail}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Mini OpenStreetMap Preview */}
            <div className="resq-card p-3 bg-white shadow-sm border overflow-hidden">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <h6 className="fw-bold text-dark mb-0 d-flex align-items-center gap-1.5 small text-uppercase tracking-wider">
                  <MapPin size={15} className="text-danger" /> Scene Map Location
                </h6>
                {inc.coordinates && (
                  <a
                    href={`https://www.google.com/maps?q=${inc.coordinates[0]},${inc.coordinates[1]}`}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1 py-0.5 px-2 small"
                    style={{ fontSize: '0.72rem' }}
                  >
                    <Navigation size={12} />
                    <span>Open External Maps</span>
                  </a>
                )}
              </div>
              <div className="rounded overflow-hidden border">
                <IncidentMap incidentsList={[inc]} height="220px" />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="modal-footer bg-light py-2.5 px-4 d-flex justify-content-end">
            <button
              type="button"
              className="btn btn-sm btn-secondary px-3"
              onClick={() => setSelectedIncident(null)}
            >
              Close Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IncidentDetailModal;

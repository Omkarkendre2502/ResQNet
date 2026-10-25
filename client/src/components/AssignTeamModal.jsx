import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import {
  UserPlus,
  Ambulance,
  MapPin,
  Users,
  Check,
  Shield,
  Truck,
  Phone,
  AlertTriangle,
  Loader2
} from 'lucide-react';

/**
 * Squad Assignment Modal for Control Room Dispatchers.
 * Lists ONLY Available teams with leader, base, vehicle, and crew size.
 * Requires user confirmation before dispatching.
 *
 * @param {Object} props
 * @param {Object} props.incident - The target incident to assign
 * @param {Function} props.onClose - Dismiss callback
 * @param {Function} [props.onAssigned] - Callback with incident ID on successful assignment
 */
export const AssignTeamModal = ({ incident, onClose, onAssigned }) => {
  const { rescueTeams = [], assignTeam, setSelectedIncident, currentUser } = useApp();

  // Filter ONLY Available teams
  const availableTeams = rescueTeams.filter((t) => t.status === 'Available');

  const [selectedTeamId, setSelectedTeamId] = useState(
    availableTeams[0] ? availableTeams[0].id : ''
  );
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const modalRef = useRef(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !isSubmitting) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isSubmitting, onClose]);

  const selectedTeam = availableTeams.find((t) => t.id === selectedTeamId);

  const handleInitialSubmit = (e) => {
    e.preventDefault();
    if (!selectedTeamId) return;
    setShowConfirm(true);
  };

  const handleFinalConfirm = async () => {
    if (!selectedTeamId || !incident) return;
    setIsSubmitting(true);
    try {
      const success = await assignTeam(incident.id, selectedTeamId);
      if (success) {
        setSelectedIncident((prev) =>
          prev && prev.id === incident.id
            ? {
                ...prev,
                assignedTeamId: selectedTeamId,
                assignedTeamName: selectedTeam?.name,
                status: prev.status === 'Reported' ? 'Assigned' : prev.status
              }
            : prev
        );
        if (onAssigned) {
          onAssigned(incident.id);
        }
        onClose();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="modal fade show d-block"
      tabIndex="-1"
      role="dialog"
      aria-modal="true"
      aria-labelledby="assign-team-modal-title"
      style={{
        backgroundColor: 'rgba(11, 19, 41, 0.72)',
        zIndex: 1060,
        backdropFilter: 'blur(3px)'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) {
          onClose();
        }
      }}
    >
      <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '520px' }} ref={modalRef}>
        <div className="modal-content border-0 shadow-lg rounded-3 overflow-hidden">
          {/* Header */}
          <div className="modal-header bg-navy text-white py-3 px-4">
            <div className="d-flex align-items-center gap-2">
              <div className="rounded-circle bg-danger p-1.5 text-white d-flex align-items-center justify-content-center">
                <UserPlus size={16} />
              </div>
              <div>
                <h5 className="modal-title fw-bold fs-6 mb-0" id="assign-team-modal-title">
                  Dispatch Rescue Squad
                </h5>
                <small className="text-light opacity-75" style={{ fontSize: '0.72rem' }}>
                  Operator: {currentUser?.name || 'Authorized Admin'}
                </small>
              </div>
            </div>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={onClose}
              disabled={isSubmitting}
              aria-label="Close"
            ></button>
          </div>

          {/* Body */}
          <div className="modal-body p-4 bg-light-subtle">
            {/* Target Emergency Card */}
            <div className="resq-card p-3 mb-3 bg-white border shadow-sm">
              <div className="d-flex align-items-center justify-content-between mb-1">
                <span className="badge bg-danger font-monospace px-2 py-0.5" style={{ fontSize: '0.72rem' }}>
                  {incident.id}
                </span>
                <span className="badge bg-light text-secondary border small">
                  Severity: <strong className="text-dark">{incident.severity}</strong>
                </span>
              </div>
              <h6 className="fw-bold text-dark mb-1 small">
                {incident.title || `${incident.type} Emergency`}
              </h6>
              <div className="text-secondary small d-flex align-items-center gap-1">
                <MapPin size={12} className="text-danger flex-shrink-0" />
                <span className="text-truncate">{incident.location}</span>
              </div>
            </div>

            {/* Confirmation Alert Step */}
            {showConfirm ? (
              <div className="p-3 rounded bg-warning-subtle border border-warning-subtle mb-3">
                <div className="d-flex align-items-start gap-2">
                  <AlertTriangle size={18} className="text-warning-emphasis flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-warning-emphasis small d-block mb-1">
                      Confirm Squad Dispatch Order
                    </strong>
                    <p className="text-dark small mb-2 lh-sm">
                      Are you sure you want to dispatch <strong>{selectedTeam?.name}</strong> to{' '}
                      <strong>{incident.location}</strong>? The squad will be notified immediately and status will advance to <strong>Assigned</strong>.
                    </p>
                    <div className="d-flex gap-2">
                      <button
                        type="button"
                        className="btn btn-sm btn-resq-danger d-inline-flex align-items-center gap-1.5 px-3 py-1.5 fw-semibold"
                        onClick={handleFinalConfirm}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? <Loader2 size={13} className="spin-anim" /> : <Check size={14} />}
                        <span>Confirm Dispatch</span>
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-secondary px-3"
                        onClick={() => setShowConfirm(false)}
                        disabled={isSubmitting}
                      >
                        Back
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

            {/* List of Available Teams */}
            {!showConfirm && (
              <form onSubmit={handleInitialSubmit}>
                <div className="mb-3">
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <label className="form-label small fw-bold text-dark mb-0">
                      Available Pune Rescue Squads:
                    </label>
                    <span className="badge bg-success-subtle text-success border border-success-subtle">
                      {availableTeams.length} Available
                    </span>
                  </div>

                  {availableTeams.length === 0 ? (
                    <div className="p-4 text-center rounded bg-white border text-muted small">
                      <AlertTriangle size={24} className="text-warning mx-auto mb-2 d-block" />
                      <strong>All squads currently engaged on active missions.</strong>
                      <p className="text-secondary small mt-1 mb-0">
                        Check the Rescue Teams tab for current status or wait for returning units.
                      </p>
                    </div>
                  ) : (
                    <div className="d-flex flex-column gap-2" role="radiogroup" aria-label="Available rescue teams">
                      {availableTeams.map((team) => {
                        const isSelected = selectedTeamId === team.id;
                        return (
                          <div
                            key={team.id}
                            role="radio"
                            aria-checked={isSelected}
                            tabIndex={0}
                            className={`p-3 rounded border cursor-pointer transition ${
                              isSelected
                                ? 'border-primary bg-primary-subtle shadow-sm'
                                : 'border-light-subtle bg-white hover-shadow'
                            }`}
                            onClick={() => setSelectedTeamId(team.id)}
                            onKeyDown={(e) => {
                              if (e.key === ' ' || e.key === 'Enter') {
                                e.preventDefault();
                                setSelectedTeamId(team.id);
                              }
                            }}
                          >
                            <div className="d-flex align-items-center justify-content-between mb-1.5">
                              <div className="d-flex align-items-center gap-2">
                                <input
                                  type="radio"
                                  id={`team-${team.id}`}
                                  name="availableSquad"
                                  checked={isSelected}
                                  onChange={() => setSelectedTeamId(team.id)}
                                  className="form-check-input mt-0"
                                />
                                <label htmlFor={`team-${team.id}`} className="fw-bold text-dark small mb-0 cursor-pointer">
                                  {team.name} <span className="text-muted font-monospace">({team.id})</span>
                                </label>
                              </div>
                              <span className="badge bg-success-subtle text-success border border-success-subtle py-0.5 px-2" style={{ fontSize: '0.68rem' }}>
                                Ready for Callout
                              </span>
                            </div>

                            <div className="ms-4 small text-secondary">
                              <div className="row g-1">
                                <div className="col-sm-6">
                                  <span className="text-muted">Leader:</span>{' '}
                                  <strong className="text-dark">{team.leader || 'Command Officer'}</strong>
                                </div>
                                <div className="col-sm-6">
                                  <span className="text-muted">Base:</span>{' '}
                                  <strong className="text-dark">{team.currentLocation || 'Pune Central'}</strong>
                                </div>
                                <div className="col-sm-6">
                                  <span className="text-muted">Vehicle:</span>{' '}
                                  <span className="text-dark">{team.vehicle || 'Heavy Unit'}</span>
                                </div>
                                <div className="col-sm-6">
                                  <span className="text-muted">Crew Size:</span>{' '}
                                  <strong className="text-dark">{team.membersCount || 6} personnel</strong>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="modal-footer bg-light px-0 pb-0 pt-3 border-top d-flex justify-content-end gap-2">
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary px-3"
                    onClick={onClose}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-sm btn-resq-danger d-inline-flex align-items-center gap-1.5 px-3 py-1.5 fw-semibold"
                    disabled={availableTeams.length === 0 || !selectedTeamId || isSubmitting}
                  >
                    <Check size={14} />
                    <span>Proceed to Assign</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignTeamModal;

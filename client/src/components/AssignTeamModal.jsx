import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserPlus, Ambulance, MapPin, Users, Check, Phone } from 'lucide-react';

export const AssignTeamModal = ({ incident, onClose }) => {
  const { rescueTeams, assignTeam, setSelectedIncident } = useApp();
  const [selectedTeamId, setSelectedTeamId] = useState(
    incident.assignedTeamId || (rescueTeams[0] ? rescueTeams[0].id : '')
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedTeamId) return;

    assignTeam(incident.id, selectedTeamId);
    setSelectedIncident((prev) =>
      prev && prev.id === incident.id
        ? {
            ...prev,
            assignedTeamId: selectedTeamId,
            assignedTeamName: rescueTeams.find((t) => t.id === selectedTeamId)?.name,
            status: prev.status === 'Reported' ? 'Assigned' : prev.status
          }
        : prev
    );
    onClose();
  };

  return (
    <div
      className="modal fade show d-block"
      tabIndex="-1"
      style={{ backgroundColor: 'rgba(11, 19, 41, 0.65)', zIndex: 1060 }}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 shadow" style={{ borderRadius: '8px' }}>
          <div className="modal-header bg-light border-bottom">
            <h5 className="modal-title fw-bold d-flex align-items-center gap-2 fs-6">
              <UserPlus size={18} className="text-danger" />
              Assign Rescue Squad (Admin: Rahul Patil)
            </h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              aria-label="Close"
            ></button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body p-4">
              <div className="p-3 bg-light rounded border mb-3">
                <div className="text-muted small">Target Emergency:</div>
                <div className="fw-bold text-dark">
                  {incident.id}: {incident.title || incident.type}
                </div>
                <div className="text-secondary small mt-1 d-flex align-items-center gap-1">
                  <MapPin size={12} className="text-danger" />
                  {incident.location} | Severity: <strong>{incident.severity}</strong>
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold text-dark">
                  Select Available Rescue Squad in Pune:
                </label>
                <div className="d-flex flex-column gap-2">
                  {rescueTeams.map((team) => {
                    const isSelected = selectedTeamId === team.id;
                    const isAvailable = team.status === 'Available';

                    return (
                      <div
                        key={team.id}
                        className={`p-3 rounded border cursor-pointer ${
                          isSelected
                            ? 'border-primary bg-primary-subtle shadow-sm'
                            : 'border-light-subtle bg-white'
                        }`}
                        style={{ cursor: 'pointer' }}
                        onClick={() => setSelectedTeamId(team.id)}
                      >
                        <div className="d-flex align-items-center justify-content-between mb-1">
                          <div className="d-flex align-items-center gap-2">
                            <input
                              type="radio"
                              name="rescueTeam"
                              checked={isSelected}
                              onChange={() => setSelectedTeamId(team.id)}
                              className="form-check-input mt-0"
                            />
                            <strong className="text-dark small">{team.name}</strong>
                          </div>
                          <span
                            className={`badge ${
                              isAvailable
                                ? 'bg-success'
                                : team.status === 'On the Way'
                                ? 'bg-primary'
                                : 'bg-warning text-dark'
                            }`}
                            style={{ fontSize: '0.68rem' }}
                          >
                            {team.status}
                          </span>
                        </div>
                        <div className="ms-4 text-secondary small">
                          <div>
                            Leader: {team.leader} | Members: {team.membersCount}
                          </div>
                          <div>
                            Base: {team.currentLocation} | {team.phone}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="modal-footer bg-light border-top">
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm"
                onClick={onClose}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-resq-danger btn-sm d-flex align-items-center gap-1">
                <Check size={14} /> Confirm & Dispatch Squad
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

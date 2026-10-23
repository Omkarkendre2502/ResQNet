import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Ambulance,
  MapPin,
  CheckCircle,
  Eye,
  Flame,
  Waves,
  Car,
  Building2,
  AlertTriangle,
  Users,
  Clock,
  Navigation,
  Check,
  ShieldCheck,
  Phone,
  Radio
} from 'lucide-react';

export const RescueTeamDashboard = () => {
  const {
    rescueTeams,
    activeTeamId,
    setActiveTeamId,
    incidents,
    updateIncidentStatus,
    setSelectedIncident
  } = useApp();

  // Tab: 'active' | 'completed' | 'all'
  const [viewTab, setViewTab] = useState('active');

  // Currently selected rescue team (defaults to activeTeamId or first team)
  const currentTeam =
    rescueTeams.find((t) => t.id === activeTeamId) || rescueTeams[0];

  // Helper to check if an incident belongs to a specific team
  const isAssignedToTeam = (inc, team) => {
    if (!inc || !team) return false;
    const teamIdMatch =
      inc.assignedTeamId &&
      String(inc.assignedTeamId).trim().toLowerCase() === String(team.id).trim().toLowerCase();
    const teamNameMatch =
      inc.assignedTeamName &&
      team.name &&
      String(inc.assignedTeamName).trim().toLowerCase() === String(team.name).trim().toLowerCase();
    return Boolean(teamIdMatch || teamNameMatch);
  };

  // Filter missions strictly assigned to the current team
  const allTeamMissions = incidents.filter((inc) => isAssignedToTeam(inc, currentTeam));
  
  const activeMissions = allTeamMissions.filter(
    (inc) => inc.status !== 'Completed' && inc.status !== 'Resolved'
  );
  
  const completedMissions = allTeamMissions.filter(
    (inc) => inc.status === 'Completed' || inc.status === 'Resolved'
  );

  // Other teams that currently have active missions (to help user notice if they're on another team)
  const otherTeamsWithMissions = rescueTeams.filter((t) => {
    if (t.id === currentTeam.id) return false;
    return incidents.some(
      (inc) => isAssignedToTeam(inc, t) && inc.status !== 'Completed' && inc.status !== 'Resolved'
    );
  });

  const displayedMissions =
    viewTab === 'active'
      ? activeMissions
      : viewTab === 'completed'
      ? completedMissions
      : allTeamMissions;

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

  const getIncidentIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'fire':
        return <Flame size={18} className="text-danger" />;
      case 'flood':
        return <Waves size={18} className="text-primary" />;
      case 'accident':
        return <Car size={18} className="text-warning" />;
      case 'building collapse':
        return <Building2 size={18} className="text-danger" />;
      default:
        return <AlertTriangle size={18} className="text-secondary" />;
    }
  };

  // 5 Operational Workflow Steps
  const workflowSteps = ['Assigned', 'On the Way', 'Reached', 'In Progress', 'Completed'];

  const getStepIndex = (status) => {
    switch (status) {
      case 'Assigned':
        return 0;
      case 'On the Way':
        return 1;
      case 'Reached':
        return 2;
      case 'In Progress':
        return 3;
      case 'Completed':
      case 'Resolved':
        return 4;
      default:
        return 0;
    }
  };

  return (
    <div className="container-fluid p-3 p-lg-4">
      {/* Squad Header & Operational Roster Switcher */}
      <div className="resq-card p-4 mb-4 bg-white border shadow-sm">
        <div className="row align-items-center">
          <div className="col-lg-7 mb-3 mb-lg-0">
            <span className="badge bg-danger-subtle text-danger border border-danger-subtle mb-2">
              Rescue Squad Terminal • Pune Zone
            </span>
            <div className="d-flex align-items-center gap-3">
              <div
                className="d-flex align-items-center justify-content-center"
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '8px',
                  backgroundColor: '#fee2e2',
                  color: '#dc2626'
                }}
              >
                <Ambulance size={24} />
              </div>
              <div>
                <h4 className="fw-bold text-dark mb-0">{currentTeam.name}</h4>
                <div className="text-secondary small mt-1">
                  <strong>Leader:</strong> {currentTeam.leader} |{' '}
                  <strong>Base:</strong> {currentTeam.currentLocation} |{' '}
                  <strong>Vehicle:</strong> {currentTeam.vehicle}
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-5 text-lg-end">
            <label className="form-label small fw-semibold text-muted mb-1 d-block">
              Select Field Rescue Squad:
            </label>
            <div className="d-flex align-items-center justify-content-lg-end gap-2">
              <select
                className="form-select form-select-sm d-inline-block w-auto"
                value={currentTeam.id}
                onChange={(e) => setActiveTeamId(e.target.value)}
              >
                {rescueTeams.map((t) => {
                  const teamActiveCount = incidents.filter(
                    (inc) => isAssignedToTeam(inc, t) && inc.status !== 'Completed' && inc.status !== 'Resolved'
                  ).length;
                  return (
                    <option key={t.id} value={t.id}>
                      {t.name} ({teamActiveCount} Active)
                    </option>
                  );
                })}
              </select>
            </div>
          </div>
        </div>

        {/* Notice banner if another team has active missions */}
        {otherTeamsWithMissions.length > 0 && activeMissions.length === 0 && (
          <div className="alert alert-info py-2 px-3 mt-3 mb-0 small d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center gap-2">
              <Radio size={16} className="text-primary flex-shrink-0" />
              <span>
                <strong>Dispatch Alert:</strong> Active missions are currently assigned to{' '}
                <strong>{otherTeamsWithMissions.map((t) => t.name).join(', ')}</strong>.
              </span>
            </div>
            <button
              className="btn btn-sm btn-outline-primary py-0 px-2"
              onClick={() => setActiveTeamId(otherTeamsWithMissions[0].id)}
            >
              Switch to {otherTeamsWithMissions[0].id} &rarr;
            </button>
          </div>
        )}
      </div>

      {/* Summary KPI Cards for this Squad */}
      <div className="row g-3 mb-4">
        <div className="col-sm-4">
          <div className="stat-card">
            <div>
              <div className="text-muted small fw-semibold">Active Missions</div>
              <div className="h4 fw-bold mb-0 text-danger">{activeMissions.length}</div>
              <small className="text-muted">In progress or en route</small>
            </div>
            <div className="stat-icon bg-danger-subtle">
              <Navigation size={20} />
            </div>
          </div>
        </div>

        <div className="col-sm-4">
          <div className="stat-card">
            <div>
              <div className="text-muted small fw-semibold">Completed History</div>
              <div className="h4 fw-bold mb-0 text-success">{completedMissions.length}</div>
              <small className="text-muted">Missions resolved by this squad</small>
            </div>
            <div className="stat-icon bg-success-subtle">
              <CheckCircle size={20} />
            </div>
          </div>
        </div>

        <div className="col-sm-4">
          <div className="stat-card">
            <div>
              <div className="text-muted small fw-semibold">Squad Readiness</div>
              <div className="h4 fw-bold mb-0 text-dark">
                {activeMissions.length > 0 ? 'Deployed' : 'Available'}
              </div>
              <small className="text-muted">{currentTeam.membersCount} crew members</small>
            </div>
            <div className="stat-icon bg-primary-subtle">
              <ShieldCheck size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* Missions Container */}
      <div className="resq-card">
        {/* Navigation Tabs for Active Missions vs Completed History */}
        <div className="resq-card-header d-flex flex-wrap align-items-center justify-content-between gap-2">
          <div className="d-flex align-items-center gap-2">
            <Navigation size={18} className="text-danger" />
            <h6 className="mb-0 fw-bold text-dark">
              Missions for {currentTeam.name}
            </h6>
          </div>

          <div className="btn-group btn-group-sm" role="group">
            <button
              type="button"
              className={`btn ${viewTab === 'active' ? 'btn-danger fw-semibold' : 'btn-outline-secondary'}`}
              onClick={() => setViewTab('active')}
            >
              Active Missions ({activeMissions.length})
            </button>
            <button
              type="button"
              className={`btn ${viewTab === 'completed' ? 'btn-success fw-semibold' : 'btn-outline-secondary'}`}
              onClick={() => setViewTab('completed')}
            >
              Completed History ({completedMissions.length})
            </button>
            <button
              type="button"
              className={`btn ${viewTab === 'all' ? 'btn-dark' : 'btn-outline-secondary'}`}
              onClick={() => setViewTab('all')}
            >
              All ({allTeamMissions.length})
            </button>
          </div>
        </div>

        <div className="resq-card-body p-4">
          {displayedMissions.length === 0 ? (
            <div className="text-center p-5 text-muted">
              <CheckCircle size={36} className="text-success opacity-75 mb-2 mx-auto d-block" />
              <h6 className="fw-bold text-dark">
                {viewTab === 'completed'
                  ? 'No Completed Missions Yet'
                  : 'No Active Missions Assigned'}
              </h6>
              <p className="small mb-0 text-secondary">
                {viewTab === 'completed'
                  ? `Completed emergency missions for ${currentTeam.name} will appear here.`
                  : `${currentTeam.name} is on standby. Use the Admin Dashboard to assign incidents to this squad.`}
              </p>
            </div>
          ) : (
            <div className="row g-3">
              {displayedMissions.map((inc) => {
                const isCompleted = inc.status === 'Completed' || inc.status === 'Resolved';
                const currentStep = getStepIndex(inc.status);

                return (
                  <div className="col-12 col-xl-6" key={inc.id}>
                    <div className="border rounded p-3 bg-white h-100 shadow-sm d-flex flex-column justify-content-between">
                      <div>
                        {/* Top Bar: Incident ID, Severity, Status */}
                        <div className="d-flex align-items-center justify-content-between mb-2">
                          <div className="d-flex align-items-center gap-2">
                            <span className="badge bg-dark fw-bold">{inc.id}</span>
                            <span className={getSeverityBadge(inc.severity)}>
                              {inc.severity} Severity
                            </span>
                          </div>
                          <span className={getStatusBadge(inc.status)}>
                            {inc.status}
                          </span>
                        </div>

                        {/* Title & Emergency Type */}
                        <div className="d-flex align-items-start gap-2 mb-2">
                          <div className="mt-1">{getIncidentIcon(inc.type)}</div>
                          <div>
                            <h6 className="fw-bold text-dark mb-1">
                              {inc.title || `${inc.type} Incident`}
                            </h6>
                            <div className="text-danger small fw-semibold d-flex align-items-center gap-1">
                              <MapPin size={13} />
                              {inc.location}
                            </div>
                          </div>
                        </div>

                        {/* Assigned Team & Details Bar */}
                        <div className="p-2 bg-light rounded text-secondary small mb-3 border">
                          <div className="mb-1">
                            <strong className="text-dark">Assigned Squad: </strong>
                            <span className="text-primary fw-semibold">
                              {inc.assignedTeamName || currentTeam.name}
                            </span>
                          </div>
                          <div>
                            <strong className="text-dark">Situation: </strong>
                            {inc.description}
                          </div>
                        </div>

                        {/* Impact & Timestamp */}
                        <div className="d-flex justify-content-between text-muted small mb-3">
                          <span className="d-flex align-items-center gap-1">
                            <Users size={13} />
                            People Affected: <strong className="text-dark">{inc.peopleAffected}</strong>
                          </span>
                          <span className="d-flex align-items-center gap-1">
                            <Clock size={13} />
                            {new Date(inc.reportedAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>

                        {/* Visual Workflow Steps (Assigned -> On the Way -> Reached -> In Progress -> Completed) */}
                        <div className="p-2 mb-3 bg-light rounded border">
                          <div className="d-flex align-items-center justify-content-between small text-muted mb-1" style={{ fontSize: '0.72rem' }}>
                            <span className="fw-semibold">MISSION PROGRESSION:</span>
                            <span className="fw-bold text-dark">{inc.status}</span>
                          </div>
                          <div className="d-flex gap-1">
                            {workflowSteps.map((step, idx) => {
                              const isCurrentOrPassed = currentStep >= idx;
                              return (
                                <div
                                  key={step}
                                  className="flex-fill rounded"
                                  style={{
                                    height: '6px',
                                    backgroundColor: isCurrentOrPassed
                                      ? idx === 4
                                        ? '#16a34a'
                                        : '#dc2626'
                                      : '#cbd5e1'
                                  }}
                                  title={step}
                                />
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      {/* Status Update Buttons */}
                      <div className="pt-3 border-top">
                        <div className="d-flex align-items-center justify-content-between mb-2">
                          <span className="text-muted small fw-semibold">
                            Update Operational Status:
                          </span>
                          <button
                            type="button"
                            className="btn btn-sm btn-link text-secondary p-0 d-flex align-items-center gap-1"
                            style={{ fontSize: '0.75rem' }}
                            onClick={() => setSelectedIncident(inc)}
                          >
                            <Eye size={12} /> View Full Incident
                          </button>
                        </div>

                        {/* The 5 step buttons: Assigned -> On the Way -> Reached -> In Progress -> Completed */}
                        <div className="d-flex flex-wrap gap-1">
                          <button
                            type="button"
                            className={`btn btn-sm ${
                              inc.status === 'Assigned'
                                ? 'btn-danger fw-bold'
                                : 'btn-outline-secondary'
                            }`}
                            style={{ fontSize: '0.74rem' }}
                            onClick={() =>
                              updateIncidentStatus(
                                inc.id,
                                'Assigned',
                                `${currentTeam.name} acknowledged mission assignment.`
                              )
                            }
                          >
                            Assigned
                          </button>

                          <button
                            type="button"
                            className={`btn btn-sm ${
                              inc.status === 'On the Way'
                                ? 'btn-primary fw-bold'
                                : 'btn-outline-primary'
                            }`}
                            style={{ fontSize: '0.74rem' }}
                            onClick={() =>
                              updateIncidentStatus(
                                inc.id,
                                'On the Way',
                                `${currentTeam.name} is on the way to ${inc.location.split(',')[0]}.`
                              )
                            }
                          >
                            On the Way
                          </button>

                          <button
                            type="button"
                            className={`btn btn-sm ${
                              inc.status === 'Reached'
                                ? 'btn-info text-white fw-bold'
                                : 'btn-outline-info'
                            }`}
                            style={{ fontSize: '0.74rem' }}
                            onClick={() =>
                              updateIncidentStatus(
                                inc.id,
                                'Reached',
                                `${currentTeam.name} reached the scene at ${inc.location}.`
                              )
                            }
                          >
                            Reached
                          </button>

                          <button
                            type="button"
                            className={`btn btn-sm ${
                              inc.status === 'In Progress'
                                ? 'btn-warning text-dark fw-bold'
                                : 'btn-outline-warning'
                            }`}
                            style={{ fontSize: '0.74rem' }}
                            onClick={() =>
                              updateIncidentStatus(
                                inc.id,
                                'In Progress',
                                `${currentTeam.name} is actively executing rescue operations.`
                              )
                            }
                          >
                            In Progress
                          </button>

                          <button
                            type="button"
                            className={`btn btn-sm ${
                              isCompleted ? 'btn-success fw-bold' : 'btn-outline-success'
                            }`}
                            style={{ fontSize: '0.74rem' }}
                            onClick={() =>
                              updateIncidentStatus(
                                inc.id,
                                'Completed',
                                `Rescue operation successfully completed by ${currentTeam.name}. Scene secured.`
                              )
                            }
                          >
                            <Check size={12} className="d-inline me-1" />
                            Completed
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

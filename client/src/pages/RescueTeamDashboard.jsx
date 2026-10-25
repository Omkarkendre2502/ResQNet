import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { formatRelativeTime } from '../hooks/useRelativeTime';
import {
  Ambulance,
  MapPin,
  CheckCircle2,
  Eye,
  Flame,
  Waves,
  Car,
  Building2,
  AlertTriangle,
  Users,
  Clock,
  Navigation,
  Phone,
  Radio,
  ExternalLink,
  Shield,
  Truck,
  Check,
  Loader2,
  Sparkles,
  Info
} from 'lucide-react';
import PageHeader from '../components/dashboard/PageHeader';
import StatCard from '../components/dashboard/StatCard';
import StatusBadge from '../components/dashboard/StatusBadge';
import SeverityBadge from '../components/dashboard/SeverityBadge';
import ProgressTimeline from '../components/dashboard/ProgressTimeline';
import EmptyState from '../components/dashboard/EmptyState';

/**
 * Tactical Field Terminal for Pune Rescue Squads.
 * Strict forward-only lifecycle: Assigned -> On the Way -> Reached -> In Progress -> Completed.
 * Shows only the assigned squad (rescue role) or squad selector (admin role).
 */
export const RescueTeamDashboard = () => {
  const {
    currentUser,
    rescueTeams = [],
    activeTeamId,
    setActiveTeamId,
    incidents = [],
    updateIncidentStatus,
    setSelectedIncident,
    showToast
  } = useApp();

  const [viewTab, setViewTab] = useState('active'); // 'active' | 'completed' | 'all'

  // Modal for status action confirmation with optional field note
  const [statusConfirmTarget, setStatusConfirmTarget] = useState(null);
  const [statusNote, setStatusNote] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Track known mission IDs to highlight newly assigned missions with "New" badge and toast
  const knownMissionIdsRef = useRef(new Set());
  const isFirstMountRef = useRef(true);
  const [newlyAssignedIds, setNewlyAssignedIds] = useState(() => new Set());

  // Determine current active team
  // Rescue user: LOCKED to their assigned teamId. Admin user: can switch squads.
  const currentTeam = useMemo(() => {
    if (currentUser?.role === 'rescue' && currentUser?.teamId) {
      const found = rescueTeams.find(
        (t) => String(t.id).toLowerCase() === String(currentUser.teamId).toLowerCase()
      );
      if (found) return found;
    }
    return rescueTeams.find((t) => t.id === activeTeamId) || rescueTeams[0] || {
      id: 'PERT-01',
      name: 'Pune Emergency Response Team 1',
      leader: 'Officer in Charge',
      currentLocation: 'Pune Central',
      vehicle: 'Heavy Rescue Tender',
      membersCount: 6,
      status: 'Available'
    };
  }, [currentUser, rescueTeams, activeTeamId]);

  // Check if an incident belongs to this squad
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
  const allTeamMissions = useMemo(() => {
    return incidents.filter((inc) => isAssignedToTeam(inc, currentTeam));
  }, [incidents, currentTeam]);

  const activeMissions = useMemo(() => {
    return allTeamMissions.filter(
      (inc) => inc.status !== 'Completed' && inc.status !== 'Resolved'
    );
  }, [allTeamMissions]);

  const completedMissions = useMemo(() => {
    return allTeamMissions.filter(
      (inc) => inc.status === 'Completed' || inc.status === 'Resolved'
    );
  }, [allTeamMissions]);

  // Detect newly assigned missions after polling refresh
  useEffect(() => {
    const currentActiveIds = new Set(activeMissions.map((m) => m.id));

    if (isFirstMountRef.current) {
      isFirstMountRef.current = false;
      knownMissionIdsRef.current = currentActiveIds;
      return;
    }

    const newIds = [];
    currentActiveIds.forEach((id) => {
      if (!knownMissionIdsRef.current.has(id)) {
        newIds.push(id);
      }
    });

    if (newIds.length > 0) {
      setNewlyAssignedIds((prev) => new Set([...prev, ...newIds]));
      showToast(`Tactical Dispatch Alert: ${newIds.length} new mission assigned to ${currentTeam.name}!`, 'info');
      knownMissionIdsRef.current = currentActiveIds;
    }
  }, [activeMissions, currentTeam.name, showToast]);

  const displayedMissions =
    viewTab === 'active'
      ? activeMissions
      : viewTab === 'completed'
      ? completedMissions
      : allTeamMissions;

  // Type icon helper
  const getTypeIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'fire':
        return <Flame size={16} className="text-danger flex-shrink-0" />;
      case 'flood':
        return <Waves size={16} className="text-primary flex-shrink-0" />;
      case 'accident':
        return <Car size={16} className="text-warning flex-shrink-0" />;
      case 'building collapse':
        return <Building2 size={16} className="text-danger flex-shrink-0" />;
      default:
        return <AlertTriangle size={16} className="text-secondary flex-shrink-0" />;
    }
  };

  // Next allowed forward step mapping
  const getNextStepConfig = (status) => {
    switch (status) {
      case 'Reported':
      case 'Assigned':
        return {
          nextStatus: 'On the Way',
          buttonLabel: 'Mark: On the Way',
          buttonClass: 'btn-primary',
          icon: Navigation,
          promptText: 'Advance squad status to "On the Way"? Squad vehicle is en route.',
          defaultNote: `${currentTeam.name} has departed base and is en route to scene.`
        };
      case 'On the Way':
        return {
          nextStatus: 'Reached',
          buttonLabel: 'Mark: Reached Scene',
          buttonClass: 'btn-info text-white',
          icon: MapPin,
          promptText: 'Confirm squad arrival at emergency scene?',
          defaultNote: `${currentTeam.name} reached incident location and secured perimeter.`
        };
      case 'Reached':
        return {
          nextStatus: 'In Progress',
          buttonLabel: 'Mark: In Progress',
          buttonClass: 'btn-warning text-dark',
          icon: Radio,
          promptText: 'Begin active containment and rescue operations?',
          defaultNote: `${currentTeam.name} initiated active rescue operations on site.`
        };
      case 'In Progress':
        return {
          nextStatus: 'Completed',
          buttonLabel: 'Mark: Mission Completed',
          buttonClass: 'btn-success',
          icon: CheckCircle2,
          promptText: 'Declare emergency operation resolved and scene secure?',
          defaultNote: `Emergency rescue mission successfully completed by ${currentTeam.name}.`
        };
      default:
        return null;
    }
  };

  // Open confirmation modal for status update
  const handleOpenStatusModal = (incident) => {
    const nextConfig = getNextStepConfig(incident.status);
    if (!nextConfig) return;
    setStatusConfirmTarget({
      incident,
      nextConfig
    });
    setStatusNote(nextConfig.defaultNote);
  };

  // Execute confirmed status update
  const handleExecuteStatusUpdate = async () => {
    if (!statusConfirmTarget) return;
    const { incident, nextConfig } = statusConfirmTarget;
    setIsUpdatingStatus(true);
    try {
      await updateIncidentStatus(
        incident.id,
        nextConfig.nextStatus,
        statusNote.trim() || nextConfig.defaultNote
      );
      // Remove from newly assigned highlight
      setNewlyAssignedIds((prev) => {
        const next = new Set(prev);
        next.delete(incident.id);
        return next;
      });
      setStatusConfirmTarget(null);
    } catch (err) {
      // toast shown in context
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Squad readiness status badge
  const readinessText = activeMissions.length > 0 ? 'On Mission' : 'Standby / Available';
  const readinessVariant = activeMissions.length > 0 ? 'warning' : 'success';

  return (
    <div className="rescue-dashboard container-fluid p-3 p-lg-4">
      {/* 1. Tactical Terminal Header */}
      <PageHeader
        title={`Field Terminal • ${currentTeam.name}`}
        subtitle={`Command Sector: ${currentTeam.currentLocation} • Squad Leader: ${currentTeam.leader} • Crew Size: ${currentTeam.membersCount} personnel.`}
        roleBadge={currentTeam.id}
        extraActions={
          currentUser?.role === 'admin' ? (
            <div className="d-flex align-items-center gap-1.5 ms-2">
              <span className="small text-secondary fw-semibold">Switch Squad:</span>
              <select
                className="form-select form-select-sm border-secondary-subtle"
                value={currentTeam.id}
                onChange={(e) => setActiveTeamId(e.target.value)}
                style={{ width: 'auto' }}
                aria-label="Switch rescue team"
              >
                {rescueTeams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.id})
                  </option>
                ))}
              </select>
            </div>
          ) : null
        }
      />

      {/* 2. Squad Information & Readiness Badge Banner */}
      <div className="resq-card p-3 p-md-4 mb-4 bg-white border shadow-sm">
        <div className="row align-items-center g-3">
          <div className="col-md-8">
            <div className="d-flex align-items-center gap-3">
              <div
                className="rounded-circle d-flex align-items-center justify-content-center p-3 bg-danger-subtle text-danger flex-shrink-0"
                style={{ width: '54px', height: '54px' }}
              >
                <Ambulance size={26} />
              </div>
              <div>
                <div className="d-flex align-items-center gap-2 mb-1">
                  <h4 className="fw-bold text-dark mb-0 fs-5">{currentTeam.name}</h4>
                  <span
                    className={`badge ${
                      readinessVariant === 'success'
                        ? 'bg-success-subtle text-success border border-success-subtle'
                        : 'bg-warning-subtle text-warning-emphasis border border-warning-subtle'
                    } py-1 px-2.5 fw-semibold small`}
                  >
                    {readinessText}
                  </span>
                </div>
                <div className="text-secondary small d-flex flex-wrap align-items-center gap-3">
                  <span><strong>Leader:</strong> {currentTeam.leader}</span>
                  <span>•</span>
                  <span><strong>Depot:</strong> {currentTeam.currentLocation}</span>
                  <span>•</span>
                  <span><strong>Vehicle:</strong> {currentTeam.vehicle || 'Heavy Tactical Unit'}</span>
                  <span>•</span>
                  <span><strong>Crew:</strong> {currentTeam.membersCount || 6} personnel</span>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-4 text-md-end">
            {currentTeam.phone && (
              <a
                href={`tel:${currentTeam.phone}`}
                className="btn btn-sm btn-outline-danger d-inline-flex align-items-center gap-1.5 px-3 py-1.5"
              >
                <Phone size={14} />
                <span>Base Radio: {currentTeam.phone}</span>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* 3. Stat Cards */}
      <div className="stat-card-grid">
        <StatCard
          icon={<Navigation size={20} />}
          value={activeMissions.length}
          label="Active Missions"
          sublabel="In progress or en route"
          variant="danger"
          isActive={viewTab === 'active'}
          onClick={() => setViewTab('active')}
        />

        <StatCard
          icon={<CheckCircle2 size={20} />}
          value={completedMissions.length}
          label="Completed History"
          sublabel="Missions resolved by this squad"
          variant="success"
          isActive={viewTab === 'completed'}
          onClick={() => setViewTab('completed')}
        />

        <StatCard
          icon={<Shield size={20} />}
          value={readinessText}
          label="Operational Readiness"
          sublabel={`${currentTeam.membersCount || 6} crew certified`}
          variant={readinessVariant}
        />
      </div>

      {/* 4. Missions Container */}
      <div className="resq-card shadow-sm border mb-4">
        {/* Navigation Tabs */}
        <div className="p-3 border-bottom d-flex flex-wrap align-items-center justify-content-between gap-3 bg-light-subtle">
          <div className="d-flex align-items-center gap-2">
            <Radio size={16} className="text-danger" />
            <h5 className="fw-bold text-dark mb-0 fs-6">Tactical Mission Queue</h5>
            <span className="badge bg-navy text-white rounded-pill px-2.5">
              {displayedMissions.length}
            </span>
          </div>

          <div className="btn-group btn-group-sm" role="group" aria-label="Filter missions">
            <button
              type="button"
              className={`btn ${viewTab === 'active' ? 'btn-danger' : 'btn-outline-secondary'}`}
              onClick={() => setViewTab('active')}
            >
              Active Missions ({activeMissions.length})
            </button>
            <button
              type="button"
              className={`btn ${viewTab === 'completed' ? 'btn-success' : 'btn-outline-secondary'}`}
              onClick={() => setViewTab('completed')}
            >
              Completed ({completedMissions.length})
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

        {/* Missions Cards Body */}
        <div className="p-3 p-md-4 bg-light-subtle">
          {displayedMissions.length === 0 ? (
            <EmptyState
              icon={<CheckCircle2 size={32} className="text-success" />}
              title={viewTab === 'completed' ? 'No completed missions recorded' : 'No active missions assigned'}
              description={
                viewTab === 'completed'
                  ? `Completed missions resolved by ${currentTeam.name} will appear here.`
                  : `${currentTeam.name} is on standby. All personnel and vehicles are stationed ready for emergency dispatch.`
              }
            />
          ) : (
            <div className="row g-3">
              {displayedMissions.map((inc) => {
                const isNew = newlyAssignedIds.has(inc.id);
                const nextStep = getNextStepConfig(inc.status);
                const isCompleted = inc.status === 'Completed' || inc.status === 'Resolved';
                const { relativeTime } = formatRelativeTime(inc.reportedAt);

                // Google Maps & OSM navigation URL
                const mapLink = inc.coordinates
                  ? `https://www.google.com/maps/dir/?api=1&destination=${inc.coordinates[0]},${inc.coordinates[1]}`
                  : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(inc.location + ' Pune')}`;

                return (
                  <div key={inc.id} className="col-12 col-xl-6">
                    <div className="resq-card p-3 p-md-4 bg-white shadow-sm border h-100 d-flex flex-column justify-content-between position-relative">
                      {/* Top Bar */}
                      <div>
                        <div className="d-flex align-items-center justify-content-between mb-2">
                          <div className="d-flex align-items-center gap-2">
                            <span className="badge bg-dark font-monospace fw-bold py-1 px-2">
                              {inc.id}
                            </span>
                            <SeverityBadge severity={inc.severity} size="sm" />
                            {isNew && (
                              <span className="badge bg-danger text-white pulse-badge small">
                                <Sparkles size={11} className="me-1 inline" />
                                New
                              </span>
                            )}
                          </div>
                          <StatusBadge status={inc.status} size="sm" />
                        </div>

                        {/* Title & Emergency Type */}
                        <div className="d-flex align-items-start gap-2 mb-2">
                          <div className="mt-1">{getTypeIcon(inc.type)}</div>
                          <div className="flex-grow-1">
                            <h6 className="fw-bold text-dark mb-1">
                              {inc.title || `${inc.type} Emergency`}
                            </h6>
                            <div className="d-flex align-items-center gap-2 flex-wrap">
                              <span className="text-secondary small d-flex align-items-center gap-1">
                                <MapPin size={12} className="text-danger flex-shrink-0" />
                                <strong>{inc.location}</strong>
                              </span>
                              <a
                                href={mapLink}
                                target="_blank"
                                rel="noreferrer"
                                className="btn btn-sm btn-link text-primary p-0 d-inline-flex align-items-center gap-1 small"
                                style={{ fontSize: '0.74rem' }}
                                title="Open GPS navigation in Google Maps"
                              >
                                <ExternalLink size={12} />
                                <span>Navigate</span>
                              </a>
                            </div>
                          </div>
                        </div>

                        {/* Description */}
                        <p className="text-secondary small mb-3 p-2.5 rounded bg-light border lh-base">
                          {inc.description || 'No situational details reported.'}
                        </p>

                        {/* Affected & Contact Info */}
                        <div className="row g-2 mb-3 small">
                          <div className="col-sm-6">
                            <span className="text-muted">People Affected:</span>{' '}
                            <strong className="text-dark">{inc.peopleAffected || 0}</strong>
                          </div>
                          <div className="col-sm-6">
                            <span className="text-muted">Elapsed Time:</span>{' '}
                            <strong className="text-dark font-monospace">{relativeTime}</strong>
                          </div>
                          {inc.reporterPhone && (
                            <div className="col-12">
                              <span className="text-muted">Reporter Line:</span>{' '}
                              <a
                                href={`tel:${inc.reporterPhone}`}
                                className="text-danger fw-semibold text-decoration-none ms-1"
                              >
                                <Phone size={12} className="me-1 inline" />
                                {inc.reporterPhone} (Call Reporter)
                              </a>
                            </div>
                          )}
                        </div>

                        {/* 6-Stage Progress Timeline */}
                        <div className="p-2 mb-3 rounded bg-light border">
                          <div className="d-flex align-items-center justify-content-between small text-muted mb-1" style={{ fontSize: '0.7rem' }}>
                            <span className="fw-bold text-uppercase">Mission Progression:</span>
                            <span className="fw-bold text-dark">{inc.status}</span>
                          </div>
                          <ProgressTimeline
                            currentStatus={inc.status}
                            timeline={inc.timeline || []}
                            orientation="horizontal"
                          />
                        </div>
                      </div>

                      {/* Bottom Operational Action Bar */}
                      <div className="border-top pt-3 d-flex flex-column gap-2">
                        {/* Prominent Next Allowed Step Button */}
                        {nextStep && !isCompleted && (
                          <button
                            type="button"
                            className={`btn ${nextStep.buttonClass} d-inline-flex align-items-center justify-content-center gap-2 py-2 fw-bold w-100 shadow-sm`}
                            onClick={() => handleOpenStatusModal(inc)}
                          >
                            <nextStep.icon size={16} />
                            <span>{nextStep.buttonLabel} &rarr;</span>
                          </button>
                        )}

                        {isCompleted && (
                          <div className="p-2 bg-success-subtle border border-success-subtle text-success rounded text-center small fw-semibold d-flex align-items-center justify-content-center gap-1.5">
                            <CheckCircle2 size={16} />
                            <span>Mission Completed &bull; Operations Secured</span>
                          </div>
                        )}

                        <div className="d-flex justify-content-end">
                          <button
                            type="button"
                            className="btn btn-sm btn-link text-secondary p-0 d-inline-flex align-items-center gap-1 small"
                            style={{ fontSize: '0.75rem' }}
                            onClick={() => setSelectedIncident(inc)}
                          >
                            <Eye size={13} />
                            <span>View Full Incident Dossier</span>
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

      {/* 5. Status Advance Confirmation Modal with Field Notes */}
      {statusConfirmTarget && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          role="dialog"
          aria-modal="true"
          style={{ backgroundColor: 'rgba(11, 19, 41, 0.72)', zIndex: 1060 }}
        >
          <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '460px' }}>
            <div className="modal-content border-0 shadow-lg rounded-3">
              <div className="modal-header bg-navy text-white py-3 px-4">
                <div className="d-flex align-items-center gap-2">
                  <Shield size={16} className="text-danger" />
                  <h5 className="modal-title fw-bold fs-6 mb-0">Advance Tactical Status</h5>
                </div>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setStatusConfirmTarget(null)}
                  disabled={isUpdatingStatus}
                ></button>
              </div>

              <div className="modal-body p-4 bg-light-subtle">
                <div className="p-3 bg-white rounded border mb-3">
                  <div className="d-flex align-items-center justify-content-between mb-1">
                    <span className="badge bg-dark font-monospace">{statusConfirmTarget.incident.id}</span>
                    <span className="text-muted small">
                      Current: <strong className="text-dark">{statusConfirmTarget.incident.status}</strong>
                    </span>
                  </div>
                  <div className="fw-bold text-dark small">{statusConfirmTarget.incident.location}</div>
                </div>

                <div className="mb-3">
                  <div className="small fw-semibold text-dark mb-1">
                    Next Allowed Stage:
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <StatusBadge status={statusConfirmTarget.nextConfig.nextStatus} size="normal" />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-bold text-dark">
                    Situational Note / Field Report (Optional):
                  </label>
                  <textarea
                    rows="3"
                    className="form-control form-control-sm"
                    value={statusNote}
                    onChange={(e) => setStatusNote(e.target.value)}
                    placeholder="Enter dispatch notes, arrival time, or site conditions..."
                    disabled={isUpdatingStatus}
                  ></textarea>
                </div>
              </div>

              <div className="modal-footer bg-light px-4 py-2.5 border-top d-flex justify-content-end gap-2">
                <button
                  type="button"
                  className="btn btn-sm btn-outline-secondary px-3"
                  onClick={() => setStatusConfirmTarget(null)}
                  disabled={isUpdatingStatus}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-sm btn-resq-danger d-inline-flex align-items-center gap-1.5 px-3 py-1.5 fw-semibold"
                  onClick={handleExecuteStatusUpdate}
                  disabled={isUpdatingStatus}
                >
                  {isUpdatingStatus ? <Loader2 size={13} className="spin-anim" /> : <Check size={14} />}
                  <span>Confirm Status Update</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RescueTeamDashboard;

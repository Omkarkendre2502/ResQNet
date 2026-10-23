import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  ShieldCheck,
  Siren,
  Ambulance,
  CheckCircle,
  Eye,
  UserPlus,
  MapPin,
  ClipboardList,
  Flame,
  Waves,
  Car,
  Building2,
  AlertTriangle,
  Users,
  Phone,
  RefreshCw,
  Mail,
  UserCheck,
  Calendar
} from 'lucide-react';

export const AdminDashboard = ({ onOpenAssignModal }) => {
  const { incidents, rescueTeams, setSelectedIncident, registeredUsers, fetchUsers } = useApp();
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [activeTab, setActiveTab] = useState('incidents'); // 'incidents' | 'teams' | 'users'
  const [usersLoading, setUsersLoading] = useState(false);

  // Fetch users when users tab is activated
  useEffect(() => {
    if (activeTab === 'users') {
      setUsersLoading(true);
      fetchUsers().finally(() => setUsersLoading(false));
    }
  }, [activeTab, fetchUsers]);
  // Summary Metrics
  const totalIncidents = incidents.length;
  const criticalIncidents = incidents.filter(
    (i) => i.severity === 'Critical' && i.status !== 'Completed' && i.status !== 'Resolved'
  ).length;
  const availableRescueTeams = rescueTeams.filter((t) => t.status === 'Available').length;
  const resolvedIncidents = incidents.filter(
    (i) => i.status === 'Completed' || i.status === 'Resolved'
  ).length;

  // Filtered Incidents
  const filteredIncidents = incidents.filter((inc) => {
    if (filterSeverity !== 'all' && inc.severity.toLowerCase() !== filterSeverity.toLowerCase()) {
      return false;
    }
    const isCompleted = inc.status === 'Completed' || inc.status === 'Resolved';
    if (filterStatus === 'active' && isCompleted) return false;
    if (filterStatus === 'resolved' && !isCompleted) return false;
    return true;
  });

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
      {/* Admin Header */}
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div>
          <div className="d-flex align-items-center gap-2">
            <span className="badge bg-danger text-uppercase fw-semibold">Control Center</span>
            <span className="text-muted small">Pune Municipal Emergency Response</span>
          </div>
          <h4 className="fw-bold text-dark mb-0 mt-1">
            Admin Dashboard — Rahul Patil
          </h4>
        </div>
        <div className="d-flex align-items-center gap-2">
          <span className="badge bg-success-subtle text-success border border-success-subtle d-inline-flex align-items-center gap-1">
            <ShieldCheck size={14} /> Dispatch Network Active
          </span>
        </div>
      </div>

      {/* 4 Summary Cards */}
      <div className="row g-3 mb-4">        {/* Total Incidents */}
        <div className="col-sm-6 col-xl-3">
          <div className="stat-card">
            <div>
              <div className="text-muted small fw-semibold">Total Incidents</div>
              <div className="h3 fw-bold mb-0 text-dark">{totalIncidents}</div>
              <small className="text-muted">Recorded in Pune zone</small>
            </div>
            <div className="stat-icon bg-primary-subtle">
              <ClipboardList size={20} />
            </div>
          </div>
        </div>

        {/* Critical Incidents */}
        <div className="col-sm-6 col-xl-3">
          <div className="stat-card">
            <div>
              <div className="text-muted small fw-semibold">Critical Incidents</div>
              <div className="h3 fw-bold mb-0 text-danger">{criticalIncidents}</div>
              <small className="text-danger fw-semibold">Immediate squad required</small>
            </div>
            <div className="stat-icon bg-danger-subtle">
              <Siren size={20} />
            </div>
          </div>
        </div>

        {/* Available Rescue Teams */}
        <div className="col-sm-6 col-xl-3">
          <div className="stat-card">
            <div>
              <div className="text-muted small fw-semibold">Available Rescue Units</div>
              <div className="h3 fw-bold mb-0 text-success">{availableRescueTeams} / {rescueTeams.length}</div>
              <small className="text-muted">Ready for deployment</small>
            </div>
            <div className="stat-icon bg-success-subtle">
              <Ambulance size={20} />
            </div>
          </div>
        </div>

        {/* Resolved Incidents */}
        <div className="col-sm-6 col-xl-3">
          <div className="stat-card">
            <div>
              <div className="text-muted small fw-semibold">Completed Missions</div>
              <div className="h3 fw-bold mb-0 text-info">{resolvedIncidents}</div>
              <small className="text-muted">Successfully mitigated</small>
            </div>
            <div className="stat-icon bg-info-subtle">
              <CheckCircle size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="d-flex gap-2 mb-4 border-bottom pb-2">
        <button
          className={`btn btn-sm d-flex align-items-center gap-1 ${activeTab === 'incidents' ? 'btn-danger' : 'btn-outline-secondary'}`}
          onClick={() => setActiveTab('incidents')}
        >
          <ClipboardList size={15} /> Incidents
          <span className="badge bg-white text-danger ms-1">{incidents.length}</span>
        </button>
        <button
          className={`btn btn-sm d-flex align-items-center gap-1 ${activeTab === 'teams' ? 'btn-danger' : 'btn-outline-secondary'}`}
          onClick={() => setActiveTab('teams')}
        >
          <Ambulance size={15} /> Rescue Teams
          <span className={`badge ms-1 ${activeTab === 'teams' ? 'bg-white text-danger' : 'bg-danger text-white'}`}>{rescueTeams.length}</span>
        </button>
        <button
          className={`btn btn-sm d-flex align-items-center gap-1 ${activeTab === 'users' ? 'btn-danger' : 'btn-outline-secondary'}`}
          onClick={() => setActiveTab('users')}
        >
          <Users size={15} /> Registered Users
          {registeredUsers.length > 0 && (
            <span className={`badge ms-1 ${activeTab === 'users' ? 'bg-white text-danger' : 'bg-secondary text-white'}`}>{registeredUsers.length}</span>
          )}
        </button>
      </div>

      {/* Incidents Table */}
      {activeTab === 'incidents' && (
      <div className="resq-card mb-4">
        <div className="resq-card-header d-flex flex-wrap align-items-center justify-content-between gap-2">
          <div className="d-flex align-items-center gap-2">
            <ClipboardList size={18} className="text-danger" />
            <h6 className="mb-0 fw-bold text-dark">Pune Emergency Incidents</h6>
            <span className="badge bg-dark rounded-pill">{filteredIncidents.length}</span>
          </div>

          {/* Quick Filters */}
          <div className="d-flex flex-wrap gap-2">
            <select
              className="form-select form-select-sm"
              style={{ width: 'auto' }}
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            <select
              className="form-select form-select-sm"
              style={{ width: 'auto' }}
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="resolved">Completed Only</option>
            </select>
          </div>
        </div>

        <div className="resq-card-body p-0">
          {filteredIncidents.length === 0 ? (
            <div className="text-center p-5 text-muted">
              <ClipboardList size={32} className="opacity-50 mb-2 mx-auto d-block" />
              <h6>No emergencies in this filter</h6>
              <p className="small mb-0">No incidents currently match your selection.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light small text-uppercase text-secondary">
                  <tr>
                    <th className="ps-4">Incident ID</th>
                    <th>Emergency Type</th>
                    <th>Pune Location</th>
                    <th>Severity</th>
                    <th>Status</th>
                    <th>Assigned Squad</th>
                    <th className="text-end pe-4">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredIncidents.map((inc) => (
                    <tr key={inc.id}>
                      <td className="ps-4 fw-bold text-dark">{inc.id}</td>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          {getIncidentIcon(inc.type)}
                          <div>
                            <div className="fw-semibold text-dark">{inc.type}</div>
                            <small
                              className="text-muted text-truncate d-block"
                              style={{ maxWidth: '180px' }}
                            >
                              {inc.title || inc.description}
                            </small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="text-dark small fw-medium text-truncate" style={{ maxWidth: '240px' }}>
                          <MapPin size={13} className="text-danger me-1 d-inline" />
                          {inc.location}
                        </div>
                        <small className="text-muted">
                          Affected: {inc.peopleAffected} | Reporter: {inc.reportedBy}
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
                          <span className="badge bg-danger-subtle text-danger border border-danger-subtle small">
                            Unassigned
                          </span>
                        )}
                      </td>
                      <td className="text-end pe-4">
                        <div className="btn-group btn-group-sm">
                          <button
                            className="btn btn-outline-secondary d-inline-flex align-items-center gap-1"
                            onClick={() => setSelectedIncident(inc)}
                            title="View Details"
                          >
                            <Eye size={13} />
                            <span>Details</span>
                          </button>
                          <button
                            className="btn btn-resq-primary d-inline-flex align-items-center gap-1"
                            onClick={() => {
                              if (onOpenAssignModal) onOpenAssignModal(inc);
                            }}
                            title="Assign Rescue Squad"
                          >
                            <UserPlus size={13} />
                            <span>Assign</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      )} {/* end activeTab === 'incidents' */}

      {/* Rescue Teams Tab */}
      {activeTab === 'teams' && (
      <div className="resq-card">
        <div className="resq-card-header d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-2">
            <Ambulance size={18} className="text-danger" />
            <h6 className="mb-0 fw-bold text-dark">
              Pune Rescue Squads Roster
            </h6>
            <span className="badge bg-success-subtle text-success border border-success-subtle">
              {availableRescueTeams} Ready
            </span>
          </div>
          <small className="text-muted">Real-time availability</small>
        </div>

        <div className="resq-card-body p-3">
          <div className="row g-3">
            {rescueTeams.map((team) => {
              const isAvailable = team.status === 'Available';
              return (
                <div className="col-md-4" key={team.id}>
                  <div className="p-3 rounded border bg-white h-100">
                    <div className="d-flex align-items-start justify-content-between mb-2">
                      <div>
                        <div className="fw-bold text-dark small">{team.name}</div>
                        <span className="badge bg-light text-secondary border" style={{ fontSize: '0.68rem' }}>
                          {team.type}
                        </span>
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

                    <div className="text-secondary small mt-2">
                      <div>
                        <strong>Leader:</strong> {team.leader}
                      </div>
                      <div>
                        <strong>Members:</strong> {team.membersCount} Specialists
                      </div>
                      <div>
                        <Phone size={12} className="text-muted me-1 d-inline" />
                        {team.phone}
                      </div>
                      <div>
                        <MapPin size={12} className="text-danger me-1 d-inline" />
                        Base: {team.currentLocation}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      )} {/* end activeTab === 'teams' */}

      {/* Users Management Tab */}
      {activeTab === 'users' && (
      <div className="resq-card">
        <div className="resq-card-header d-flex flex-wrap align-items-center justify-content-between gap-2">
          <div className="d-flex align-items-center gap-2">
            <Users size={18} className="text-danger" />
            <h6 className="mb-0 fw-bold text-dark">Registered Users</h6>
            <span className="badge bg-dark rounded-pill">{registeredUsers.length}</span>
          </div>
          <button
            className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1"
            onClick={() => {
              setUsersLoading(true);
              fetchUsers().finally(() => setUsersLoading(false));
            }}
            disabled={usersLoading}
          >
            <RefreshCw size={13} className={usersLoading ? 'spin-anim' : ''} />
            {usersLoading ? 'Loading...' : 'Refresh'}
          </button>
        </div>

        <div className="resq-card-body p-0">
          {usersLoading ? (
            <div className="text-center p-5 text-muted">
              <div className="spinner-border spinner-border-sm text-danger me-2" role="status" />
              Loading users from database...
            </div>
          ) : registeredUsers.length === 0 ? (
            <div className="text-center p-5 text-muted">
              <Users size={32} className="opacity-50 mb-2 mx-auto d-block" />
              <h6>No users loaded yet</h6>
              <p className="small mb-2">Click Refresh to load users from the database.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light small text-uppercase text-secondary">
                  <tr>
                    <th className="ps-4">Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Phone</th>
                    <th className="pe-4">Registered</th>
                  </tr>
                </thead>
                <tbody>
                  {registeredUsers.map((u) => (
                    <tr key={u._id || u.id}>
                      <td className="ps-4">
                        <div className="d-flex align-items-center gap-2">
                          <div
                            className="d-flex align-items-center justify-content-center rounded-circle bg-danger text-white fw-bold"
                            style={{ width: 32, height: 32, fontSize: '0.75rem', flexShrink: 0 }}
                          >
                            {u.name ? u.name.charAt(0).toUpperCase() : '?'}
                          </div>
                          <div>
                            <div className="fw-semibold text-dark small">{u.name}</div>
                            {u.teamId && (
                              <span className="badge bg-primary-subtle text-primary border border-primary-subtle" style={{ fontSize: '0.65rem' }}>
                                {u.teamId}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="d-flex align-items-center gap-1 text-muted small">
                          <Mail size={12} />
                          {u.email}
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${
                          u.role === 'admin' ? 'bg-danger' :
                          u.role === 'rescue' ? 'bg-primary' :
                          'bg-success-subtle text-success border border-success-subtle'
                        }`}>
                          <UserCheck size={11} className="me-1 d-inline" />
                          {u.role}
                        </span>
                      </td>
                      <td>
                        {u.phone ? (
                          <div className="d-flex align-items-center gap-1 text-muted small">
                            <Phone size={12} />
                            {u.phone}
                          </div>
                        ) : (
                          <span className="text-muted small">—</span>
                        )}
                      </td>
                      <td className="pe-4">
                        {u.createdAt ? (
                          <div className="d-flex align-items-center gap-1 text-muted small">
                            <Calendar size={12} />
                            {new Date(u.createdAt).toLocaleDateString('en-IN', {
                              day: '2-digit', month: 'short', year: 'numeric'
                            })}
                          </div>
                        ) : (
                          <span className="text-muted small">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      )} {/* end activeTab === 'users' */}

    </div>
  );
};

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
  Calendar,
  Key,
  UserX,
  Trash2,
  Edit3,
  ShieldAlert,
  Activity,
  Copy,
  Check,
  Clock,
  Search,
  Lock,
  Download,
  ArrowUpDown,
  ArrowUp,
  ArrowDown
} from 'lucide-react';

export const AdminDashboard = ({ onOpenAssignModal }) => {
  const {
    incidents,
    rescueTeams,
    setSelectedIncident,
    registeredUsers,
    fetchUsers,
    currentUser,
    auditLogs,
    fetchAuditLogs,
    updateUserStatus,
    resetUserPassword,
    updateUserProfile,
    deleteUser,
    createRescueUser
  } = useApp();

  const [filterSeverity, setFilterSeverity] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [activeTab, setActiveTab] = useState('incidents'); // 'incidents' | 'teams' | 'users' | 'activity'
  const [usersLoading, setUsersLoading] = useState(false);
  const [logsLoading, setLogsLoading] = useState(false);

  // User Management State
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('all');
  const [userStatusFilter, setUserStatusFilter] = useState('all');

  // Modals State
  const [editingUser, setEditingUser] = useState(null);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');

  const [tempPasswordResult, setTempPasswordResult] = useState(null);
  const [copiedPass, setCopiedPass] = useState(false);

  const [showAddRescueModal, setShowAddRescueModal] = useState(false);
  const [addRescueForm, setAddRescueForm] = useState({
    name: '',
    email: '',
    password: '',
    teamId: 'PERT-01',
    phone: ''
  });
  const [addRescueError, setAddRescueError] = useState('');

  const [confirmStatusUser, setConfirmStatusUser] = useState(null);
  const [confirmDeleteUser, setConfirmDeleteUser] = useState(null);

  // Sync data on tab change
  useEffect(() => {
    if (activeTab === 'users') {
      setUsersLoading(true);
      fetchUsers().finally(() => setUsersLoading(false));
    } else if (activeTab === 'activity') {
      setLogsLoading(true);
      fetchAuditLogs().finally(() => setLogsLoading(false));
    }
  }, [activeTab, fetchUsers, fetchAuditLogs]);

  // Summary Metrics
  const totalIncidents = incidents.length;
  const criticalIncidents = incidents.filter(
    (i) => i.severity === 'Critical' && i.status !== 'Completed' && i.status !== 'Resolved'
  ).length;
  const availableRescueTeams = rescueTeams.filter((t) => t.status === 'Available').length;
  const resolvedIncidents = incidents.filter(
    (i) => i.status === 'Completed' || i.status === 'Resolved'
  ).length;

  // Incidents Sorting & CSV State
  const [incidentSortField, setIncidentSortField] = useState('reportedAt');
  const [incidentSortOrder, setIncidentSortOrder] = useState('desc');

  const handleSort = (field) => {
    if (incidentSortField === field) {
      setIncidentSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setIncidentSortField(field);
      setIncidentSortOrder('asc');
    }
  };

  const renderSortIndicator = (field) => {
    if (incidentSortField !== field) {
      return <ArrowUpDown size={12} className="text-muted ms-1 opacity-50" />;
    }
    return incidentSortOrder === 'asc' ? (
      <ArrowUp size={12} className="text-danger ms-1" />
    ) : (
      <ArrowDown size={12} className="text-danger ms-1" />
    );
  };

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

  const severityWeight = { Critical: 4, High: 3, Medium: 2, Low: 1 };

  const sortedIncidents = [...filteredIncidents].sort((a, b) => {
    let comp = 0;
    if (incidentSortField === 'id') {
      comp = String(a.id).localeCompare(String(b.id), undefined, { numeric: true });
    } else if (incidentSortField === 'severity') {
      comp = (severityWeight[a.severity] || 0) - (severityWeight[b.severity] || 0);
    } else if (incidentSortField === 'status') {
      comp = (a.status || '').localeCompare(b.status || '');
    } else if (incidentSortField === 'type') {
      comp = (a.type || '').localeCompare(b.type || '');
    } else if (incidentSortField === 'location') {
      comp = (a.location || '').localeCompare(b.location || '');
    } else {
      comp = new Date(a.reportedAt || 0) - new Date(b.reportedAt || 0);
    }
    return incidentSortOrder === 'asc' ? comp : -comp;
  });

  const exportIncidentsToCSV = () => {
    if (sortedIncidents.length === 0) return;
    const headers = [
      'Incident ID',
      'Emergency Type',
      'Title',
      'Location',
      'Severity',
      'Status',
      'People Affected',
      'Assigned Squad',
      'Reported At',
      'Reporter Name',
      'Reporter Phone'
    ];
    const rows = sortedIncidents.map((inc) => [
      `"${inc.id}"`,
      `"${(inc.type || '').replace(/"/g, '""')}"`,
      `"${(inc.title || '').replace(/"/g, '""')}"`,
      `"${(inc.location || '').replace(/"/g, '""')}"`,
      `"${inc.severity || ''}"`,
      `"${inc.status || ''}"`,
      `"${inc.peopleAffected || 0}"`,
      `"${(inc.assignedTeamName || inc.assignedTeamId || 'Unassigned').replace(/"/g, '""')}"`,
      `"${inc.reportedAt ? new Date(inc.reportedAt).toISOString() : ''}"`,
      `"${(inc.reporterName || '').replace(/"/g, '""')}"`,
      `"${(inc.reporterPhone || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `resqnet_pune_incidents_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Filtered Users
  const filteredUsers = registeredUsers.filter((u) => {
    if (userRoleFilter !== 'all' && u.role !== userRoleFilter) return false;
    if (userStatusFilter === 'active' && u.isActive === false) return false;
    if (userStatusFilter === 'inactive' && u.isActive !== false) return false;
    if (userSearch.trim()) {
      const q = userSearch.toLowerCase().trim();
      const matchName = u.name && u.name.toLowerCase().includes(q);
      const matchEmail = u.email && u.email.toLowerCase().includes(q);
      const matchPhone = u.phone && u.phone.includes(q);
      const matchTeam = u.teamId && u.teamId.toLowerCase().includes(q);
      if (!matchName && !matchEmail && !matchPhone && !matchTeam) return false;
    }
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

  // Handlers for User Management
  const handleOpenEditUser = (user) => {
    setEditingUser(user);
    setEditName(user.name || '');
    setEditPhone(user.phone || '');
    setEditEmail(user.email || '');
  };

  const handleSaveEditUser = async (e) => {
    e.preventDefault();
    if (!editingUser) return;
    const ok = await updateUserProfile(editingUser._id || editingUser.id, {
      name: editName,
      phone: editPhone,
      email: editEmail
    });
    if (ok) setEditingUser(null);
  };

  const handleResetPassword = async (user) => {
    try {
      const res = await resetUserPassword(user._id || user.id);
      setTempPasswordResult(res.tempPassword);
      setCopiedPass(false);
    } catch (err) {
      // toast shown in context
    }
  };

  const handleCopyTempPassword = () => {
    if (tempPasswordResult) {
      navigator.clipboard.writeText(tempPasswordResult);
      setCopiedPass(true);
      setTimeout(() => setCopiedPass(false), 2500);
    }
  };

  const handleToggleStatus = async () => {
    if (!confirmStatusUser) return;
    const nextStatus = confirmStatusUser.isActive === false;
    await updateUserStatus(confirmStatusUser._id || confirmStatusUser.id, nextStatus);
    setConfirmStatusUser(null);
  };

  const handleDeleteUser = async () => {
    if (!confirmDeleteUser) return;
    await deleteUser(confirmDeleteUser._id || confirmDeleteUser.id);
    setConfirmDeleteUser(null);
  };

  const handleCreateRescueSubmit = async (e) => {
    e.preventDefault();
    setAddRescueError('');
    if (!addRescueForm.name || !addRescueForm.email || !addRescueForm.password || !addRescueForm.teamId) {
      setAddRescueError('Please fill out all required fields.');
      return;
    }
    const ok = await createRescueUser(addRescueForm);
    if (ok) {
      setShowAddRescueModal(false);
      setAddRescueForm({ name: '', email: '', password: '', teamId: 'PERT-01', phone: '' });
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
            Admin Dashboard — {currentUser?.name || 'Administrator'}
          </h4>
        </div>
        <div className="d-flex align-items-center gap-2">
          <span className="badge bg-success-subtle text-success border border-success-subtle d-inline-flex align-items-center gap-1">
            <ShieldCheck size={14} /> Dispatch Network Active
          </span>
        </div>
      </div>

      {/* 4 Summary Cards */}
      <div className="row g-3 mb-4">
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

        <div className="col-sm-6 col-xl-3">
          <div className="stat-card">
            <div>
              <div className="text-muted small fw-semibold">Critical Incidents</div>
              <div className="h3 fw-bold mb-0 text-danger">{criticalIncidents}</div>
              <small className="text-danger fw-semibold">Immediate squad response</small>
            </div>
            <div className="stat-icon bg-danger-subtle">
              <Siren size={20} />
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-xl-3">
          <div className="stat-card">
            <div>
              <div className="text-muted small fw-semibold">Available Squads</div>
              <div className="h3 fw-bold mb-0 text-success">{availableRescueTeams}</div>
              <small className="text-muted">of {rescueTeams.length} ready for dispatch</small>
            </div>
            <div className="stat-icon bg-success-subtle">
              <Ambulance size={20} />
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-xl-3">
          <div className="stat-card">
            <div>
              <div className="text-muted small fw-semibold">Resolved Cases</div>
              <div className="h3 fw-bold mb-0 text-dark">{resolvedIncidents}</div>
              <small className="text-success fw-semibold">Missions completed</small>
            </div>
            <div className="stat-icon bg-success-subtle">
              <CheckCircle size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="d-flex flex-wrap gap-2 mb-4 border-bottom pb-2">
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
          <Users size={15} /> User Management
          <span className={`badge ms-1 ${activeTab === 'users' ? 'bg-white text-danger' : 'bg-secondary text-white'}`}>{registeredUsers.length}</span>
        </button>
        <button
          className={`btn btn-sm d-flex align-items-center gap-1 ${activeTab === 'activity' ? 'btn-danger' : 'btn-outline-secondary'}`}
          onClick={() => setActiveTab('activity')}
        >
          <Activity size={15} /> Activity Log
          {auditLogs.length > 0 && (
            <span className={`badge ms-1 ${activeTab === 'activity' ? 'bg-white text-danger' : 'bg-dark text-white'}`}>{auditLogs.length}</span>
          )}
        </button>
      </div>

      {/* TAB 1: Incidents Table */}
      {activeTab === 'incidents' && (
        <div className="resq-card mb-4">
          <div className="resq-card-header d-flex flex-wrap align-items-center justify-content-between gap-2">
            <div className="d-flex align-items-center gap-2">
              <ClipboardList size={18} className="text-danger" />
              <h6 className="mb-0 fw-bold text-dark">Pune Emergency Incidents</h6>
              <span className="badge bg-dark rounded-pill">{filteredIncidents.length}</span>
            </div>

            {/* Quick Filters & CSV Export */}
            <div className="d-flex flex-wrap align-items-center gap-2">
              <button
                type="button"
                className="btn btn-sm btn-outline-dark d-flex align-items-center gap-1"
                onClick={exportIncidentsToCSV}
                title="Export filtered emergency incidents to CSV spreadsheet"
                disabled={sortedIncidents.length === 0}
              >
                <Download size={14} />
                <span>Export CSV</span>
              </button>

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
                <option value="resolved">Resolved Only</option>
              </select>
            </div>
          </div>

          <div className="resq-card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light small text-uppercase text-secondary">
                  <tr>
                    <th
                      className="ps-4 user-select-none"
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleSort('id')}
                      title="Sort by Incident ID"
                    >
                      <div className="d-inline-flex align-items-center">
                        ID {renderSortIndicator('id')}
                      </div>
                    </th>
                    <th
                      className="user-select-none"
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleSort('type')}
                      title="Sort by Emergency Type"
                    >
                      <div className="d-inline-flex align-items-center">
                        Emergency Type {renderSortIndicator('type')}
                      </div>
                    </th>
                    <th
                      className="user-select-none"
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleSort('location')}
                      title="Sort by Location"
                    >
                      <div className="d-inline-flex align-items-center">
                        Location (Pune) {renderSortIndicator('location')}
                      </div>
                    </th>
                    <th
                      className="user-select-none"
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleSort('severity')}
                      title="Sort by Severity"
                    >
                      <div className="d-inline-flex align-items-center">
                        Severity {renderSortIndicator('severity')}
                      </div>
                    </th>
                    <th
                      className="user-select-none"
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleSort('status')}
                      title="Sort by Status"
                    >
                      <div className="d-inline-flex align-items-center">
                        Status {renderSortIndicator('status')}
                      </div>
                    </th>
                    <th>Assigned Squad</th>
                    <th className="pe-4 text-end">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedIncidents.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center py-5 text-muted">
                        <ClipboardList size={36} className="mb-2 text-secondary opacity-50" />
                        <div>No emergency incidents match current filter criteria.</div>
                      </td>
                    </tr>
                  ) : (
                    sortedIncidents.map((incident) => (
                      <tr key={incident.id}>
                        <td className="ps-4 fw-bold text-danger small">
                          #{incident.id}
                        </td>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            {getIncidentIcon(incident.type)}
                            <span className="fw-semibold text-dark">{incident.type}</span>
                          </div>
                        </td>
                        <td>
                          <div className="d-flex align-items-center gap-1 text-secondary small">
                            <MapPin size={13} className="text-muted flex-shrink-0" />
                            <span className="text-truncate" style={{ maxWidth: '200px' }}>
                              {incident.location}
                            </span>
                          </div>
                        </td>
                        <td>
                          <span className={`badge ${getSeverityBadge(incident.severity)}`}>
                            {incident.severity}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${getStatusBadge(incident.status)}`}>
                            {incident.status}
                          </span>
                        </td>
                        <td>
                          {incident.assignedTeamName ? (
                            <span className="badge bg-primary-subtle text-primary border border-primary-subtle d-inline-flex align-items-center gap-1">
                              <Ambulance size={12} /> {incident.assignedTeamName}
                            </span>
                          ) : (
                            <span className="badge bg-light text-muted border">Unassigned</span>
                          )}
                        </td>
                        <td className="pe-4 text-end">
                          <div className="btn-group btn-group-sm">
                            <button
                              className="btn btn-outline-secondary"
                              onClick={() => setSelectedIncident(incident)}
                              title="View Details"
                            >
                              <Eye size={14} />
                            </button>
                            {incident.status === 'Reported' && (
                              <button
                                className="btn btn-resq-danger"
                                onClick={() => onOpenAssignModal(incident)}
                                title="Assign Squad"
                              >
                                <UserPlus size={14} className="me-1" />
                                <span>Assign</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Rescue Teams */}
      {activeTab === 'teams' && (
        <div className="resq-card mb-4">
          <div className="resq-card-header d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center gap-2">
              <Ambulance size={18} className="text-danger" />
              <h6 className="mb-0 fw-bold text-dark">Pune Emergency Response Squads</h6>
              <span className="badge bg-dark rounded-pill">{rescueTeams.length}</span>
            </div>
            <button
              className="btn btn-outline-danger btn-sm d-flex align-items-center gap-1"
              onClick={() => setShowAddRescueModal(true)}
            >
              <UserPlus size={14} /> Add Squad User
            </button>
          </div>
          <div className="resq-card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light small text-uppercase text-secondary">
                  <tr>
                    <th className="ps-4">Squad ID</th>
                    <th>Team Name</th>
                    <th>Specialty</th>
                    <th>Squad Leader</th>
                    <th>Current Station</th>
                    <th>Contact Phone</th>
                    <th className="pe-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {rescueTeams.map((team) => (
                    <tr key={team.id}>
                      <td className="ps-4 fw-bold text-danger">{team.id}</td>
                      <td className="fw-semibold text-dark">{team.name}</td>
                      <td>
                        <span className="badge bg-light text-dark border">{team.type}</span>
                      </td>
                      <td className="small text-secondary">{team.leader}</td>
                      <td>
                        <div className="d-flex align-items-center gap-1 small text-muted">
                          <MapPin size={12} /> {team.currentLocation}
                        </div>
                      </td>
                      <td>
                        <div className="d-flex align-items-center gap-1 small text-muted">
                          <Phone size={12} /> {team.phone}
                        </div>
                      </td>
                      <td className="pe-4">
                        <span className={`badge ${
                          team.status === 'Available' ? 'bg-success' :
                          team.status === 'Assigned' ? 'bg-warning text-dark' :
                          'bg-danger'
                        }`}>
                          {team.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: User Management */}
      {activeTab === 'users' && (
        <div className="resq-card mb-4">
          <div className="resq-card-header d-flex flex-wrap align-items-center justify-content-between gap-3">
            <div className="d-flex align-items-center gap-2">
              <Users size={18} className="text-danger" />
              <h6 className="mb-0 fw-bold text-dark">Registered Users Directory</h6>
              <span className="badge bg-dark rounded-pill">{filteredUsers.length}</span>
            </div>

            <div className="d-flex flex-wrap align-items-center gap-2">
              {/* Search Bar */}
              <div className="input-group input-group-sm" style={{ width: '220px' }}>
                <span className="input-group-text bg-light border-end-0">
                  <Search size={14} className="text-muted" />
                </span>
                <input
                  type="text"
                  className="form-control border-start-0"
                  placeholder="Search user, email, squad..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                />
              </div>

              {/* Role Filter */}
              <select
                className="form-select form-select-sm"
                style={{ width: 'auto' }}
                value={userRoleFilter}
                onChange={(e) => setUserRoleFilter(e.target.value)}
              >
                <option value="all">All Roles</option>
                <option value="citizen">Citizens</option>
                <option value="rescue">Rescue Squads</option>
                <option value="admin">Administrators</option>
              </select>

              {/* Status Filter */}
              <select
                className="form-select form-select-sm"
                style={{ width: 'auto' }}
                value={userStatusFilter}
                onChange={(e) => setUserStatusFilter(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="active">Active Only</option>
                <option value="inactive">Disabled Only</option>
              </select>

              <button
                className="btn btn-resq-danger btn-sm d-flex align-items-center gap-1"
                onClick={() => setShowAddRescueModal(true)}
              >
                <UserPlus size={14} /> Add Squad User
              </button>

              <button
                className="btn btn-outline-secondary btn-sm"
                onClick={() => fetchUsers()}
                title="Refresh user directory"
              >
                <RefreshCw size={14} className={usersLoading ? 'spin' : ''} />
              </button>
            </div>
          </div>

          <div className="resq-card-body p-0">
            {usersLoading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-danger spinner-border-sm me-2" role="status"></div>
                <span className="text-muted small">Loading registered accounts...</span>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-5 text-muted">
                <Users size={36} className="mb-2 text-secondary opacity-50" />
                <div>No registered users found matching the filter criteria.</div>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light small text-uppercase text-secondary">
                    <tr>
                      <th className="ps-4">User</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Phone</th>
                      <th>Status</th>
                      <th>Last Login</th>
                      <th className="pe-4 text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((u) => {
                      const isSelf = String(u._id || u.id) === String(currentUser?._id || currentUser?.id);
                      return (
                        <tr key={u._id || u.id}>
                          <td className="ps-4">
                            <div className="d-flex align-items-center gap-2">
                              <div
                                className="d-flex align-items-center justify-content-center rounded-circle bg-danger text-white fw-bold"
                                style={{ width: 34, height: 34, fontSize: '0.8rem', flexShrink: 0 }}
                              >
                                {u.name ? u.name.charAt(0).toUpperCase() : '?'}
                              </div>
                              <div>
                                <div className="fw-semibold text-dark small d-flex align-items-center gap-1">
                                  <span>{u.name}</span>
                                  {isSelf && (
                                    <span className="badge bg-light text-muted border" style={{ fontSize: '0.65rem' }}>
                                      You
                                    </span>
                                  )}
                                </div>
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
                              <span>{u.email}</span>
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
                                <span>{u.phone}</span>
                              </div>
                            ) : (
                              <span className="text-muted small">—</span>
                            )}
                          </td>
                          <td>
                            {u.isActive === false ? (
                              <span className="badge bg-danger-subtle text-danger border border-danger-subtle">
                                Disabled
                              </span>
                            ) : (
                              <span className="badge bg-success-subtle text-success border border-success-subtle">
                                Active
                              </span>
                            )}
                          </td>
                          <td>
                            {u.lastLogin ? (
                              <div className="text-muted small d-flex align-items-center gap-1">
                                <Clock size={12} />
                                <span>{new Date(u.lastLogin).toLocaleDateString('en-IN', {
                                  day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                                })}</span>
                              </div>
                            ) : (
                              <span className="text-muted small">Never</span>
                            )}
                          </td>
                          <td className="pe-4 text-end">
                            <div className="btn-group btn-group-sm">
                              {/* Edit Profile */}
                              <button
                                className="btn btn-outline-secondary"
                                onClick={() => handleOpenEditUser(u)}
                                title="Edit Profile"
                              >
                                <Edit3 size={14} />
                              </button>

                              {/* Reset Password */}
                              <button
                                className="btn btn-outline-secondary"
                                onClick={() => handleResetPassword(u)}
                                title="Generate Temporary Password"
                              >
                                <Key size={14} />
                              </button>

                              {/* Activate / Deactivate Toggle */}
                              {!isSelf && (
                                <button
                                  className={`btn ${u.isActive === false ? 'btn-outline-success' : 'btn-outline-warning'}`}
                                  onClick={() => setConfirmStatusUser(u)}
                                  title={u.isActive === false ? 'Activate User' : 'Disable User'}
                                >
                                  {u.isActive === false ? <UserCheck size={14} /> : <UserX size={14} />}
                                </button>
                              )}

                              {/* Delete */}
                              {!isSelf && (
                                <button
                                  className="btn btn-outline-danger"
                                  onClick={() => setConfirmDeleteUser(u)}
                                  title="Delete User"
                                >
                                  <Trash2 size={14} />
                                </button>
                              )}
                            </div>
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
      )}

      {/* TAB 4: Activity Log */}
      {activeTab === 'activity' && (
        <div className="resq-card mb-4">
          <div className="resq-card-header d-flex flex-wrap align-items-center justify-content-between gap-2">
            <div className="d-flex align-items-center gap-2">
              <Activity size={18} className="text-danger" />
              <h6 className="mb-0 fw-bold text-dark">System Activity & Audit Log</h6>
              <span className="badge bg-dark rounded-pill">{auditLogs.length}</span>
            </div>
            <button
              className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1"
              onClick={() => fetchAuditLogs()}
            >
              <RefreshCw size={14} className={logsLoading ? 'spin' : ''} />
              <span>Refresh Log</span>
            </button>
          </div>

          <div className="resq-card-body p-0">
            {logsLoading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-danger spinner-border-sm me-2" role="status"></div>
                <span className="text-muted small">Loading activity entries...</span>
              </div>
            ) : auditLogs.length === 0 ? (
              <div className="text-center py-5 text-muted">
                <Activity size={36} className="mb-2 text-secondary opacity-50" />
                <div>No administrative activity logs recorded yet.</div>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light small text-uppercase text-secondary">
                    <tr>
                      <th className="ps-4">Timestamp</th>
                      <th>Admin / Initiator</th>
                      <th>Action</th>
                      <th>Target</th>
                      <th className="pe-4">Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditLogs.map((log) => (
                      <tr key={log._id || log.id}>
                        <td className="ps-4 text-nowrap small text-muted">
                          {new Date(log.timestamp).toLocaleDateString('en-IN', {
                            day: '2-digit', month: 'short', year: 'numeric',
                            hour: '2-digit', minute: '2-digit', second: '2-digit'
                          })}
                        </td>
                        <td>
                          <div className="fw-semibold text-dark small">{log.userName}</div>
                          <span className="badge bg-light text-muted border" style={{ fontSize: '0.65rem' }}>
                            {log.userRole}
                          </span>
                        </td>
                        <td>
                          <span className="badge bg-dark font-monospace" style={{ fontSize: '0.72rem' }}>
                            {log.action}
                          </span>
                        </td>
                        <td>
                          <span className="small text-secondary fw-semibold">
                            {log.targetType}: <span className="text-danger">{log.targetId}</span>
                          </span>
                        </td>
                        <td className="pe-4 small text-muted">
                          {log.details && typeof log.details === 'object' ? (
                            <code>{JSON.stringify(log.details)}</code>
                          ) : (
                            String(log.details || '—')
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
      )}

      {/* MODAL 1: Edit User Profile */}
      {editingUser && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(11, 19, 41, 0.65)', zIndex: 1060 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header bg-light border-bottom">
                <h5 className="modal-title fw-bold fs-6 d-flex align-items-center gap-2">
                  <Edit3 size={18} className="text-danger" /> Edit User Profile
                </h5>
                <button type="button" className="btn-close" onClick={() => setEditingUser(null)}></button>
              </div>
              <form onSubmit={handleSaveEditUser}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-dark">Full Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-dark">Email Address</label>
                    <input
                      type="email"
                      className="form-control"
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-dark">Phone Number</label>
                    <input
                      type="tel"
                      className="form-control"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                    />
                  </div>
                </div>
                <div className="modal-footer bg-light border-top">
                  <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => setEditingUser(null)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-resq-danger btn-sm">
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Temporary Password Generated */}
      {tempPasswordResult && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(11, 19, 41, 0.65)', zIndex: 1060 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header bg-light border-bottom">
                <h5 className="modal-title fw-bold fs-6 d-flex align-items-center gap-2">
                  <Key size={18} className="text-success" /> Temporary Password Created
                </h5>
                <button type="button" className="btn-close" onClick={() => setTempPasswordResult(null)}></button>
              </div>
              <div className="modal-body p-4 text-center">
                <p className="text-secondary small mb-3">
                  A high-entropy temporary password has been set. The user must update their password upon next sign in.
                </p>
                <div className="p-3 bg-light border rounded d-flex align-items-center justify-content-between mb-3">
                  <span className="fw-bold font-monospace text-danger fs-5">{tempPasswordResult}</span>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-dark d-flex align-items-center gap-1"
                    onClick={handleCopyTempPassword}
                  >
                    {copiedPass ? <Check size={14} className="text-success" /> : <Copy size={14} />}
                    <span>{copiedPass ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
                <div className="alert alert-warning py-2 small mb-0 d-flex align-items-center gap-2 text-start">
                  <AlertTriangle size={16} className="flex-shrink-0" />
                  <span>Please share this password securely with the user immediately.</span>
                </div>
              </div>
              <div className="modal-footer bg-light border-top">
                <button type="button" className="btn btn-resq-primary btn-sm" onClick={() => setTempPasswordResult(null)}>
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Add Rescue Squad User */}
      {showAddRescueModal && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(11, 19, 41, 0.65)', zIndex: 1060 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header bg-light border-bottom">
                <h5 className="modal-title fw-bold fs-6 d-flex align-items-center gap-2">
                  <Ambulance size={18} className="text-danger" /> Add Rescue Squad User
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowAddRescueModal(false)}></button>
              </div>
              <form onSubmit={handleCreateRescueSubmit}>
                <div className="modal-body p-4">
                  {addRescueError && (
                    <div className="alert alert-danger py-2 small mb-3">{addRescueError}</div>
                  )}
                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-dark">Full Squad / Contact Name</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. PERT-02 Alpha Lead"
                      value={addRescueForm.name}
                      onChange={(e) => setAddRescueForm({ ...addRescueForm, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-dark">Email Address (Login)</label>
                    <input
                      type="email"
                      className="form-control"
                      placeholder="e.g. pert02@resqnet.org"
                      value={addRescueForm.email}
                      onChange={(e) => setAddRescueForm({ ...addRescueForm, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-dark">Link to Rescue Squad</label>
                    <select
                      className="form-select"
                      value={addRescueForm.teamId}
                      onChange={(e) => setAddRescueForm({ ...addRescueForm, teamId: e.target.value })}
                      required
                    >
                      {rescueTeams.map((team) => (
                        <option key={team.id} value={team.id}>
                          {team.id} — {team.name} ({team.currentLocation})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-dark">Initial Password</label>
                    <input
                      type="password"
                      className="form-control"
                      placeholder="Create secure password (min 8 chars)"
                      value={addRescueForm.password}
                      onChange={(e) => setAddRescueForm({ ...addRescueForm, password: e.target.value })}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-dark">Contact Phone</label>
                    <input
                      type="tel"
                      className="form-control"
                      placeholder="+91 (020) 2550-6789"
                      value={addRescueForm.phone}
                      onChange={(e) => setAddRescueForm({ ...addRescueForm, phone: e.target.value })}
                    />
                  </div>
                </div>
                <div className="modal-footer bg-light border-top">
                  <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => setShowAddRescueModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-resq-danger btn-sm">
                    Create Squad Account
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: Confirm Activate / Deactivate */}
      {confirmStatusUser && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(11, 19, 41, 0.65)', zIndex: 1060 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header bg-light border-bottom">
                <h5 className="modal-title fw-bold fs-6 d-flex align-items-center gap-2">
                  <ShieldAlert size={18} className="text-warning" />
                  Confirm Status Change
                </h5>
                <button type="button" className="btn-close" onClick={() => setConfirmStatusUser(null)}></button>
              </div>
              <div className="modal-body p-4">
                <p className="text-secondary mb-0">
                  Are you sure you want to {confirmStatusUser.isActive === false ? 'reactivate' : 'disable'} account{' '}
                  <strong>{confirmStatusUser.email}</strong>?
                  {confirmStatusUser.isActive !== false && (
                    <span className="d-block mt-2 text-danger small">
                      Disabled accounts cannot log into ResQNet until re-enabled by an administrator.
                    </span>
                  )}
                </p>
              </div>
              <div className="modal-footer bg-light border-top">
                <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => setConfirmStatusUser(null)}>
                  Cancel
                </button>
                <button
                  type="button"
                  className={`btn btn-sm ${confirmStatusUser.isActive === false ? 'btn-success' : 'btn-danger'}`}
                  onClick={handleToggleStatus}
                >
                  Confirm {confirmStatusUser.isActive === false ? 'Activation' : 'Deactivation'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: Confirm Delete User */}
      {confirmDeleteUser && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(11, 19, 41, 0.65)', zIndex: 1060 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header bg-light border-bottom">
                <h5 className="modal-title fw-bold fs-6 d-flex align-items-center gap-2">
                  <Trash2 size={18} className="text-danger" /> Delete User Account
                </h5>
                <button type="button" className="btn-close" onClick={() => setConfirmDeleteUser(null)}></button>
              </div>
              <div className="modal-body p-4">
                <p className="text-secondary mb-0">
                  Are you sure you want to permanently delete account for <strong>{confirmDeleteUser.name}</strong> ({confirmDeleteUser.email})?
                  <span className="d-block mt-2 text-danger small">
                    This action is permanent and cannot be undone.
                  </span>
                </p>
              </div>
              <div className="modal-footer bg-light border-top">
                <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => setConfirmDeleteUser(null)}>
                  Cancel
                </button>
                <button type="button" className="btn btn-danger btn-sm" onClick={handleDeleteUser}>
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

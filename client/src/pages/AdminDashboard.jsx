import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { useDebounce } from '../hooks/useDebounce';
import { formatRelativeTime } from '../hooks/useRelativeTime';
import {
  Shield,
  Siren,
  Ambulance,
  CheckCircle2,
  Users,
  AlertTriangle,
  Flame,
  Waves,
  Car,
  Building2,
  UserPlus,
  Phone,
  Mail,
  Calendar,
  Key,
  Trash2,
  Edit3,
  Activity,
  Copy,
  Check,
  Clock,
  Search,
  Download,
  MapPin,
  Eye,
  RotateCcw,
  UserCheck,
  UserX,
  Truck,
  Map as MapIcon,
  HelpCircle,
  FileText
} from 'lucide-react';
import PageHeader from '../components/dashboard/PageHeader';
import StatCard from '../components/dashboard/StatCard';
import StatusBadge from '../components/dashboard/StatusBadge';
import SeverityBadge from '../components/dashboard/SeverityBadge';
import DataTable from '../components/dashboard/DataTable';
import FilterBar from '../components/dashboard/FilterBar';
import ChartSection from '../components/dashboard/ChartSection';
import ConfirmModal from '../components/dashboard/ConfirmModal';
import { IncidentMap } from '../components/IncidentMap';
import { AssignTeamModal } from '../components/AssignTeamModal';

/**
 * Control Center Admin Dashboard (Pune Zone).
 * Provides unified incident dispatch, real-time telemetry, team readiness monitoring,
 * user role management with safeguards, and audit logging.
 */
export const AdminDashboard = ({ onOpenAssignModal }) => {
  const {
    incidents = [],
    rescueTeams = [],
    setSelectedIncident,
    registeredUsers = [],
    fetchUsers,
    currentUser,
    auditLogs = [],
    fetchAuditLogs,
    updateUserStatus,
    resetUserPassword,
    updateUserProfile,
    deleteUser,
    createRescueUser,
    showToast
  } = useApp();

  // Active Tab: 'incidents' | 'teams' | 'users' | 'activity' | 'map'
  const [activeTab, setActiveTab] = useState('incidents');
  const [highlightedIncidentId, setHighlightedIncidentId] = useState(null);

  // Local Assign Modal Target
  const [localAssignTarget, setLocalAssignTarget] = useState(null);

  // Incidents Filter State
  const [incidentSearch, setIncidentSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [assignmentFilter, setAssignmentFilter] = useState('all'); // 'all' | 'assigned' | 'unassigned'
  const [dateRangeFilter, setDateRangeFilter] = useState('all'); // 'all' | 'today' | '7days'
  const [selectedTeamFilter, setSelectedTeamFilter] = useState('all');

  const [sortField, setSortField] = useState('reportedAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);

  const debouncedSearch = useDebounce(incidentSearch, 300);

  // User Management State
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('all');
  const [userStatusFilter, setUserStatusFilter] = useState('all');
  const [userPage, setUserPage] = useState(1);
  const debouncedUserSearch = useDebounce(userSearch, 300);

  // Activity Log State
  const [logActionFilter, setLogActionFilter] = useState('all');
  const [logSearch, setLogSearch] = useState('');
  const [logPage, setLogPage] = useState(1);

  // Modals State
  const [editingUser, setEditingUser] = useState(null);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [isEditingUserSubmitting, setIsEditingUserSubmitting] = useState(false);

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
  const [isCreatingRescue, setIsCreatingRescue] = useState(false);

  const [confirmStatusUser, setConfirmStatusUser] = useState(null);
  const [isStatusSubmitting, setIsStatusSubmitting] = useState(false);

  const [confirmDeleteUser, setConfirmDeleteUser] = useState(null);
  const [isDeleteSubmitting, setIsDeleteSubmitting] = useState(false);

  // Sync data on tab change
  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    } else if (activeTab === 'activity') {
      fetchAuditLogs();
    }
  }, [activeTab, fetchUsers, fetchAuditLogs]);

  // Type icon helper
  const getTypeIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'fire':
        return <Flame size={15} className="text-danger flex-shrink-0" />;
      case 'flood':
        return <Waves size={15} className="text-primary flex-shrink-0" />;
      case 'accident':
        return <Car size={15} className="text-warning flex-shrink-0" />;
      case 'building collapse':
        return <Building2 size={15} className="text-danger flex-shrink-0" />;
      default:
        return <AlertTriangle size={15} className="text-secondary flex-shrink-0" />;
    }
  };

  // Metrics computation for Stat Cards
  const metrics = useMemo(() => {
    const now = Date.now();
    let total = incidents.length;
    let criticalOpen = 0;
    let unassigned = 0;
    let completedToday = 0;

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const todayMs = startOfToday.getTime();

    incidents.forEach((inc) => {
      const isDone = inc.status === 'Completed' || inc.status === 'Resolved';
      if (isDone) {
        const repDate = new Date(inc.reportedAt || 0).getTime();
        if (repDate >= todayMs) completedToday++;
      } else {
        if (inc.severity === 'Critical') criticalOpen++;
        if (!inc.assignedTeamId && inc.status === 'Reported') unassigned++;
      }
    });

    const availableTeams = rescueTeams.filter((t) => t.status === 'Available').length;
    const registeredCitizens = registeredUsers.filter((u) => u.role === 'citizen').length;

    return {
      total,
      criticalOpen,
      unassigned,
      availableTeams,
      totalTeams: rescueTeams.length,
      completedToday,
      registeredCitizens
    };
  }, [incidents, rescueTeams, registeredUsers]);

  // Admin Safeguard Helpers:
  // Cannot delete or disable own account or last active admin
  const activeAdminsCount = useMemo(() => {
    return registeredUsers.filter(
      (u) => u.role === 'admin' && u.isActive !== false
    ).length;
  }, [registeredUsers]);

  const isSelf = (user) => {
    if (!user || !currentUser) return false;
    const uId = user._id || user.id;
    const cId = currentUser._id || currentUser.id;
    return (
      (uId && cId && String(uId) === String(cId)) ||
      (user.email && currentUser.email && user.email.toLowerCase() === currentUser.email.toLowerCase())
    );
  };

  const isLastAdmin = (user) => {
    return user.role === 'admin' && activeAdminsCount <= 1;
  };

  // Filtered incidents
  const filteredIncidents = useMemo(() => {
    const now = Date.now();
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const todayMs = startOfToday.getTime();
    const sevenDaysAgoMs = now - 7 * 24 * 60 * 60 * 1000;

    return incidents.filter((inc) => {
      // Severity
      if (severityFilter !== 'all' && inc.severity?.toLowerCase() !== severityFilter.toLowerCase()) {
        return false;
      }

      // Status
      if (statusFilter !== 'all') {
        const isDone = inc.status === 'Completed' || inc.status === 'Resolved';
        if (statusFilter === 'active' && isDone) return false;
        if (statusFilter === 'completed' && !isDone) return false;
        if (
          statusFilter !== 'active' &&
          statusFilter !== 'completed' &&
          inc.status?.toLowerCase() !== statusFilter.toLowerCase()
        ) {
          return false;
        }
      }

      // Type
      if (typeFilter !== 'all' && inc.type?.toLowerCase() !== typeFilter.toLowerCase()) {
        return false;
      }

      // Assignment
      if (assignmentFilter === 'assigned' && !inc.assignedTeamId) return false;
      if (assignmentFilter === 'unassigned' && Boolean(inc.assignedTeamId)) return false;

      // Squad filter
      if (selectedTeamFilter !== 'all') {
        const matchesTeamId =
          inc.assignedTeamId &&
          String(inc.assignedTeamId).toLowerCase() === String(selectedTeamFilter).toLowerCase();
        const matchesTeamName =
          inc.assignedTeamName &&
          rescueTeams.some(
            (t) =>
              t.id === selectedTeamFilter &&
              t.name.toLowerCase() === inc.assignedTeamName.toLowerCase()
          );
        if (!matchesTeamId && !matchesTeamName) return false;
      }

      // Date Range
      if (dateRangeFilter !== 'all') {
        const repTime = new Date(inc.reportedAt || 0).getTime();
        if (dateRangeFilter === 'today' && repTime < todayMs) return false;
        if (dateRangeFilter === '7days' && repTime < sevenDaysAgoMs) return false;
      }

      // Search Query
      if (debouncedSearch.trim()) {
        const q = debouncedSearch.toLowerCase().trim();
        const matchId = inc.id?.toLowerCase().includes(q);
        const matchLoc = inc.location?.toLowerCase().includes(q);
        const matchType = inc.type?.toLowerCase().includes(q);
        const matchTitle = inc.title?.toLowerCase().includes(q);
        const matchTeam = inc.assignedTeamName?.toLowerCase().includes(q);
        const matchReporter = inc.reportedBy?.toLowerCase().includes(q);
        if (!matchId && !matchLoc && !matchType && !matchTitle && !matchTeam && !matchReporter) {
          return false;
        }
      }

      return true;
    });
  }, [
    incidents,
    severityFilter,
    statusFilter,
    typeFilter,
    assignmentFilter,
    selectedTeamFilter,
    dateRangeFilter,
    debouncedSearch,
    rescueTeams
  ]);

  // Sorted incidents
  const sortedIncidents = useMemo(() => {
    const list = [...filteredIncidents];
    list.sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (sortField === 'reportedAt') {
        valA = new Date(valA || 0).getTime();
        valB = new Date(valB || 0).getTime();
      } else if (sortField === 'severity') {
        const weight = { Critical: 4, High: 3, Medium: 2, Low: 1 };
        valA = weight[a.severity] || 0;
        valB = weight[b.severity] || 0;
      } else if (sortField === 'waitingTime') {
        const now = Date.now();
        valA = !a.assignedTeamId ? now - new Date(a.reportedAt || 0).getTime() : 0;
        valB = !b.assignedTeamId ? now - new Date(b.reportedAt || 0).getTime() : 0;
      } else if (typeof valA === 'string') {
        valA = valA.toLowerCase();
        valB = (valB || '').toLowerCase();
        return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
    return list;
  }, [filteredIncidents, sortField, sortOrder]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Bulk CSV Export
  const handleExportCSV = () => {
    if (!sortedIncidents.length) {
      showToast('No incidents to export matching current filters.', 'warning');
      return;
    }

    const headers = [
      'Incident ID',
      'Type',
      'Title',
      'Severity',
      'Status',
      'Location',
      'People Affected',
      'Assigned Squad',
      'Reported Time',
      'Reporter Name',
      'Reporter Phone',
      'Description'
    ];

    const rows = sortedIncidents.map((i) => [
      `"${i.id || ''}"`,
      `"${i.type || ''}"`,
      `"${(i.title || '').replace(/"/g, '""')}"`,
      `"${i.severity || ''}"`,
      `"${i.status || ''}"`,
      `"${(i.location || '').replace(/"/g, '""')}"`,
      `"${i.peopleAffected || 0}"`,
      `"${(i.assignedTeamName || 'Unassigned').replace(/"/g, '""')}"`,
      `"${new Date(i.reportedAt).toLocaleString('en-IN')}"`,
      `"${(i.reportedBy || '').replace(/"/g, '""')}"`,
      `"${(i.reporterPhone || '').replace(/"/g, '""')}"`,
      `"${(i.description || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `resqnet_pune_dispatch_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast(`Exported ${sortedIncidents.length} incidents to CSV.`, 'success');
  };

  // Assign Squad Trigger
  const triggerAssignModal = (incident) => {
    if (onOpenAssignModal) {
      onOpenAssignModal(incident);
    } else {
      setLocalAssignTarget(incident);
    }
  };

  const handleSquadAssigned = (incidentId) => {
    setHighlightedIncidentId(incidentId);
    showToast(`Squad successfully dispatched to Incident #${incidentId}`, 'success');
    setTimeout(() => {
      setHighlightedIncidentId(null);
    }, 3000);
  };

  // Incidents Table Columns
  const incidentColumns = [
    {
      key: 'id',
      label: 'Incident ID',
      sortable: true,
      width: '110px',
      render: (item) => (
        <span className="badge bg-dark fw-bold font-monospace py-1 px-2" style={{ fontSize: '0.78rem' }}>
          {item.id}
        </span>
      )
    },
    {
      key: 'type',
      label: 'Emergency Type',
      sortable: true,
      width: '150px',
      render: (item) => (
        <div className="d-flex align-items-center gap-1.5">
          {getTypeIcon(item.type)}
          <span className="fw-semibold text-dark small">{item.type}</span>
        </div>
      )
    },
    {
      key: 'location',
      label: 'Location / Sector',
      sortable: true,
      render: (item) => (
        <div>
          <div className="fw-medium text-dark small">{item.location}</div>
          {item.peopleAffected ? (
            <div className="text-muted" style={{ fontSize: '0.7rem' }}>
              {item.peopleAffected} casualties reported
            </div>
          ) : null}
        </div>
      )
    },
    {
      key: 'severity',
      label: 'Severity',
      sortable: true,
      width: '115px',
      render: (item) => <SeverityBadge severity={item.severity} size="sm" />
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      width: '130px',
      render: (item) => <StatusBadge status={item.status} size="sm" />
    },
    {
      key: 'assignedTeamName',
      label: 'Assigned Squad',
      sortable: true,
      width: '160px',
      render: (item) => {
        if (item.assignedTeamName) {
          return (
            <div className="d-flex align-items-center gap-1 text-primary fw-medium small">
              <Ambulance size={13} className="text-primary flex-shrink-0" />
              <span>{item.assignedTeamName}</span>
            </div>
          );
        }
        return (
          <span className="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle py-0.5 px-2 small">
            Unassigned
          </span>
        );
      }
    },
    {
      key: 'waitingTime',
      label: 'Waiting Time',
      sortable: true,
      width: '145px',
      render: (item) => {
        const isDone = item.status === 'Completed' || item.status === 'Resolved';
        if (isDone || item.assignedTeamId) {
          return <span className="text-muted small">—</span>;
        }

        const elapsedMs = Date.now() - new Date(item.reportedAt || 0).getTime();
        const elapsedMinutes = Math.max(0, Math.floor(elapsedMs / (1000 * 60)));
        const isCriticalOrHigh = item.severity === 'Critical' || item.severity === 'High';

        if (isCriticalOrHigh && elapsedMinutes >= 10) {
          return (
            <span
              className="waiting-time-alert"
              title={`Critical/High incident unassigned for ${elapsedMinutes} minutes! Immediate dispatch required.`}
            >
              <AlertTriangle size={12} />
              <span>{elapsedMinutes}m (OVERDUE)</span>
            </span>
          );
        }

        return (
          <span className="text-secondary small font-monospace">
            {elapsedMinutes < 60 ? `${elapsedMinutes}m waiting` : `${Math.floor(elapsedMinutes / 60)}h ${elapsedMinutes % 60}m`}
          </span>
        );
      }
    },
    {
      key: 'reportedAt',
      label: 'Reported',
      sortable: true,
      width: '120px',
      render: (item) => {
        const { relativeTime, fullDate } = formatRelativeTime(item.reportedAt);
        return (
          <span className="text-secondary small" title={`Reported: ${fullDate}`}>
            {relativeTime}
          </span>
        );
      }
    },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      align: 'end',
      width: '140px',
      render: (item) => (
        <div className="d-inline-flex align-items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary py-1 px-2 small d-inline-flex align-items-center gap-1"
            onClick={() => setSelectedIncident(item)}
            title="View Full Incident File"
          >
            <Eye size={12} />
            <span>Details</span>
          </button>
          {!item.assignedTeamId && (
            <button
              type="button"
              className="btn btn-sm btn-resq-danger py-1 px-2 small d-inline-flex align-items-center gap-1 fw-semibold"
              onClick={() => triggerAssignModal(item)}
              title="Assign Squad to Incident"
            >
              <UserPlus size={12} />
              <span>Assign</span>
            </button>
          )}
        </div>
      )
    }
  ];

  // User Management Handlers
  const handleOpenEditUser = (user) => {
    setEditingUser(user);
    setEditName(user.name || '');
    setEditPhone(user.phone || '');
    setEditEmail(user.email || '');
  };

  const handleSaveEditUser = async (e) => {
    e.preventDefault();
    if (!editingUser) return;
    setIsEditingUserSubmitting(true);
    try {
      const ok = await updateUserProfile(editingUser._id || editingUser.id, {
        name: editName,
        phone: editPhone,
        email: editEmail
      });
      if (ok) setEditingUser(null);
    } finally {
      setIsEditingUserSubmitting(false);
    }
  };

  const handleResetPassword = async (user) => {
    try {
      const res = await resetUserPassword(user._id || user.id);
      setTempPasswordResult(res.tempPassword);
      setCopiedPass(false);
    } catch (err) {
      // toast in context
    }
  };

  const handleCopyTempPassword = () => {
    if (tempPasswordResult) {
      navigator.clipboard.writeText(tempPasswordResult);
      setCopiedPass(true);
      setTimeout(() => setCopiedPass(false), 2500);
    }
  };

  const handleConfirmToggleStatus = async () => {
    if (!confirmStatusUser) return;
    if (isSelf(confirmStatusUser)) {
      showToast('Security Restriction: You cannot disable your own admin account.', 'danger');
      setConfirmStatusUser(null);
      return;
    }
    if (isLastAdmin(confirmStatusUser)) {
      showToast('Security Restriction: Cannot disable the last active administrator.', 'danger');
      setConfirmStatusUser(null);
      return;
    }

    setIsStatusSubmitting(true);
    try {
      const nextStatus = confirmStatusUser.isActive === false;
      await updateUserStatus(confirmStatusUser._id || confirmStatusUser.id, nextStatus);
      setConfirmStatusUser(null);
    } finally {
      setIsStatusSubmitting(false);
    }
  };

  const handleConfirmDeleteUser = async () => {
    if (!confirmDeleteUser) return;
    if (isSelf(confirmDeleteUser)) {
      showToast('Security Restriction: You cannot delete your own admin account.', 'danger');
      setConfirmDeleteUser(null);
      return;
    }
    if (isLastAdmin(confirmDeleteUser)) {
      showToast('Security Restriction: Cannot delete the last active administrator.', 'danger');
      setConfirmDeleteUser(null);
      return;
    }

    setIsDeleteSubmitting(true);
    try {
      await deleteUser(confirmDeleteUser._id || confirmDeleteUser.id);
      setConfirmDeleteUser(null);
    } finally {
      setIsDeleteSubmitting(false);
    }
  };

  const handleCreateRescueSubmit = async (e) => {
    e.preventDefault();
    setAddRescueError('');
    if (!addRescueForm.name || !addRescueForm.email || !addRescueForm.password || !addRescueForm.teamId) {
      setAddRescueError('Please fill out all required fields.');
      return;
    }

    setIsCreatingRescue(true);
    try {
      const ok = await createRescueUser(addRescueForm);
      if (ok) {
        setShowAddRescueModal(false);
        setAddRescueForm({ name: '', email: '', password: '', teamId: 'PERT-01', phone: '' });
      }
    } finally {
      setIsCreatingRescue(false);
    }
  };

  // Filtered Users List
  const filteredUsers = useMemo(() => {
    return registeredUsers.filter((u) => {
      if (userRoleFilter !== 'all' && u.role !== userRoleFilter) return false;
      if (userStatusFilter === 'active' && u.isActive === false) return false;
      if (userStatusFilter === 'disabled' && u.isActive !== false) return false;

      if (debouncedUserSearch.trim()) {
        const q = debouncedUserSearch.toLowerCase().trim();
        const matchName = u.name?.toLowerCase().includes(q);
        const matchEmail = u.email?.toLowerCase().includes(q);
        const matchPhone = u.phone?.includes(q);
        const matchTeam = u.teamId?.toLowerCase().includes(q);
        if (!matchName && !matchEmail && !matchPhone && !matchTeam) return false;
      }

      return true;
    });
  }, [registeredUsers, userRoleFilter, userStatusFilter, debouncedUserSearch]);

  // Users Table Columns
  const userColumns = [
    {
      key: 'name',
      label: 'User Name / Identity',
      sortable: true,
      render: (u) => (
        <div>
          <div className="fw-bold text-dark small">{u.name}</div>
          <div className="text-muted" style={{ fontSize: '0.72rem' }}>
            ID: {u._id || u.id}
          </div>
        </div>
      )
    },
    {
      key: 'email',
      label: 'Email & Contact',
      sortable: true,
      render: (u) => (
        <div>
          <div className="text-dark small d-flex align-items-center gap-1">
            <Mail size={12} className="text-muted" />
            <span>{u.email}</span>
          </div>
          {u.phone && (
            <div className="text-secondary small d-flex align-items-center gap-1 mt-0.5">
              <Phone size={12} className="text-muted" />
              <span>{u.phone}</span>
            </div>
          )}
        </div>
      )
    },
    {
      key: 'role',
      label: 'Role / Team',
      sortable: true,
      width: '140px',
      render: (u) => {
        let badgeClass = 'bg-secondary';
        if (u.role === 'admin') badgeClass = 'bg-danger text-white';
        else if (u.role === 'rescue') badgeClass = 'bg-primary text-white';
        else badgeClass = 'bg-light text-dark border';

        return (
          <div>
            <span className={`badge ${badgeClass} text-uppercase px-2 py-0.5`} style={{ fontSize: '0.68rem' }}>
              {u.role}
            </span>
            {u.teamId && (
              <div className="text-primary small fw-semibold font-monospace mt-1">
                {u.teamId}
              </div>
            )}
          </div>
        );
      }
    },
    {
      key: 'isActive',
      label: 'Account Status',
      sortable: true,
      width: '120px',
      render: (u) => (
        <span
          className={`badge ${
            u.isActive !== false ? 'bg-success-subtle text-success border border-success-subtle' : 'bg-danger-subtle text-danger border border-danger-subtle'
          } py-0.5 px-2 small`}
        >
          {u.isActive !== false ? 'Active' : 'Disabled'}
        </span>
      )
    },
    {
      key: 'createdAt',
      label: 'Registered',
      sortable: true,
      width: '120px',
      render: (u) => {
        const { relativeTime, fullDate } = formatRelativeTime(u.createdAt);
        return (
          <span className="text-secondary small" title={fullDate}>
            {relativeTime}
          </span>
        );
      }
    },
    {
      key: 'actions',
      label: 'Administration Actions',
      sortable: false,
      align: 'end',
      width: '240px',
      render: (u) => {
        const self = isSelf(u);
        const lastAdm = isLastAdmin(u);
        const cannotTouch = self || lastAdm;

        return (
          <div className="d-inline-flex align-items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
            {/* Edit Profile */}
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary py-1 px-2"
              onClick={() => handleOpenEditUser(u)}
              title="Edit Contact & Name"
            >
              <Edit3 size={13} />
            </button>

            {/* Reset Temporary Password */}
            <button
              type="button"
              className="btn btn-sm btn-outline-warning py-1 px-2 text-dark"
              onClick={() => handleResetPassword(u)}
              title="Generate temporary password"
            >
              <Key size={13} />
            </button>

            {/* Enable / Disable Toggle */}
            <button
              type="button"
              className={`btn btn-sm ${
                u.isActive !== false ? 'btn-outline-secondary' : 'btn-outline-success'
              } py-1 px-2`}
              disabled={cannotTouch}
              onClick={() => setConfirmStatusUser(u)}
              title={
                self
                  ? 'Cannot disable your own account'
                  : lastAdm
                  ? 'Cannot disable last active administrator'
                  : u.isActive !== false
                  ? 'Disable Account'
                  : 'Enable Account'
              }
            >
              {u.isActive !== false ? <UserX size={13} /> : <UserCheck size={13} />}
            </button>

            {/* Delete Account */}
            <button
              type="button"
              className="btn btn-sm btn-outline-danger py-1 px-2"
              disabled={cannotTouch}
              onClick={() => setConfirmDeleteUser(u)}
              title={
                self
                  ? 'Cannot delete your own account'
                  : lastAdm
                  ? 'Cannot delete last active administrator'
                  : 'Delete Account'
              }
            >
              <Trash2 size={13} />
            </button>
          </div>
        );
      }
    }
  ];

  // Filtered Activity Logs
  const filteredLogs = useMemo(() => {
    return auditLogs.filter((log) => {
      if (logActionFilter !== 'all' && !log.action?.toLowerCase().includes(logActionFilter.toLowerCase())) {
        return false;
      }
      if (logSearch.trim()) {
        const q = logSearch.toLowerCase().trim();
        const matchAct = log.action?.toLowerCase().includes(q);
        const matchUser = log.userEmail?.toLowerCase().includes(q) || log.userName?.toLowerCase().includes(q);
        const matchDetail = log.details && JSON.stringify(log.details).toLowerCase().includes(q);
        if (!matchAct && !matchUser && !matchDetail) return false;
      }
      return true;
    });
  }, [auditLogs, logActionFilter, logSearch]);

  // Activity Log Columns
  const logColumns = [
    {
      key: 'action',
      label: 'Action Type',
      sortable: true,
      width: '180px',
      render: (log) => (
        <span className="badge bg-dark font-monospace py-1 px-2" style={{ fontSize: '0.72rem' }}>
          {log.action}
        </span>
      )
    },
    {
      key: 'userEmail',
      label: 'Operator / Actor',
      sortable: true,
      render: (log) => (
        <div>
          <div className="fw-semibold text-dark small">{log.userName || log.userEmail || 'System'}</div>
          {log.userRole && (
            <span className="badge bg-light text-secondary border small" style={{ fontSize: '0.65rem' }}>
              {log.userRole}
            </span>
          )}
        </div>
      )
    },
    {
      key: 'details',
      label: 'Event Details',
      sortable: false,
      render: (log) => (
        <div className="text-secondary small font-monospace text-truncate" style={{ maxWidth: '340px' }}>
          {typeof log.details === 'object' ? JSON.stringify(log.details) : String(log.details || '—')}
        </div>
      )
    },
    {
      key: 'ip',
      label: 'Client IP',
      sortable: true,
      width: '130px',
      render: (log) => (
        <span className="text-muted small font-monospace">
          {log.ip || '127.0.0.1'}
        </span>
      )
    },
    {
      key: 'timestamp',
      label: 'Timestamp',
      sortable: true,
      width: '150px',
      render: (log) => {
        const { relativeTime, fullDate } = formatRelativeTime(log.timestamp || log.createdAt);
        return (
          <span className="text-secondary small" title={fullDate}>
            {relativeTime}
          </span>
        );
      }
    }
  ];

  return (
    <div className="admin-dashboard container-fluid p-3 p-lg-4">
      {/* 1. Control Center Header */}
      <PageHeader
        title="Control Center • Pune Municipal Dispatch"
        subtitle={`Signed in as ${currentUser?.name || 'Administrator'} • Live real-time emergency telemetry & squad coordination.`}
        roleBadge="CONTROL CENTER"
        showReportButton={false}
      />

      {/* 2. 6 Clickable Control Room Stat Cards Grid */}
      <div className="stat-card-grid">
        {/* Total Incidents */}
        <StatCard
          icon={<Activity size={20} />}
          value={metrics.total}
          label="Total Incidents"
          sublabel="All recorded emergencies"
          variant="primary"
          isActive={activeTab === 'incidents' && statusFilter === 'all' && severityFilter === 'all'}
          onClick={() => {
            setActiveTab('incidents');
            setStatusFilter('all');
            setSeverityFilter('all');
            setAssignmentFilter('all');
          }}
        />

        {/* Critical Open */}
        <StatCard
          icon={<Siren size={20} />}
          value={metrics.criticalOpen}
          label="Critical Open"
          sublabel="Priority tier-1 alerts"
          variant="danger"
          isActive={activeTab === 'incidents' && severityFilter === 'critical' && statusFilter === 'active'}
          onClick={() => {
            setActiveTab('incidents');
            setSeverityFilter('critical');
            setStatusFilter('active');
          }}
        />

        {/* Unassigned */}
        <StatCard
          icon={<AlertTriangle size={20} />}
          value={metrics.unassigned}
          label="Unassigned"
          sublabel="Awaiting squad dispatch"
          variant="warning"
          isActive={activeTab === 'incidents' && assignmentFilter === 'unassigned'}
          onClick={() => {
            setActiveTab('incidents');
            setAssignmentFilter('unassigned');
            setStatusFilter('active');
          }}
        />

        {/* Available Teams */}
        <StatCard
          icon={<Ambulance size={20} />}
          value={`${metrics.availableTeams} / ${metrics.totalTeams}`}
          label="Available Squads"
          sublabel="Ready for dispatch"
          variant="success"
          isActive={activeTab === 'teams'}
          onClick={() => setActiveTab('teams')}
        />

        {/* Completed Today */}
        <StatCard
          icon={<CheckCircle2 size={20} />}
          value={metrics.completedToday}
          label="Resolved Today"
          sublabel="Missions closed today"
          variant="info"
          isActive={activeTab === 'incidents' && statusFilter === 'completed' && dateRangeFilter === 'today'}
          onClick={() => {
            setActiveTab('incidents');
            setStatusFilter('completed');
            setDateRangeFilter('today');
          }}
        />

        {/* Registered Citizens */}
        <StatCard
          icon={<Users size={20} />}
          value={metrics.registeredCitizens}
          label="Citizens Enrolled"
          sublabel="Pune residential accounts"
          variant="secondary"
          isActive={activeTab === 'users'}
          onClick={() => setActiveTab('users')}
        />
      </div>

      {/* 3. Pure SVG / CSS Real-Data Metrics Chart Section */}
      <ChartSection incidents={incidents} />

      {/* 4. Tab Navigation Strip */}
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3 border-bottom pb-2">
        <div className="d-flex flex-wrap gap-2" role="tablist" aria-label="Control Center Views">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'incidents'}
            className={`btn btn-sm d-inline-flex align-items-center gap-1.5 fw-semibold ${
              activeTab === 'incidents' ? 'btn-danger' : 'btn-outline-secondary'
            }`}
            onClick={() => setActiveTab('incidents')}
          >
            <Activity size={14} />
            <span>Incidents & Dispatch</span>
            <span className={`badge ms-1 ${activeTab === 'incidents' ? 'bg-white text-danger' : 'bg-dark text-white'}`}>
              {filteredIncidents.length}
            </span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'teams'}
            className={`btn btn-sm d-inline-flex align-items-center gap-1.5 fw-semibold ${
              activeTab === 'teams' ? 'btn-danger' : 'btn-outline-secondary'
            }`}
            onClick={() => setActiveTab('teams')}
          >
            <Ambulance size={14} />
            <span>Rescue Teams</span>
            <span className={`badge ms-1 ${activeTab === 'teams' ? 'bg-white text-danger' : 'bg-success text-white'}`}>
              {rescueTeams.length}
            </span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'users'}
            className={`btn btn-sm d-inline-flex align-items-center gap-1.5 fw-semibold ${
              activeTab === 'users' ? 'btn-danger' : 'btn-outline-secondary'
            }`}
            onClick={() => setActiveTab('users')}
          >
            <Users size={14} />
            <span>User Management</span>
            <span className={`badge ms-1 ${activeTab === 'users' ? 'bg-white text-danger' : 'bg-secondary text-white'}`}>
              {registeredUsers.length}
            </span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'activity'}
            className={`btn btn-sm d-inline-flex align-items-center gap-1.5 fw-semibold ${
              activeTab === 'activity' ? 'btn-danger' : 'btn-outline-secondary'
            }`}
            onClick={() => setActiveTab('activity')}
          >
            <Activity size={14} />
            <span>Activity Log</span>
            <span className={`badge ms-1 ${activeTab === 'activity' ? 'bg-white text-danger' : 'bg-dark text-white'}`}>
              {auditLogs.length}
            </span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'map'}
            className={`btn btn-sm d-inline-flex align-items-center gap-1.5 fw-semibold ${
              activeTab === 'map' ? 'btn-danger' : 'btn-outline-secondary'
            }`}
            onClick={() => setActiveTab('map')}
          >
            <MapIcon size={14} />
            <span>Pune GIS Situation Map</span>
          </button>
        </div>

        {/* Global Action on Tab (e.g. Export CSV or Create Squad User) */}
        {activeTab === 'incidents' && (
          <button
            type="button"
            className="btn btn-sm btn-outline-dark d-inline-flex align-items-center gap-1.5 fw-semibold"
            onClick={handleExportCSV}
            title="Download CSV export of currently filtered incidents"
          >
            <Download size={14} />
            <span>Export Filtered CSV</span>
          </button>
        )}

        {activeTab === 'users' && (
          <button
            type="button"
            className="btn btn-sm btn-resq-danger d-inline-flex align-items-center gap-1.5 fw-semibold"
            onClick={() => setShowAddRescueModal(true)}
          >
            <UserPlus size={14} />
            <span>Create Rescue Squad Account</span>
          </button>
        )}
      </div>

      {/* ============================================================== */}
      {/* TAB 1: INCIDENTS & DISPATCH DATA TABLE                          */}
      {/* ============================================================== */}
      {activeTab === 'incidents' && (
        <div className="resq-card border shadow-sm mb-4">
          {/* Filter Bar */}
          <div className="p-3 border-bottom bg-white">
            <FilterBar
              searchQuery={incidentSearch}
              onSearchChange={(q) => {
                setIncidentSearch(q);
                setCurrentPage(1);
              }}
              searchPlaceholder="Search incident ID, locality, squad, or keyword..."
              statusFilters={[
                { label: 'Active (Open)', value: 'active' },
                { label: 'Completed (Resolved)', value: 'completed' },
                { label: 'Reported', value: 'Reported' },
                { label: 'Assigned', value: 'Assigned' },
                { label: 'On the Way', value: 'On the Way' },
                { label: 'Reached', value: 'Reached' },
                { label: 'In Progress', value: 'In Progress' }
              ]}
              selectedStatus={statusFilter}
              onStatusChange={(val) => {
                setStatusFilter(val);
                setCurrentPage(1);
              }}
              severityFilters={[
                { label: 'Critical', value: 'critical' },
                { label: 'High', value: 'high' },
                { label: 'Medium', value: 'medium' },
                { label: 'Low', value: 'low' }
              ]}
              selectedSeverity={severityFilter}
              onSeverityChange={(val) => {
                setSeverityFilter(val);
                setCurrentPage(1);
              }}
              typeFilters={['Fire', 'Flood', 'Accident', 'Building Collapse', 'Other']}
              selectedType={typeFilter}
              onTypeChange={(val) => {
                setTypeFilter(val);
                setCurrentPage(1);
              }}
              extraFilters={
                <div className="d-flex align-items-center gap-2">
                  {/* Assignment Select */}
                  <select
                    className="form-select form-select-sm border-secondary-subtle"
                    value={assignmentFilter}
                    onChange={(e) => {
                      setAssignmentFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                    style={{ width: 'auto', minWidth: '130px' }}
                    aria-label="Filter by squad assignment"
                  >
                    <option value="all">All Assignments</option>
                    <option value="unassigned">Unassigned Only</option>
                    <option value="assigned">Assigned Squad</option>
                  </select>

                  {/* Date Range Select */}
                  <select
                    className="form-select form-select-sm border-secondary-subtle"
                    value={dateRangeFilter}
                    onChange={(e) => {
                      setDateRangeFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                    style={{ width: 'auto', minWidth: '120px' }}
                    aria-label="Filter by reporting date"
                  >
                    <option value="all">All Dates</option>
                    <option value="today">Today Only</option>
                    <option value="7days">Last 7 Days</option>
                  </select>
                </div>
              }
              onReset={() => {
                setIncidentSearch('');
                setSeverityFilter('all');
                setStatusFilter('all');
                setTypeFilter('all');
                setAssignmentFilter('all');
                setDateRangeFilter('all');
                setSelectedTeamFilter('all');
                setCurrentPage(1);
              }}
              hasActiveFilters={Boolean(
                incidentSearch ||
                  severityFilter !== 'all' ||
                  statusFilter !== 'all' ||
                  typeFilter !== 'all' ||
                  assignmentFilter !== 'all' ||
                  dateRangeFilter !== 'all' ||
                  selectedTeamFilter !== 'all'
              )}
            />
          </div>

          {/* Incidents Table */}
          <DataTable
            columns={incidentColumns}
            data={sortedIncidents}
            sortField={sortField}
            sortOrder={sortOrder}
            onSort={handleSort}
            onRowClick={(item) => setSelectedIncident(item)}
            highlightedId={highlightedIncidentId}
            currentPage={currentPage}
            itemsPerPage={10}
            onPageChange={setCurrentPage}
            emptyTitle="No incidents matching criteria"
            emptyMessage="Try adjusting or clearing your search filters to view emergency records."
            emptyActionLabel="Reset All Filters"
            onEmptyAction={() => {
              setIncidentSearch('');
              setSeverityFilter('all');
              setStatusFilter('all');
              setTypeFilter('all');
              setAssignmentFilter('all');
              setDateRangeFilter('all');
              setSelectedTeamFilter('all');
            }}
          />
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: RESCUE TEAMS TELEMETRY & CARDS                           */}
      {/* ============================================================== */}
      {activeTab === 'teams' && (
        <div className="row g-3 mb-4">
          {rescueTeams.map((team) => {
            const isAvailable = team.status === 'Available';
            // Find active mission assigned to this team
            const activeMission = incidents.find(
              (i) =>
                (i.assignedTeamId === team.id ||
                  (i.assignedTeamName && i.assignedTeamName.toLowerCase() === team.name.toLowerCase())) &&
                i.status !== 'Completed' &&
                i.status !== 'Resolved'
            );

            // Count completed missions for this team
            const completedCount = incidents.filter(
              (i) =>
                (i.assignedTeamId === team.id ||
                  (i.assignedTeamName && i.assignedTeamName.toLowerCase() === team.name.toLowerCase())) &&
                (i.status === 'Completed' || i.status === 'Resolved')
            ).length;

            return (
              <div key={team.id} className="col-md-6 col-xl-4">
                <div className="resq-card p-4 h-100 bg-white shadow-sm border d-flex flex-column justify-content-between">
                  <div>
                    {/* Top Identity & Status */}
                    <div className="d-flex align-items-start justify-content-between mb-3">
                      <div>
                        <span className="badge bg-dark font-monospace mb-1">{team.id}</span>
                        <h5 className="fw-bold text-dark mb-0 fs-6">{team.name}</h5>
                        <div className="text-muted small">Leader: <strong>{team.leader || 'Officer in Charge'}</strong></div>
                      </div>
                      <StatusBadge status={team.status} size="sm" />
                    </div>

                    {/* Operational Details Grid */}
                    <div className="p-3 rounded bg-light border mb-3 small">
                      <div className="row g-2">
                        <div className="col-6">
                          <span className="text-muted d-block" style={{ fontSize: '0.68rem' }}>BASE LOCATION:</span>
                          <strong className="text-dark d-flex align-items-center gap-1">
                            <MapPin size={11} className="text-danger" />
                            {team.currentLocation || 'Pune Central'}
                          </strong>
                        </div>
                        <div className="col-6">
                          <span className="text-muted d-block" style={{ fontSize: '0.68rem' }}>CREW COMPLEMENT:</span>
                          <strong className="text-dark d-flex align-items-center gap-1">
                            <Users size={11} className="text-primary" />
                            {team.membersCount || 6} personnel
                          </strong>
                        </div>
                        <div className="col-6">
                          <span className="text-muted d-block" style={{ fontSize: '0.68rem' }}>RESPONSE VEHICLE:</span>
                          <span className="text-dark fw-medium d-flex align-items-center gap-1">
                            <Truck size={11} className="text-muted" />
                            {team.vehicle || 'Heavy Unit'}
                          </span>
                        </div>
                        <div className="col-6">
                          <span className="text-muted d-block" style={{ fontSize: '0.68rem' }}>COMPLETED MISSIONS:</span>
                          <strong className="text-success">{completedCount} resolved</strong>
                        </div>
                      </div>
                    </div>

                    {/* Active Mission or Standby */}
                    <div className="mb-3">
                      <div className="text-muted small fw-semibold text-uppercase tracking-wider mb-1" style={{ fontSize: '0.68rem' }}>
                        Current Mission Status:
                      </div>
                      {activeMission ? (
                        <div className="p-2.5 rounded bg-primary-subtle border border-primary-subtle small">
                          <div className="d-flex align-items-center justify-content-between mb-1">
                            <strong className="text-primary">#{activeMission.id}: {activeMission.type}</strong>
                            <SeverityBadge severity={activeMission.severity} size="sm" />
                          </div>
                          <div className="text-secondary small d-flex align-items-center gap-1">
                            <MapPin size={11} className="text-danger flex-shrink-0" />
                            <span className="text-truncate">{activeMission.location}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="p-2.5 rounded bg-success-subtle border border-success-subtle text-success small d-flex align-items-center gap-1.5">
                          <CheckCircle2 size={14} />
                          <span>Squad on Standby • Ready for immediate dispatch</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card Footer Actions */}
                  <div className="border-top pt-3 d-flex align-items-center justify-content-between gap-2">
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1.5"
                      onClick={() => {
                        setSelectedTeamFilter(team.id);
                        setActiveTab('incidents');
                      }}
                      title="View all incidents associated with this squad"
                    >
                      <Eye size={13} />
                      <span>View Missions</span>
                    </button>

                    {team.phone && (
                      <a
                        href={`tel:${team.phone}`}
                        className="btn btn-sm btn-outline-dark d-inline-flex align-items-center gap-1"
                      >
                        <Phone size={13} />
                        <span>Call Base</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 3: USER MANAGEMENT                                         */}
      {/* ============================================================== */}
      {activeTab === 'users' && (
        <div className="resq-card border shadow-sm mb-4">
          {/* User Filter Bar */}
          <div className="p-3 border-bottom bg-white">
            <FilterBar
              searchQuery={userSearch}
              onSearchChange={(q) => {
                setUserSearch(q);
                setUserPage(1);
              }}
              searchPlaceholder="Search user name, email, phone, or squad..."
              statusFilters={[
                { label: 'Active', value: 'active' },
                { label: 'Disabled', value: 'disabled' }
              ]}
              selectedStatus={userStatusFilter}
              onStatusChange={(val) => {
                setUserStatusFilter(val);
                setUserPage(1);
              }}
              severityFilters={[]}
              typeFilters={[
                { label: 'Citizen', value: 'citizen' },
                { label: 'Rescue Squad', value: 'rescue' },
                { label: 'Admin', value: 'admin' }
              ]}
              selectedType={userRoleFilter}
              onTypeChange={(val) => {
                setUserRoleFilter(val);
                setUserPage(1);
              }}
              onReset={() => {
                setUserSearch('');
                setUserRoleFilter('all');
                setUserStatusFilter('all');
                setUserPage(1);
              }}
              hasActiveFilters={Boolean(userSearch || userRoleFilter !== 'all' || userStatusFilter !== 'all')}
            />
          </div>

          {/* Users Table */}
          <DataTable
            columns={userColumns}
            data={filteredUsers}
            currentPage={userPage}
            itemsPerPage={10}
            onPageChange={setUserPage}
            emptyTitle="No registered users found"
            emptyMessage="No accounts match your current filter criteria."
            emptyActionLabel="Reset Filters"
            onEmptyAction={() => {
              setUserSearch('');
              setUserRoleFilter('all');
              setUserStatusFilter('all');
            }}
          />
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 4: AUDIT ACTIVITY LOG                                      */}
      {/* ============================================================== */}
      {activeTab === 'activity' && (
        <div className="resq-card border shadow-sm mb-4">
          <div className="p-3 border-bottom bg-white">
            <FilterBar
              searchQuery={logSearch}
              onSearchChange={(q) => {
                setLogSearch(q);
                setLogPage(1);
              }}
              searchPlaceholder="Search audit actions, operators, or target details..."
              statusFilters={[
                { label: 'Auth Actions', value: 'AUTH' },
                { label: 'Incident Actions', value: 'INCIDENT' },
                { label: 'User Actions', value: 'USER' }
              ]}
              selectedStatus={logActionFilter}
              onStatusChange={(val) => {
                setLogActionFilter(val);
                setLogPage(1);
              }}
              onReset={() => {
                setLogSearch('');
                setLogActionFilter('all');
                setLogPage(1);
              }}
              hasActiveFilters={Boolean(logSearch || logActionFilter !== 'all')}
            />
          </div>

          <DataTable
            columns={logColumns}
            data={filteredLogs}
            currentPage={logPage}
            itemsPerPage={10}
            onPageChange={setLogPage}
            emptyTitle="No activity entries recorded"
            emptyMessage="No matching security or dispatch audit logs were found."
          />
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 5: PUNE GIS SITUATION MAP                                  */}
      {/* ============================================================== */}
      {activeTab === 'map' && (
        <div className="resq-card border shadow-sm overflow-hidden mb-4">
          <div className="p-3 border-bottom bg-light-subtle d-flex flex-wrap align-items-center justify-content-between gap-2">
            <div>
              <h6 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
                <MapPin size={16} className="text-danger" />
                Live Incident Coordinates Across Pune Municipal Sectors
              </h6>
              <span className="text-muted small">
                Click any marker to inspect incident dispatch timeline and details.
              </span>
            </div>
            <div className="d-flex align-items-center gap-2">
              <span className="badge bg-danger-subtle text-danger border border-danger-subtle">
                {incidents.filter((i) => i.severity === 'Critical').length} Critical
              </span>
              <span className="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle">
                {incidents.filter((i) => i.severity === 'High').length} High
              </span>
              <span className="badge bg-primary-subtle text-primary border border-primary-subtle">
                {incidents.length} Total Pinpoints
              </span>
            </div>
          </div>
          <div className="p-0">
            <IncidentMap incidentsList={incidents} height="600px" />
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODALS: EDIT USER, RESET PASSWORD, CREATE RESCUE, CONFIRMATIONS */}
      {/* ============================================================== */}

      {/* 1. Edit User Modal */}
      {editingUser && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          role="dialog"
          aria-modal="true"
          style={{ backgroundColor: 'rgba(11, 19, 41, 0.72)', zIndex: 1060 }}
        >
          <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '440px' }}>
            <div className="modal-content border-0 shadow-lg rounded-3">
              <div className="modal-header bg-navy text-white py-3 px-4">
                <h5 className="modal-title fw-bold fs-6 mb-0">Edit User Details</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setEditingUser(null)}
                ></button>
              </div>
              <form onSubmit={handleSaveEditUser}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label small fw-bold text-dark">Full Name</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-bold text-dark">Phone Number</label>
                    <input
                      type="tel"
                      className="form-control form-control-sm"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-bold text-dark">Email Address</label>
                    <input
                      type="email"
                      className="form-control form-control-sm"
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="modal-footer bg-light px-4 py-2.5 border-top">
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => setEditingUser(null)}
                    disabled={isEditingUserSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-sm btn-primary"
                    disabled={isEditingUserSubmitting}
                  >
                    {isEditingUserSubmitting ? 'Saving...' : 'Save Profile'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* 2. Temporary Password Modal */}
      {tempPasswordResult && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          role="dialog"
          aria-modal="true"
          style={{ backgroundColor: 'rgba(11, 19, 41, 0.72)', zIndex: 1060 }}
        >
          <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '420px' }}>
            <div className="modal-content border-0 shadow-lg rounded-3">
              <div className="modal-header bg-warning-subtle text-warning-emphasis py-3 px-4">
                <div className="d-flex align-items-center gap-2">
                  <Key size={18} />
                  <h5 className="modal-title fw-bold fs-6 mb-0">Temporary Password Generated</h5>
                </div>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setTempPasswordResult(null)}
                ></button>
              </div>
              <div className="modal-body p-4 text-center">
                <p className="text-secondary small mb-3">
                  This user will be required to change their password upon their next sign-in.
                </p>
                <div className="p-3 bg-light rounded border d-flex align-items-center justify-content-between mb-3">
                  <code className="fs-5 fw-bold text-dark tracking-wider select-all">
                    {tempPasswordResult}
                  </code>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1"
                    onClick={handleCopyTempPassword}
                  >
                    {copiedPass ? <Check size={14} className="text-success" /> : <Copy size={14} />}
                    <span>{copiedPass ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <div className="small text-muted">
                  Share this temporary password securely with the user.
                </div>
              </div>
              <div className="modal-footer bg-light px-4 py-2.5 border-top">
                <button
                  type="button"
                  className="btn btn-sm btn-primary w-100"
                  onClick={() => setTempPasswordResult(null)}
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Create Rescue Squad User Modal */}
      {showAddRescueModal && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          role="dialog"
          aria-modal="true"
          style={{ backgroundColor: 'rgba(11, 19, 41, 0.72)', zIndex: 1060 }}
        >
          <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '480px' }}>
            <div className="modal-content border-0 shadow-lg rounded-3">
              <div className="modal-header bg-navy text-white py-3 px-4">
                <h5 className="modal-title fw-bold fs-6 mb-0">Create Rescue Squad Account</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowAddRescueModal(false)}
                ></button>
              </div>
              <form onSubmit={handleCreateRescueSubmit}>
                <div className="modal-body p-4">
                  {addRescueError && (
                    <div className="alert alert-danger py-2 small mb-3">
                      {addRescueError}
                    </div>
                  )}
                  <div className="mb-3">
                    <label className="form-label small fw-bold text-dark">Officer / User Name</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={addRescueForm.name}
                      onChange={(e) => setAddRescueForm({ ...addRescueForm, name: e.target.value })}
                      placeholder="e.g. Inspector Ramesh Kadam"
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-bold text-dark">Official Email</label>
                    <input
                      type="email"
                      className="form-control form-control-sm"
                      value={addRescueForm.email}
                      onChange={(e) => setAddRescueForm({ ...addRescueForm, email: e.target.value })}
                      placeholder="e.g. squad1@resqnet.org"
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-bold text-dark">Contact Phone</label>
                    <input
                      type="tel"
                      className="form-control form-control-sm"
                      value={addRescueForm.phone}
                      onChange={(e) => setAddRescueForm({ ...addRescueForm, phone: e.target.value })}
                      placeholder="e.g. 9820011223"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-bold text-dark">Assign to Squad Unit</label>
                    <select
                      className="form-select form-select-sm"
                      value={addRescueForm.teamId}
                      onChange={(e) => setAddRescueForm({ ...addRescueForm, teamId: e.target.value })}
                    >
                      {rescueTeams.map((team) => (
                        <option key={team.id} value={team.id}>
                          {team.name} ({team.id}) • {team.currentLocation}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-bold text-dark">Initial Password</label>
                    <input
                      type="password"
                      className="form-control form-control-sm"
                      value={addRescueForm.password}
                      onChange={(e) => setAddRescueForm({ ...addRescueForm, password: e.target.value })}
                      placeholder="At least 6 characters"
                      required
                    />
                  </div>
                </div>
                <div className="modal-footer bg-light px-4 py-2.5 border-top">
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => setShowAddRescueModal(false)}
                    disabled={isCreatingRescue}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-sm btn-resq-danger"
                    disabled={isCreatingRescue}
                  >
                    {isCreatingRescue ? 'Creating Account...' : 'Create Rescue Account'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* 4. Confirm Status Toggle Modal */}
      <ConfirmModal
        isOpen={Boolean(confirmStatusUser)}
        onClose={() => setConfirmStatusUser(null)}
        onConfirm={handleConfirmToggleStatus}
        title={confirmStatusUser?.isActive !== false ? 'Disable User Account' : 'Re-enable User Account'}
        message={
          confirmStatusUser?.isActive !== false
            ? `Are you sure you want to disable ${confirmStatusUser?.name} (${confirmStatusUser?.email})? They will be unable to sign in until re-enabled.`
            : `Re-enable account access for ${confirmStatusUser?.name} (${confirmStatusUser?.email})?`
        }
        confirmLabel={confirmStatusUser?.isActive !== false ? 'Disable Account' : 'Enable Account'}
        isDestructive={confirmStatusUser?.isActive !== false}
        isLoading={isStatusSubmitting}
      />

      {/* 5. Confirm Delete User Modal */}
      <ConfirmModal
        isOpen={Boolean(confirmDeleteUser)}
        onClose={() => setConfirmDeleteUser(null)}
        onConfirm={handleConfirmDeleteUser}
        title="Delete User Account"
        message={`Warning: Are you sure you want to permanently delete user account "${confirmDeleteUser?.name}" (${confirmDeleteUser?.email})? This action cannot be reversed.`}
        confirmLabel="Permanently Delete"
        isDestructive={true}
        isLoading={isDeleteSubmitting}
      />

      {/* 6. Local Assign Modal if triggered from internal table actions */}
      {localAssignTarget && (
        <AssignTeamModal
          incident={localAssignTarget}
          onClose={() => setLocalAssignTarget(null)}
          onAssigned={handleSquadAssigned}
        />
      )}
    </div>
  );
};

export default AdminDashboard;

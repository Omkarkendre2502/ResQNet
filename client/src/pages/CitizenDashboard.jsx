import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { useDebounce } from '../hooks/useDebounce';
import { formatRelativeTime } from '../hooks/useRelativeTime';
import {
  Plus,
  Eye,
  AlertTriangle,
  Flame,
  Waves,
  Car,
  Building2,
  CheckCircle2,
  Activity,
  PhoneCall,
  ShieldAlert,
  HelpCircle,
  Clock,
  Sparkles
} from 'lucide-react';
import PageHeader from '../components/dashboard/PageHeader';
import StatCard from '../components/dashboard/StatCard';
import StatusBadge from '../components/dashboard/StatusBadge';
import SeverityBadge from '../components/dashboard/SeverityBadge';
import DataTable from '../components/dashboard/DataTable';
import FilterBar from '../components/dashboard/FilterBar';

/**
 * Citizen Emergency Response Dashboard (Pune Zone).
 * Provides live emergency tracking, quick stats, filtered incident records,
 * safety protocols, and emergency hotlines.
 */
export const CitizenDashboard = () => {
  const {
    currentUser,
    incidents = [],
    navigateTo,
    setSelectedIncident
  } = useApp();

  // Filters & Search State
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'active' | 'completed' | specific status
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState('reportedAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);

  const debouncedSearch = useDebounce(searchQuery, 300);

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

  // Metrics computation
  const stats = useMemo(() => {
    const total = incidents.length;
    const active = incidents.filter(
      (i) => i.status !== 'Completed' && i.status !== 'Resolved'
    ).length;
    const completed = incidents.filter(
      (i) => i.status === 'Completed' || i.status === 'Resolved'
    ).length;

    // Latest status
    const sortedByTime = [...incidents].sort(
      (a, b) => new Date(b.reportedAt || 0) - new Date(a.reportedAt || 0)
    );
    const latestIncident = sortedByTime[0];
    const latestStatus = latestIncident ? latestIncident.status : 'None';

    return { total, active, completed, latestStatus, latestIncident };
  }, [incidents]);

  // Filtered & Sorted incidents
  const filteredIncidents = useMemo(() => {
    return incidents.filter((inc) => {
      // Status filter
      if (statusFilter !== 'all') {
        const isDone = inc.status === 'Completed' || inc.status === 'Resolved';
        if (statusFilter === 'active' && isDone) return false;
        if (statusFilter === 'completed' && !isDone) return false;
        if (
          statusFilter !== 'active' &&
          statusFilter !== 'completed' &&
          inc.status.toLowerCase() !== statusFilter.toLowerCase()
        ) {
          return false;
        }
      }

      // Search query
      if (debouncedSearch.trim()) {
        const q = debouncedSearch.toLowerCase().trim();
        const matchId = inc.id?.toLowerCase().includes(q);
        const matchLoc = inc.location?.toLowerCase().includes(q);
        const matchType = inc.type?.toLowerCase().includes(q);
        const matchTitle = inc.title?.toLowerCase().includes(q);
        if (!matchId && !matchLoc && !matchType && !matchTitle) return false;
      }

      return true;
    });
  }, [incidents, statusFilter, debouncedSearch]);

  const sortedIncidents = useMemo(() => {
    const list = [...filteredIncidents];
    list.sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (sortField === 'reportedAt') {
        valA = new Date(valA || 0).getTime();
        valB = new Date(valB || 0).getTime();
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

  // Table Columns
  const columns = [
    {
      key: 'id',
      label: 'Incident ID',
      sortable: true,
      width: '120px',
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
      width: '160px',
      render: (item) => (
        <div className="d-flex align-items-center gap-2">
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
              {item.peopleAffected} persons affected
            </div>
          ) : null}
        </div>
      )
    },
    {
      key: 'severity',
      label: 'Severity',
      sortable: true,
      width: '120px',
      render: (item) => <SeverityBadge severity={item.severity} size="sm" />
    },
    {
      key: 'status',
      label: 'Live Status',
      sortable: true,
      width: '140px',
      render: (item) => <StatusBadge status={item.status} size="sm" />
    },
    {
      key: 'assignedTeamName',
      label: 'Assigned Squad',
      sortable: true,
      width: '170px',
      render: (item) => (
        <span className={item.assignedTeamName ? 'fw-medium text-primary small' : 'text-muted small fst-italic'}>
          {item.assignedTeamName || 'Pending Dispatch'}
        </span>
      )
    },
    {
      key: 'reportedAt',
      label: 'Reported',
      sortable: true,
      width: '130px',
      render: (item) => {
        const { relativeTime, fullDate } = formatRelativeTime(item.reportedAt);
        return (
          <span
            className="text-secondary small d-inline-flex align-items-center gap-1 cursor-help"
            title={`Reported at: ${fullDate}`}
          >
            <Clock size={12} className="text-muted" />
            <span>{relativeTime}</span>
          </span>
        );
      }
    },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      align: 'end',
      width: '100px',
      render: (item) => (
        <button
          type="button"
          className="btn btn-sm btn-outline-danger d-inline-flex align-items-center gap-1 py-1 px-2.5 fw-semibold"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedIncident(item);
          }}
          title="Track live mission status and details"
        >
          <Eye size={13} />
          <span>Track</span>
        </button>
      )
    }
  ];

  return (
    <div className="citizen-dashboard container-fluid p-3 p-lg-4">
      {/* 1. Page Header */}
      <PageHeader
        title={`Welcome, ${currentUser?.name || 'Citizen'}`}
        subtitle="Pune Zone Citizen Emergency Services • Track live rescue missions and report municipal incidents."
        roleBadge="CITIZEN PORTAL"
        showReportButton={true}
        onReportClick={() => navigateTo('report-emergency')}
      />

      {/* 2. Stat Cards Grid (Clickable Filters) */}
      <div className="stat-card-grid">
        <StatCard
          icon={<Activity size={20} />}
          value={stats.total}
          label="Total Reported"
          sublabel="All your reported emergencies"
          variant="primary"
          isActive={statusFilter === 'all'}
          onClick={() => setStatusFilter('all')}
        />
        <StatCard
          icon={<AlertTriangle size={20} />}
          value={stats.active}
          label="Active Operations"
          sublabel="In progress or en route"
          variant="danger"
          isActive={statusFilter === 'active'}
          onClick={() => setStatusFilter('active')}
        />
        <StatCard
          icon={<CheckCircle2 size={20} />}
          value={stats.completed}
          label="Resolved Missions"
          sublabel="Successfully resolved & closed"
          variant="success"
          isActive={statusFilter === 'completed'}
          onClick={() => setStatusFilter('completed')}
        />
        <StatCard
          icon={<Sparkles size={20} />}
          value={stats.latestStatus}
          label="Latest Status"
          sublabel={stats.latestIncident ? `Incident #${stats.latestIncident.id}` : 'No active reports'}
          variant="info"
          isActive={
            statusFilter !== 'all' &&
            statusFilter !== 'active' &&
            statusFilter !== 'completed' &&
            statusFilter === stats.latestStatus
          }
          onClick={() => {
            if (stats.latestIncident) {
              setStatusFilter(stats.latestIncident.status);
            }
          }}
        />
      </div>

      {/* 3. My Reported Incidents Table Section */}
      <div className="resq-card shadow-sm border mb-4">
        <div className="p-3 border-bottom d-flex flex-wrap align-items-center justify-content-between gap-3 bg-light-subtle">
          <div className="d-flex align-items-center gap-2">
            <h2 className="h6 fw-bold text-dark mb-0">My Reported Incidents</h2>
            <span className="badge bg-navy text-white rounded-pill px-2.5">
              {filteredIncidents.length}
            </span>
          </div>

          {/* Quick status tabs */}
          <div className="btn-group btn-group-sm" role="group" aria-label="Filter incidents by status">
            <button
              type="button"
              className={`btn ${statusFilter === 'all' ? 'btn-dark' : 'btn-outline-secondary'}`}
              onClick={() => {
                setStatusFilter('all');
                setCurrentPage(1);
              }}
            >
              All ({stats.total})
            </button>
            <button
              type="button"
              className={`btn ${statusFilter === 'active' ? 'btn-danger' : 'btn-outline-secondary'}`}
              onClick={() => {
                setStatusFilter('active');
                setCurrentPage(1);
              }}
            >
              Active ({stats.active})
            </button>
            <button
              type="button"
              className={`btn ${statusFilter === 'completed' ? 'btn-success' : 'btn-outline-secondary'}`}
              onClick={() => {
                setStatusFilter('completed');
                setCurrentPage(1);
              }}
            >
              Completed ({stats.completed})
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="p-3 border-bottom bg-white">
          <FilterBar
            searchQuery={searchQuery}
            onSearchChange={(q) => {
              setSearchQuery(q);
              setCurrentPage(1);
            }}
            searchPlaceholder="Search by ID, location, or emergency type..."
            onReset={() => {
              setSearchQuery('');
              setStatusFilter('all');
              setCurrentPage(1);
            }}
            hasActiveFilters={Boolean(searchQuery || statusFilter !== 'all')}
          />
        </div>

        {/* Incidents DataTable */}
        <DataTable
          columns={columns}
          data={sortedIncidents}
          sortField={sortField}
          sortOrder={sortOrder}
          onSort={handleSort}
          onRowClick={(item) => setSelectedIncident(item)}
          currentPage={currentPage}
          itemsPerPage={10}
          onPageChange={setCurrentPage}
          emptyTitle="No incidents found"
          emptyMessage={
            incidents.length === 0
              ? 'No incidents yet - report your first emergency if you require rescue, fire, or medical dispatch.'
              : 'No incidents match your search query or selected filter.'
          }
          emptyActionLabel={incidents.length === 0 ? 'Report Emergency' : 'Clear Filters'}
          onEmptyAction={
            incidents.length === 0
              ? () => navigateTo('report-emergency')
              : () => {
                  setSearchQuery('');
                  setStatusFilter('all');
                }
          }
        />
      </div>

      {/* 4. Safety Guidance & Emergency Hotlines Bar */}
      <div className="row g-3">
        {/* Quick Tips */}
        <div className="col-lg-7">
          <div className="resq-card p-4 h-100 bg-white border shadow-sm">
            <div className="d-flex align-items-center gap-2 mb-3">
              <ShieldAlert size={18} className="text-danger" />
              <h3 className="h6 fw-bold text-dark mb-0">Emergency Response Guidelines • Pune Zone</h3>
            </div>
            <div className="row g-3 small">
              <div className="col-md-4">
                <div className="p-3 rounded bg-light border h-100">
                  <div className="fw-bold text-dark mb-1">1. Stay Clear & Safe</div>
                  <div className="text-secondary">
                    Move away from active hazard zones (structural cracks, flood currents, open flames) to marked safety points.
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="p-3 rounded bg-light border h-100">
                  <div className="fw-bold text-dark mb-1">2. Keep Lines Clear</div>
                  <div className="text-secondary">
                    Keep your registered phone line open for callback verification by the assigned Pune dispatch squad leader.
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="p-3 rounded bg-light border h-100">
                  <div className="fw-bold text-dark mb-1">3. Live Coordination</div>
                  <div className="text-secondary">
                    Check the live 6-step Progress Timeline for arrival estimates. Do not enter unstable cordoned areas.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pune Emergency Hotlines */}
        <div className="col-lg-5">
          <div className="resq-card p-4 h-100 bg-white border shadow-sm">
            <div className="d-flex align-items-center gap-2 mb-3">
              <PhoneCall size={18} className="text-danger" />
              <h3 className="h6 fw-bold text-dark mb-0">Direct Pune Emergency Hotlines</h3>
            </div>
            <div className="d-flex flex-column gap-2.5">
              <a
                href="tel:112"
                className="p-2.5 px-3 rounded border d-flex align-items-center justify-content-between text-decoration-none bg-light hover-shadow transition"
              >
                <div>
                  <div className="fw-bold text-dark small">National Emergency Service</div>
                  <div className="text-muted" style={{ fontSize: '0.72rem' }}>All-in-one Police, Fire & Medical</div>
                </div>
                <span className="badge bg-danger fs-6 px-3 py-1.5 font-monospace">112</span>
              </a>

              <a
                href="tel:101"
                className="p-2.5 px-3 rounded border d-flex align-items-center justify-content-between text-decoration-none bg-light hover-shadow transition"
              >
                <div>
                  <div className="fw-bold text-dark small">Pune Municipal Fire Brigade</div>
                  <div className="text-muted" style={{ fontSize: '0.72rem' }}>Fire rescue & heavy HAZMAT extrication</div>
                </div>
                <span className="badge bg-danger fs-6 px-3 py-1.5 font-monospace">101</span>
              </a>

              <a
                href="tel:108"
                className="p-2.5 px-3 rounded border d-flex align-items-center justify-content-between text-decoration-none bg-light hover-shadow transition"
              >
                <div>
                  <div className="fw-bold text-dark small">Disaster Medical Ambulance</div>
                  <div className="text-muted" style={{ fontSize: '0.72rem' }}>Emergency trauma & life support triage</div>
                </div>
                <span className="badge bg-danger fs-6 px-3 py-1.5 font-monospace">108</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CitizenDashboard;

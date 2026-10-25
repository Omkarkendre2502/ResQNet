import { useMemo } from 'react';
import { useApp } from '../context/AppContext';

/**
 * Custom hook to filter, sort, and calculate metrics on incidents.
 *
 * @param {Object} options
 * @param {string} [options.filterStatus='all']
 * @param {string} [options.filterSeverity='all']
 * @param {string} [options.filterType='all']
 * @param {string} [options.searchQuery='']
 * @param {string} [options.sortField='reportedAt']
 * @param {'asc'|'desc'} [options.sortOrder='desc']
 * @param {string} [options.teamId]
 * @returns {Object} Filtered incidents and computed metrics
 */
export const useIncidents = (options = {}) => {
  const { incidents = [], rescueTeams = [], currentUser } = useApp();

  const {
    filterStatus = 'all',
    filterSeverity = 'all',
    filterType = 'all',
    searchQuery = '',
    sortField = 'reportedAt',
    sortOrder = 'desc',
    teamId = null
  } = options;

  // Filtered list based on active filters
  const filteredIncidents = useMemo(() => {
    return incidents.filter((inc) => {
      // Team filter if specified
      if (teamId) {
        const matchesTeamId =
          inc.assignedTeamId &&
          String(inc.assignedTeamId).toLowerCase() === String(teamId).toLowerCase();
        const matchesTeamName =
          inc.assignedTeamName &&
          rescueTeams.some(
            (t) =>
              t.id === teamId &&
              t.name.toLowerCase() === inc.assignedTeamName.toLowerCase()
          );
        if (!matchesTeamId && !matchesTeamName) return false;
      }

      // Status filter
      if (filterStatus !== 'all') {
        const isDone = inc.status === 'Completed' || inc.status === 'Resolved';
        if (filterStatus === 'active' && isDone) return false;
        if (filterStatus === 'completed' && !isDone) return false;
        if (
          filterStatus !== 'active' &&
          filterStatus !== 'completed' &&
          inc.status.toLowerCase() !== filterStatus.toLowerCase()
        ) {
          return false;
        }
      }

      // Severity filter
      if (
        filterSeverity !== 'all' &&
        inc.severity?.toLowerCase() !== filterSeverity.toLowerCase()
      ) {
        return false;
      }

      // Type filter
      if (
        filterType !== 'all' &&
        inc.type?.toLowerCase() !== filterType.toLowerCase()
      ) {
        return false;
      }

      // Search query filter (matches ID, location, title, reporter name, squad name)
      if (searchQuery && searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
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
  }, [incidents, rescueTeams, teamId, filterStatus, filterSeverity, filterType, searchQuery]);

  // Sorted list
  const sortedIncidents = useMemo(() => {
    const list = [...filteredIncidents];
    list.sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (sortField === 'reportedAt') {
        valA = new Date(valA || 0).getTime();
        valB = new Date(valB || 0).getTime();
      } else if (sortField === 'severity') {
        const severityRank = { Critical: 4, High: 3, Medium: 2, Low: 1 };
        valA = severityRank[a.severity] || 0;
        valB = severityRank[b.severity] || 0;
      } else if (typeof valA === 'string') {
        valA = valA.toLowerCase();
        valB = (valB || '').toLowerCase();
        return sortOrder === 'asc'
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
    return list;
  }, [filteredIncidents, sortField, sortOrder]);

  // Computed summary stats
  const metrics = useMemo(() => {
    const now = Date.now();
    let total = incidents.length;
    let active = 0;
    let completed = 0;
    let criticalOpen = 0;
    let unassigned = 0;
    let highUrgencyUnassigned = 0;
    let completedToday = 0;

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const todayMs = startOfToday.getTime();

    incidents.forEach((inc) => {
      const isCompleted = inc.status === 'Completed' || inc.status === 'Resolved';
      if (isCompleted) {
        completed++;
        const repDate = new Date(inc.reportedAt || 0).getTime();
        if (repDate >= todayMs) {
          completedToday++;
        }
      } else {
        active++;
        if (inc.severity === 'Critical') {
          criticalOpen++;
        }
        if (!inc.assignedTeamId && inc.status === 'Reported') {
          unassigned++;
          // Waiting > 10 min for Critical or High
          const repTime = new Date(inc.reportedAt || 0).getTime();
          const waitingMinutes = (now - repTime) / (1000 * 60);
          if (
            (inc.severity === 'Critical' || inc.severity === 'High') &&
            waitingMinutes > 10
          ) {
            highUrgencyUnassigned++;
          }
        }
      }
    });

    return {
      total,
      active,
      completed,
      criticalOpen,
      unassigned,
      highUrgencyUnassigned,
      completedToday,
      totalTeams: rescueTeams.length,
      availableTeams: rescueTeams.filter((t) => t.status === 'Available').length
    };
  }, [incidents, rescueTeams]);

  // Export to CSV helper
  const exportToCSV = (filename = `resqnet_incidents_${Date.now()}.csv`) => {
    if (!sortedIncidents.length) return false;

    const headers = [
      'Incident ID',
      'Type',
      'Severity',
      'Status',
      'Location',
      'People Affected',
      'Assigned Squad',
      'Reported Time',
      'Description'
    ];

    const rows = sortedIncidents.map((i) => [
      `"${i.id || ''}"`,
      `"${i.type || ''}"`,
      `"${i.severity || ''}"`,
      `"${i.status || ''}"`,
      `"${(i.location || '').replace(/"/g, '""')}"`,
      `"${i.peopleAffected || 0}"`,
      `"${(i.assignedTeamName || 'Unassigned').replace(/"/g, '""')}"`,
      `"${new Date(i.reportedAt).toLocaleString('en-IN')}"`,
      `"${(i.description || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return true;
  };

  return {
    incidents: sortedIncidents,
    totalCount: filteredIncidents.length,
    rawCount: incidents.length,
    metrics,
    exportToCSV,
    currentUser
  };
};

export default useIncidents;

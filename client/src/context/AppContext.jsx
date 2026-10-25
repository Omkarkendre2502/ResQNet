import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AppContext = createContext();

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const STORAGE_ACTIVE_TEAM_KEY = 'resqnet_active_team';
const STORAGE_USER_KEY = 'resqnet_session_user';
const STORAGE_TOKEN_KEY = 'resqnet_session_token';

// Clean up any legacy localStorage data
try {
  localStorage.removeItem('resqnet_pune_incidents_v2');
  localStorage.removeItem('resqnet_pune_teams_v2');
  localStorage.removeItem('resqnet_pune_users_list_v2');
  localStorage.removeItem('resqnet_pune_user_v2');
  localStorage.removeItem('resqnet_pune_token_v2');
} catch (e) {
  // Ignore in restricted environments
}

export const AppProvider = ({ children }) => {
  // Navigation State
  const [activePage, setActivePage] = useState('home');
  const [redirectAfterLogin, setRedirectAfterLogin] = useState(null);

  // Selected Incident for Detail Modal
  const [selectedIncident, setSelectedIncident] = useState(null);

  // Toast Notification State
  const [toast, setToast] = useState(null);

  // Auth Token stored in sessionStorage (secure session-only storage)
  const [authToken, setAuthToken] = useState(() => {
    try {
      return sessionStorage.getItem(STORAGE_TOKEN_KEY) || null;
    } catch (e) {
      return null;
    }
  });

  // Current User State loaded from sessionStorage only
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const savedUser = sessionStorage.getItem(STORAGE_USER_KEY);
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (e) {
      return null;
    }
  });

  // Incidents State (always live from server, never cached in localStorage)
  const [incidents, setIncidents] = useState([]);

  // Rescue Teams State (always live from server, never cached in localStorage)
  const [rescueTeams, setRescueTeams] = useState([]);

  // Active Rescue Team ID for Rescue Team Dashboard
  const [activeTeamId, setActiveTeamId] = useState(() => {
    try {
      return sessionStorage.getItem(STORAGE_ACTIVE_TEAM_KEY) || 'PERT-01';
    } catch (e) {
      return 'PERT-01';
    }
  });

  // Registered users list (for Admin management panel)
  const [registeredUsers, setRegisteredUsers] = useState([]);

  // Audit Logs list (for Admin management panel)
  const [auditLogs, setAuditLogs] = useState([]);

  // Auto-refresh & Sync State
  const [lastUpdated, setLastUpdated] = useState(() => Date.now());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [readNotificationIds, setReadNotificationIds] = useState(() => {
    try {
      const stored = sessionStorage.getItem('resqnet_read_notifications');
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch (e) {
      return new Set();
    }
  });

  // Toast notification
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  // Navigation
  const navigateTo = (page) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setActivePage(page);
  };

  // Handle Unauthorized (401: Token missing, invalid, or expired)
  const handleUnauthorized = useCallback(() => {
    setCurrentUser(null);
    setAuthToken(null);
    setIncidents([]);
    setRescueTeams([]);
    setRegisteredUsers([]);
    try {
      sessionStorage.removeItem(STORAGE_USER_KEY);
      sessionStorage.removeItem(STORAGE_TOKEN_KEY);
      sessionStorage.removeItem(STORAGE_ACTIVE_TEAM_KEY);
    } catch (e) {
      console.error('Error clearing session credentials', e);
    }
    navigateTo('login');
    showToast('Session expired, please sign in again.', 'warning');
  }, []);

  // Helper for Auth Headers
  const getHeaders = useCallback(() => {
    const headers = { 'Content-Type': 'application/json' };
    const token = authToken || (function() {
      try { return sessionStorage.getItem(STORAGE_TOKEN_KEY); } catch (e) { return null; }
    })();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }, [authToken]);

  // Fetch Incidents from Backend API
  const fetchIncidents = useCallback(async () => {
    const token = authToken || (function() {
      try { return sessionStorage.getItem(STORAGE_TOKEN_KEY); } catch (e) { return null; }
    })();
    if (!token) return;

    try {
      const res = await fetch(`${API_BASE_URL}/incidents`, {
        headers: getHeaders()
      });
      if (res.status === 401) {
        handleUnauthorized();
        return;
      }
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setIncidents(data);
        }
      }
    } catch (err) {
      console.warn('Network error fetching incidents:', err.message);
    }
  }, [authToken, getHeaders, handleUnauthorized]);

  // Fetch Rescue Teams from Backend API
  const fetchTeams = useCallback(async () => {
    const token = authToken || (function() {
      try { return sessionStorage.getItem(STORAGE_TOKEN_KEY); } catch (e) { return null; }
    })();
    if (!token) return;

    try {
      const res = await fetch(`${API_BASE_URL}/rescue-teams`, {
        headers: getHeaders()
      });
      if (res.status === 401) {
        handleUnauthorized();
        return;
      }
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setRescueTeams(data);
        }
      }
    } catch (err) {
      console.warn('Network error fetching rescue teams:', err.message);
    }
  }, [authToken, getHeaders, handleUnauthorized]);

  // Fetch Registered Users from Backend API (Admin only)
  const fetchUsers = useCallback(async () => {
    const token = authToken || (function() {
      try { return sessionStorage.getItem(STORAGE_TOKEN_KEY); } catch (e) { return null; }
    })();
    if (!token || currentUser?.role !== 'admin') return;

    try {
      const res = await fetch(`${API_BASE_URL}/admin/users`, {
        headers: getHeaders()
      });
      if (res.status === 401) {
        handleUnauthorized();
        return;
      }
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.users)) {
          setRegisteredUsers(data.users);
        }
      }
    } catch (err) {
      console.warn('Network error fetching users:', err.message);
    }
  }, [authToken, currentUser?.role, getHeaders, handleUnauthorized]);

  // Fetch Audit Logs from Backend API (Admin only)
  const fetchAuditLogs = useCallback(async () => {
    const token = authToken || (function() {
      try { return sessionStorage.getItem(STORAGE_TOKEN_KEY); } catch (e) { return null; }
    })();
    if (!token || currentUser?.role !== 'admin') return;

    try {
      const res = await fetch(`${API_BASE_URL}/admin/audit-logs`, {
        headers: getHeaders()
      });
      if (res.status === 401) {
        handleUnauthorized();
        return;
      }
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.logs)) {
          setAuditLogs(data.logs);
        }
      }
    } catch (err) {
      console.warn('Network error fetching audit logs:', err.message);
    }
  }, [authToken, currentUser?.role, getHeaders, handleUnauthorized]);

  // Refresh All Data (Manual & Background Auto-Polling)
  const refreshAllData = useCallback(async () => {
    const token = authToken || (function() {
      try { return sessionStorage.getItem(STORAGE_TOKEN_KEY); } catch (e) { return null; }
    })();
    if (!token) return;

    setIsRefreshing(true);
    try {
      await Promise.all([
        fetchIncidents(),
        fetchTeams(),
        currentUser?.role === 'admin' ? fetchUsers() : Promise.resolve(),
        currentUser?.role === 'admin' ? fetchAuditLogs() : Promise.resolve()
      ]);
      setLastUpdated(Date.now());
    } finally {
      setIsRefreshing(false);
    }
  }, [authToken, currentUser?.role, fetchIncidents, fetchTeams, fetchUsers, fetchAuditLogs]);

  // Sync on Mount & Auth State Changes
  useEffect(() => {
    if (authToken) {
      fetchIncidents();
      fetchTeams();
      if (currentUser?.role === 'admin') {
        fetchUsers();
        fetchAuditLogs();
      }
      setLastUpdated(Date.now());
    } else {
      setIncidents([]);
      setRescueTeams([]);
      setRegisteredUsers([]);
      setAuditLogs([]);
    }
  }, [authToken, currentUser?.role, fetchIncidents, fetchTeams, fetchUsers, fetchAuditLogs]);

  // 20-Second Background Auto-Polling (pauses on hidden tab, refreshes immediately when visible)
  useEffect(() => {
    if (!authToken) return;

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        refreshAllData();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    const interval = setInterval(() => {
      if (!document.hidden) {
        refreshAllData();
      }
    }, 20000);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [authToken, refreshAllData]);

  // Derived Notifications from active and recent incidents
  const notifications = incidents.slice(0, 10).map((inc) => {
    let alertDesc = `${inc.location} • ${inc.status}`;
    if (inc.status === 'Reported') {
      alertDesc = `New report at ${inc.location} (${inc.severity} severity)`;
    } else if (inc.status === 'Assigned') {
      alertDesc = `Assigned to ${inc.assignedTeamName || 'Rescue Squad'}`;
    } else if (inc.status === 'On the Way') {
      alertDesc = `${inc.assignedTeamName || 'Squad'} is en route to ${inc.location}`;
    } else if (inc.status === 'In Progress') {
      alertDesc = `Active rescue operations underway at ${inc.location}`;
    } else if (inc.status === 'Completed' || inc.status === 'Resolved') {
      alertDesc = `Mission completed & verified at ${inc.location}`;
    }
    return {
      id: `${inc.id}-${inc.status}`,
      incidentId: inc.id,
      title: `${inc.type} Emergency #${inc.id}`,
      message: alertDesc,
      time: inc.reportedAt,
      severity: inc.severity,
      status: inc.status,
      incident: inc
    };
  });

  const unreadNotificationsCount = notifications.filter(
    (n) => !readNotificationIds.has(n.id)
  ).length;

  const markAllNotificationsAsRead = () => {
    const allIds = notifications.map((n) => n.id);
    const newSet = new Set(allIds);
    setReadNotificationIds(newSet);
    try {
      sessionStorage.setItem('resqnet_read_notifications', JSON.stringify(Array.from(newSet)));
    } catch (e) {}
  };

  const markNotificationAsRead = (id) => {
    setReadNotificationIds((prev) => {
      const next = new Set([...prev, id]);
      try {
        sessionStorage.setItem('resqnet_read_notifications', JSON.stringify(Array.from(next)));
      } catch (e) {}
      return next;
    });
  };

  // Change Password for Logged-In User
  const changePassword = async (currentPassword, newPassword) => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/change-password`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ currentPassword, newPassword })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to change password');
      }
      showToast(data.message || 'Password changed successfully.', 'success');
      return { success: true };
    } catch (err) {
      showToast(err.message, 'danger');
      return { success: false, error: err.message };
    }
  };

  // Persist Current User & Token strictly to sessionStorage
  useEffect(() => {
    try {
      if (currentUser) {
        sessionStorage.setItem(STORAGE_USER_KEY, JSON.stringify(currentUser));
      } else {
        sessionStorage.removeItem(STORAGE_USER_KEY);
      }
      if (authToken) {
        sessionStorage.setItem(STORAGE_TOKEN_KEY, authToken);
      } else {
        sessionStorage.removeItem(STORAGE_TOKEN_KEY);
      }
      if (activeTeamId) {
        sessionStorage.setItem(STORAGE_ACTIVE_TEAM_KEY, activeTeamId);
      }
    } catch (e) {
      console.error('Failed to sync session credentials', e);
    }
  }, [currentUser, authToken, activeTeamId]);

  // 1. User Login (Single login form for all roles; server authenticates & returns role)
  const login = async (email, password) => {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim(), password })
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const errorMsg = data.error || 'Invalid email or password';
      showToast(errorMsg, 'danger');
      throw new Error(errorMsg);
    }

    setCurrentUser(data.user);
    setAuthToken(data.token);
    try {
      sessionStorage.setItem(STORAGE_TOKEN_KEY, data.token);
      sessionStorage.setItem(STORAGE_USER_KEY, JSON.stringify(data.user));
    } catch (e) {}

    if (data.user.teamId) {
      setActiveTeamId(data.user.teamId);
    }

    showToast(`Welcome back, ${data.user.name}!`, 'success');

    // If user must change password, remain on password change view before routing to dashboard
    if (data.user.mustChangePassword) {
      showToast('Please set a new password to continue.', 'warning');
      return { success: true, user: data.user, mustChangePassword: true };
    }

    // Route to intended destination if remembered, otherwise to role dashboard
    if (redirectAfterLogin) {
      const destination = redirectAfterLogin;
      setRedirectAfterLogin(null);
      navigateTo(destination);
    } else if (data.user.role === 'admin') {
      navigateTo('admin-dashboard');
    } else if (data.user.role === 'rescue') {
      navigateTo('rescue-dashboard');
    } else {
      navigateTo('citizen-dashboard');
    }

    return { success: true, user: data.user };
  };

  // 2. User Logout
  const logout = () => {
    setCurrentUser(null);
    setAuthToken(null);
    setIncidents([]);
    setRescueTeams([]);
    setRegisteredUsers([]);
    try {
      sessionStorage.removeItem(STORAGE_USER_KEY);
      sessionStorage.removeItem(STORAGE_TOKEN_KEY);
      sessionStorage.removeItem(STORAGE_ACTIVE_TEAM_KEY);
    } catch (e) {}
    navigateTo('home');
    showToast('Logged out successfully', 'info');
  };

  // 3. Citizen Registration (Creates citizen account, does NOT auto-login)
  const registerCitizen = async (name, email, phone, password) => {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, phone, password })
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const errorMsg = data.error || (data.details ? data.details.map((d) => d.message).join('. ') : 'Registration failed.');
      showToast(errorMsg, 'danger');
      throw new Error(errorMsg);
    }

    showToast('Account created successfully. Please sign in with your credentials.', 'success');
    return { success: true, email: data.user?.email || email };
  };

  // 4. Citizen Reports Emergency (POST /api/incidents)
  const reportEmergency = async (formData) => {
    const isFormData = typeof FormData !== 'undefined' && formData instanceof FormData;

    const headers = {};
    const token = authToken || (function() {
      try { return sessionStorage.getItem(STORAGE_TOKEN_KEY); } catch (e) { return null; }
    })();

    if (!token) {
      handleUnauthorized();
      throw new Error('Please sign in to report an emergency.');
    }

    headers['Authorization'] = `Bearer ${token}`;

    let body;
    if (isFormData) {
      body = formData;
    } else {
      headers['Content-Type'] = 'application/json';
      body = JSON.stringify(formData);
    }

    const res = await fetch(`${API_BASE_URL}/incidents`, {
      method: 'POST',
      headers,
      body
    });

    if (res.status === 401) {
      handleUnauthorized();
      throw new Error('Session expired. Please sign in again.');
    }

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const errorMsg = data.error || (data.details ? data.details.map((d) => d.message).join('. ') : 'Failed to submit report');
      showToast(errorMsg, 'danger');
      throw new Error(errorMsg);
    }

    const createdIncident = data.incident;
    setIncidents((prev) => [createdIncident, ...prev.filter((i) => i.id !== createdIncident.id)]);
    showToast(`Emergency reported successfully! Reference ID: ${createdIncident.id}`, 'success');
    return createdIncident;
  };

  // 5. Admin Assigns Rescue Team (PATCH /api/incidents/:id/assign)
  const assignTeam = async (incidentId, teamId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/incidents/${incidentId}/assign`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ teamId })
      });

      if (res.status === 401) {
        handleUnauthorized();
        return false;
      }

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const errorMsg = data.error || 'Failed to assign rescue squad';
        showToast(errorMsg, 'danger');
        return false;
      }

      // Update incident and team list from live server response
      setIncidents((prev) =>
        prev.map((inc) => (inc.id === incidentId ? data.incident : inc))
      );
      await fetchTeams();
      setSelectedIncident((prev) =>
        prev && prev.id === incidentId ? data.incident : prev
      );

      showToast(`Assigned squad to incident #${incidentId}`, 'success');
      return true;
    } catch (err) {
      showToast(err.message || 'Error assigning squad.', 'danger');
      return false;
    }
  };

  // 6. Rescue Team Updates Status (PATCH /api/incidents/:id/status)
  const updateIncidentStatus = async (incidentId, newStatus, note = '') => {
    try {
      const res = await fetch(`${API_BASE_URL}/incidents/${incidentId}/status`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ status: newStatus, note })
      });

      if (res.status === 401) {
        handleUnauthorized();
        return;
      }

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const errorMsg = data.error || 'Failed to update status';
        showToast(errorMsg, 'danger');
        throw new Error(errorMsg);
      }

      setIncidents((prev) =>
        prev.map((inc) => (inc.id === incidentId ? data.incident : inc))
      );
      await fetchTeams();
      setSelectedIncident((prev) =>
        prev && prev.id === incidentId ? data.incident : prev
      );

      showToast(`Incident #${incidentId} status updated to: ${newStatus}`, 'info');
    } catch (err) {
      showToast(err.message || 'Status update failed.', 'danger');
      throw err;
    }
  };

  // 7. Admin: Update User Status (Activate/Deactivate)
  const updateUserStatus = async (userId, isActive) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/users/${userId}/status`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ isActive })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Failed to update user status.');
      showToast(data.message || 'Status updated.', 'success');
      await fetchUsers();
      await fetchAuditLogs();
      return true;
    } catch (err) {
      showToast(err.message, 'danger');
      return false;
    }
  };

  // 8. Admin: Reset User Password
  const resetUserPassword = async (userId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/users/${userId}/reset-password`, {
        method: 'POST',
        headers: getHeaders()
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Failed to reset password.');
      showToast('Password reset successfully.', 'success');
      await fetchAuditLogs();
      return data;
    } catch (err) {
      showToast(err.message, 'danger');
      throw err;
    }
  };

  // 9. Admin: Update User Profile
  const updateUserProfile = async (userId, updateData) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify(updateData)
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Failed to update user profile.');
      showToast('User profile updated successfully.', 'success');
      await fetchUsers();
      await fetchAuditLogs();
      return true;
    } catch (err) {
      showToast(err.message, 'danger');
      return false;
    }
  };

  // 10. Admin: Delete User
  const deleteUser = async (userId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Failed to delete user.');
      showToast(data.message || 'User deleted.', 'success');
      await fetchUsers();
      await fetchAuditLogs();
      return true;
    } catch (err) {
      showToast(err.message, 'danger');
      return false;
    }
  };

  // 11. Admin: Create Rescue Squad User
  const createRescueUser = async (formData) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/rescue-users`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(formData)
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Failed to create rescue squad user.');
      showToast(data.message || 'Rescue user created.', 'success');
      await fetchUsers();
      await fetchAuditLogs();
      return true;
    } catch (err) {
      showToast(err.message, 'danger');
      return false;
    }
  };

  return (
    <AppContext.Provider
      value={{
        activePage,
        navigateTo,
        redirectAfterLogin,
        setRedirectAfterLogin,
        currentUser,
        setCurrentUser,
        authToken,
        login,
        logout,
        registerCitizen,
        incidents,
        rescueTeams,
        reportEmergency,
        assignTeam,
        updateIncidentStatus,
        activeTeamId,
        setActiveTeamId,
        selectedIncident,
        setSelectedIncident,
        toast,
        showToast,
        fetchIncidents,
        fetchTeams,
        registeredUsers,
        fetchUsers,
        auditLogs,
        fetchAuditLogs,
        updateUserStatus,
        resetUserPassword,
        updateUserProfile,
        deleteUser,
        createRescueUser,
        lastUpdated,
        isRefreshing,
        refreshAllData,
        notifications,
        unreadNotificationsCount,
        markAllNotificationsAsRead,
        markNotificationAsRead,
        showProfileModal,
        setShowProfileModal,
        changePassword
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
export default AppContext;

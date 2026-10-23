import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { defaultIncidents, defaultTeams } from '../data/defaultData';

const AppContext = createContext();

const API_BASE_URL = 'http://localhost:5000/api';

const STORAGE_INCIDENTS_KEY = 'resqnet_pune_incidents_v2';
const STORAGE_TEAMS_KEY = 'resqnet_pune_teams_v2';
const STORAGE_ACTIVE_TEAM_KEY = 'resqnet_pune_active_team_v2';
const STORAGE_USER_KEY = 'resqnet_pune_user_v2';
const STORAGE_TOKEN_KEY = 'resqnet_pune_token_v2';
const STORAGE_USERS_LIST_KEY = 'resqnet_pune_users_list_v2';

export const AppProvider = ({ children }) => {
  // Navigation State
  const [activePage, setActivePage] = useState('home');

  // Selected Incident for Detail Modal
  const [selectedIncident, setSelectedIncident] = useState(null);

  // Toast Notification State
  const [toast, setToast] = useState(null);

  // Auth Token
  const [authToken, setAuthToken] = useState(() => {
    return localStorage.getItem(STORAGE_TOKEN_KEY) || null;
  });

  // Current User State (Default: Citizen Priya Sharma)
  const [currentUser, setCurrentUser] = useState(() => {
    const savedUser = localStorage.getItem(STORAGE_USER_KEY);
    if (savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch (e) {
        console.error('Error parsing stored user', e);
      }
    }
    return {
      id: 'user-citizen-priya',
      name: 'Priya Sharma',
      email: 'citizen@resqnet.org',
      role: 'citizen',
      phone: '+91 98220 12345'
    };
  });

  // Incidents State
  const [incidents, setIncidents] = useState(() => {
    const saved = localStorage.getItem(STORAGE_INCIDENTS_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.error('Error parsing stored incidents', e);
      }
    }
    return defaultIncidents;
  });

  // Rescue Teams State
  const [rescueTeams, setRescueTeams] = useState(() => {
    const saved = localStorage.getItem(STORAGE_TEAMS_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.error('Error parsing stored teams', e);
      }
    }
    return defaultTeams;
  });

  // Active Rescue Team ID for Rescue Team Dashboard
  const [activeTeamId, setActiveTeamId] = useState(() => {
    return localStorage.getItem(STORAGE_ACTIVE_TEAM_KEY) || 'PERT-01';
  });

  // Registered users list (for Admin user management panel)
  const [registeredUsers, setRegisteredUsers] = useState(() => {
    const saved = localStorage.getItem(STORAGE_USERS_LIST_KEY);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return []; }
    }
    return [];
  });

  // Helper for Auth Headers
  const getHeaders = useCallback(() => {
    const headers = { 'Content-Type': 'application/json' };
    const token = authToken || localStorage.getItem(STORAGE_TOKEN_KEY);
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }, [authToken]);

  // Fetch Incidents from Backend API
  const fetchIncidents = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/incidents`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          // If database has incidents, use them
          if (data.length > 0) {
            setIncidents(data);
            localStorage.setItem(STORAGE_INCIDENTS_KEY, JSON.stringify(data));
          }
        }
      }
    } catch (err) {
      // Backend not running, local state remains active
    }
  }, []);

  // Fetch Rescue Teams from Backend API
  const fetchTeams = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/rescue-teams`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setRescueTeams(data);
          localStorage.setItem(STORAGE_TEAMS_KEY, JSON.stringify(data));
        }
      }
    } catch (err) {
      // Backend not running, local state remains active
    }
  }, []);

  // Fetch Registered Users from Backend API (Admin only)
  const fetchUsers = useCallback(async () => {
    try {
      const token = authToken || localStorage.getItem(STORAGE_TOKEN_KEY);
      if (!token) return;
      const res = await fetch(`${API_BASE_URL}/auth/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.users)) {
          setRegisteredUsers(data.users);
          localStorage.setItem(STORAGE_USERS_LIST_KEY, JSON.stringify(data.users));
        }
      }
    } catch (err) {
      // Backend not running or unauthorized, silently skip
    }
  }, [authToken]);

  // Initial Sync on Mount
  useEffect(() => {
    fetchIncidents();
    fetchTeams();
  }, [fetchIncidents, fetchTeams]);

  // Persist Incidents to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_INCIDENTS_KEY, JSON.stringify(incidents));
    } catch (e) {
      console.error('Failed to save incidents to localStorage', e);
    }
  }, [incidents]);

  // Persist Rescue Teams to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_TEAMS_KEY, JSON.stringify(rescueTeams));
    } catch (e) {
      console.error('Failed to save teams to localStorage', e);
    }
  }, [rescueTeams]);

  // Persist Active Team ID to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_ACTIVE_TEAM_KEY, activeTeamId);
    } catch (e) {
      console.error('Failed to save activeTeamId to localStorage', e);
    }
  }, [activeTeamId]);

  // Persist Current User & Token to localStorage
  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(currentUser));
      } else {
        localStorage.removeItem(STORAGE_USER_KEY);
      }
      if (authToken) {
        localStorage.setItem(STORAGE_TOKEN_KEY, authToken);
      } else {
        localStorage.removeItem(STORAGE_TOKEN_KEY);
      }
    } catch (e) {
      console.error('Failed to save user/token to localStorage', e);
    }
  }, [currentUser, authToken]);

  // Show Toast
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Navigation
  const navigateTo = (page) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setActivePage(page);
  };

  // 1. User Login (Authenticates with Backend API)
  const login = async (email, password, role) => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role })
      });

      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data.user);
        setAuthToken(data.token);
        localStorage.setItem(STORAGE_TOKEN_KEY, data.token);
        localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(data.user));

        if (data.user.teamId) {
          setActiveTeamId(data.user.teamId);
        }

        // Fetch fresh incidents & teams from DB
        await fetchIncidents();
        await fetchTeams();

        showToast(`Welcome back, ${data.user.name}! (${data.user.role.toUpperCase()})`, 'success');

        if (data.user.role === 'admin') navigateTo('admin-dashboard');
        else if (data.user.role === 'rescue') navigateTo('rescue-dashboard');
        else navigateTo('citizen-dashboard');

        return { success: true };
      } else {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Invalid credentials');
      }
    } catch (error) {
      console.warn('API login failed or offline fallback:', error.message);
      // Fallback local login if backend is unreachable
      let userRole = role || 'citizen';
      let userName = 'Priya Sharma';
      let teamId = null;

      if (email.includes('admin') || role === 'admin') {
        userRole = 'admin';
        userName = 'Rahul Patil';
      } else if (email.includes('rescue') || role === 'rescue') {
        userRole = 'rescue';
        userName = 'Pune Emergency Response Team 01';
        teamId = 'PERT-01';
        setActiveTeamId('PERT-01');
      }

      const demoUser = {
        id: `usr-${Date.now()}`,
        name: userName,
        email: email,
        role: userRole,
        teamId
      };

      setCurrentUser(demoUser);
      showToast(`Logged in as ${demoUser.name} (${demoUser.role.toUpperCase()})`, 'success');

      if (userRole === 'admin') navigateTo('admin-dashboard');
      else if (userRole === 'rescue') navigateTo('rescue-dashboard');
      else navigateTo('citizen-dashboard');
      return { success: true };
    }
  };

  // 2. User Logout
  const logout = () => {
    setCurrentUser(null);
    setAuthToken(null);
    localStorage.removeItem(STORAGE_USER_KEY);
    localStorage.removeItem(STORAGE_TOKEN_KEY);
    navigateTo('home');
    showToast('Logged out successfully', 'info');
  };

  // 3. Citizen Registration (Registers in Backend MongoDB)
  const registerCitizen = async (name, email, phone, password) => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, password, role: 'citizen' })
      });

      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data.user);
        setAuthToken(data.token);
        localStorage.setItem(STORAGE_TOKEN_KEY, data.token);
        localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(data.user));
        navigateTo('citizen-dashboard');
        showToast(`Welcome to ResQNet, ${name}! Your citizen account has been created.`, 'success');
        return true;
      } else {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Registration failed.');
      }
    } catch (err) {
      console.warn('Backend register fallback:', err.message);
      // Fallback local registration
      const newUser = {
        id: `usr-${Date.now()}`,
        name,
        email,
        phone: phone || '+91 98220 00000',
        role: 'citizen'
      };
      setCurrentUser(newUser);
      navigateTo('citizen-dashboard');
      showToast(`Welcome to ResQNet, ${name}! Account ready.`, 'success');
      return true;
    }
  };

  // 4. Role Switcher for Pune presentation
  const switchRole = async (role) => {
    if (role === 'admin') {
      try {
        await login('admin@resqnet.org', 'adminpassword', 'admin');
      } catch (e) {
        const adminUser = {
          id: 'user-admin-rahul',
          name: 'Rahul Patil',
          email: 'admin@resqnet.org',
          role: 'admin',
          phone: '+91 98230 45678'
        };
        setCurrentUser(adminUser);
        navigateTo('admin-dashboard');
        showToast('Switched to Admin: Rahul Patil', 'info');
      }
    } else if (role === 'rescue') {
      try {
        await login('rescue@resqnet.org', 'rescuepassword', 'rescue');
      } catch (e) {
        const rescueUser = {
          id: 'user-rescue-pert01',
          name: 'Pune Emergency Response Team 01',
          email: 'rescue@resqnet.org',
          role: 'rescue',
          teamId: 'PERT-01',
          phone: '+91 (020) 2550-6789'
        };
        setCurrentUser(rescueUser);
        setActiveTeamId('PERT-01');
        navigateTo('rescue-dashboard');
        showToast('Switched to Rescue Unit: Pune Emergency Response Team 01', 'info');
      }
    } else {
      try {
        await login('citizen@resqnet.org', 'password123', 'citizen');
      } catch (e) {
        const citizenUser = {
          id: 'user-citizen-priya',
          name: 'Priya Sharma',
          email: 'citizen@resqnet.org',
          role: 'citizen',
          phone: '+91 98220 12345'
        };
        setCurrentUser(citizenUser);
        navigateTo('citizen-dashboard');
        showToast('Switched to Citizen: Priya Sharma', 'info');
      }
    }
  };

  // 5. Citizen Reports Emergency (POST /api/incidents)
  const reportEmergency = async (formData) => {
    let createdIncident = null;

    try {
      const res = await fetch(`${API_BASE_URL}/incidents`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          type: formData.type,
          location: formData.location,
          coordinates: formData.coordinates,
          peopleAffected: formData.peopleAffected,
          severity: formData.severity,
          description: formData.description,
          photoUrl: formData.photoUrl,
          reporterName: currentUser?.name || 'Priya Sharma',
          reporterEmail: currentUser?.email || 'citizen@resqnet.org',
          reporterPhone: currentUser?.phone || '+91 98220 12345'
        })
      });

      if (res.ok) {
        const data = await res.json();
        createdIncident = data.incident;
        setIncidents((prev) => [createdIncident, ...prev.filter((i) => i.id !== createdIncident.id)]);
      }
    } catch (err) {
      console.warn('Backend reporting fallback to local:', err.message);
    }

    // Fallback local creation if backend did not return
    if (!createdIncident) {
      const newId = `INC-${Math.floor(2000 + Math.random() * 8000)}`;
      const now = new Date().toISOString();
      const defaultCoords = [
        18.5204 + (Math.random() - 0.5) * 0.04,
        73.8567 + (Math.random() - 0.5) * 0.04
      ];

      createdIncident = {
        id: newId,
        type: formData.type,
        title: `${formData.type} Emergency at ${formData.location.split(',')[0]}`,
        location: formData.location,
        coordinates: formData.coordinates || defaultCoords,
        peopleAffected: parseInt(formData.peopleAffected) || 1,
        severity: formData.severity,
        description: formData.description,
        reportedBy: currentUser ? currentUser.name : 'Priya Sharma',
        reporterEmail: currentUser ? currentUser.email : 'priya.sharma@example.com',
        reporterPhone: currentUser?.phone || '+91 98220 12345',
        status: 'Reported',
        assignedTeamId: null,
        assignedTeamName: null,
        photoUrl: formData.photoUrl || null,
        reportedAt: now,
        updatedAt: now,
        timeline: [
          {
            status: 'Reported',
            time: now,
            note: `Emergency reported by ${currentUser ? currentUser.name : 'Priya Sharma'}. Severity: ${formData.severity}.`
          }
        ]
      };
      setIncidents((prev) => [createdIncident, ...prev]);
    }

    showToast(`Emergency reported successfully! ID: ${createdIncident.id}`, 'success');
    return createdIncident;
  };

  // 6. Admin Assigns Rescue Team (PATCH /api/incidents/:id/assign)
  const assignTeam = async (incidentId, teamId) => {
    const team = rescueTeams.find((t) => t.id === teamId);
    if (!team) return false;

    // Send assignment to Backend MongoDB API
    try {
      const res = await fetch(`${API_BASE_URL}/incidents/${incidentId}/assign`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ teamId, note: `Admin Rahul Patil assigned rescue team: ${team.name}` })
      });

      if (res.ok) {
        const data = await res.json();
        // Update local state with DB response
        setIncidents((prev) =>
          prev.map((inc) => (inc.id === incidentId ? data.incident : inc))
        );
      }
    } catch (err) {
      console.warn('Backend assign fallback to local:', err.message);
    }

    // Local optimistic update
    const now = new Date().toISOString();
    setIncidents((prev) =>
      prev.map((inc) => {
        if (inc.id === incidentId) {
          const updatedTimeline = [
            ...(inc.timeline || []),
            {
              status: 'Assigned',
              time: now,
              note: `Admin Rahul Patil assigned rescue team: ${team.name}`
            }
          ];
          return {
            ...inc,
            assignedTeamId: team.id,
            assignedTeamName: team.name,
            status: inc.status === 'Reported' ? 'Assigned' : inc.status,
            updatedAt: now,
            timeline: updatedTimeline
          };
        }
        return inc;
      })
    );

    // Update Rescue Team status to Assigned
    setRescueTeams((prev) =>
      prev.map((t) => (t.id === teamId ? { ...t, status: 'Assigned' } : t))
    );

    // Automatically set activeTeamId so the Rescue Team Dashboard immediately points to this team!
    setActiveTeamId(team.id);

    // Update selectedIncident in-place if modal is open
    setSelectedIncident((prev) =>
      prev && prev.id === incidentId
        ? {
            ...prev,
            assignedTeamId: team.id,
            assignedTeamName: team.name,
            status: prev.status === 'Reported' ? 'Assigned' : prev.status,
            updatedAt: now,
            timeline: [
              ...(prev.timeline || []),
              {
                status: 'Assigned',
                time: now,
                note: `Admin Rahul Patil assigned rescue team: ${team.name}`
              }
            ]
          }
        : prev
    );

    showToast(`Assigned ${team.name} to ${incidentId}`, 'success');
    return true;
  };

  // 7. Rescue Team Updates Status (PATCH /api/incidents/:id/status)
  const updateIncidentStatus = async (incidentId, newStatus, note = '') => {
    // Send status update to Backend MongoDB API
    try {
      const res = await fetch(`${API_BASE_URL}/incidents/${incidentId}/status`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ status: newStatus, note })
      });

      if (res.ok) {
        const data = await res.json();
        setIncidents((prev) =>
          prev.map((inc) => (inc.id === incidentId ? data.incident : inc))
        );
      }
    } catch (err) {
      console.warn('Backend status update fallback to local:', err.message);
    }

    // Local optimistic update
    const now = new Date().toISOString();
    setIncidents((prev) =>
      prev.map((inc) => {
        if (inc.id === incidentId) {
          const customNote = note || `Status updated to ${newStatus} by rescue squad`;
          const updatedTimeline = [
            ...(inc.timeline || []),
            { status: newStatus, time: now, note: customNote }
          ];

          return {
            ...inc,
            status: newStatus,
            updatedAt: now,
            timeline: updatedTimeline
          };
        }
        return inc;
      })
    );

    // If Completed or Resolved, free up the squad back to Available
    if (newStatus === 'Completed' || newStatus === 'Resolved') {
      const targetInc = incidents.find((i) => i.id === incidentId);
      if (targetInc && targetInc.assignedTeamId) {
        setRescueTeams((teams) =>
          teams.map((t) =>
            t.id === targetInc.assignedTeamId ? { ...t, status: 'Available' } : t
          )
        );
      }
    } else if (['On the Way', 'Reached', 'In Progress'].includes(newStatus)) {
      const targetInc = incidents.find((i) => i.id === incidentId);
      if (targetInc && targetInc.assignedTeamId) {
        setRescueTeams((teams) =>
          teams.map((t) =>
            t.id === targetInc.assignedTeamId ? { ...t, status: 'In Progress' } : t
          )
        );
      }
    }

    // Also update selectedIncident in-place if open
    setSelectedIncident((prev) =>
      prev && prev.id === incidentId
        ? {
            ...prev,
            status: newStatus,
            updatedAt: now,
            timeline: [
              ...(prev.timeline || []),
              { status: newStatus, time: now, note: note || `Status updated to ${newStatus}` }
            ]
          }
        : prev
    );

    showToast(`Incident #${incidentId} status updated to: ${newStatus}`, 'info');
  };

  // Reset demo data
  const resetDemoData = () => {
    setIncidents(defaultIncidents);
    setRescueTeams(defaultTeams);
    setActiveTeamId('PERT-01');
    localStorage.setItem(STORAGE_INCIDENTS_KEY, JSON.stringify(defaultIncidents));
    localStorage.setItem(STORAGE_TEAMS_KEY, JSON.stringify(defaultTeams));
    localStorage.setItem(STORAGE_ACTIVE_TEAM_KEY, 'PERT-01');
    showToast('Reset to 2 clean Pune test incidents', 'info');
  };

  return (
    <AppContext.Provider
      value={{
        activePage,
        navigateTo,
        currentUser,
        setCurrentUser,
        authToken,
        login,
        logout,
        registerCitizen,
        switchRole,
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
        resetDemoData,
        fetchIncidents,
        fetchTeams,
        registeredUsers,
        fetchUsers
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);

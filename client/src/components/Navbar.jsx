import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  Menu,
  PhoneCall,
  Plus,
  Bell,
  RefreshCw,
  User,
  CheckCircle,
  AlertTriangle,
  Flame,
  Waves,
  Car,
  Building2,
  Clock,
  Check
} from 'lucide-react';

export const Navbar = ({ setMobileOpen }) => {
  const {
    currentUser,
    navigateTo,
    incidents,
    lastUpdated,
    isRefreshing,
    refreshAllData,
    notifications,
    unreadNotificationsCount,
    markAllNotificationsAsRead,
    markNotificationAsRead,
    setSelectedIncident,
    setShowProfileModal
  } = useApp();

  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef(null);

  // Close notifications dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications]);

  const activeIncidentsCount = incidents.filter(
    (inc) => inc.status !== 'Completed' && inc.status !== 'Resolved'
  ).length;

  const formatUpdateTime = (timestamp) => {
    if (!timestamp) return 'Just now';
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getIncidentIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'fire':
        return <Flame size={14} className="text-danger" />;
      case 'flood':
        return <Waves size={14} className="text-primary" />;
      case 'accident':
        return <Car size={14} className="text-warning" />;
      case 'building collapse':
        return <Building2 size={14} className="text-danger" />;
      default:
        return <AlertTriangle size={14} className="text-secondary" />;
    }
  };

  return (
    <header className="resq-navbar">
      {/* Left: Mobile Trigger & Control Center Badge */}
      <div className="d-flex align-items-center gap-2 gap-sm-3">
        <button
          className="btn btn-outline-secondary d-lg-none p-1 px-2"
          onClick={() => setMobileOpen((prev) => !prev)}
          aria-label="Toggle navigation"
        >
          <Menu size={18} />
        </button>

        <div className="d-none d-sm-flex align-items-center gap-2">
          <span className="navbar-badge-emergency">
            <span className="pulse-dot"></span>
            <span>PUNE EMERGENCY DISPATCH</span>
          </span>
          <span className="badge bg-danger-subtle text-danger border border-danger-subtle">
            {activeIncidentsCount} Active
          </span>
        </div>
      </div>

      {/* Right: Auto-Refresh Indicator, Helpline, Notifications, Profile & Actions */}
      <div className="d-flex align-items-center gap-2">
        {/* Live Feed Status & Manual Refresh Button */}
        {currentUser && (
          <div className="d-flex align-items-center gap-1 bg-light border rounded px-2 py-1">
            <span
              className="text-muted d-none d-md-inline"
              style={{ fontSize: '0.72rem' }}
              title={`Last synchronized: ${formatUpdateTime(lastUpdated)}`}
            >
              Updated: <strong>{formatUpdateTime(lastUpdated)}</strong>
            </span>
            <button
              type="button"
              className="btn btn-sm btn-link text-secondary p-0 ms-1"
              onClick={refreshAllData}
              title="Refresh feeds now (Auto-refreshes every 20s)"
              disabled={isRefreshing}
            >
              <RefreshCw
                size={13}
                className={isRefreshing ? 'spin-anim text-danger' : 'text-muted'}
              />
            </button>
          </div>
        )}

        {/* Pune Emergency Helpline */}
        <div className="d-none d-xl-flex align-items-center gap-1 px-2 py-1 rounded bg-light border text-muted small">
          <PhoneCall size={13} className="text-danger" />
          <span>Control: </span>
          <span className="fw-bold text-dark">112 / 101</span>
        </div>

        {/* Notification Bell Dropdown */}
        {currentUser && (
          <div className="position-relative" ref={notifRef}>
            <button
              type="button"
              className="btn btn-sm btn-light border position-relative p-1 px-2 text-dark"
              onClick={() => setShowNotifications(!showNotifications)}
              title="System Alerts & Dispatch Notifications"
            >
              <Bell size={16} />
              {unreadNotificationsCount > 0 && (
                <span
                  className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger border border-light"
                  style={{ fontSize: '0.62rem', padding: '0.22em 0.45em' }}
                >
                  {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
                </span>
              )}
            </button>

            {/* Notifications Flyout */}
            {showNotifications && (
              <div
                className="position-absolute end-0 mt-2 bg-white rounded shadow-lg border overflow-hidden"
                style={{ width: '330px', zIndex: 1050 }}
              >
                <div className="p-3 bg-light border-bottom d-flex align-items-center justify-content-between">
                  <div>
                    <h6 className="fw-bold text-dark mb-0 small">Emergency Alerts</h6>
                    <small className="text-muted" style={{ fontSize: '0.7rem' }}>
                      Pune Disaster Response System
                    </small>
                  </div>
                  {unreadNotificationsCount > 0 && (
                    <button
                      type="button"
                      className="btn btn-sm btn-link text-danger p-0 fw-semibold"
                      style={{ fontSize: '0.72rem' }}
                      onClick={markAllNotificationsAsRead}
                    >
                      Mark all as read
                    </button>
                  )}
                </div>

                <div className="p-0 overflow-auto" style={{ maxHeight: '340px' }}>
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-muted small">
                      <CheckCircle size={24} className="text-success mb-2 mx-auto d-block" />
                      <div>No active alerts. Emergency network operating normally.</div>
                    </div>
                  ) : (
                    <div className="list-group list-group-flush small">
                      {notifications.map((notif) => (
                        <button
                          key={notif.id}
                          type="button"
                          className="list-group-item list-group-item-action p-2 px-3 border-bottom text-start"
                          onClick={() => {
                            markNotificationAsRead(notif.id);
                            setSelectedIncident(notif.incident);
                            setShowNotifications(false);
                          }}
                        >
                          <div className="d-flex align-items-start gap-2">
                            <div className="mt-1">{getIncidentIcon(notif.incident?.type)}</div>
                            <div className="flex-grow-1 overflow-hidden">
                              <div className="d-flex align-items-center justify-content-between mb-1">
                                <span className="fw-bold text-dark text-truncate" style={{ fontSize: '0.78rem' }}>
                                  {notif.title}
                                </span>
                                <span
                                  className={`badge ${
                                    notif.severity === 'Critical'
                                      ? 'bg-danger'
                                      : notif.severity === 'High'
                                      ? 'bg-warning text-dark'
                                      : 'bg-secondary'
                                  }`}
                                  style={{ fontSize: '0.62rem' }}
                                >
                                  {notif.severity}
                                </span>
                              </div>
                              <p className="mb-1 text-secondary" style={{ fontSize: '0.72rem', lineHeight: '1.3' }}>
                                {notif.message}
                              </p>
                              <div className="text-muted d-flex align-items-center gap-1" style={{ fontSize: '0.65rem' }}>
                                <Clock size={10} />
                                {new Date(notif.time).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* User Profile Trigger Button */}
        {currentUser ? (
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1 py-1 px-2"
            onClick={() => setShowProfileModal(true)}
            title="My Profile & Security Settings"
          >
            <div
              className="d-flex align-items-center justify-content-center bg-danger-subtle text-danger rounded-circle"
              style={{ width: '22px', height: '22px' }}
            >
              <User size={13} />
            </div>
            <span className="d-none d-md-inline small fw-semibold text-dark">
              {currentUser.name.split(' ')[0]}
            </span>
            <span
              className="badge bg-secondary text-uppercase d-none d-lg-inline"
              style={{ fontSize: '0.62rem' }}
            >
              {currentUser.role}
            </span>
          </button>
        ) : null}

        {/* Action: Report Emergency or Sign In */}
        {currentUser ? (
          <button
            className="btn btn-resq-danger btn-sm d-flex align-items-center gap-1"
            onClick={() => navigateTo('report-emergency')}
          >
            <Plus size={16} />
            <span>Report</span>
          </button>
        ) : (
          <button
            className="btn btn-resq-primary btn-sm"
            onClick={() => navigateTo('login')}
          >
            Sign In
          </button>
        )}
      </div>
    </header>
  );
};

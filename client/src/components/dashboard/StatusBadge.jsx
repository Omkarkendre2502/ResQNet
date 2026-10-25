import React from 'react';
import {
  FileText,
  UserCheck,
  Navigation,
  MapPin,
  Activity,
  CheckCircle,
  HelpCircle
} from 'lucide-react';

/**
 * Accessible Status Badge displaying both an icon and text label.
 * Supports all 6 lifecycle stages:
 * Reported -> Assigned -> On the Way -> Reached -> In Progress -> Completed
 *
 * @param {Object} props
 * @param {string} props.status - Incident status string
 * @param {string} [props.size='normal'] - 'sm' | 'normal' | 'lg'
 */
export const StatusBadge = ({ status, size = 'normal' }) => {
  const normStatus = (status || '').trim();

  const getStatusConfig = (s) => {
    switch (s) {
      case 'Reported':
        return {
          icon: <FileText size={size === 'sm' ? 11 : 13} />,
          label: 'Reported',
          className: 'badge-status-reported',
          bg: '#e0f2fe',
          color: '#0369a1',
          border: '#bae6fd'
        };
      case 'Assigned':
        return {
          icon: <UserCheck size={size === 'sm' ? 11 : 13} />,
          label: 'Assigned',
          className: 'badge-status-assigned',
          bg: '#e0e7ff',
          color: '#4338ca',
          border: '#c7d2fe'
        };
      case 'On the Way':
        return {
          icon: <Navigation size={size === 'sm' ? 11 : 13} />,
          label: 'On the Way',
          className: 'badge-status-on-way',
          bg: '#fef3c7',
          color: '#b45309',
          border: '#fde68a'
        };
      case 'Reached':
        return {
          icon: <MapPin size={size === 'sm' ? 11 : 13} />,
          label: 'Reached',
          className: 'badge-status-reached',
          bg: '#ccfbf1',
          color: '#0f766e',
          border: '#99f6e4'
        };
      case 'In Progress':
        return {
          icon: <Activity size={size === 'sm' ? 11 : 13} />,
          label: 'In Progress',
          className: 'badge-status-in-progress',
          bg: '#f3e8ff',
          color: '#7e22ce',
          border: '#e9d5ff'
        };
      case 'Completed':
      case 'Resolved':
        return {
          icon: <CheckCircle size={size === 'sm' ? 11 : 13} />,
          label: 'Completed',
          className: 'badge-status-completed',
          bg: '#dcfce7',
          color: '#15803d',
          border: '#bbf7d0'
        };
      default:
        return {
          icon: <HelpCircle size={size === 'sm' ? 11 : 13} />,
          label: s || 'Unknown',
          className: 'badge-status-unknown',
          bg: '#f1f5f9',
          color: '#475569',
          border: '#cbd5e1'
        };
    }
  };

  const config = getStatusConfig(normStatus);

  const paddingClass = size === 'sm' ? 'px-2 py-0.5' : size === 'lg' ? 'px-3 py-1.5' : 'px-2.5 py-1';
  const fontSize = size === 'sm' ? '0.72rem' : size === 'lg' ? '0.85rem' : '0.78rem';

  return (
    <span
      className={`status-badge d-inline-flex align-items-center gap-1.5 rounded-pill fw-semibold border ${config.className} ${paddingClass}`}
      style={{
        backgroundColor: config.bg,
        color: config.color,
        borderColor: config.border,
        fontSize,
        whiteSpace: 'nowrap'
      }}
      aria-label={`Status: ${config.label}`}
    >
      <span className="d-inline-flex align-items-center" aria-hidden="true">
        {config.icon}
      </span>
      <span>{config.label}</span>
    </span>
  );
};

export default StatusBadge;

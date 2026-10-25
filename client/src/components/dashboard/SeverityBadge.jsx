import React from 'react';
import { AlertOctagon, AlertTriangle, AlertCircle, Info } from 'lucide-react';

/**
 * Accessible Severity Badge with text label and icon.
 * Critical = Red, High = Orange, Medium = Amber, Low = Green.
 *
 * @param {Object} props
 * @param {string} props.severity - 'Critical'|'High'|'Medium'|'Low'
 * @param {string} [props.size='normal'] - 'sm' | 'normal' | 'lg'
 */
export const SeverityBadge = ({ severity, size = 'normal' }) => {
  const norm = (severity || 'Low').trim().toLowerCase();

  const getSeverityConfig = (s) => {
    switch (s) {
      case 'critical':
        return {
          label: 'Critical',
          icon: <AlertOctagon size={size === 'sm' ? 11 : 13} />,
          className: 'badge-severity-critical',
          bg: '#fee2e2',
          color: '#b91c1c',
          border: '#fca5a5'
        };
      case 'high':
        return {
          label: 'High',
          icon: <AlertTriangle size={size === 'sm' ? 11 : 13} />,
          className: 'badge-severity-high',
          bg: '#ffedd5',
          color: '#c2410c',
          border: '#fdba74'
        };
      case 'medium':
        return {
          label: 'Medium',
          icon: <AlertCircle size={size === 'sm' ? 11 : 13} />,
          className: 'badge-severity-medium',
          bg: '#fef3c7',
          color: '#b45309',
          border: '#fde68a'
        };
      case 'low':
      default:
        return {
          label: 'Low',
          icon: <Info size={size === 'sm' ? 11 : 13} />,
          className: 'badge-severity-low',
          bg: '#dcfce7',
          color: '#15803d',
          border: '#bbf7d0'
        };
    }
  };

  const config = getSeverityConfig(norm);
  const paddingClass = size === 'sm' ? 'px-2 py-0.5' : size === 'lg' ? 'px-3 py-1.5' : 'px-2.5 py-1';
  const fontSize = size === 'sm' ? '0.72rem' : size === 'lg' ? '0.85rem' : '0.78rem';

  return (
    <span
      className={`severity-badge d-inline-flex align-items-center gap-1.5 rounded-pill fw-semibold border ${config.className} ${paddingClass}`}
      style={{
        backgroundColor: config.bg,
        color: config.color,
        borderColor: config.border,
        fontSize,
        whiteSpace: 'nowrap'
      }}
      aria-label={`Severity: ${config.label}`}
    >
      <span className="d-inline-flex align-items-center" aria-hidden="true">
        {config.icon}
      </span>
      <span>{config.label}</span>
    </span>
  );
};

export default SeverityBadge;

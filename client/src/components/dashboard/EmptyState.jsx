import React from 'react';
import { ClipboardList, Plus, RotateCcw, AlertTriangle } from 'lucide-react';

/**
 * Reusable Empty State component with customizable icon, message, and action button.
 *
 * @param {Object} props
 * @param {React.ReactNode} [props.icon] - Icon component
 * @param {string} props.title - Main headline
 * @param {string} props.description - Explanatory message
 * @param {string} [props.actionLabel] - Button text
 * @param {Function} [props.onAction] - Button click handler
 * @param {boolean} [props.isError=false] - If true, renders error styled state
 */
export const EmptyState = ({
  icon,
  title = 'No incidents yet',
  description = 'There are no active records matching your criteria.',
  actionLabel,
  onAction,
  isError = false
}) => {
  return (
    <div className="empty-state p-4 p-md-5 text-center my-3 rounded bg-light border border-dashed">
      <div
        className={`empty-state-icon mx-auto mb-3 rounded-circle d-flex align-items-center justify-content-center p-3 ${
          isError ? 'bg-danger-subtle text-danger' : 'bg-white shadow-sm text-secondary'
        }`}
        style={{ width: '64px', height: '64px' }}
      >
        {icon || (isError ? <AlertTriangle size={28} /> : <ClipboardList size={28} />)}
      </div>

      <h5 className="fw-bold text-dark mb-1">{title}</h5>
      <p className="text-secondary small mb-3 mx-auto" style={{ maxWidth: '440px' }}>
        {description}
      </p>

      {actionLabel && onAction && (
        <button
          type="button"
          className={`btn ${
            isError ? 'btn-outline-danger' : 'btn-resq-danger'
          } d-inline-flex align-items-center gap-2 px-3 py-2 fw-semibold shadow-sm`}
          onClick={onAction}
        >
          {isError ? <RotateCcw size={15} /> : <Plus size={15} />}
          <span>{actionLabel}</span>
        </button>
      )}
    </div>
  );
};

export default EmptyState;

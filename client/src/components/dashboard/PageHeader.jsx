import React from 'react';
import { RefreshCw, Plus, Radio } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatTime24 } from '../../utils/formatTime';

/**
 * Standardized Page Header across all dashboards.
 *
 * @param {Object} props
 * @param {string} props.title - Dashboard title (e.g. "Control Center • Pune Municipal Dispatch")
 * @param {string} props.subtitle - Descriptive subtitle
 * @param {string} [props.roleBadge='CONTROL CENTER'] - Small top uppercase label
 * @param {boolean} [props.showReportButton=false] - Whether to show the "Report Emergency" button
 * @param {Function} [props.onReportClick] - Callback when "Report Emergency" is clicked
 * @param {React.ReactNode} [props.extraActions] - Additional actions or badges
 */
export const PageHeader = ({
  title,
  subtitle,
  roleBadge = 'CONTROL CENTER',
  showReportButton = false,
  onReportClick,
  extraActions
}) => {
  const {
    lastUpdated,
    isRefreshing,
    refreshAllData,
    navigateTo
  } = useApp();

  const formattedTime = formatTime24(lastUpdated);

  return (
    <header className="dashboard-page-header p-3 p-md-4 mb-4 bg-white border rounded shadow-sm">
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
        {/* Left: small label, title, and single subtitle line */}
        <div style={{ minWidth: 0, flex: '1 1 auto' }}>
          {roleBadge && (
            <div
              className="text-uppercase fw-bold text-secondary mb-1"
              style={{ fontSize: '0.72rem', letterSpacing: '0.06em' }}
            >
              {roleBadge}
            </div>
          )}

          <h1
            className="h4 fw-bold text-dark mb-1"
            style={{ wordBreak: 'break-word', lineHeight: 1.25 }}
          >
            {title}
          </h1>

          <p className="text-secondary small mb-0" style={{ wordBreak: 'break-word' }}>
            {subtitle}
          </p>
        </div>

        {/* Right: Dispatch network active badge and the ONE Last updated control */}
        <div className="d-flex flex-wrap align-items-center gap-2 flex-shrink-0">
          <span className="badge bg-success-subtle text-success border border-success-subtle d-inline-flex align-items-center gap-1.5 px-2.5 py-1.5">
            <span
              className="pulse-dot-sm bg-success d-inline-block rounded-circle"
              style={{ width: '7px', height: '7px' }}
            ></span>
            <span className="fw-semibold" style={{ fontSize: '0.75rem', lineHeight: 1 }}>
              Dispatch network active
            </span>
          </span>

          <div
            className="d-inline-flex align-items-center gap-2 bg-light border rounded px-3 py-1.5 text-secondary"
            role="status"
            aria-live="polite"
            style={{ whiteSpace: 'nowrap' }}
          >
            <Radio
              size={14}
              className={isRefreshing ? 'text-danger animate-pulse' : 'text-success'}
            />
            <span className="small text-nowrap" style={{ whiteSpace: 'nowrap' }}>
              Last updated:{' '}
              <strong
                className="text-dark font-monospace text-nowrap"
                style={{ whiteSpace: 'nowrap' }}
              >
                {formattedTime}
              </strong>
            </span>
            <button
              type="button"
              className="btn btn-sm btn-link text-secondary p-0 ms-1 d-inline-flex align-items-center"
              onClick={refreshAllData}
              disabled={isRefreshing}
              aria-label="Refresh data now"
              title="Manual refresh feeds"
            >
              <RefreshCw
                size={14}
                className={isRefreshing ? 'spin-anim text-danger' : 'text-muted hover-spin'}
              />
            </button>
          </div>

          {extraActions}

          {showReportButton && (
            <button
              type="button"
              className="btn btn-resq-danger d-inline-flex align-items-center gap-2 px-3 py-2 fw-semibold shadow-sm"
              onClick={onReportClick || (() => navigateTo('report-emergency'))}
            >
              <Plus size={16} />
              <span>Report Emergency</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default PageHeader;

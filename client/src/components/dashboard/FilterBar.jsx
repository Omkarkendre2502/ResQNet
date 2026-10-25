import React from 'react';
import { Search, X, RotateCcw, Filter } from 'lucide-react';

/**
 * Reusable FilterBar with debounced search, dropdown chips, and reset action.
 *
 * @param {Object} props
 * @param {string} props.searchQuery - Current search query text
 * @param {Function} props.onSearchChange - Search input change handler
 * @param {string} [props.searchPlaceholder='Search incidents...']
 * @param {Array} [props.statusFilters] - Array of status options [{ label, value }]
 * @param {string} [props.selectedStatus='all']
 * @param {Function} [props.onStatusChange]
 * @param {Array} [props.severityFilters] - Array of severity options [{ label, value }]
 * @param {string} [props.selectedSeverity='all']
 * @param {Function} [props.onSeverityChange]
 * @param {Array} [props.typeFilters] - Array of type options
 * @param {string} [props.selectedType='all']
 * @param {Function} [props.onTypeChange]
 * @param {React.ReactNode} [props.extraFilters] - Custom filter inputs/dropdowns
 * @param {Function} [props.onReset] - Reset all filters callback
 * @param {boolean} [props.hasActiveFilters=false]
 */
export const FilterBar = ({
  searchQuery = '',
  onSearchChange,
  searchPlaceholder = 'Search ID, location, type...',
  statusFilters = [],
  selectedStatus = 'all',
  onStatusChange,
  severityFilters = [],
  selectedSeverity = 'all',
  onSeverityChange,
  typeFilters = [],
  selectedType = 'all',
  onTypeChange,
  extraFilters,
  onReset,
  hasActiveFilters = false
}) => {
  return (
    <div className="filter-bar bg-white p-3 rounded border shadow-sm mb-3">
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
        {/* Search Input with Clear Button */}
        <div className="search-input-wrapper position-relative flex-grow-1" style={{ minWidth: '240px', maxWidth: '380px' }}>
          <div className="input-group input-group-sm">
            <span className="input-group-text bg-light border-end-0 text-muted">
              <Search size={14} />
            </span>
            <input
              type="text"
              className="form-control border-start-0 ps-0"
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              aria-label={searchPlaceholder}
            />
            {searchQuery && (
              <button
                type="button"
                className="btn btn-sm btn-light border border-start-0 text-muted"
                onClick={() => onSearchChange('')}
                aria-label="Clear search query"
              >
                <X size={13} />
              </button>
            )}
          </div>
        </div>

        {/* Dropdowns / Filter Chips */}
        <div className="d-flex flex-wrap align-items-center gap-2">
          {/* Status Chips or Select */}
          {statusFilters.length > 0 && (
            <div className="d-flex align-items-center gap-1">
              <span className="text-secondary small me-1 d-none d-sm-inline">Status:</span>
              <select
                className="form-select form-select-sm border-secondary-subtle"
                value={selectedStatus}
                onChange={(e) => onStatusChange(e.target.value)}
                aria-label="Filter by status"
                style={{ width: 'auto', minWidth: '130px' }}
              >
                <option value="all">All Statuses</option>
                {statusFilters.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Severity Select */}
          {severityFilters.length > 0 && (
            <div className="d-flex align-items-center gap-1">
              <span className="text-secondary small me-1 d-none d-sm-inline">Severity:</span>
              <select
                className="form-select form-select-sm border-secondary-subtle"
                value={selectedSeverity}
                onChange={(e) => onSeverityChange(e.target.value)}
                aria-label="Filter by severity"
                style={{ width: 'auto', minWidth: '120px' }}
              >
                <option value="all">All Severities</option>
                {severityFilters.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Type Select */}
          {typeFilters.length > 0 && (
            <div className="d-flex align-items-center gap-1">
              <span className="text-secondary small me-1 d-none d-sm-inline">Type:</span>
              <select
                className="form-select form-select-sm border-secondary-subtle"
                value={selectedType}
                onChange={(e) => onTypeChange(e.target.value)}
                aria-label="Filter by incident type"
                style={{ width: 'auto', minWidth: '120px' }}
              >
                <option value="all">All Types</option>
                {typeFilters.map((t) => (
                  <option key={typeof t === 'string' ? t : t.value} value={typeof t === 'string' ? t : t.value}>
                    {typeof t === 'string' ? t : t.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {extraFilters}

          {/* Reset Filters Button */}
          {hasActiveFilters && onReset && (
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1"
              onClick={onReset}
              title="Reset all active filters"
            >
              <RotateCcw size={12} />
              <span className="d-none d-sm-inline">Reset</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default FilterBar;

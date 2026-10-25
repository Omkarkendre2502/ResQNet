import React from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown, ChevronLeft, ChevronRight } from 'lucide-react';
import SkeletonLoader from './SkeletonLoader';
import EmptyState from './EmptyState';

/**
 * Accessible responsive DataTable with sorting, pagination, stacked mobile card view,
 * sticky header, and loading skeletons.
 *
 * @param {Object} props
 * @param {Array} props.columns - [{ key, label, sortable, render, align, width, mobileHidden }]
 * @param {Array} props.data - Array of row items
 * @param {string} [props.sortField] - Current sort key
 * @param {'asc'|'desc'} [props.sortOrder='asc']
 * @param {Function} [props.onSort] - Sort column handler (field) => void
 * @param {Function} [props.onRowClick] - Row click handler (item) => void
 * @param {Function} [props.rowClassName] - Callback to return dynamic row class (item) => string
 * @param {string|number} [props.highlightedId] - ID of row to momentarily highlight
 * @param {boolean} [props.isLoading=false]
 * @param {number} [props.currentPage=1]
 * @param {number} [props.itemsPerPage=10]
 * @param {Function} [props.onPageChange] - Page change handler (newPage) => void
 * @param {string} [props.emptyTitle='No records found']
 * @param {string} [props.emptyMessage='No data matches your active filters.']
 * @param {string} [props.emptyActionLabel]
 * @param {Function} [props.onEmptyAction]
 */
export const DataTable = ({
  columns = [],
  data = [],
  sortField,
  sortOrder = 'asc',
  onSort,
  onRowClick,
  rowClassName,
  highlightedId,
  isLoading = false,
  currentPage = 1,
  itemsPerPage = 10,
  onPageChange,
  emptyTitle,
  emptyMessage,
  emptyActionLabel,
  onEmptyAction
}) => {
  if (isLoading) {
    return <SkeletonLoader type="table" count={itemsPerPage > 6 ? 6 : itemsPerPage} columns={columns.length} />;
  }

  if (!data || data.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyMessage}
        actionLabel={emptyActionLabel}
        onAction={onEmptyAction}
      />
    );
  }

  // Calculate pagination slice
  const totalItems = data.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const validPage = Math.max(1, Math.min(currentPage, totalPages));
  const startIndex = (validPage - 1) * itemsPerPage;
  const paginatedData = onPageChange ? data.slice(startIndex, startIndex + itemsPerPage) : data;

  const handleSortClick = (col) => {
    if (col.sortable && onSort) {
      onSort(col.key);
    }
  };

  return (
    <div className="resq-data-table-wrapper">
      <div className="table-responsive table-responsive-cards border rounded bg-white shadow-sm">
        <table className="table table-hover align-middle mb-0" role="table">
          <thead className="table-light border-bottom sticky-header" role="rowgroup">
            <tr role="row">
              {columns.map((col) => {
                const isCurrentSort = sortField === col.key;
                return (
                  <th
                    key={col.key}
                    scope="col"
                    role="columnheader"
                    aria-sort={
                      isCurrentSort
                        ? sortOrder === 'asc'
                          ? 'ascending'
                          : 'descending'
                        : undefined
                    }
                    className={`py-3 px-3 text-secondary text-uppercase fw-semibold small ${
                      col.align === 'center'
                        ? 'text-center'
                        : col.align === 'end'
                        ? 'text-end'
                        : 'text-start'
                    } ${col.sortable ? 'sortable-header cursor-pointer select-none' : ''}`}
                    style={{ width: col.width || 'auto', fontSize: '0.72rem', letterSpacing: '0.04em' }}
                    onClick={() => handleSortClick(col)}
                  >
                    <div className={`d-inline-flex align-items-center gap-1 ${col.align === 'end' ? 'justify-content-end' : ''}`}>
                      <span>{col.label}</span>
                      {col.sortable && (
                        <span className="sort-icon text-muted" aria-hidden="true">
                          {isCurrentSort ? (
                            sortOrder === 'asc' ? (
                              <ArrowUp size={12} className="text-primary fw-bold" />
                            ) : (
                              <ArrowDown size={12} className="text-primary fw-bold" />
                            )
                          ) : (
                            <ArrowUpDown size={12} className="opacity-40" />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody role="rowgroup">
            {paginatedData.map((item, index) => {
              const isHighlighted = highlightedId && (item.id === highlightedId || item._id === highlightedId);
              const customRowClass = rowClassName ? rowClassName(item) : '';
              const isClickable = typeof onRowClick === 'function';

              return (
                <tr
                  key={item.id || item._id || index}
                  role="row"
                  tabIndex={isClickable ? 0 : undefined}
                  className={`data-row ${isClickable ? 'cursor-pointer' : ''} ${
                    isHighlighted ? 'table-highlight-flash' : ''
                  } ${customRowClass}`}
                  onClick={() => isClickable && onRowClick(item)}
                  onKeyDown={
                    isClickable
                      ? (e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            onRowClick(item);
                          }
                        }
                      : undefined
                  }
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      role="cell"
                      data-label={col.label}
                      className={`py-3 px-3 ${
                        col.align === 'center'
                          ? 'text-center'
                          : col.align === 'end'
                          ? 'text-end'
                          : 'text-start'
                      } ${col.mobileHidden ? 'd-none d-md-table-cell' : ''}`}
                    >
                      {col.render ? col.render(item, index) : item[col.key] ?? '—'}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Bar */}
      {onPageChange && totalPages > 1 && (
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 p-3 bg-white border border-top-0 rounded-bottom">
          <div className="text-muted small">
            Showing <strong className="text-dark">{startIndex + 1}</strong> to{' '}
            <strong className="text-dark">
              {Math.min(startIndex + itemsPerPage, totalItems)}
            </strong>{' '}
            of <strong className="text-dark">{totalItems}</strong> entries
          </div>

          <nav aria-label="Table navigation">
            <ul className="pagination pagination-sm mb-0">
              <li className={`page-item ${validPage <= 1 ? 'disabled' : ''}`}>
                <button
                  type="button"
                  className="page-link"
                  onClick={() => onPageChange(validPage - 1)}
                  disabled={validPage <= 1}
                  aria-label="Previous page"
                >
                  <ChevronLeft size={14} />
                </button>
              </li>

              {Array.from({ length: totalPages }).map((_, idx) => {
                const pageNum = idx + 1;
                // Only show around current page for neat look
                if (
                  totalPages > 7 &&
                  Math.abs(pageNum - validPage) > 2 &&
                  pageNum !== 1 &&
                  pageNum !== totalPages
                ) {
                  if (pageNum === 2 || pageNum === totalPages - 1) {
                    return (
                      <li key={pageNum} className="page-item disabled">
                        <span className="page-link">…</span>
                      </li>
                    );
                  }
                  return null;
                }

                return (
                  <li
                    key={pageNum}
                    className={`page-item ${validPage === pageNum ? 'active' : ''}`}
                  >
                    <button
                      type="button"
                      className="page-link"
                      onClick={() => onPageChange(pageNum)}
                      aria-current={validPage === pageNum ? 'page' : undefined}
                    >
                      {pageNum}
                    </button>
                  </li>
                );
              })}

              <li className={`page-item ${validPage >= totalPages ? 'disabled' : ''}`}>
                <button
                  type="button"
                  className="page-link"
                  onClick={() => onPageChange(validPage + 1)}
                  disabled={validPage >= totalPages}
                  aria-label="Next page"
                >
                  <ChevronRight size={14} />
                </button>
              </li>
            </ul>
          </nav>
        </div>
      )}
    </div>
  );
};

export default DataTable;

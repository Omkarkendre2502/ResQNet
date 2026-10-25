import React from 'react';

/**
 * Shimmering skeleton loader for dashboard tables, stat cards, and detail views.
 *
 * @param {Object} props
 * @param {'table'|'cards'|'line'|'stats'} [props.type='table']
 * @param {number} [props.count=3]
 * @param {number} [props.columns=5]
 */
export const SkeletonLoader = ({ type = 'table', count = 3, columns = 5 }) => {
  if (type === 'stats') {
    return (
      <div className="row g-3">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="col-sm-6 col-lg-3">
            <div className="skeleton-card resq-card p-3 h-100">
              <div className="d-flex justify-content-between mb-3">
                <div className="skeleton-shimmer" style={{ width: '45%', height: '14px' }}></div>
                <div className="skeleton-shimmer rounded-circle" style={{ width: '32px', height: '32px' }}></div>
              </div>
              <div className="skeleton-shimmer mb-2" style={{ width: '60%', height: '28px' }}></div>
              <div className="skeleton-shimmer" style={{ width: '80%', height: '12px' }}></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'cards') {
    return (
      <div className="d-flex flex-column gap-3">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="skeleton-card resq-card p-3 p-md-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div className="skeleton-shimmer" style={{ width: '120px', height: '22px' }}></div>
              <div className="skeleton-shimmer" style={{ width: '80px', height: '22px' }}></div>
            </div>
            <div className="skeleton-shimmer mb-2" style={{ width: '70%', height: '16px' }}></div>
            <div className="skeleton-shimmer mb-3" style={{ width: '90%', height: '14px' }}></div>
            <div className="d-flex gap-2">
              <div className="skeleton-shimmer" style={{ width: '100px', height: '32px' }}></div>
              <div className="skeleton-shimmer" style={{ width: '100px', height: '32px' }}></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'line') {
    return (
      <div className="d-flex flex-column gap-2 py-2">
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="skeleton-shimmer"
            style={{ width: `${Math.min(100, 40 + (i * 20))}%`, height: '14px' }}
          ></div>
        ))}
      </div>
    );
  }

  // Default: Table skeleton rows
  return (
    <div className="table-responsive">
      <table className="table align-middle mb-0">
        <tbody>
          {Array.from({ length: count }).map((_, rIdx) => (
            <tr key={rIdx}>
              {Array.from({ length: columns }).map((_, cIdx) => (
                <td key={cIdx} className="py-3">
                  <div
                    className="skeleton-shimmer"
                    style={{
                      height: '16px',
                      width: cIdx === 0 ? '70px' : cIdx === 1 ? '140px' : '90px'
                    }}
                  ></div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SkeletonLoader;

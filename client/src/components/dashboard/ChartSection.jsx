import React, { useMemo } from 'react';
import {
  Flame,
  Waves,
  Car,
  Building2,
  AlertTriangle,
  BarChart3,
  TrendingUp,
  PieChart
} from 'lucide-react';

/**
 * Pure SVG & CSS responsive charts for Admin Control Center.
 * Computes strictly from real live incident data:
 * 1. Incidents by Type
 * 2. Incidents by Status
 * 3. 7-Day Inflow Trend
 *
 * @param {Object} props
 * @param {Array} props.incidents - List of live incidents
 */
export const ChartSection = ({ incidents = [] }) => {
  // 1. Incidents by Type
  const typeStats = useMemo(() => {
    const counts = {
      Fire: 0,
      Flood: 0,
      Accident: 0,
      'Building Collapse': 0,
      Other: 0
    };

    incidents.forEach((inc) => {
      const t = inc.type || 'Other';
      if (counts[t] !== undefined) {
        counts[t]++;
      } else {
        counts.Other++;
      }
    });

    const total = incidents.length || 1;
    const typeMeta = {
      Fire: { color: '#dc2626', icon: Flame },
      Flood: { color: '#2563eb', icon: Waves },
      Accident: { color: '#d97706', icon: Car },
      'Building Collapse': { color: '#7c3aed', icon: Building2 },
      Other: { color: '#64748b', icon: AlertTriangle }
    };

    return Object.entries(counts).map(([type, count]) => {
      const percentage = Math.round((count / total) * 100);
      const meta = typeMeta[type] || typeMeta.Other;
      return {
        type,
        count,
        percentage,
        color: meta.color,
        Icon: meta.icon
      };
    });
  }, [incidents]);

  // 2. Incidents by Status
  const statusStats = useMemo(() => {
    const counts = {
      Reported: 0,
      Assigned: 0,
      'On the Way': 0,
      Reached: 0,
      'In Progress': 0,
      Completed: 0
    };

    incidents.forEach((inc) => {
      const s = inc.status === 'Resolved' ? 'Completed' : inc.status;
      if (counts[s] !== undefined) {
        counts[s]++;
      }
    });

    const total = incidents.length || 1;
    const colors = {
      Reported: '#0284c7',
      Assigned: '#6366f1',
      'On the Way': '#d97706',
      Reached: '#0d9488',
      'In Progress': '#9333ea',
      Completed: '#16a34a'
    };

    return Object.entries(counts).map(([status, count]) => ({
      status,
      count,
      percentage: Math.round((count / total) * 100),
      color: colors[status]
    }));
  }, [incidents]);

  // 3. 7-Day Trend (Last 7 days, ending today)
  const trendData = useMemo(() => {
    const days = [];
    const now = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);

      const dayEnd = new Date(d);
      dayEnd.setHours(23, 59, 59, 999);

      const count = incidents.filter((inc) => {
        const repTime = new Date(inc.reportedAt || 0).getTime();
        return repTime >= d.getTime() && repTime <= dayEnd.getTime();
      }).length;

      const dayLabel = d.toLocaleDateString('en-IN', { weekday: 'short' });
      const dateStr = d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });

      days.push({ dayLabel, dateStr, count });
    }

    const maxCount = Math.max(1, ...days.map((d) => d.count));
    return { days, maxCount };
  }, [incidents]);

  return (
    <div className="row g-3 mb-4">
      {/* 1. Incidents by Type */}
      <div className="col-lg-4">
        <div className="resq-card p-3 p-md-4 h-100 shadow-sm border bg-white">
          <div className="d-flex align-items-center justify-content-between mb-3 border-bottom pb-2">
            <div className="d-flex align-items-center gap-2">
              <PieChart size={16} className="text-danger" />
              <h6 className="fw-bold text-dark mb-0 small">Incidents by Type</h6>
            </div>
            <span className="badge bg-light text-secondary border small">{incidents.length} Total</span>
          </div>

          <div className="d-flex flex-column gap-3">
            {typeStats.map((item) => {
              const IconComp = item.Icon;
              return (
                <div key={item.type}>
                  <div className="d-flex align-items-center justify-content-between small mb-1">
                    <span className="d-flex align-items-center gap-1.5 text-dark fw-medium">
                      <IconComp size={13} style={{ color: item.color }} />
                      <span>{item.type}</span>
                    </span>
                    <span className="text-muted fw-semibold">
                      {item.count} <span className="small opacity-75">({item.percentage}%)</span>
                    </span>
                  </div>
                  <div className="progress" style={{ height: '6px' }}>
                    <div
                      className="progress-bar rounded"
                      role="progressbar"
                      style={{ width: `${item.percentage}%`, backgroundColor: item.color }}
                      aria-valuenow={item.percentage}
                      aria-valuemin="0"
                      aria-valuemax="100"
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. Incidents by Status */}
      <div className="col-lg-4">
        <div className="resq-card p-3 p-md-4 h-100 shadow-sm border bg-white">
          <div className="d-flex align-items-center justify-content-between mb-3 border-bottom pb-2">
            <div className="d-flex align-items-center gap-2">
              <BarChart3 size={16} className="text-primary" />
              <h6 className="fw-bold text-dark mb-0 small">Status Distribution</h6>
            </div>
            <span className="badge bg-light text-secondary border small">Live Stages</span>
          </div>

          {/* Segmented bar */}
          <div className="progress mb-3 rounded" style={{ height: '10px' }}>
            {statusStats.map(
              (item) =>
                item.count > 0 && (
                  <div
                    key={item.status}
                    className="progress-bar"
                    style={{ width: `${item.percentage}%`, backgroundColor: item.color }}
                    title={`${item.status}: ${item.count} (${item.percentage}%)`}
                    aria-label={`${item.status}: ${item.count}`}
                  ></div>
                )
            )}
          </div>

          <div className="row g-2">
            {statusStats.map((item) => (
              <div key={item.status} className="col-6">
                <div className="p-2 rounded border bg-light d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center gap-1.5 overflow-hidden">
                    <span
                      className="rounded-circle d-inline-block flex-shrink-0"
                      style={{ width: '8px', height: '8px', backgroundColor: item.color }}
                    ></span>
                    <span className="text-secondary small text-truncate" style={{ fontSize: '0.72rem' }}>
                      {item.status}
                    </span>
                  </div>
                  <strong className="text-dark small ms-1">{item.count}</strong>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. 7-Day Inflow Trend (Pure SVG) */}
      <div className="col-lg-4">
        <div className="resq-card p-3 p-md-4 h-100 shadow-sm border bg-white">
          <div className="d-flex align-items-center justify-content-between mb-3 border-bottom pb-2">
            <div className="d-flex align-items-center gap-2">
              <TrendingUp size={16} className="text-success" />
              <h6 className="fw-bold text-dark mb-0 small">7-Day Incident Trend</h6>
            </div>
            <span className="badge bg-light text-secondary border small">Last 7 Days</span>
          </div>

          <div className="d-flex flex-column justify-content-between h-75 pt-2">
            {/* SVG Histogram */}
            <div className="position-relative" style={{ height: '120px' }}>
              <svg viewBox="0 0 280 100" className="w-100 h-100" preserveAspectRatio="none">
                {/* Horizontal gridlines */}
                <line x1="0" y1="20" x2="280" y2="20" stroke="#f1f5f9" strokeDasharray="3,3" />
                <line x1="0" y1="50" x2="280" y2="50" stroke="#f1f5f9" strokeDasharray="3,3" />
                <line x1="0" y1="80" x2="280" y2="80" stroke="#e2e8f0" />

                {trendData.days.map((d, idx) => {
                  const barWidth = 24;
                  const x = idx * 40 + 8;
                  const barHeight = Math.max(4, (d.count / trendData.maxCount) * 65);
                  const y = 80 - barHeight;

                  return (
                    <g key={d.dateStr}>
                      <rect
                        x={x}
                        y={y}
                        width={barWidth}
                        height={barHeight}
                        rx="3"
                        fill={idx === 6 ? '#dc2626' : '#3b82f6'}
                        className="trend-bar-rect"
                        opacity={idx === 6 ? '1' : '0.85'}
                      >
                        <title>{`${d.dateStr} (${d.dayLabel}): ${d.count} reported`}</title>
                      </rect>
                      {/* Bar Value on top */}
                      <text
                        x={x + barWidth / 2}
                        y={y - 4}
                        textAnchor="middle"
                        fontSize="9"
                        fill="#64748b"
                        fontWeight="600"
                      >
                        {d.count}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Day Labels below bars */}
            <div className="d-flex justify-content-between text-muted px-1" style={{ fontSize: '0.7rem' }}>
              {trendData.days.map((d, idx) => (
                <span
                  key={d.dateStr}
                  className={`text-center ${idx === 6 ? 'fw-bold text-danger' : ''}`}
                  style={{ width: '36px' }}
                >
                  {d.dayLabel}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChartSection;

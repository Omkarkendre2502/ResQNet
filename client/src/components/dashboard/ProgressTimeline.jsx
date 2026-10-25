import React from 'react';
import {
  FileText,
  UserCheck,
  Navigation,
  MapPin,
  Activity,
  CheckCircle2,
  Clock
} from 'lucide-react';

export const TIMELINE_STAGES = [
  { key: 'Reported', label: 'Reported', desc: 'Incident registered in dispatch system', icon: FileText },
  { key: 'Assigned', label: 'Assigned', desc: 'Rescue squad allocated and alerted', icon: UserCheck },
  { key: 'On the Way', label: 'On the Way', desc: 'Squad en route with response vehicle', icon: Navigation },
  { key: 'Reached', label: 'Reached', desc: 'Arrived at scene & establishing perimeter', icon: MapPin },
  { key: 'In Progress', label: 'In Progress', desc: 'Active rescue and medical operations', icon: Activity },
  { key: 'Completed', label: 'Completed', desc: 'Operations closed & site secured', icon: CheckCircle2 }
];

/**
 * 6-stage forward-only progress timeline.
 * Displays timeline events, notes, timestamps, and active state.
 *
 * @param {Object} props
 * @param {string} props.currentStatus - Current incident status
 * @param {Array} [props.timeline=[]] - Timeline events array [{ status, timestamp, note, updatedBy }]
 * @param {string} [props.assignedSquad] - Squad callsign/name
 * @param {boolean} [props.orientation='horizontal'] - 'horizontal' | 'vertical'
 */
export const ProgressTimeline = ({
  currentStatus = 'Reported',
  timeline = [],
  assignedSquad,
  orientation = 'horizontal'
}) => {
  // Normalize Resolved to Completed
  const normalizedStatus =
    currentStatus === 'Resolved' ? 'Completed' : currentStatus;

  const currentStageIndex = TIMELINE_STAGES.findIndex(
    (s) => s.key.toLowerCase() === normalizedStatus.toLowerCase()
  );
  const activeIdx = currentStageIndex >= 0 ? currentStageIndex : 0;

  // Build a lookup map from timeline array by status
  const eventMap = {};
  if (Array.isArray(timeline)) {
    timeline.forEach((item) => {
      if (item && item.status) {
        const key = item.status === 'Resolved' ? 'Completed' : item.status;
        eventMap[key.toLowerCase()] = item;
      }
    });
  }

  return (
    <div className={`progress-timeline progress-timeline-${orientation}`}>
      <div className="timeline-track" role="list">
        {TIMELINE_STAGES.map((stage, idx) => {
          const isDone = idx < activeIdx;
          const isCurrent = idx === activeIdx;
          const isUpcoming = idx > activeIdx;
          const event = eventMap[stage.key.toLowerCase()];
          const IconComponent = stage.icon;

          const timestampStr = event?.timestamp
            ? new Date(event.timestamp).toLocaleTimeString('en-IN', {
                hour: '2-digit',
                minute: '2-digit',
                month: 'short',
                day: 'numeric'
              })
            : null;

          return (
            <div
              key={stage.key}
              role="listitem"
              className={`timeline-step ${
                isDone ? 'step-done' : isCurrent ? 'step-current' : 'step-upcoming'
              }`}
            >
              {/* Connector line */}
              {idx > 0 && <div className="timeline-connector" aria-hidden="true"></div>}

              {/* Node Icon Circle */}
              <div
                className="timeline-node"
                aria-label={`${stage.label}: ${
                  isDone ? 'Completed' : isCurrent ? 'Currently active' : 'Upcoming'
                }`}
              >
                {isDone ? (
                  <CheckCircle2 size={16} className="text-white" />
                ) : (
                  <IconComponent size={15} />
                )}
                {isCurrent && <span className="timeline-pulse-ring"></span>}
              </div>

              {/* Text content */}
              <div className="timeline-content">
                <div className="d-flex align-items-center gap-1.5 flex-wrap">
                  <span className="timeline-stage-title fw-bold text-dark">
                    {stage.label}
                  </span>
                  {isCurrent && (
                    <span className="badge bg-primary-subtle text-primary border border-primary-subtle py-0.5 px-1.5" style={{ fontSize: '0.65rem' }}>
                      Active
                    </span>
                  )}
                  {isDone && (
                    <span className="badge bg-success-subtle text-success border border-success-subtle py-0.5 px-1.5" style={{ fontSize: '0.65rem' }}>
                      Done
                    </span>
                  )}
                </div>

                <div className="timeline-stage-desc text-muted small">
                  {stage.key === 'Assigned' && assignedSquad
                    ? `Assigned to: ${assignedSquad}`
                    : stage.desc}
                </div>

                {/* Event timestamp & notes if present */}
                {event && (
                  <div className="timeline-event-meta mt-1 p-1.5 rounded bg-light border small">
                    {timestampStr && (
                      <div className="d-flex align-items-center gap-1 text-secondary" style={{ fontSize: '0.72rem' }}>
                        <Clock size={11} className="text-primary" />
                        <span>{timestampStr}</span>
                      </div>
                    )}
                    {event.note && (
                      <div className="text-dark mt-0.5 fst-italic" style={{ fontSize: '0.73rem' }}>
                        &ldquo;{event.note}&rdquo;
                      </div>
                    )}
                  </div>
                )}

                {isUpcoming && !event && (
                  <span className="text-muted fst-italic" style={{ fontSize: '0.68rem' }}>
                    Pending prior stages
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProgressTimeline;

import React, { useState, useEffect } from 'react';

/**
 * Metric card component with 44px circle icon on the left,
 * and vertically stacked label, value, and hint text on the right.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.icon - Lucide icon component
 * @param {number|string} props.value - Metric numeric value or string
 * @param {string} props.label - Descriptive uppercase label
 * @param {string} [props.sublabel] - Secondary helper text (hint)
 * @param {string} [props.variant='primary'] - 'primary'|'danger'|'warning'|'success'|'info'|'secondary'
 * @param {boolean} [props.isActive=false] - Whether this filter card is currently active/selected
 * @param {Function} [props.onClick] - Callback when card is clicked to filter
 * @param {string} [props.badgeText] - Optional badge inside card
 */
export const StatCard = ({
  icon,
  value,
  label,
  sublabel,
  variant = 'primary',
  isActive = false,
  onClick,
  badgeText
}) => {
  const isClickable = typeof onClick === 'function';
  const isFraction = typeof value === 'string' && value.includes('/');
  const numericValue = typeof value === 'number' ? value : parseInt(value, 10);
  const isPureNumber = !isFraction && !isNaN(numericValue) && typeof value !== 'string';

  const [displayValue, setDisplayValue] = useState(
    isPureNumber ? 0 : value
  );

  // Animated count-up on initial mount for pure numbers
  useEffect(() => {
    if (!isPureNumber) {
      setDisplayValue(value);
      return;
    }

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion || numericValue === 0) {
      setDisplayValue(numericValue);
      return;
    }

    let start = 0;
    const duration = 400; // ms
    const stepTime = 25;
    const steps = Math.max(1, duration / stepTime);
    const increment = numericValue / steps;

    const timer = setInterval(() => {
      start += increment;
      if (start >= numericValue) {
        setDisplayValue(numericValue);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(start));
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [numericValue, value, isPureNumber]);

  const variantStyles = {
    danger: {
      bgLight: 'bg-danger-subtle',
      text: 'text-danger',
      ring: 'ring-danger'
    },
    warning: {
      bgLight: 'bg-warning-subtle',
      text: 'text-warning-emphasis',
      ring: 'ring-warning'
    },
    success: {
      bgLight: 'bg-success-subtle',
      text: 'text-success',
      ring: 'ring-success'
    },
    info: {
      bgLight: 'bg-info-subtle',
      text: 'text-info',
      ring: 'ring-info'
    },
    secondary: {
      bgLight: 'bg-secondary-subtle',
      text: 'text-secondary',
      ring: 'ring-secondary'
    },
    primary: {
      bgLight: 'bg-primary-subtle',
      text: 'text-primary',
      ring: 'ring-primary'
    }
  };

  const currentVariant = variantStyles[variant] || variantStyles.primary;

  // Format fractions such as "3 / 3" into "3/3" and keep on one line
  const formattedValue = isFraction
    ? String(value).replace(/\s*\/\s*/, '/')
    : (isPureNumber ? displayValue : value);

  const isLongText = typeof formattedValue === 'string' && formattedValue.length > 8 && !isFraction;

  return (
    <div
      role={isClickable ? 'button' : 'region'}
      tabIndex={isClickable ? 0 : undefined}
      aria-pressed={isClickable ? isActive : undefined}
      aria-label={`${label}: ${value}`}
      className={`stat-card ${isClickable ? 'clickable-card' : ''} ${
        isActive ? `active-card ${currentVariant.ring}` : ''
      }`}
      onClick={isClickable ? onClick : undefined}
      onKeyDown={
        isClickable
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
    >
      {/* Icon circle on the left: fixed 44px circle, flex-shrink: 0 */}
      <div
        className={`stat-card-icon-circle ${currentVariant.bgLight} ${currentVariant.text}`}
        aria-hidden="true"
      >
        {icon}
      </div>

      {/* Text block on the right with min-width: 0 */}
      <div className="stat-card-body">
        <span className="stat-card-label" title={label}>
          {label}
        </span>

        <div className="stat-card-value-wrap">
          <span
            className={`stat-card-value ${isLongText ? 'stat-card-value-text' : ''} ${currentVariant.text}`}
          >
            {formattedValue}
          </span>
          {badgeText && (
            <span
              className="badge bg-light text-secondary border small px-1.5 py-0.5"
              style={{ fontSize: '0.65rem' }}
            >
              {badgeText}
            </span>
          )}
        </div>

        {sublabel && (
          <span className="stat-card-hint" title={sublabel}>
            {sublabel}
          </span>
        )}
      </div>
    </div>
  );
};

export default StatCard;

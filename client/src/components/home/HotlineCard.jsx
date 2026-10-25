import React from 'react';
import { hotlines } from '../../data/homeContent';
import { PhoneCall, ShieldAlert, Flame, Ambulance, Clock } from 'lucide-react';

export const HotlineCard = ({ className = '' }) => {
  const getIcon = (iconName) => {
    switch (iconName) {
      case 'ShieldAlert':
        return <ShieldAlert size={22} className="text-danger" />;
      case 'Flame':
        return <Flame size={22} className="text-warning" />;
      case 'Ambulance':
        return <Ambulance size={22} className="text-info" />;
      default:
        return <PhoneCall size={22} className="text-danger" />;
    }
  };

  return (
    <div className={`resq-hotline-hero-card ${className}`}>
      <div className="d-flex align-items-center justify-content-between mb-3 border-bottom pb-2 border-white border-opacity-10">
        <div>
          <span className="text-white-50 text-uppercase fw-bold" style={{ fontSize: '0.72rem', letterSpacing: '0.08em' }}>
            Pune Emergency Dispatch
          </span>
          <h4 className="h6 fw-bold text-white mb-0">Direct Hotlines (Click to Call)</h4>
        </div>
        <span className="badge bg-danger d-inline-flex align-items-center gap-1">
          <span className="pulse-dot" style={{ width: '6px', height: '6px', background: '#fff' }}></span>
          <span>24/7 ACTIVE</span>
        </span>
      </div>

      <div className="d-flex flex-column gap-2 mb-3">
        {hotlines.map((hotline) => (
          <a
            key={hotline.number}
            href={hotline.tel}
            className="resq-hotline-item"
            aria-label={`Call ${hotline.name} at ${hotline.number}`}
          >
            <div className="d-flex align-items-center gap-3">
              <div
                className="d-flex align-items-center justify-content-center rounded bg-white bg-opacity-10 p-2"
                style={{ width: '42px', height: '42px' }}
              >
                {getIcon(hotline.icon)}
              </div>
              <div className="text-start">
                <div className="text-white fw-bold" style={{ fontSize: '0.92rem' }}>
                  {hotline.name}
                </div>
                <div className="text-white-50" style={{ fontSize: '0.75rem' }}>
                  {hotline.subtext}
                </div>
              </div>
            </div>

            <div className="text-end">
              <span className="resq-hotline-num text-white">{hotline.number}</span>
              <span className="d-block text-white-50" style={{ fontSize: '0.65rem' }}>
                Tap to Call
              </span>
            </div>
          </a>
        ))}
      </div>

      <div className="pt-2 text-center text-white-50 small border-top border-white border-opacity-10" style={{ fontSize: '0.75rem' }}>
        <Clock size={12} className="me-1" />
        Official Pune Municipal Corporation Control Center
      </div>
    </div>
  );
};

export default HotlineCard;

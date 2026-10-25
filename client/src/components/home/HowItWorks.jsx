import React, { useState } from 'react';
import { workflowSteps } from '../../data/homeContent';
import { Siren, ShieldCheck, Ambulance, CheckCircle2 } from 'lucide-react';

export const HowItWorks = () => {
  const [activeStep, setActiveStep] = useState(0);

  const getStepIcon = (iconName) => {
    switch (iconName) {
      case 'Siren':
        return <Siren size={22} />;
      case 'ShieldCheck':
        return <ShieldCheck size={22} />;
      case 'Ambulance':
        return <Ambulance size={22} />;
      case 'CheckCircle2':
        return <CheckCircle2 size={22} />;
      default:
        return <ShieldCheck size={22} />;
    }
  };

  return (
    <section id="how-it-works" className="resq-section resq-section-alt" aria-labelledby="workflow-heading">
      <div className="container-xl">
        <div className="text-center mb-5">
          <div className="resq-section-eyebrow">Response Lifecycle</div>
          <h2 id="workflow-heading" className="resq-section-title">
            How Pune Emergency Response Works
          </h2>
          <p className="resq-section-subtitle mx-auto">
            From your immediate digital report to field squad arrival, every stage is authenticated, coordinated, and tracked in real time.
          </p>
        </div>

        <div className="row g-4">
          {workflowSteps.map((item, idx) => {
            const isHighlighted = idx === activeStep;
            return (
              <div key={item.step} className="col-12 col-sm-6 col-lg-3">
                <div
                  className={`resq-step-card ${isHighlighted ? 'active-step' : ''}`}
                  onMouseEnter={() => setActiveStep(idx)}
                  tabIndex={0}
                  onFocus={() => setActiveStep(idx)}
                >
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <div className="resq-step-icon">{getStepIcon(item.icon)}</div>
                    <span className="resq-step-num">{item.step}</span>
                  </div>

                  <h3 className="h6 fw-bold text-dark mb-2">{item.title}</h3>
                  <p className="small text-muted mb-0" style={{ lineHeight: '1.45' }}>
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;

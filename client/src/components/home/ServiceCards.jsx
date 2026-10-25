import React from 'react';
import { useApp } from '../../context/AppContext';
import { services } from '../../data/homeContent';
import { SafeImage } from './SafeImage';
import { Siren } from 'lucide-react';

export const ServiceCards = () => {
  const { currentUser, navigateTo, setRedirectAfterLogin } = useApp();

  const handleCardClick = () => {
    if (!currentUser) {
      setRedirectAfterLogin('report-emergency');
      navigateTo('login');
    } else {
      navigateTo('report-emergency');
    }
  };

  return (
    <section id="services" className="resq-section" aria-labelledby="services-heading">
      <div className="container-xl">
        <div className="text-center mb-5">
          <div className="resq-section-eyebrow">Municipal Emergency Coordination</div>
          <h2 id="services-heading" className="resq-section-title">
            What We Handle Across Pune
          </h2>
          <p className="resq-section-subtitle mx-auto">
            Rapid response categorization ensuring reports are directly dispatched to specialized municipal rescue squads, fire brigades, and medical personnel.
          </p>
        </div>

        <div className="row g-4 justify-content-center">
          {services.map((item) => (
            <div key={item.id} className="col-12 col-md-6 col-lg-4">
              <div
                className="resq-service-card"
                onClick={() => handleCardClick(item.category)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleCardClick(item.category);
                  }
                }}
                aria-label={`Report ${item.title} emergency`}
              >
                {/* Photo with 4:3 Aspect Ratio */}
                <SafeImage
                  srcWebp={item.imageWebp}
                  srcJpg={item.imageJpg}
                  alt={item.alt}
                  aspectRatio="4 / 3"
                  width="800"
                  height="600"
                  loading="lazy"
                />

                <div className="resq-service-body">
                  <span className="resq-service-badge bg-danger-subtle text-danger">
                    {item.badge}
                  </span>
                  <h3 className="resq-service-title">{item.title}</h3>
                  <p className="resq-service-desc">{item.summary}</p>
                  <div className="resq-service-action">
                    <Siren size={15} />
                    <span>Report this Emergency &rarr;</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServiceCards;

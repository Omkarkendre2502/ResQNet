import React from 'react';
import { aboutHighlights } from '../../data/homeContent';
import { SafeImage } from './SafeImage';
import { CheckCircle2, ShieldCheck } from 'lucide-react';

export const AboutSection = () => {
  return (
    <section id="about" className="resq-section" aria-labelledby="about-heading">
      <div className="container-xl">
        <div className="row align-items-center g-4 g-lg-5">
          {/* Left: Real Photo */}
          <div className="col-12 col-lg-6">
            <div className="position-relative">
              <SafeImage
                srcWebp="/images/about-team.webp"
                srcJpg="/images/about-team.jpg"
                alt="Pune emergency control center team monitoring operations"
                aspectRatio="4 / 3"
                width="1000"
                height="750"
                loading="lazy"
                className="rounded shadow-sm border"
              />
              <div
                className="position-absolute bottom-0 start-0 m-3 p-2 px-3 rounded bg-dark bg-opacity-90 text-white small border border-secondary"
                style={{ backdropFilter: 'blur(6px)' }}
              >
                <div className="d-flex align-items-center gap-2">
                  <ShieldCheck size={16} className="text-danger" />
                  <span className="fw-semibold">Pune Municipal Disaster Control Center</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Benefits & Context */}
          <div className="col-12 col-lg-6">
            <div className="resq-section-eyebrow">About the Initiative</div>
            <h2 id="about-heading" className="resq-section-title">
              Why ResQNet for Pune?
            </h2>
            <p className="resq-section-subtitle mb-4">
              During urgent crises, every second matters. ResQNet eliminates communication delays by establishing an instantaneous digital bridge between citizens and Pune’s emergency response infrastructure.
            </p>

            <div className="d-flex flex-column gap-3">
              {aboutHighlights.map((item, idx) => (
                <div key={idx} className="d-flex align-items-start gap-3">
                  <div className="mt-1 text-danger flex-shrink-0">
                    <CheckCircle2 size={20} />
                  </div>
                  <div>
                    <h3 className="h6 fw-bold text-dark mb-1">{item.title}</h3>
                    <p className="small text-muted mb-0" style={{ lineHeight: '1.45' }}>
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;

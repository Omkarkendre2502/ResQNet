import React, { useState } from 'react';
import { faqs } from '../../data/homeContent';
import { ChevronDown, AlertTriangle } from 'lucide-react';

export const FaqAccordion = () => {
  const [openId, setOpenId] = useState(1);

  const toggleItem = (id) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <section id="faq" className="resq-section resq-section-alt" aria-labelledby="faq-heading">
      <div className="container-xl">
        <div className="text-center mb-5">
          <div className="resq-section-eyebrow">Frequently Asked Questions</div>
          <h2 id="faq-heading" className="resq-section-title">
            Answers for Pune Citizens
          </h2>
          <p className="resq-section-subtitle mx-auto">
            Everything you need to know about reporting incidents, tracking squads, and account privacy.
          </p>
        </div>

        <div className="row justify-content-center">
          <div className="col-12 col-lg-9">
            {/* Critical Disclaimer Notice */}
            <div className="p-3 mb-4 rounded bg-danger-subtle border border-danger-subtle text-danger-emphasis d-flex align-items-start gap-3">
              <AlertTriangle size={24} className="text-danger flex-shrink-0 mt-1" />
              <div className="small">
                <strong>CRITICAL NOTICE:</strong> ResQNet is designed to coordinate operations and support field dispatch, but{' '}
                <strong>it does not replace direct telephone contact</strong>. In any immediate life-threatening crisis,
                fire, or severe injury, always call{' '}
                <a href="tel:112" className="fw-bold text-danger text-decoration-underline">112</a>,{' '}
                <a href="tel:101" className="fw-bold text-danger text-decoration-underline">101</a>, or{' '}
                <a href="tel:108" className="fw-bold text-danger text-decoration-underline">108</a> immediately before filing an online report.
              </div>
            </div>

            {/* Accordion Questions */}
            <div className="resq-faq-accordion" role="region" aria-label="Frequently Asked Questions">
              {faqs.map((item) => {
                const isOpen = openId === item.id;
                return (
                  <div key={item.id} className="resq-faq-item">
                    <button
                      type="button"
                      className="resq-faq-header"
                      onClick={() => toggleItem(item.id)}
                      aria-expanded={isOpen}
                      aria-controls={`faq-answer-${item.id}`}
                      id={`faq-btn-${item.id}`}
                    >
                      <span className="pe-3">{item.question}</span>
                      <ChevronDown
                        size={18}
                        className="text-secondary flex-shrink-0"
                        style={{
                          transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                          transition: 'transform 0.25s ease'
                        }}
                      />
                    </button>

                    {isOpen && (
                      <div
                        id={`faq-answer-${item.id}`}
                        role="region"
                        aria-labelledby={`faq-btn-${item.id}`}
                        className="resq-faq-body"
                      >
                        {item.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FaqAccordion;

import React, { useState } from 'react';
import { hotlines, navLinks } from '../../data/homeContent';
import { ShieldCheck, PhoneCall, ExternalLink, X } from 'lucide-react';

export const HomeFooter = () => {
  const [showCreditsModal, setShowCreditsModal] = useState(false);

  const handleSmoothScroll = (e, href) => {
    e.preventDefault();
    const targetId = href.replace('#', '');
    const targetEl = document.getElementById(targetId);
    if (targetEl) {
      const topOffset = targetEl.getBoundingClientRect().top + window.pageYOffset - 75;
      window.scrollTo({
        top: topOffset,
        behavior: 'smooth'
      });
    }
  };

  return (
    <>
      <footer className="resq-home-footer" role="contentinfo">
        <div className="container-xl">
          <div className="row g-4 mb-5">
            {/* Col 1: Brand & Mission */}
            <div className="col-12 col-md-5 col-lg-4">
              <div className="d-flex align-items-center gap-2 mb-3">
                <div
                  className="rounded bg-danger text-white d-flex align-items-center justify-content-center"
                  style={{ width: '32px', height: '32px' }}
                >
                  <ShieldCheck size={18} />
                </div>
                <span className="h5 fw-bold text-white mb-0">ResQNet</span>
                <span className="badge bg-danger ms-2">Pune Zone</span>
              </div>

              <p className="small text-white-50 mb-3" style={{ lineHeight: '1.6' }}>
                Smart Emergency Response & Disaster Management System for the Pune Metropolitan Area. Providing rapid incident dispatch, live mission coordination, and civil disaster preparedness.
              </p>

              <div className="d-flex align-items-center gap-2">
                <span className="badge bg-light text-dark fw-semibold">PMC Operations</span>
                <span className="badge bg-dark border border-secondary text-white-50">Public Portal</span>
              </div>
            </div>

            {/* Col 2: Quick Links */}
            <div className="col-6 col-md-3 col-lg-2 offset-lg-1">
              <h4 className="resq-footer-heading">Quick Navigation</h4>
              <ul className="resq-footer-links">
                {navLinks.map((link) => (
                  <li key={link.href}>
                    <a href={link.href} onClick={(e) => handleSmoothScroll(e, link.href)}>
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Col 3: Emergency Hotlines */}
            <div className="col-6 col-md-4 col-lg-3">
              <h4 className="resq-footer-heading">Emergency Hotlines</h4>
              <ul className="resq-footer-links">
                {hotlines.map((h) => (
                  <li key={h.number}>
                    <a href={h.tel} className="d-flex align-items-center gap-1 text-danger fw-bold">
                      <PhoneCall size={13} />
                      <span>{h.name}: {h.number}</span>
                    </a>
                  </li>
                ))}
                <li className="mt-2 text-white-50 small">
                  Pune Control: +91 (020) 2550-1111
                </li>
              </ul>
            </div>

            {/* Col 4: Authority & Transparency */}
            <div className="col-12 col-md-12 col-lg-2">
              <h4 className="resq-footer-heading">Legal & Resources</h4>
              <ul className="resq-footer-links">
                <li>
                  <button
                    type="button"
                    className="btn btn-link text-white-50 p-0 text-decoration-none small text-start"
                    onClick={() => setShowCreditsModal(true)}
                  >
                    Image Credits & Licenses
                  </button>
                </li>
                <li>
                  <a
                    href="https://pmc.gov.in"
                    target="_blank"
                    rel="noreferrer"
                    className="d-inline-flex align-items-center gap-1"
                  >
                    <span>Pune Municipal Corp</span>
                    <ExternalLink size={11} />
                  </a>
                </li>
                <li>
                  <span className="text-white-50 small">Disaster Management Cell</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Copyright Strip */}
          <div className="pt-4 border-top border-white border-opacity-10 d-flex flex-wrap align-items-center justify-content-between gap-3 small text-white-50">
            <div>
              &copy; {new Date().getFullYear()} <strong>ResQNet</strong> • Government of Maharashtra & Pune Municipal Corporation. All rights reserved.
            </div>
            <div className="d-flex align-items-center gap-3">
              <span className="badge bg-danger text-white">Pune Municipal Area</span>
              <button
                type="button"
                className="btn btn-link text-white-50 p-0 text-decoration-underline small"
                onClick={() => setShowCreditsModal(true)}
              >
                Photo Credits
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* Photo Credits Modal */}
      {showCreditsModal && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 1060 }}
          role="dialog"
          aria-labelledby="credits-modal-title"
          aria-modal="true"
        >
          <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header bg-dark text-white">
                <h5 id="credits-modal-title" className="modal-title fw-bold">
                  Photographic Credits & Unsplash Licenses
                </h5>
                <button
                  type="button"
                  className="btn btn-sm btn-link text-white p-0"
                  onClick={() => setShowCreditsModal(false)}
                  aria-label="Close modal"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="modal-body p-4">
                <p className="text-secondary small mb-3">
                  All photographs displayed on the ResQNet portal are real, documentary-quality photographs sourced under the <strong>Unsplash Free License</strong>. We gratefully acknowledge the contributing photographers:
                </p>

                <div className="table-responsive">
                  <table className="table table-bordered table-sm small align-middle">
                    <thead className="table-light">
                      <tr>
                        <th>Asset File</th>
                        <th>Subject</th>
                        <th>Photographer</th>
                        <th>License</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td><code>hero-1.jpg</code></td>
                        <td>Firefighters tackling active structural blaze</td>
                        <td><strong>Matt C</strong></td>
                        <td>Unsplash Free License</td>
                      </tr>
                      <tr>
                        <td><code>hero-2.jpg</code></td>
                        <td>Emergency ambulance on duty with beacon lights</td>
                        <td><strong>Camilo Jimenez</strong></td>
                        <td>Unsplash Free License</td>
                      </tr>
                      <tr>
                        <td><code>hero-3.jpg</code></td>
                        <td>Disaster response team conducting flood relief</td>
                        <td><strong>Kelly Sikkema</strong></td>
                        <td>Unsplash Free License</td>
                      </tr>
                      <tr>
                        <td><code>service-fire.jpg</code></td>
                        <td>Fire brigade tackling hazardous fire outbreak</td>
                        <td><strong>Mike Newbry</strong></td>
                        <td>Unsplash Free License</td>
                      </tr>
                      <tr>
                        <td><code>service-flood.jpg</code></td>
                        <td>Urban flood rescue and water evacuation</td>
                        <td><strong>Kelly Sikkema</strong></td>
                        <td>Unsplash Free License</td>
                      </tr>
                      <tr>
                        <td><code>service-accident.jpg</code></td>
                        <td>Highway road traffic accident response vehicle</td>
                        <td><strong>Michael Marais</strong></td>
                        <td>Unsplash Free License</td>
                      </tr>
                      <tr>
                        <td><code>service-collapse.jpg</code></td>
                        <td>Structural damage & building collapse rescue</td>
                        <td><strong>CDC</strong></td>
                        <td>Unsplash / Public Domain</td>
                      </tr>
                      <tr>
                        <td><code>service-medical.jpg</code></td>
                        <td>108 EMS ambulance and paramedic squad</td>
                        <td><strong>Online Marketing</strong></td>
                        <td>Unsplash Free License</td>
                      </tr>
                      <tr>
                        <td><code>about-team.jpg</code></td>
                        <td>Disaster control room operations team</td>
                        <td><strong>Austin Distel</strong></td>
                        <td>Unsplash Free License</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="alert alert-light border small mt-3 mb-0">
                  Detailed source links, high-res URLs, and keyword notes are also available in{' '}
                  <code>client/public/images/CREDITS.md</code> and <code>client/public/images/README.md</code>.
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setShowCreditsModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default HomeFooter;

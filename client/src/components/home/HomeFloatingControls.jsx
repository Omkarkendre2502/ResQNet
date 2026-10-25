import React, { useState, useEffect } from 'react';
import { PhoneCall, ChevronUp, Siren } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const HomeFloatingControls = () => {
  const { currentUser, navigateTo, setRedirectAfterLogin } = useApp();
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setShowBackToTop(true);
      } else {
        setShowBackToTop(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const handleMobileReport = () => {
    if (!currentUser) {
      setRedirectAfterLogin('report-emergency');
      navigateTo('login');
    } else {
      navigateTo('report-emergency');
    }
  };

  return (
    <>
      {/* Sticky Call 112 & Report Emergency on Mobile Viewports */}
      <div className="resq-mobile-emergency-bar d-md-none" role="region" aria-label="Mobile Emergency Actions">
        <a
          href="tel:112"
          className="btn btn-danger flex-grow-1 d-flex align-items-center justify-content-center gap-2 fw-bold py-2"
          aria-label="Direct Call Emergency Hotline 112"
        >
          <PhoneCall size={18} />
          <span>Call 112 (Emergency)</span>
        </a>

        <button
          type="button"
          className="btn btn-outline-danger fw-semibold d-flex align-items-center justify-content-center px-3"
          onClick={handleMobileReport}
          aria-label="Report emergency incident"
        >
          <Siren size={18} />
        </button>
      </div>

      {/* Floating Back to Top Button */}
      <button
        type="button"
        className={`resq-back-to-top ${showBackToTop ? 'visible' : ''}`}
        onClick={scrollToTop}
        aria-label="Scroll back to top of page"
      >
        <ChevronUp size={22} />
      </button>
    </>
  );
};

export default HomeFloatingControls;

import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { navLinks } from '../../data/homeContent';
import {
  ShieldCheck,
  PhoneCall,
  Menu,
  X,
  User,
  ArrowRight
} from 'lucide-react';

export const HomeNavbar = () => {
  const { currentUser, navigateTo } = useApp();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('services');

  // Track window scroll to add shadow and solid background
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 30) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }

      // Active section spy
      const sections = ['services', 'how-it-works', 'safety-tips', 'map-preview', 'about', 'faq'];
      const scrollPos = window.scrollY + 120;

      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSmoothScroll = (e, href) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const targetId = href.replace('#', '');
    const targetEl = document.getElementById(targetId);
    if (targetEl) {
      const topOffset = targetEl.getBoundingClientRect().top + window.pageYOffset - 75;
      window.scrollTo({
        top: topOffset,
        behavior: 'smooth'
      });
      setActiveSection(targetId);
    }
  };

  const getDashboardTarget = () => {
    if (!currentUser) return 'login';
    if (currentUser.role === 'admin') return 'admin-dashboard';
    if (currentUser.role === 'rescue') return 'rescue-dashboard';
    return 'citizen-dashboard';
  };

  return (
    <>
      {/* 1. Official Government/NGO Top Bar */}
      <div className="resq-topbar py-1 px-3 d-none d-md-block">
        <div className="container-xl d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-2">
            <span className="badge bg-danger text-white rounded-pill px-2" style={{ fontSize: '0.68rem' }}>
              OFFICIAL
            </span>
            <span className="fw-medium">
              Government of Maharashtra • Pune Municipal Emergency & Disaster Operations
            </span>
          </div>
          <div className="d-flex align-items-center gap-3">
            <span>
              24/7 Hotlines: <a href="tel:112" className="fw-bold text-white">112</a> (Police/Disaster) • <a href="tel:101" className="fw-bold text-white">101</a> (Fire) • <a href="tel:108" className="fw-bold text-white">108</a> (Ambulance)
            </span>
          </div>
        </div>
      </div>

      {/* 2. Main Sticky Navigation */}
      <header className={`resq-home-nav ${isScrolled ? 'scrolled' : ''}`} role="banner">
        <div className="container-xl py-2 d-flex align-items-center justify-content-between">
          {/* Brand Logo */}
          <a
            href="#top"
            className="resq-nav-brand"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            aria-label="ResQNet Home"
          >
            <div className="resq-brand-badge" aria-hidden="true">
              <ShieldCheck size={22} />
            </div>
            <div>
              <span className="resq-brand-title">ResQNet</span>
              <span className="resq-brand-sub">Pune Zone</span>
            </div>
          </a>

          {/* Desktop Navigation Links */}
          <nav className="d-none d-lg-block" aria-label="Main Navigation">
            <ul className="resq-nav-links">
              {navLinks.map((link) => {
                const secId = link.href.replace('#', '');
                const isActive = activeSection === secId;
                return (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      className={`resq-nav-link ${isActive ? 'active' : ''}`}
                      onClick={(e) => handleSmoothScroll(e, link.href)}
                    >
                      {link.label}
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Right Action Buttons */}
          <div className="d-flex align-items-center gap-2">
            {/* Direct Call to 112 button */}
            <a
              href="tel:112"
              className="btn-emergency-nav"
              aria-label="Call emergency hotline 112"
            >
              <PhoneCall size={15} />
              <span className="d-none d-sm-inline">Emergency? </span>
              <span>Call 112</span>
            </a>

            {/* Auth / Dashboard buttons */}
            {currentUser ? (
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1"
                onClick={() => navigateTo(getDashboardTarget())}
              >
                <User size={15} />
                <span className="d-none d-md-inline fw-medium">Dashboard</span>
                <span className="badge bg-danger text-uppercase" style={{ fontSize: '0.62rem' }}>
                  {currentUser.role}
                </span>
              </button>
            ) : (
              <div className="d-none d-sm-flex align-items-center gap-1">
                <button
                  type="button"
                  className="btn btn-link text-decoration-none text-dark btn-sm fw-semibold px-2"
                  onClick={() => navigateTo('login')}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  className="btn btn-outline-dark btn-sm fw-semibold"
                  onClick={() => navigateTo('login')}
                >
                  Register
                </button>
              </div>
            )}

            {/* Mobile Menu Trigger */}
            <button
              type="button"
              className="resq-nav-toggle d-lg-none"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="resq-mobile-drawer d-lg-none p-3" role="dialog" aria-modal="true">
            <ul className="list-unstyled mb-3">
              {navLinks.map((link) => (
                <li key={link.href} className="border-bottom py-2">
                  <a
                    href={link.href}
                    className="text-dark fw-medium text-decoration-none d-block py-1"
                    onClick={(e) => handleSmoothScroll(e, link.href)}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>

            <div className="d-flex flex-column gap-2 pt-2 border-top">
              {currentUser ? (
                <button
                  type="button"
                  className="btn btn-resq-primary w-100 justify-content-center"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigateTo(getDashboardTarget());
                  }}
                >
                  <span>Go to {currentUser.role} Dashboard</span>
                  <ArrowRight size={16} />
                </button>
              ) : (
                <div className="d-flex gap-2">
                  <button
                    type="button"
                    className="btn btn-outline-dark w-50"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      navigateTo('login');
                    }}
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    className="btn btn-resq-primary w-50"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      navigateTo('login');
                    }}
                  >
                    Register
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </header>
    </>
  );
};

export default HomeNavbar;

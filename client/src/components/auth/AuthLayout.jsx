import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  ShieldCheck,
  ArrowLeft,
  PhoneCall,
  Radio,
  Clock,
  Smartphone
} from 'lucide-react';

export const AuthLayout = ({
  activeTab,
  onTabChange,
  children,
  showTabs = true
}) => {
  const { navigateTo } = useApp();

  return (
    <div className="resq-auth-page">
      {/* 1. Left Panel (Desktop Real Photo & Trust Highlights) */}
      <div className="resq-auth-hero-panel" role="complementary" aria-label="ResQNet Overview">
        {/* Background Photograph */}
        <picture>
          <source srcSet="/images/auth-bg.webp" type="image/webp" />
          <img
            src="/images/auth-bg.jpg"
            alt="Pune Emergency Response and Disaster Management Team"
            className="resq-auth-bg-img"
            width="1000"
            height="1400"
            loading="eager"
          />
        </picture>

        {/* 50% Dark Overlay */}
        <div className="resq-auth-overlay" aria-hidden="true" />

        {/* Top Branding */}
        <div className="resq-auth-hero-content">
          <a
            href="#home"
            className="resq-auth-hero-brand"
            onClick={(e) => {
              e.preventDefault();
              navigateTo('home');
            }}
          >
            <div className="resq-auth-brand-icon">
              <ShieldCheck size={24} />
            </div>
            <div>
              <span className="h4 fw-bold mb-0 text-white d-block">ResQNet</span>
              <span className="small text-white-50 fw-semibold text-uppercase" style={{ letterSpacing: '0.08em' }}>
                Pune Zone
              </span>
            </div>
          </a>

          <h1 className="resq-auth-hero-headline">
            Smart Emergency Response & Disaster Management
          </h1>

          <p className="resq-auth-hero-sub">
            The official coordinate-aware portal connecting citizens with Pune’s municipal control room, fire brigade, and 108 emergency rescue squads.
          </p>
        </div>

        {/* Bottom Trust Points Card */}
        <div className="resq-auth-hero-content">
          <div className="resq-trust-box">
            <div className="small text-uppercase text-white-50 fw-bold mb-2" style={{ letterSpacing: '0.06em' }}>
              Why Register with ResQNet?
            </div>

            <div className="resq-trust-item">
              <Clock size={18} className="resq-trust-icon" />
              <div>
                <strong className="text-white small d-block">Report in Seconds</strong>
                <span className="text-white-50" style={{ fontSize: '0.78rem' }}>
                  Streamlined submission with accurate Pune coordinates and landmark triage.
                </span>
              </div>
            </div>

            <div className="resq-trust-item">
              <Radio size={18} className="resq-trust-icon" />
              <div>
                <strong className="text-white small d-block">Track Your Rescue Team</strong>
                <span className="text-white-50" style={{ fontSize: '0.78rem' }}>
                  Live status tracking from squad departure until scene completion.
                </span>
              </div>
            </div>

            <div className="resq-trust-item">
              <Smartphone size={18} className="resq-trust-icon" />
              <div>
                <strong className="text-white small d-block">Works on Any Device</strong>
                <span className="text-white-50" style={{ fontSize: '0.78rem' }}>
                  Optimized for fast mobile loading on 4G/5G across Pune urban & rural wards.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Right Panel (Form Card & Controls) */}
      <div className="resq-auth-form-panel">
        <div className="resq-auth-card-container">
          {/* Top Bar Navigation */}
          <div className="resq-auth-top-nav">
            <button
              type="button"
              className="btn btn-link p-0 resq-back-home-link"
              onClick={() => navigateTo('home')}
            >
              <ArrowLeft size={16} />
              <span>Back to Home</span>
            </button>

            <span className="badge bg-danger-subtle text-danger border border-danger-subtle small">
              Official Portal
            </span>
          </div>

          {/* Mobile Top Banner */}
          <div className="resq-mobile-auth-banner d-lg-none">
            <div className="resq-auth-brand-icon" style={{ width: '36px', height: '36px' }}>
              <ShieldCheck size={20} />
            </div>
            <div>
              <span className="h5 fw-bold mb-0 text-dark d-block">ResQNet Pune</span>
              <span className="small text-muted">Emergency & Disaster Management</span>
            </div>
          </div>

          {/* Segmented Tab Controls (Sign In / Register) */}
          {showTabs && (
            <div className="resq-auth-tabs" role="tablist" aria-label="Portal access modes">
              <button
                type="button"
                role="tab"
                id="tab-login"
                aria-selected={activeTab === 'login'}
                aria-controls="panel-login"
                className={`resq-auth-tab-btn ${activeTab === 'login' ? 'active' : ''}`}
                onClick={() => onTabChange('login')}
              >
                Sign In
              </button>

              <button
                type="button"
                role="tab"
                id="tab-register"
                aria-selected={activeTab === 'register'}
                aria-controls="panel-register"
                className={`resq-auth-tab-btn ${activeTab === 'register' ? 'active' : ''}`}
                onClick={() => onTabChange('register')}
              >
                Create Account
              </button>
            </div>
          )}

          {/* Form Content Area */}
          <main id="auth-main-content">
            {children}
          </main>

          {/* Footer Emergency Hotlines */}
          <div className="resq-auth-footer">
            <div className="d-flex align-items-center justify-content-center gap-1 mb-1">
              <PhoneCall size={13} className="text-danger" />
              <span>In urgent life danger, call immediately:</span>
            </div>
            <div>
              <a href="tel:112">112 (Police)</a> &bull;{' '}
              <a href="tel:101">101 (Fire)</a> &bull;{' '}
              <a href="tel:108">108 (Ambulance)</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;

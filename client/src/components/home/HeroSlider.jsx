import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import { heroSlides } from '../../data/homeContent';
import { HotlineCard } from './HotlineCard';
import {
  Siren,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Radio
} from 'lucide-react';

export const HeroSlider = () => {
  const { currentUser, navigateTo, setRedirectAfterLogin } = useApp();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const totalSlides = heroSlides.length;

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  }, [totalSlides]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  }, [totalSlides]);

  // Autoplay interval (6 seconds), pauses on hover or if user prefers reduced motion
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || isPaused) return;

    const timer = setInterval(() => {
      nextSlide();
    }, 6000);

    return () => clearInterval(timer);
  }, [nextSlide, isPaused]);

  // Handle Touch Swipe on Mobile
  const handleTouchStart = (e) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const diff = touchStartX.current - touchEndX.current;
    if (diff > 50) {
      // Swiped Left -> Next
      nextSlide();
    } else if (diff < -50) {
      // Swiped Right -> Prev
      prevSlide();
    }
    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowLeft') {
      prevSlide();
    } else if (e.key === 'ArrowRight') {
      nextSlide();
    }
  };

  const handleReportEmergencyClick = () => {
    if (!currentUser) {
      setRedirectAfterLogin('report-emergency');
      navigateTo('login');
    } else {
      navigateTo('report-emergency');
    }
  };

  const handleAuthButtonClick = () => {
    if (!currentUser) {
      navigateTo('login');
    } else {
      const destination =
        currentUser.role === 'admin'
          ? 'admin-dashboard'
          : currentUser.role === 'rescue'
          ? 'rescue-dashboard'
          : 'citizen-dashboard';
      navigateTo(destination);
    }
  };

  return (
    <section
      id="top"
      className="resq-hero-container"
      aria-roledescription="carousel"
      aria-label="Pune Emergency Highlights"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* Background Slides */}
      <div className="resq-hero-carousel">
        {heroSlides.map((slide, idx) => {
          const isActive = idx === currentSlide;
          return (
            <div
              key={slide.id}
              className={`resq-hero-slide ${isActive ? 'active' : ''}`}
              role="group"
              aria-roledescription="slide"
              aria-label={`Slide ${idx + 1} of ${totalSlides}: ${slide.headline}`}
              aria-hidden={!isActive}
            >
              <picture>
                <source srcSet={slide.imageWebp} type="image/webp" />
                <img
                  src={slide.imageJpg}
                  alt={slide.alt}
                  className="resq-hero-bg"
                  width="1600"
                  height="900"
                  loading={idx === 0 ? 'eager' : 'lazy'}
                  decoding={idx === 0 ? 'sync' : 'async'}
                />
              </picture>
              {/* 45%+ Dark Overlay for text contrast */}
              <div className="resq-hero-overlay" aria-hidden="true" />
            </div>
          );
        })}

        {/* Foreground Content */}
        <div className="container-xl resq-hero-content">
          <div className="row align-items-center g-4 g-lg-5">
            {/* Left Headline & Actions */}
            <div className="col-12 col-lg-7">
              <div className="resq-hero-badge">
                <span className="pulse-dot" style={{ width: '8px', height: '8px', background: '#ef4444' }}></span>
                <span>{heroSlides[currentSlide].tag}</span>
              </div>

              <h1 className="resq-hero-title">Fast emergency reporting for Pune</h1>

              <p className="resq-hero-subtitle">
                Connecting Pune citizens directly with municipal control authorities and specialized field squads for rapid dispatch and coordinated response.
              </p>

              <div className="d-flex flex-wrap gap-3">
                <button
                  type="button"
                  className="btn btn-resq-primary btn-lg shadow-sm"
                  onClick={handleReportEmergencyClick}
                  aria-label="Report an Emergency (Login required)"
                >
                  <Siren size={20} />
                  <span>Report an Emergency</span>
                </button>

                <button
                  type="button"
                  className="btn btn-resq-secondary btn-lg"
                  onClick={handleAuthButtonClick}
                >
                  {!currentUser ? (
                    <span>Sign In</span>
                  ) : (
                    <>
                      <span>My Dashboard</span>
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </div>

              {/* Citizen trust indicators */}
              <div className="d-flex flex-wrap align-items-center gap-3 mt-4 pt-2 text-white-50 small">
                <span className="d-inline-flex align-items-center gap-1">
                  <ShieldCheck size={16} className="text-danger" /> Verified Municipal Response
                </span>
                <span className="d-inline-flex align-items-center gap-1">
                  <Radio size={16} className="text-danger" /> GPS Field Squad Coordination
                </span>
              </div>
            </div>

            {/* Right Hotline Card */}
            <div className="col-12 col-lg-5">
              <HotlineCard />
            </div>
          </div>
        </div>

        {/* Previous / Next Navigation Arrows */}
        <button
          type="button"
          className="resq-slider-arrow prev d-none d-md-flex"
          onClick={prevSlide}
          aria-label="Previous slide"
        >
          <ChevronLeft size={24} />
        </button>

        <button
          type="button"
          className="resq-slider-arrow next d-none d-md-flex"
          onClick={nextSlide}
          aria-label="Next slide"
        >
          <ChevronRight size={24} />
        </button>

        {/* Dots Indicators */}
        <div className="resq-slider-dots" role="tablist" aria-label="Slide indicators">
          {heroSlides.map((_, idx) => (
            <button
              key={idx}
              type="button"
              role="tab"
              aria-selected={idx === currentSlide}
              aria-label={`Go to slide ${idx + 1}`}
              className={`resq-slider-dot ${idx === currentSlide ? 'active' : ''}`}
              onClick={() => setCurrentSlide(idx)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSlider;

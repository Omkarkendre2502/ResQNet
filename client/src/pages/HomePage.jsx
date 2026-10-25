import React, { useEffect } from 'react';
import './home.css';

// Home Page Modular Section Components
import { HomeNavbar } from '../components/home/HomeNavbar';
import { HeroSlider } from '../components/home/HeroSlider';
import { StatsStrip } from '../components/home/StatsStrip';
import { ServiceCards } from '../components/home/ServiceCards';
import { HowItWorks } from '../components/home/HowItWorks';
import { SafetyTabs } from '../components/home/SafetyTabs';
import { MapPreview } from '../components/home/MapPreview';
import { AboutSection } from '../components/home/AboutSection';
import { FaqAccordion } from '../components/home/FaqAccordion';
import { CtaBand } from '../components/home/CtaBand';
import { HomeFooter } from '../components/home/HomeFooter';
import { HomeFloatingControls } from '../components/home/HomeFloatingControls';

/**
 * HomePage - Official Public Portal Composer
 * 1. Top bar and navbar
 * 2. Hero with image slider
 * 3. Live status strip
 * 4. What we handle (Services)
 * 5. How it works
 * 6. Safety tips
 * 7. Pune map preview
 * 8. About / Why ResQNet
 * 9. FAQ
 * 10. Call to action band
 * 11. Footer
 */
export const HomePage = () => {
  // Intersection Observer for subtle scroll-reveal animations
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const revealElements = document.querySelectorAll('.resq-reveal');
    if (!revealElements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.15,
        rootMargin: '0px 0px -40px 0px'
      }
    );

    revealElements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="resq-home-root">
      {/* 1. Top Bar & Navigation */}
      <HomeNavbar />

      <main id="main-content">
        {/* 2. Hero Slider with Real Emergency Photos & Hotlines */}
        <HeroSlider />

        {/* 3. Live Status Strip (Aggregate counts from GET /api/public/stats) */}
        <StatsStrip />

        {/* 4. What We Handle (Services) */}
        <div className="resq-reveal">
          <ServiceCards />
        </div>

        {/* 5. How It Works (4-Step Lifecycle) */}
        <div className="resq-reveal">
          <HowItWorks />
        </div>

        {/* 6. Safety Tips (Interactive Accessible Tabs) */}
        <div className="resq-reveal">
          <SafetyTabs />
        </div>

        {/* 7. Pune Map Preview (Spatial Coverage Zone) */}
        <div className="resq-reveal">
          <MapPreview />
        </div>

        {/* 8. About / Why ResQNet (Control Center Team & Benefits) */}
        <div className="resq-reveal">
          <AboutSection />
        </div>

        {/* 9. FAQ Accordion & Important Hotline Disclaimer */}
        <div className="resq-reveal">
          <FaqAccordion />
        </div>

        {/* 10. Call to Action Band */}
        <CtaBand />
      </main>

      {/* 11. Official Footer & Image Credits */}
      <HomeFooter />

      {/* Floating Controls: Sticky Mobile Call 112 & Back to Top */}
      <HomeFloatingControls />
    </div>
  );
};

export default HomePage;

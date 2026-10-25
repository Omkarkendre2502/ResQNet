import React, { useState, useEffect, useRef } from 'react';
import { Activity, Ambulance, Clock, Users } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const StatsStrip = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [animatedValues, setAnimatedValues] = useState({
    totalIncidents: 0,
    availableTeams: 0,
    registeredCitizens: 0,
    averageResponseMinutes: 0
  });

  const sectionRef = useRef(null);
  const animationStarted = useRef(false);

  // Fetch real public stats
  useEffect(() => {
    let isMounted = true;

    async function fetchPublicStats() {
      try {
        setLoading(true);
        const endpoint = `${API_BASE_URL.replace(/\/+$/, '')}/public/stats`;
        const res = await fetch(endpoint);
        if (!res.ok) {
          throw new Error(`HTTP error ${res.status}`);
        }
        const data = await res.json();
        if (isMounted) {
          setStats(data);
          setHasError(false);
        }
      } catch (err) {
        if (isMounted) {
          console.warn('[StatsStrip] Failed to load public stats; hiding strip:', err.message);
          setHasError(true);
          setStats(null);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchPublicStats();

    return () => {
      isMounted = false;
    };
  }, []);

  // IntersectionObserver to animate counters once
  useEffect(() => {
    if (!stats || animationStarted.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !animationStarted.current) {
          animationStarted.current = true;

          const duration = 1200; // ms
          const startTime = performance.now();

          const targetIncidents = stats.totalIncidents ?? 0;
          const targetTeams = stats.availableTeams ?? 0;
          const targetCitizens = stats.registeredCitizens ?? 0;
          const targetResponse = stats.averageResponseMinutes ?? 0;

          const step = (now) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Ease-out cubic
            const easeProgress = 1 - Math.pow(1 - progress, 3);

            setAnimatedValues({
              totalIncidents: Math.round(targetIncidents * easeProgress),
              availableTeams: Math.round(targetTeams * easeProgress),
              registeredCitizens: Math.round(targetCitizens * easeProgress),
              averageResponseMinutes: Number((targetResponse * easeProgress).toFixed(1))
            });

            if (progress < 1) {
              requestAnimationFrame(step);
            }
          };

          requestAnimationFrame(step);
        }
      },
      { threshold: 0.25 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, [stats]);

  // If request failed, hide strip completely to avoid displaying fabricated numbers
  if (hasError || (!loading && !stats)) {
    return null;
  }

  return (
    <section
      ref={sectionRef}
      className="resq-stats-strip"
      aria-label="Pune Emergency Readiness and Response Metrics"
    >
      <div className="container-xl">
        {loading ? (
          /* Loading Skeleton */
          <div className="row g-4 text-center">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="col-6 col-lg-3">
                <div className="p-3 d-flex align-items-center gap-3">
                  <div className="resq-skeleton-box" style={{ width: '48px', height: '48px' }} />
                  <div className="w-100 text-start">
                    <div className="resq-skeleton-box mb-2" style={{ width: '60px', height: '24px' }} />
                    <div className="resq-skeleton-box" style={{ width: '100px', height: '14px' }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Real Data Counters */
          <div className="row g-4">
            {/* Total Incidents */}
            <div className="col-6 col-lg-3">
              <div className="resq-stat-item">
                <div className="resq-stat-icon bg-danger-subtle text-danger" aria-hidden="true">
                  <Activity size={24} />
                </div>
                <div>
                  <div className="resq-stat-val">
                    {animatedValues.totalIncidents}
                    <span className="text-danger small">+</span>
                  </div>
                  <div className="resq-stat-label">Incidents Handled</div>
                </div>
              </div>
            </div>

            {/* Rescue Units Available */}
            <div className="col-6 col-lg-3">
              <div className="resq-stat-item">
                <div className="resq-stat-icon bg-success-subtle text-success" aria-hidden="true">
                  <Ambulance size={24} />
                </div>
                <div>
                  <div className="resq-stat-val">
                    {animatedValues.availableTeams}
                  </div>
                  <div className="resq-stat-label">Rescue Teams Active</div>
                </div>
              </div>
            </div>

            {/* Average Response Time */}
            <div className="col-6 col-lg-3">
              <div className="resq-stat-item">
                <div className="resq-stat-icon bg-info-subtle text-info" aria-hidden="true">
                  <Clock size={24} />
                </div>
                <div>
                  <div className="resq-stat-val">
                    {stats?.averageResponseMinutes !== null ? (
                      `${animatedValues.averageResponseMinutes}m`
                    ) : (
                      '< 10m'
                    )}
                  </div>
                  <div className="resq-stat-label">Avg. Response Time</div>
                </div>
              </div>
            </div>

            {/* Citizens Registered */}
            <div className="col-6 col-lg-3">
              <div className="resq-stat-item">
                <div className="resq-stat-icon bg-primary-subtle text-primary" aria-hidden="true">
                  <Users size={24} />
                </div>
                <div>
                  <div className="resq-stat-val">
                    {animatedValues.registeredCitizens}
                  </div>
                  <div className="resq-stat-label">Citizens Registered</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default StatsStrip;

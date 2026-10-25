import React, { useEffect, useRef, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { MapPin, Lock, ShieldAlert, ArrowRight } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export const MapPreview = () => {
  const { currentUser, navigateTo, setRedirectAfterLogin } = useApp();
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const sectionRef = useRef(null);

  const handleViewLiveMap = () => {
    if (!currentUser) {
      setRedirectAfterLogin('map');
      navigateTo('login');
    } else {
      navigateTo('map');
    }
  };

  // Lazy initialize map preview only when near viewport to optimize initial page load
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !mapLoaded) {
          setMapLoaded(true);
        }
      },
      { rootMargin: '200px' }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, [mapLoaded]);

  // Initialize lightly interactive map preview without any real incident data
  useEffect(() => {
    if (!mapLoaded || !mapContainerRef.current || mapInstanceRef.current) return;

    // Center of Pune
    const puneCenter = [18.5204, 73.8567];

    const map = L.map(mapContainerRef.current, {
      center: puneCenter,
      zoom: 12,
      scrollWheelZoom: false,
      zoomControl: false,
      attributionControl: false
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18
    }).addTo(map);

    // Pune Municipal Zone Circle Indicator (Generic zone boundary, no incident data)
    L.circle(puneCenter, {
      color: '#dc2626',
      fillColor: '#dc2626',
      fillOpacity: 0.08,
      radius: 7500,
      weight: 2,
      dashArray: '6, 6'
    }).addTo(map);

    // Key Public Sector Markers
    const publicSectors = [
      { name: 'Shivajinagar Station', coords: [18.5314, 73.8446] },
      { name: 'Swargate Command Post', coords: [18.5018, 73.8586] },
      { name: 'Hinjawadi IT Corridor', coords: [18.5913, 73.7389] },
      { name: 'Hadapsar Sub-Station', coords: [18.5089, 73.9259] }
    ];

    publicSectors.forEach((sec) => {
      const zoneIcon = L.divIcon({
        className: 'resq-zone-marker',
        html: `
          <div style="
            background: #0f172a;
            color: #ffffff;
            border: 2px solid #dc2626;
            border-radius: 4px;
            padding: 3px 6px;
            font-size: 11px;
            font-weight: 600;
            white-space: nowrap;
            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
          ">
            ${sec.name}
          </div>
        `,
        iconSize: [120, 24],
        iconAnchor: [60, 12]
      });

      L.marker(sec.coords, { icon: zoneIcon }).addTo(map);
    });

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [mapLoaded]);

  return (
    <section
      ref={sectionRef}
      id="map-preview"
      className="resq-section resq-section-alt"
      aria-labelledby="map-heading"
    >
      <div className="container-xl">
        <div className="text-center mb-5">
          <div className="resq-section-eyebrow">Geospatial Operations</div>
          <h2 id="map-heading" className="resq-section-title">
            Pune Emergency Coverage Map
          </h2>
          <p className="resq-section-subtitle mx-auto">
            Command centers and field squads coordinate response across Pune Municipal Corporation zones, cantonments, and suburban corridors.
          </p>
        </div>

        <div className="resq-map-box position-relative" style={{ height: '400px' }}>
          {/* Map Container */}
          <div
            ref={mapContainerRef}
            style={{ width: '100%', height: '100%', background: '#e2e8f0' }}
          />

          {/* Secure Access Overlay Card */}
          <div className="resq-map-overlay-banner">
            <div className="d-flex align-items-center gap-2 mb-2">
              <Lock size={16} className="text-danger flex-shrink-0" />
              <strong className="text-white">Active Incident Coordinates</strong>
            </div>
            <p className="small text-white-50 mb-3" style={{ fontSize: '0.75rem', lineHeight: '1.4' }}>
              Real-time emergency pins and triage details are restricted to verified accounts to ensure public security.
            </p>
            <button
              type="button"
              className="btn btn-resq-primary btn-sm w-100 justify-content-center"
              onClick={handleViewLiveMap}
              aria-label="View live incident map (Login required)"
            >
              <span>{currentUser ? 'Open Full Incident Map' : 'Sign in to View Live Map'}</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MapPreview;

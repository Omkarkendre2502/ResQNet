import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useApp } from '../context/AppContext';

export const IncidentMap = ({ incidentsList, height = '450px' }) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);
  const { setSelectedIncident, incidents: contextIncidents } = useApp();

  const items = incidentsList || contextIncidents;

  // Severity color mapping
  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'critical':
        return '#dc2626'; // Emergency Red
      case 'high':
        return '#ea580c'; // Orange
      case 'medium':
        return '#d97706'; // Amber
      case 'low':
        return '#16a34a'; // Green
      default:
        return '#2563eb';
    }
  };

  // Custom marker pin
  const createCustomMarker = (severity) => {
    const color = getSeverityColor(severity);
    return L.divIcon({
      className: 'custom-leaflet-marker',
      html: `
        <div style="
          position: relative;
          width: 30px;
          height: 30px;
          border-radius: 50% 50% 50% 0;
          background: ${color};
          transform: rotate(-45deg);
          border: 2px solid #ffffff;
          box-shadow: 0 3px 8px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <div style="
            transform: rotate(45deg);
            color: #ffffff;
            font-size: 12px;
            font-weight: bold;
          ">
            !
          </div>
        </div>
      `,
      iconSize: [30, 30],
      iconAnchor: [15, 30],
      popupAnchor: [0, -28]
    });
  };

  // Initialize Map centered on Pune
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [18.5204, 73.8567], // Pune coordinates
        zoom: 12,
        scrollWheelZoom: false
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 18
      }).addTo(map);

      markersLayerRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Markers
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();

    const bounds = L.latLngBounds();
    let hasCoords = false;

    items.forEach((inc) => {
      if (inc.coordinates && inc.coordinates.length === 2) {
        const [lat, lng] = inc.coordinates;
        if (!isNaN(lat) && !isNaN(lng)) {
          hasCoords = true;
          bounds.extend([lat, lng]);

          const marker = L.marker([lat, lng], {
            icon: createCustomMarker(inc.severity)
          });

          // Popup HTML
          const popupContent = document.createElement('div');
          popupContent.style.minWidth = '220px';
          popupContent.innerHTML = `
            <div style="font-family: Inter, sans-serif; padding: 2px;">
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
                <strong style="color: #0a192f; font-size: 12px;">${inc.id}</strong>
                <span style="
                  background: ${getSeverityColor(inc.severity)};
                  color: #fff;
                  font-size: 10px;
                  font-weight: 600;
                  padding: 2px 6px;
                  border-radius: 4px;
                  text-transform: uppercase;
                ">${inc.severity}</span>
              </div>
              <div style="font-weight: 600; font-size: 13px; color: #0f172a; margin-bottom: 4px;">
                ${inc.title || inc.type}
              </div>
              <div style="font-size: 11px; color: #64748b; margin-bottom: 6px;">
                📍 ${inc.location}
              </div>
              <div style="font-size: 11px; color: #334155; margin-bottom: 8px;">
                Status: <strong>${inc.status}</strong> | Affected: <strong>${inc.peopleAffected}</strong>
              </div>
              <button id="btn-view-${inc.id}" style="
                width: 100%;
                background: #0a192f;
                color: #fff;
                border: none;
                border-radius: 4px;
                padding: 5px 8px;
                font-size: 11px;
                font-weight: 600;
                cursor: pointer;
              ">
                View Incident Details
              </button>
            </div>
          `;

          marker.bindPopup(popupContent);
          marker.on('popupopen', () => {
            const btn = document.getElementById(`btn-view-${inc.id}`);
            if (btn) {
              btn.onclick = () => setSelectedIncident(inc);
            }
          });

          markersLayerRef.current.addLayer(marker);
        }
      }
    });

    if (hasCoords && mapInstanceRef.current) {
      mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 13 });
    }
  }, [items, setSelectedIncident]);

  return (
    <div className="position-relative w-100" style={{ height }}>
      <div ref={mapContainerRef} className="w-100 h-100" />
      {/* Map Legend */}
      <div
        className="position-absolute bottom-0 start-0 m-3 p-2 bg-white rounded shadow-sm border small"
        style={{ zIndex: 1000 }}
      >
        <div className="fw-semibold mb-1 text-muted" style={{ fontSize: '0.7rem' }}>
          SEVERITY
        </div>
        <div className="d-flex align-items-center gap-3" style={{ fontSize: '0.72rem' }}>
          <span className="d-flex align-items-center gap-1">
            <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#dc2626', display: 'inline-block' }}></span>
            Critical
          </span>
          <span className="d-flex align-items-center gap-1">
            <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#ea580c', display: 'inline-block' }}></span>
            High
          </span>
          <span className="d-flex align-items-center gap-1">
            <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#d97706', display: 'inline-block' }}></span>
            Medium
          </span>
          <span className="d-flex align-items-center gap-1">
            <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#16a34a', display: 'inline-block' }}></span>
            Low
          </span>
        </div>
      </div>
    </div>
  );
};

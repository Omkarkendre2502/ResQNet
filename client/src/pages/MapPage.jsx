import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { IncidentMap } from '../components/IncidentMap';
import {
  MapPin,
  Eye,
  Crosshair,
  Maximize2,
  AlertTriangle,
  Flame,
  Waves,
  Car,
  Building2,
  Shield,
  Clock
} from 'lucide-react';
import PageHeader from '../components/dashboard/PageHeader';
import SeverityBadge from '../components/dashboard/SeverityBadge';
import StatusBadge from '../components/dashboard/StatusBadge';
import { formatRelativeTime } from '../hooks/useRelativeTime';

/**
 * Interactive GIS Incident Map for Pune Emergency Response.
 * Role-scoped automatically:
 * - Citizen sees only their own reported incidents
 * - Rescue squads see only their assigned missions
 * - Admins see all emergency pins across Pune municipal sectors
 */
export const MapPage = () => {
  const { incidents = [], setSelectedIncident, currentUser, showToast } = useApp();
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [userLocation, setUserLocation] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
  const [autoFitKey, setAutoFitKey] = useState(0);

  // Filter incidents by selected severity
  const filteredIncidents = incidents.filter((inc) => {
    if (filterSeverity === 'all') return true;
    return inc.severity?.toLowerCase() === filterSeverity.toLowerCase();
  });

  // Type icon helper
  const getTypeIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'fire':
        return <Flame size={14} className="text-danger flex-shrink-0" />;
      case 'flood':
        return <Waves size={14} className="text-primary flex-shrink-0" />;
      case 'accident':
        return <Car size={14} className="text-warning flex-shrink-0" />;
      case 'building collapse':
        return <Building2 size={14} className="text-danger flex-shrink-0" />;
      default:
        return <AlertTriangle size={14} className="text-secondary flex-shrink-0" />;
    }
  };

  // Locate Me handler
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      showToast('Geolocation is not supported by your browser.', 'warning');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = [position.coords.latitude, position.coords.longitude];
        setUserLocation(coords);
        setIsLocating(false);
        showToast('Your GPS location has been pinpointed on the map.', 'success');
      },
      (error) => {
        setIsLocating(false);
        let msg = 'Unable to acquire your current location.';
        if (error.code === error.PERMISSION_DENIED) {
          msg = 'Location access permission was denied by your browser.';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          msg = 'Location information is currently unavailable.';
        } else if (error.code === error.TIMEOUT) {
          msg = 'Location request timed out. Please retry.';
        }
        showToast(msg, 'warning');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleAutoFit = () => {
    setAutoFitKey((prev) => prev + 1);
  };

  return (
    <div className="map-page container-fluid p-3 p-lg-4">
      {/* 1. Page Header */}
      <PageHeader
        title="Pune Emergency Situation Map"
        subtitle={`GIS Command View • Authorized records for ${currentUser?.role?.toUpperCase() || 'USER'} (${filteredIncidents.length} pins active).`}
        roleBadge="GIS DISPATCH"
        extraActions={
          <div className="d-flex align-items-center gap-2">
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1.5"
              onClick={handleLocateMe}
              disabled={isLocating}
              title="Pinpoint your current GPS location on the map"
            >
              <Crosshair size={14} className={isLocating ? 'spin-anim text-primary' : 'text-danger'} />
              <span>{isLocating ? 'Locating...' : 'Locate Me'}</span>
            </button>

            <button
              type="button"
              className="btn btn-sm btn-outline-dark d-inline-flex align-items-center gap-1.5"
              onClick={handleAutoFit}
              title="Zoom to fit all visible markers"
            >
              <Maximize2 size={14} />
              <span>Auto-Fit Bounds</span>
            </button>
          </div>
        }
      />

      {/* 2. Severity Filter Strip */}
      <div className="resq-card p-3 mb-3 bg-white border shadow-sm d-flex flex-wrap align-items-center justify-content-between gap-3">
        <div className="d-flex align-items-center gap-2 flex-wrap">
          <span className="text-secondary small fw-bold text-uppercase">Filter Severity:</span>
          <div className="btn-group btn-group-sm" role="group" aria-label="Filter map pins by severity">
            <button
              type="button"
              className={`btn ${filterSeverity === 'all' ? 'btn-dark' : 'btn-outline-secondary'}`}
              onClick={() => setFilterSeverity('all')}
            >
              All ({incidents.length})
            </button>
            <button
              type="button"
              className={`btn ${filterSeverity === 'critical' ? 'btn-danger' : 'btn-outline-secondary'}`}
              onClick={() => setFilterSeverity('critical')}
            >
              Critical ({incidents.filter((i) => i.severity === 'Critical').length})
            </button>
            <button
              type="button"
              className={`btn ${filterSeverity === 'high' ? 'btn-warning text-dark' : 'btn-outline-secondary'}`}
              onClick={() => setFilterSeverity('high')}
            >
              High ({incidents.filter((i) => i.severity === 'High').length})
            </button>
            <button
              type="button"
              className={`btn ${filterSeverity === 'medium' ? 'btn-info text-white' : 'btn-outline-secondary'}`}
              onClick={() => setFilterSeverity('medium')}
            >
              Medium ({incidents.filter((i) => i.severity === 'Medium').length})
            </button>
            <button
              type="button"
              className={`btn ${filterSeverity === 'low' ? 'btn-success' : 'btn-outline-secondary'}`}
              onClick={() => setFilterSeverity('low')}
            >
              Low ({incidents.filter((i) => i.severity === 'Low').length})
            </button>
          </div>
        </div>

        <div className="text-muted small">
          Role-Scoping: <strong className="text-dark">{currentUser?.role?.toUpperCase()}</strong> access applied
        </div>
      </div>

      {/* 3. Main Map & Incidents List */}
      <div className="row g-3">
        {/* Leaflet Map Card */}
        <div className="col-lg-8">
          <div className="resq-card overflow-hidden shadow-sm border bg-white">
            <IncidentMap
              incidentsList={filteredIncidents}
              height="620px"
              userLocation={userLocation}
              autoFitKey={autoFitKey}
            />
          </div>
        </div>

        {/* Side Panel: Active Sector Incidents List */}
        <div className="col-lg-4">
          <div className="resq-card h-100 shadow-sm border bg-white d-flex flex-column">
            <div className="p-3 border-bottom d-flex align-items-center justify-content-between bg-light-subtle">
              <h6 className="fw-bold text-dark mb-0 small text-uppercase tracking-wider">
                Visible Incidents ({filteredIncidents.length})
              </h6>
              <span className="badge bg-navy text-white rounded-pill px-2.5">
                Pune Zone
              </span>
            </div>

            <div
              className="p-3 flex-grow-1 overflow-auto d-flex flex-column gap-2.5"
              style={{ maxHeight: '560px' }}
            >
              {filteredIncidents.length === 0 ? (
                <div className="text-center p-5 text-muted small">
                  <AlertTriangle size={24} className="text-secondary opacity-50 mb-2 mx-auto d-block" />
                  <div>No incidents matching the active severity filter.</div>
                </div>
              ) : (
                filteredIncidents.map((inc) => {
                  const { relativeTime } = formatRelativeTime(inc.reportedAt);
                  return (
                    <div
                      key={inc.id}
                      role="button"
                      tabIndex={0}
                      className="p-3 rounded border bg-light hover-shadow cursor-pointer transition"
                      onClick={() => setSelectedIncident(inc)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setSelectedIncident(inc);
                        }
                      }}
                    >
                      <div className="d-flex align-items-center justify-content-between mb-1.5">
                        <span className="badge bg-dark font-monospace" style={{ fontSize: '0.72rem' }}>
                          {inc.id}
                        </span>
                        <SeverityBadge severity={inc.severity} size="sm" />
                      </div>

                      <div className="d-flex align-items-center gap-1.5 mb-1">
                        {getTypeIcon(inc.type)}
                        <strong className="text-dark small text-truncate">
                          {inc.title || `${inc.type} Incident`}
                        </strong>
                      </div>

                      <div className="text-secondary small d-flex align-items-center gap-1 mb-2">
                        <MapPin size={11} className="text-danger flex-shrink-0" />
                        <span className="text-truncate">{inc.location}</span>
                      </div>

                      <div className="d-flex align-items-center justify-content-between pt-2 border-top border-light-subtle">
                        <StatusBadge status={inc.status} size="sm" />
                        <span className="text-muted font-monospace" style={{ fontSize: '0.7rem' }}>
                          {relativeTime}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapPage;

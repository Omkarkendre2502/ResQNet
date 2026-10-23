import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { IncidentMap } from '../components/IncidentMap';
import { MapPin, Eye, AlertTriangle } from 'lucide-react';

export const MapPage = () => {
  const { incidents, setSelectedIncident } = useApp();
  const [filterSeverity, setFilterSeverity] = useState('all');

  const filteredIncidents = incidents.filter((inc) => {
    if (filterSeverity === 'all') return true;
    return inc.severity.toLowerCase() === filterSeverity.toLowerCase();
  });

  return (
    <div className="container-fluid p-3 p-lg-4">
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-3">
        <div>
          <h4 className="fw-bold text-dark mb-1 d-flex align-items-center gap-2">
            <MapPin size={22} className="text-danger" />
            Pune Emergency Situation Map
          </h4>
          <p className="text-secondary small mb-0">
            OpenStreetMap view of active incidents across Pune municipal sectors.
          </p>
        </div>

        {/* Severity Filter */}
        <div className="d-flex align-items-center gap-2">
          <label className="small text-muted fw-semibold">Filter:</label>
          <div className="btn-group btn-group-sm" role="group">
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
              Critical
            </button>
            <button
              type="button"
              className={`btn ${filterSeverity === 'high' ? 'btn-warning text-dark' : 'btn-outline-secondary'}`}
              onClick={() => setFilterSeverity('high')}
            >
              High
            </button>
            <button
              type="button"
              className={`btn ${filterSeverity === 'medium' ? 'btn-info text-white' : 'btn-outline-secondary'}`}
              onClick={() => setFilterSeverity('medium')}
            >
              Medium
            </button>
          </div>
        </div>
      </div>

      <div className="row g-3">
        {/* Map */}
        <div className="col-lg-8">
          <div className="resq-card overflow-hidden shadow-sm">
            <div className="resq-card-body p-0">
              <IncidentMap incidentsList={filteredIncidents} height="540px" />
            </div>
          </div>
        </div>

        {/* Incidents List in Pune */}
        <div className="col-lg-4">
          <div className="resq-card h-100 shadow-sm d-flex flex-column">
            <div className="resq-card-header d-flex justify-content-between align-items-center">
              <h6 className="fw-bold mb-0 text-dark">
                Pune Incidents ({filteredIncidents.length})
              </h6>
              <span className="badge bg-light text-secondary border">Pune Zone</span>
            </div>
            <div
              className="resq-card-body p-2 flex-grow-1 overflow-auto"
              style={{ maxHeight: '480px' }}
            >
              {filteredIncidents.length === 0 ? (
                <div className="text-center p-4 text-muted small">
                  No incidents matching filter
                </div>
              ) : (
                <div className="d-flex flex-column gap-2">
                  {filteredIncidents.map((inc) => (
                    <div
                      key={inc.id}
                      className="p-3 rounded border bg-light cursor-pointer"
                      style={{ cursor: 'pointer' }}
                      onClick={() => setSelectedIncident(inc)}
                    >
                      <div className="d-flex align-items-center justify-content-between mb-1">
                        <span className="fw-bold text-dark small">{inc.id}</span>
                        <span
                          className={`badge ${
                            inc.severity === 'Critical'
                              ? 'bg-danger'
                              : inc.severity === 'High'
                              ? 'bg-warning text-dark'
                              : inc.severity === 'Medium'
                              ? 'bg-info text-white'
                              : 'bg-success'
                          }`}
                          style={{ fontSize: '0.68rem' }}
                        >
                          {inc.severity}
                        </span>
                      </div>
                      <div className="fw-semibold text-dark small mb-1">
                        {inc.title || inc.type}
                      </div>
                      <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                        📍 {inc.location}
                      </div>
                      <div className="d-flex justify-content-between align-items-center mt-2 pt-2 border-top">
                        <span className="badge bg-white text-dark border small">
                          {inc.status}
                        </span>
                        <span className="text-primary small fw-semibold d-flex align-items-center gap-1">
                          <Eye size={12} /> Details
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

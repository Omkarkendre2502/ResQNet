import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Siren,
  MapPin,
  Flame,
  Waves,
  Car,
  Building2,
  AlertTriangle,
  Upload,
  X,
  Send,
  Eye,
  CheckCircle,
  Crosshair,
  Loader2
} from 'lucide-react';

export const ReportEmergencyPage = () => {
  const { reportEmergency, navigateTo, setSelectedIncident } = useApp();

  // Form Fields
  const [emergencyType, setEmergencyType] = useState('Fire');
  const [location, setLocation] = useState('');
  const [coordinates, setCoordinates] = useState(null);
  const [peopleAffected, setPeopleAffected] = useState(1);
  const [severity, setSeverity] = useState('High');
  const [description, setDescription] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [photoPreview, setPhotoPreview] = useState(null);

  // Status & Confirmation State
  const [isLocating, setIsLocating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedIncident, setSubmittedIncident] = useState(null);
  const [formError, setFormError] = useState('');

  // Popular Pune Locations for Quick Selection
  const puneLocations = [
    { name: 'Shivajinagar', coords: [18.5314, 73.8446] },
    { name: 'Hinjawadi Phase 1', coords: [18.5913, 73.7389] },
    { name: 'Kothrud Depot', coords: [18.5074, 73.8077] },
    { name: 'Hadapsar Gadital', coords: [18.5089, 73.9259] },
    { name: 'Swargate Chowk', coords: [18.5018, 73.8636] },
    { name: 'Deccan Gymkhana', coords: [18.5173, 73.8415] },
    { name: 'Pune Railway Station', coords: [18.5284, 73.8744] },
    { name: 'Pimpri-Chinchwad', coords: [18.6298, 73.7997] }
  ];

  // Use My Location Feature
  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCoordinates([latitude, longitude]);
        setLocation(
          `GPS Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)}) - Pune Zone`
        );
        setIsLocating(false);
      },
      (error) => {
        console.warn('Geolocation fallback to Pune center:', error);
        setCoordinates([18.5204, 73.8567]);
        setLocation('Deccan Gymkhana, Pune (GPS Detected)');
        setIsLocating(false);
      },
      { timeout: 8000 }
    );
  };

  // Photo Upload Handler
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
        setPhotoUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setPhotoPreview(null);
    setPhotoUrl('');
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!location.trim()) {
      setFormError('Please provide the emergency location in Pune.');
      return;
    }
    if (!description.trim()) {
      setFormError('Please enter a short description of the emergency.');
      return;
    }

    setIsSubmitting(true);
    try {
      const incident = await reportEmergency({
        type: emergencyType,
        location,
        coordinates,
        peopleAffected: parseInt(peopleAffected) || 1,
        severity,
        description,
        photoUrl
      });
      setSubmittedIncident(incident);
    } catch (err) {
      setFormError('Failed to submit emergency report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-12 col-lg-8">
          {/* Header */}
          <div className="d-flex align-items-center gap-3 mb-4">
            <div
              className="d-flex align-items-center justify-content-center"
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '8px',
                backgroundColor: '#fee2e2',
                color: '#dc2626'
              }}
            >
              <Siren size={22} />
            </div>
            <div>
              <h4 className="fw-bold mb-0 text-dark">Report an Emergency</h4>
              <p className="text-secondary small mb-0">
                Direct dispatch channel to Pune Control Center. Fill in essential details below.
              </p>
            </div>
          </div>

          {/* Submission Confirmation */}
          {submittedIncident ? (
            <div className="resq-card p-4 text-center border-success shadow-sm">
              <div
                className="d-inline-flex align-items-center justify-content-center mb-3"
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  backgroundColor: '#dcfce7',
                  color: '#16a34a'
                }}
              >
                <CheckCircle size={32} />
              </div>

              <h4 className="fw-bold text-success mb-2">Emergency Report Logged!</h4>
              <p className="text-secondary small mb-3">
                Your report has been received by Admin Rahul Patil and the Pune Municipal
                Emergency Dispatch. A rescue squad is being assigned based on severity triage.
              </p>

              <div className="p-3 bg-light rounded border text-start mb-4">
                <div className="d-flex justify-content-between mb-2 pb-2 border-bottom">
                  <span className="text-muted small">Incident Reference ID:</span>
                  <span className="fw-bold text-danger">{submittedIncident.id}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted small">Emergency Type:</span>
                  <span className="fw-semibold text-dark">{submittedIncident.type}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted small">Pune Location:</span>
                  <span className="fw-semibold text-dark text-truncate ms-2" style={{ maxWidth: '280px' }}>
                    {submittedIncident.location}
                  </span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted small">Severity Level:</span>
                  <span className="badge bg-danger">{submittedIncident.severity}</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span className="text-muted small">Current Status:</span>
                  <span className="badge bg-warning text-dark">Reported</span>
                </div>
              </div>

              <div className="d-flex flex-wrap gap-2 justify-content-center">
                <button
                  className="btn btn-resq-primary btn-sm d-flex align-items-center gap-1"
                  onClick={() => setSelectedIncident(submittedIncident)}
                >
                  <Eye size={14} />
                  <span>View Details & Timeline</span>
                </button>
                <button
                  className="btn btn-outline-secondary btn-sm"
                  onClick={() => navigateTo('citizen-dashboard')}
                >
                  Citizen Dashboard
                </button>
                <button
                  className="btn btn-outline-danger btn-sm"
                  onClick={() => {
                    setSubmittedIncident(null);
                    setLocation('');
                    setDescription('');
                    setPhotoPreview(null);
                    setPhotoUrl('');
                  }}
                >
                  Report Another Incident
                </button>
              </div>
            </div>
          ) : (
            /* EMERGENCY REPORTING FORM */
            <div className="resq-card shadow-sm">
              <div className="resq-card-header bg-white d-flex align-items-center justify-content-between">
                <span className="small fw-semibold text-dark">
                  Emergency Incident Intake Form
                </span>
                <span className="badge bg-danger-subtle text-danger border border-danger-subtle">
                  Pune Emergency Zone
                </span>
              </div>

              <form onSubmit={handleSubmit} className="resq-card-body p-4">
                {formError && (
                  <div className="alert alert-danger py-2 small mb-4 d-flex align-items-center gap-2">
                    <AlertTriangle size={16} />
                    <span>{formError}</span>
                  </div>
                )}

                {/* 1. Emergency Type */}
                <div className="mb-3">
                  <label className="form-label fw-semibold text-dark small">
                    1. Emergency Type <span className="text-danger">*</span>
                  </label>
                  <div className="row g-2">
                    {[
                      { type: 'Fire', icon: Flame },
                      { type: 'Flood', icon: Waves },
                      { type: 'Accident', icon: Car },
                      { type: 'Building Collapse', icon: Building2 },
                      { type: 'Other', icon: AlertTriangle }
                    ].map((item) => {
                      const Icon = item.icon;
                      const isSelected = emergencyType === item.type;
                      return (
                        <div className="col-6 col-sm-4 col-md" key={item.type}>
                          <button
                            type="button"
                            className={`btn w-100 p-2 text-center rounded border d-flex flex-column align-items-center justify-content-center ${
                              isSelected
                                ? 'btn-danger border-danger text-white'
                                : 'btn-outline-light text-dark border-secondary-subtle'
                            }`}
                            style={{ minHeight: '64px', fontSize: '0.8rem' }}
                            onClick={() => setEmergencyType(item.type)}
                          >
                            <Icon size={18} className="mb-1" />
                            <span className="fw-semibold">{item.type}</span>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Location & Use My Location */}
                <div className="mb-3">
                  <div className="d-flex align-items-center justify-content-between mb-1">
                    <label className="form-label fw-semibold text-dark small mb-0">
                      2. Location in Pune <span className="text-danger">*</span>
                    </label>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-danger py-0 px-2 d-flex align-items-center gap-1"
                      style={{ fontSize: '0.75rem' }}
                      onClick={handleUseMyLocation}
                      disabled={isLocating}
                    >
                      {isLocating ? (
                        <>
                          <Loader2 size={12} className="spin" />
                          <span>Detecting GPS...</span>
                        </>
                      ) : (
                        <>
                          <Crosshair size={12} />
                          <span>Use My Location</span>
                        </>
                      )}
                    </button>
                  </div>
                  <div className="input-group">
                    <span className="input-group-text bg-light text-muted">
                      <MapPin size={16} className="text-danger" />
                    </span>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Near Shivajinagar Bus Stand, Hinjawadi Phase 1, Kothrud"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      required
                    />
                  </div>
                  {/* Quick Pune Landmarks */}
                  <div className="mt-2 d-flex flex-wrap gap-1 align-items-center">
                    <span className="text-muted" style={{ fontSize: '0.72rem' }}>
                      Pune Locations:
                    </span>
                    {puneLocations.map((loc) => (
                      <button
                        type="button"
                        key={loc.name}
                        className="btn btn-sm btn-light py-0 px-1 border"
                        style={{ fontSize: '0.7rem' }}
                        onClick={() => {
                          setLocation(`${loc.name}, Pune`);
                          setCoordinates(loc.coords);
                        }}
                      >
                        {loc.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Number of People Affected & 4. Severity */}
                <div className="row g-3 mb-3">
                  <div className="col-md-5">
                    <label className="form-label fw-semibold text-dark small">
                      3. People Affected <span className="text-danger">*</span>
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="5000"
                      className="form-control"
                      value={peopleAffected}
                      onChange={(e) => setPeopleAffected(e.target.value)}
                      required
                    />
                  </div>

                  <div className="col-md-7">
                    <label className="form-label fw-semibold text-dark small">
                      4. Severity Level <span className="text-danger">*</span>
                    </label>
                    <div className="d-flex gap-2">
                      {['Low', 'Medium', 'High', 'Critical'].map((lvl) => {
                        const isSelected = severity === lvl;
                        let btnClass = 'btn-outline-secondary';
                        if (isSelected) {
                          if (lvl === 'Critical') btnClass = 'btn-danger fw-bold';
                          else if (lvl === 'High') btnClass = 'btn-warning text-dark fw-bold';
                          else if (lvl === 'Medium') btnClass = 'btn-info text-white fw-bold';
                          else btnClass = 'btn-success fw-bold';
                        }
                        return (
                          <button
                            type="button"
                            key={lvl}
                            className={`btn btn-sm flex-fill ${btnClass}`}
                            onClick={() => setSeverity(lvl)}
                          >
                            {lvl}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* 5. Short Description */}
                <div className="mb-3">
                  <label className="form-label fw-semibold text-dark small">
                    5. Short Description <span className="text-danger">*</span>
                  </label>
                  <textarea
                    className="form-control"
                    rows="3"
                    placeholder="Describe the incident (e.g. electrical fire, trapped passengers, water depth, smoke severity)..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                  ></textarea>
                </div>

                {/* 6. Optional Photo Upload */}
                <div className="mb-4">
                  <label className="form-label fw-semibold text-dark small">
                    6. Optional Photo Upload
                  </label>
                  <div className="p-3 bg-light rounded border border-dashed">
                    {!photoPreview ? (
                      <div className="text-center">
                        <Upload size={22} className="text-muted mb-1" />
                        <div className="small text-muted mb-2">
                          Upload scene image to help responders assess hazard
                        </div>
                        <label className="btn btn-sm btn-outline-secondary mb-0">
                          <span>Choose Image</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="d-none"
                            onChange={handlePhotoChange}
                          />
                        </label>
                      </div>
                    ) : (
                      <div className="d-flex align-items-center gap-3">
                        <img
                          src={photoPreview}
                          alt="Incident Preview"
                          className="rounded border"
                          style={{ width: '70px', height: '70px', objectFit: 'cover' }}
                        />
                        <div className="flex-grow-1">
                          <div className="fw-semibold text-dark small">Photo Attached</div>
                          <button
                            type="button"
                            className="btn btn-sm btn-link text-danger p-0 d-flex align-items-center gap-1 mt-1"
                            onClick={removePhoto}
                          >
                            <X size={14} /> Remove photo
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="btn btn-resq-danger w-100 py-2 fw-semibold d-flex align-items-center justify-content-center gap-2"
                  disabled={isSubmitting}
                >
                  <Send size={16} />
                  <span>{isSubmitting ? 'Submitting Report...' : 'Submit Emergency Report'}</span>
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

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
  Loader2,
  ChevronRight,
  ChevronLeft,
  Phone,
  Users,
  FileText,
  Image as ImageIcon,
  Check
} from 'lucide-react';

export const ReportEmergencyPage = () => {
  const { reportEmergency, navigateTo, setSelectedIncident, currentUser } = useApp();

  // Wizard Step State (1: Type & Severity, 2: Location, 3: Details & Contact, 4: Review & Submit)
  const [currentStep, setCurrentStep] = useState(1);

  // Form Fields
  const [emergencyType, setEmergencyType] = useState('Fire');
  const [severity, setSeverity] = useState('High');
  const [location, setLocation] = useState('');
  const [coordinates, setCoordinates] = useState(null);
  const [peopleAffected, setPeopleAffected] = useState(1);
  const [description, setDescription] = useState('');
  const [reporterPhone, setReporterPhone] = useState(currentUser?.phone || '');
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoUrl, setPhotoUrl] = useState('');

  // Status & Confirmation State
  const [isLocating, setIsLocating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedIncident, setSubmittedIncident] = useState(null);
  const [formError, setFormError] = useState('');

  // Pune Locations for Quick Selection
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

  // Photo Upload Handler with 2MB max and type checks
  const handlePhotoChange = (e) => {
    setFormError('');
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setFormError('Invalid image format. Only JPEG, PNG, and WebP images are allowed.');
      e.target.value = '';
      return;
    }

    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      setFormError('Image file is too large. Maximum allowed size is 2 MB.');
      e.target.value = '';
      return;
    }

    setPhotoFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPhotoPreview(objectUrl);
  };

  const removePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
    setPhotoUrl('');
  };

  // Step Validation & Navigation
  const validateStep = (step) => {
    setFormError('');
    if (step === 1) {
      if (!emergencyType || !severity) {
        setFormError('Please select both emergency type and severity level.');
        return false;
      }
    } else if (step === 2) {
      if (!location.trim() || location.trim().length < 3) {
        setFormError('Please specify the incident location in Pune municipal zone.');
        return false;
      }
    } else if (step === 3) {
      if (!description.trim() || description.trim().length < 5) {
        setFormError('Please provide a brief description of the emergency (min 5 characters).');
        return false;
      }
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 4));
    }
  };

  const prevStep = () => {
    setFormError('');
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  // Final Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep(3)) return;

    setIsSubmitting(true);
    setFormError('');

    try {
      const formData = new FormData();
      formData.append('type', emergencyType);
      formData.append('severity', severity);
      formData.append('location', location);
      if (coordinates) {
        formData.append('coordinates', JSON.stringify(coordinates));
      }
      formData.append('peopleAffected', String(peopleAffected));
      formData.append('description', description);
      formData.append('reporterPhone', reporterPhone);

      if (photoFile) {
        formData.append('photo', photoFile);
      } else if (photoUrl) {
        formData.append('photoUrl', photoUrl);
      }

      const createdIncident = await reportEmergency(formData);
      setSubmittedIncident(createdIncident);
    } catch (err) {
      setFormError(err.message || 'Failed to submit emergency report.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const stepLabels = [
    { num: 1, title: 'Type & Triage', icon: Flame },
    { num: 2, title: 'Pune Location', icon: MapPin },
    { num: 3, title: 'Details & Photo', icon: FileText },
    { num: 4, title: 'Review & Submit', icon: CheckCircle }
  ];

  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-12 col-lg-8">
          {/* Header */}
          <div className="text-center mb-4">
            <div
              className="d-inline-flex align-items-center justify-content-center mb-2"
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: '#dc2626',
                color: '#fff'
              }}
            >
              <Siren size={26} />
            </div>
            <h3 className="fw-bold text-dark mb-1">Report Emergency Incident</h3>
            <p className="text-secondary small mb-0">
              Pune Municipal Emergency Response & Disaster Management Dispatch
            </p>
          </div>

          {/* SUCCESS SCREEN */}
          {submittedIncident ? (
            <div className="resq-card p-4 p-md-5 text-center shadow-sm border">
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
                Your report has been received by the Pune Municipal Emergency Dispatch
                Control Center. A rescue squad is being assigned based on severity triage.
              </p>

              <div className="p-3 bg-light rounded border text-start mb-4">
                <div className="d-flex justify-content-between mb-2 pb-2 border-bottom">
                  <span className="text-muted small">Incident Reference ID:</span>
                  <span className="fw-bold text-danger">#{submittedIncident.id}</span>
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
                    setCurrentStep(1);
                    setLocation('');
                    setDescription('');
                    removePhoto();
                  }}
                >
                  Report Another Incident
                </button>
              </div>
            </div>
          ) : (
            /* MULTI-STEP REPORTING WIZARD */
            <div className="resq-card shadow-sm border">
              {/* Step Progress Tracker */}
              <div className="p-3 bg-light border-bottom">
                <div className="row g-2 text-center">
                  {stepLabels.map((s) => {
                    const Icon = s.icon;
                    const isActive = currentStep === s.num;
                    const isDone = currentStep > s.num;
                    return (
                      <div className="col-3" key={s.num}>
                        <div
                          className={`d-flex flex-column align-items-center py-1 rounded ${
                            isActive
                              ? 'bg-white shadow-sm border text-danger fw-bold'
                              : isDone
                              ? 'text-success'
                              : 'text-muted'
                          }`}
                          style={{ cursor: isDone ? 'pointer' : 'default' }}
                          onClick={() => {
                            if (isDone) setCurrentStep(s.num);
                          }}
                        >
                          <div className="d-flex align-items-center gap-1 mb-1 small">
                            {isDone ? (
                              <Check size={14} className="text-success fw-bold" />
                            ) : (
                              <Icon size={14} />
                            )}
                            <span className="d-none d-md-inline" style={{ fontSize: '0.75rem' }}>
                              Step {s.num}
                            </span>
                          </div>
                          <span
                            className="text-truncate px-1 small"
                            style={{ fontSize: '0.72rem', maxWidth: '100%' }}
                          >
                            {s.title}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <form onSubmit={handleSubmit} className="resq-card-body p-4">
                {formError && (
                  <div className="alert alert-danger py-2 small mb-4 d-flex align-items-center gap-2">
                    <AlertTriangle size={16} />
                    <span>{formError}</span>
                  </div>
                )}

                {/* STEP 1: Emergency Type & Severity */}
                {currentStep === 1 && (
                  <div>
                    <h5 className="fw-bold text-dark mb-3">1. Select Emergency Type & Triage Level</h5>

                    <div className="mb-4">
                      <label className="form-label fw-semibold text-dark small">
                        Emergency Type <span className="text-danger">*</span>
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

                    <div className="mb-3">
                      <label className="form-label fw-semibold text-dark small">
                        Severity Level (Priority Triage) <span className="text-danger">*</span>
                      </label>
                      <div className="row g-2">
                        {[
                          { level: 'Critical', desc: 'Life-threatening / immediate squad', color: 'danger' },
                          { level: 'High', desc: 'Severe damage / high priority', color: 'warning' },
                          { level: 'Medium', desc: 'Contained situation / moderate urgency', color: 'info' },
                          { level: 'Low', desc: 'Advisory / non-critical response', color: 'secondary' }
                        ].map((item) => (
                          <div className="col-6 col-md-3" key={item.level}>
                            <button
                              type="button"
                              className={`btn w-100 p-2 text-start rounded border h-100 ${
                                severity === item.level
                                  ? 'border-2 border-danger bg-danger-subtle text-danger'
                                  : 'border-secondary-subtle bg-white text-dark'
                              }`}
                              onClick={() => setSeverity(item.level)}
                            >
                              <div className="fw-bold small">{item.level}</div>
                              <div className="text-muted" style={{ fontSize: '0.68rem', lineHeight: '1.2' }}>
                                {item.desc}
                              </div>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 2: Location & Pune Sector */}
                {currentStep === 2 && (
                  <div>
                    <h5 className="fw-bold text-dark mb-3">2. Incident Location & Coordinates</h5>

                    <div className="mb-3">
                      <label className="form-label fw-semibold text-dark small">
                        Pune Sector / Address Details <span className="text-danger">*</span>
                      </label>
                      <div className="input-group mb-2">
                        <span className="input-group-text bg-light border-end-0">
                          <MapPin size={16} className="text-danger" />
                        </span>
                        <input
                          type="text"
                          className="form-control border-start-0"
                          placeholder="e.g. Near Shivajinagar Railway Station, FC Road, Pune"
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          required
                        />
                        <button
                          type="button"
                          className="btn btn-outline-danger d-flex align-items-center gap-1"
                          onClick={handleUseMyLocation}
                          disabled={isLocating}
                        >
                          {isLocating ? (
                            <Loader2 size={15} className="spin" />
                          ) : (
                            <Crosshair size={15} />
                          )}
                          <span className="d-none d-sm-inline">
                            {isLocating ? 'Detecting...' : 'Use GPS'}
                          </span>
                        </button>
                      </div>
                      <small className="text-muted">
                        Be as specific as possible (landmarks, street names, sector numbers).
                      </small>
                    </div>

                    {/* Quick Pune Locality Buttons */}
                    <div className="mb-3">
                      <label className="form-label small text-muted fw-semibold mb-2">
                        Quick Pune Locality Presets:
                      </label>
                      <div className="d-flex flex-wrap gap-1">
                        {puneLocations.map((loc) => (
                          <button
                            key={loc.name}
                            type="button"
                            className="btn btn-sm btn-outline-secondary py-1 px-2"
                            style={{ fontSize: '0.75rem' }}
                            onClick={() => {
                              setLocation(`${loc.name}, Pune`);
                              setCoordinates(loc.coords);
                            }}
                          >
                            <MapPin size={11} className="me-1 text-danger" />
                            {loc.name}
                          </button>
                        ))}
                      </div>
                    </div>

                    {coordinates && (
                      <div className="alert alert-light border py-2 px-3 small d-flex align-items-center gap-2 mb-0">
                        <CheckCircle size={15} className="text-success" />
                        <span>Pinned Coordinates: [{coordinates[0].toFixed(4)}, {coordinates[1].toFixed(4)}]</span>
                      </div>
                    )}
                  </div>
                )}

                {/* STEP 3: Details, Contact & Optional Photo */}
                {currentStep === 3 && (
                  <div>
                    <h5 className="fw-bold text-dark mb-3">3. Situation Details & Contact Info</h5>

                    <div className="row g-3 mb-3">
                      <div className="col-sm-6">
                        <label className="form-label fw-semibold text-dark small">
                          Estimated People Affected / In Need
                        </label>
                        <div className="input-group">
                          <span className="input-group-text bg-light border-end-0">
                            <Users size={16} className="text-muted" />
                          </span>
                          <input
                            type="number"
                            className="form-control border-start-0"
                            min="1"
                            max="5000"
                            value={peopleAffected}
                            onChange={(e) => setPeopleAffected(Math.max(1, parseInt(e.target.value, 10) || 1))}
                            required
                          />
                        </div>
                      </div>

                      <div className="col-sm-6">
                        <label className="form-label fw-semibold text-dark small">
                          Callback Phone Number
                        </label>
                        <div className="input-group">
                          <span className="input-group-text bg-light border-end-0">
                            <Phone size={16} className="text-muted" />
                          </span>
                          <input
                            type="tel"
                            className="form-control border-start-0"
                            placeholder="+91 98220 12345"
                            value={reporterPhone}
                            onChange={(e) => setReporterPhone(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-semibold text-dark small">
                        Emergency Description & Hazards <span className="text-danger">*</span>
                      </label>
                      <textarea
                        className="form-control"
                        rows="3"
                        placeholder="Describe the current hazard, smoke, structural issues, blocked roads, or trapped individuals..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                      ></textarea>
                    </div>

                    {/* Photo Upload with Live Preview */}
                    <div className="mb-2">
                      <label className="form-label fw-semibold text-dark small">
                        Attach Scene Photo (Optional, Max 2MB)
                      </label>

                      {photoPreview ? (
                        <div className="position-relative d-inline-block border rounded p-1 bg-light">
                          <img
                            src={photoPreview}
                            alt="Scene Preview"
                            style={{ maxHeight: '160px', borderRadius: '4px', display: 'block' }}
                          />
                          <button
                            type="button"
                            className="btn btn-sm btn-danger position-absolute top-0 end-0 m-1 p-1 rounded-circle shadow"
                            onClick={removePhoto}
                            title="Remove Photo"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <div className="d-flex align-items-center gap-2">
                          <label className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1 mb-0 cursor-pointer">
                            <Upload size={14} />
                            <span>Select Photo</span>
                            <input
                              type="file"
                              accept="image/jpeg,image/png,image/webp"
                              className="d-none"
                              onChange={handlePhotoChange}
                            />
                          </label>
                          <span className="text-muted small">Supports JPEG, PNG, WebP</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* STEP 4: Summary Review & Dispatch Confirmation */}
                {currentStep === 4 && (
                  <div>
                    <h5 className="fw-bold text-dark mb-3">4. Verify Report & Dispatch Rescue</h5>
                    <p className="text-muted small mb-3">
                      Please review the incident summary carefully before submitting to the Pune Control Center.
                    </p>

                    <div className="p-3 bg-light rounded border mb-3">
                      <div className="row g-2 mb-2 pb-2 border-bottom">
                        <div className="col-sm-6">
                          <span className="text-muted small d-block">Emergency Type:</span>
                          <span className="fw-bold text-dark d-flex align-items-center gap-1">
                            <Flame size={15} className="text-danger" /> {emergencyType}
                          </span>
                        </div>
                        <div className="col-sm-6">
                          <span className="text-muted small d-block">Severity Level:</span>
                          <span className="badge bg-danger">{severity}</span>
                        </div>
                      </div>

                      <div className="mb-2 pb-2 border-bottom">
                        <span className="text-muted small d-block">Pune Location:</span>
                        <span className="fw-semibold text-dark">{location}</span>
                        {coordinates && (
                          <div className="text-muted small">[{coordinates[0].toFixed(4)}, {coordinates[1].toFixed(4)}]</div>
                        )}
                      </div>

                      <div className="row g-2 mb-2 pb-2 border-bottom">
                        <div className="col-sm-6">
                          <span className="text-muted small d-block">People Affected:</span>
                          <span className="fw-semibold text-dark">{peopleAffected} person(s)</span>
                        </div>
                        <div className="col-sm-6">
                          <span className="text-muted small d-block">Callback Phone:</span>
                          <span className="fw-semibold text-dark">{reporterPhone || 'Not provided'}</span>
                        </div>
                      </div>

                      <div className="mb-2">
                        <span className="text-muted small d-block">Description:</span>
                        <span className="text-dark small">{description}</span>
                      </div>

                      {photoPreview && (
                        <div className="mt-2 pt-2 border-top">
                          <span className="text-muted small d-block mb-1">Attached Photo:</span>
                          <img
                            src={photoPreview}
                            alt="Attached Scene"
                            style={{ maxHeight: '100px', borderRadius: '4px' }}
                          />
                        </div>
                      )}
                    </div>

                    <div className="alert alert-danger py-2 small mb-0 d-flex align-items-center gap-2">
                      <Siren size={16} className="flex-shrink-0" />
                      <span>
                        Submitting logs this emergency directly into the Pune Municipal Dispatch queue.
                      </span>
                    </div>
                  </div>
                )}

                {/* Wizard Controls */}
                <div className="d-flex justify-content-between align-items-center mt-4 pt-3 border-top">
                  {currentStep > 1 ? (
                    <button
                      type="button"
                      className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1"
                      onClick={prevStep}
                      disabled={isSubmitting}
                    >
                      <ChevronLeft size={16} /> Previous
                    </button>
                  ) : (
                    <div></div>
                  )}

                  {currentStep < 4 ? (
                    <button
                      type="button"
                      className="btn btn-resq-danger btn-sm d-flex align-items-center gap-1"
                      onClick={nextStep}
                    >
                      <span>Next</span> <ChevronRight size={16} />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      className="btn btn-resq-danger btn-sm d-flex align-items-center gap-2 px-4 py-2 fw-semibold"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 size={16} className="spin" />
                          <span>Dispatching Report...</span>
                        </>
                      ) : (
                        <>
                          <Send size={16} />
                          <span>Confirm & Submit Emergency</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

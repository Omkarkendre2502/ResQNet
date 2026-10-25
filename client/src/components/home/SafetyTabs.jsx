import React, { useState } from 'react';
import { safetyCategories } from '../../data/homeContent';
import { ShieldCheck, Flame, Waves, Car, Building2 } from 'lucide-react';

export const SafetyTabs = () => {
  const [activeTab, setActiveTab] = useState(safetyCategories[0].id);

  const getCategoryIcon = (id) => {
    switch (id) {
      case 'fire':
        return <Flame size={16} className="me-1 text-danger" />;
      case 'flood':
        return <Waves size={16} className="me-1 text-primary" />;
      case 'accident':
        return <Car size={16} className="me-1 text-warning" />;
      case 'collapse':
        return <Building2 size={16} className="me-1 text-danger" />;
      default:
        return <ShieldCheck size={16} className="me-1" />;
    }
  };

  const currentCategory = safetyCategories.find((c) => c.id === activeTab) || safetyCategories[0];

  const handleKeyDown = (e, index) => {
    let newIndex = index;
    if (e.key === 'ArrowRight') {
      newIndex = (index + 1) % safetyCategories.length;
    } else if (e.key === 'ArrowLeft') {
      newIndex = (index - 1 + safetyCategories.length) % safetyCategories.length;
    } else {
      return;
    }
    e.preventDefault();
    setActiveTab(safetyCategories[newIndex].id);
    const nextBtn = document.getElementById(`safety-tab-${safetyCategories[newIndex].id}`);
    if (nextBtn) nextBtn.focus();
  };

  return (
    <section id="safety-tips" className="resq-section" aria-labelledby="safety-heading">
      <div className="container-xl">
        <div className="text-center mb-5">
          <div className="resq-section-eyebrow">Civil Preparedness</div>
          <h2 id="safety-heading" className="resq-section-title">
            Essential Safety & Survival Guidelines
          </h2>
          <p className="resq-section-subtitle mx-auto">
            Practical, life-saving actions to protect yourself and others before emergency teams arrive on the scene.
          </p>
        </div>

        <div className="row justify-content-center">
          <div className="col-12 col-lg-10">
            {/* Tabs Navigation */}
            <div
              className="resq-tabs-nav justify-content-center"
              role="tablist"
              aria-label="Disaster Safety Topics"
            >
              {safetyCategories.map((cat, idx) => {
                const isActive = cat.id === activeTab;
                return (
                  <button
                    key={cat.id}
                    id={`safety-tab-${cat.id}`}
                    role="tab"
                    aria-selected={isActive}
                    aria-controls={`safety-panel-${cat.id}`}
                    tabIndex={isActive ? 0 : -1}
                    className={`resq-tab-btn ${isActive ? 'active' : ''}`}
                    onClick={() => setActiveTab(cat.id)}
                    onKeyDown={(e) => handleKeyDown(e, idx)}
                  >
                    {getCategoryIcon(cat.id)}
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Tab Panel */}
            <div
              id={`safety-panel-${currentCategory.id}`}
              role="tabpanel"
              aria-labelledby={`safety-tab-${currentCategory.id}`}
              className="pt-2"
            >
              <div className="row g-3">
                {currentCategory.tips.map((tip, idx) => (
                  <div key={idx} className="col-12 col-md-6">
                    <div className="resq-tip-item h-100">
                      <div className="d-flex align-items-start gap-2">
                        <span className="badge bg-danger rounded-circle p-1 mt-1" style={{ width: '8px', height: '8px' }}></span>
                        <div>
                          <h3 className="resq-tip-title">{tip.title}</h3>
                          <p className="resq-tip-body">{tip.body}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SafetyTabs;

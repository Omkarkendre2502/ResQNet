import React from 'react';
import { useApp } from '../../context/AppContext';
import { ShieldCheck, UserPlus, LogIn, ArrowRight } from 'lucide-react';

export const CtaBand = () => {
  const { currentUser, navigateTo } = useApp();

  const getDashboardTarget = () => {
    if (!currentUser) return 'login';
    if (currentUser.role === 'admin') return 'admin-dashboard';
    if (currentUser.role === 'rescue') return 'rescue-dashboard';
    return 'citizen-dashboard';
  };

  return (
    <section className="resq-cta-band" aria-labelledby="cta-heading">
      <div className="container-xl text-center">
        <div className="d-inline-flex align-items-center gap-2 px-3 py-1 rounded-pill bg-white bg-opacity-10 text-white small fw-semibold mb-3 border border-white border-opacity-10">
          <ShieldCheck size={16} className="text-danger" />
          <span>Pune Municipal Disaster Preparedness</span>
        </div>

        <h2 id="cta-heading" className="display-6 fw-bold text-white mb-3">
          Be Prepared for Any Emergency in Pune
        </h2>

        <p className="text-white-50 mx-auto mb-4" style={{ maxWidth: '640px', fontSize: '1.05rem' }}>
          Join thousands of registered citizens who can report emergencies in seconds, receive rapid dispatch assistance, and help keep Pune safe.
        </p>

        <div className="d-flex flex-wrap justify-content-center gap-3">
          {!currentUser ? (
            <>
              <button
                type="button"
                className="btn btn-resq-primary btn-lg"
                onClick={() => navigateTo('login')}
              >
                <UserPlus size={18} />
                <span>Create a Free Citizen Account</span>
              </button>

              <button
                type="button"
                className="btn btn-resq-secondary btn-lg"
                onClick={() => navigateTo('login')}
              >
                <LogIn size={18} />
                <span>Sign In</span>
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                className="btn btn-resq-primary btn-lg"
                onClick={() => navigateTo('report-emergency')}
              >
                <span>Report an Emergency</span>
              </button>

              <button
                type="button"
                className="btn btn-resq-secondary btn-lg"
                onClick={() => navigateTo(getDashboardTarget())}
              >
                <span>Go to My Dashboard</span>
                <ArrowRight size={18} />
              </button>
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default CtaBand;

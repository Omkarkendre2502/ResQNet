import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import './auth.css';

// Modular Auth Components
import { AuthLayout } from '../components/auth/AuthLayout';
import { SignInForm } from '../components/auth/SignInForm';
import { RegisterForm } from '../components/auth/RegisterForm';
import { AuthSuccess } from '../components/auth/AuthSuccess';
import { SetNewPasswordForm } from '../components/auth/SetNewPasswordForm';

/**
 * LoginPage Composer
 * - Desktop split screen layout with photo panel
 * - Seamless switching between Sign In, Registration, and Password Reset
 * - URL hash sync (#login, #register)
 * - Safe pre-filling of registered email (never password)
 */
export const LoginPage = () => {
  const { currentUser, navigateTo } = useApp();

  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== 'undefined' && window.location.hash === '#register') {
      return 'register';
    }
    return 'login';
  });

  const [prefilledEmail, setPrefilledEmail] = useState('');

  // Synchronize activeTab with URL hash
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash === '#register') {
        setActiveTab('register');
      } else if (hash === '#login') {
        setActiveTab('login');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (typeof window !== 'undefined') {
      window.location.hash = tab === 'register' ? '#register' : '#login';
    }
  };

  const handleRegisterSuccess = (email) => {
    setPrefilledEmail(email);
    setActiveTab('success');
  };

  const handleProceedToLogin = (email) => {
    setPrefilledEmail(email);
    handleTabChange('login');
  };

  const handlePasswordChanged = () => {
    if (currentUser?.role === 'admin') {
      navigateTo('admin-dashboard');
    } else if (currentUser?.role === 'rescue') {
      navigateTo('rescue-dashboard');
    } else {
      navigateTo('citizen-dashboard');
    }
  };

  return (
    <AuthLayout
      activeTab={activeTab}
      onTabChange={handleTabChange}
      showTabs={activeTab === 'login' || activeTab === 'register'}
    >
      {activeTab === 'login' && (
        <SignInForm
          initialEmail={prefilledEmail}
          onSwitchToRegister={() => handleTabChange('register')}
          onMustChangePassword={() => setActiveTab('change-password')}
        />
      )}

      {activeTab === 'register' && (
        <RegisterForm
          onSwitchToLogin={() => handleTabChange('login')}
          onRegisterSuccess={handleRegisterSuccess}
        />
      )}

      {activeTab === 'success' && (
        <AuthSuccess
          email={prefilledEmail}
          onProceedToLogin={handleProceedToLogin}
        />
      )}

      {activeTab === 'change-password' && (
        <SetNewPasswordForm onPasswordChanged={handlePasswordChanged} />
      )}
    </AuthLayout>
  );
};

export default LoginPage;

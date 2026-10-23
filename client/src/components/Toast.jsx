import React from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';

export const Toast = () => {
  const { toast } = useApp();

  if (!toast) return null;

  const getAlertClass = () => {
    switch (toast.type) {
      case 'danger':
      case 'error':
        return 'alert-danger border-danger';
      case 'warning':
        return 'alert-warning border-warning';
      case 'info':
        return 'alert-primary border-primary';
      default:
        return 'alert-success border-success';
    }
  };

  const getIcon = () => {
    switch (toast.type) {
      case 'danger':
      case 'error':
        return <AlertCircle size={20} className="text-danger flex-shrink-0" />;
      case 'warning':
        return <AlertTriangle size={20} className="text-warning flex-shrink-0" />;
      case 'info':
        return <Info size={20} className="text-primary flex-shrink-0" />;
      default:
        return <CheckCircle size={20} className="text-success flex-shrink-0" />;
    }
  };

  return (
    <div className="resq-toast">
      <div className={`alert ${getAlertClass()} d-flex align-items-center mb-0 py-3 shadow border`}>
        <div className="me-3">{getIcon()}</div>
        <div className="flex-grow-1">
          <div className="fw-semibold text-dark small">{toast.message}</div>
        </div>
      </div>
    </div>
  );
};

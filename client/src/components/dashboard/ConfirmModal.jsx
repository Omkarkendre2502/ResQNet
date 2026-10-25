import React, { useEffect, useRef } from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';

/**
 * Accessible confirmation modal with focus trap, keyboard close, and loading state.
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether modal is visible
 * @param {Function} props.onClose - Dismiss modal handler
 * @param {Function} props.onConfirm - Confirm action handler
 * @param {string} props.title - Modal heading
 * @param {string|React.ReactNode} props.message - Descriptive warning/prompt
 * @param {string} [props.confirmLabel='Confirm'] - Confirmation button text
 * @param {string} [props.cancelLabel='Cancel'] - Cancel button text
 * @param {boolean} [props.isDestructive=false] - If true, styles confirm button red
 * @param {boolean} [props.isLoading=false] - Shows spinner and disables actions
 */
export const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isDestructive = false,
  isLoading = false
}) => {
  const modalRef = useRef(null);
  const confirmBtnRef = useRef(null);

  // Focus trap & Escape key listener
  useEffect(() => {
    if (!isOpen) return;

    // Focus confirm button when opened
    const timer = setTimeout(() => {
      confirmBtnRef.current?.focus();
    }, 50);

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !isLoading) {
        e.preventDefault();
        onClose();
        return;
      }

      // Tab navigation focus trap
      if (e.key === 'Tab' && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll(
          'button:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;

        const firstElement = focusable[0];
        const lastElement = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="modal fade show d-block confirm-modal-backdrop"
      tabIndex="-1"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
      aria-describedby="confirm-modal-description"
      style={{
        backgroundColor: 'rgba(11, 19, 41, 0.72)',
        zIndex: 1060,
        backdropFilter: 'blur(3px)'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !isLoading) {
          onClose();
        }
      }}
    >
      <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '440px' }} ref={modalRef}>
        <div className="modal-content border-0 shadow-lg rounded-3 overflow-hidden">
          <div className="modal-header border-bottom py-3 bg-light">
            <div className="d-flex align-items-center gap-2">
              <div
                className={`rounded-circle p-1.5 d-flex align-items-center justify-content-center ${
                  isDestructive ? 'bg-danger-subtle text-danger' : 'bg-warning-subtle text-warning-emphasis'
                }`}
              >
                <AlertTriangle size={18} />
              </div>
              <h5 className="modal-title fw-bold text-dark fs-6 mb-0" id="confirm-modal-title">
                {title}
              </h5>
            </div>
            <button
              type="button"
              className="btn-close"
              aria-label="Close"
              onClick={onClose}
              disabled={isLoading}
            ></button>
          </div>

          <div className="modal-body p-4" id="confirm-modal-description">
            <p className="text-secondary small mb-0 lh-base">
              {message}
            </p>
          </div>

          <div className="modal-footer border-top bg-light py-2.5 px-4 d-flex justify-content-end gap-2">
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary px-3"
              onClick={onClose}
              disabled={isLoading}
            >
              {cancelLabel}
            </button>
            <button
              ref={confirmBtnRef}
              type="button"
              className={`btn btn-sm ${
                isDestructive ? 'btn-danger' : 'btn-primary'
              } px-3 d-inline-flex align-items-center gap-1.5 fw-semibold`}
              onClick={onConfirm}
              disabled={isLoading}
            >
              {isLoading && <Loader2 size={13} className="spin-anim" />}
              <span>{confirmLabel}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;

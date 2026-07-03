'use client';

import { useEffect } from 'react';
import { Button } from './Button';
import { AlertTriangle } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  description: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
}

export function ConfirmModal({
  isOpen,
  title,
  description,
  onConfirm,
  onCancel,
  confirmText = 'ตกลง',
  cancelText = 'ยกเลิก',
  isLoading = false,
}: ConfirmModalProps) {
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isLoading) {
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isLoading, onCancel]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div 
        className="w-full max-w-md overflow-hidden rounded-xl border border-ink-700 bg-ink-900 shadow-2xl"
        role="dialog" 
        aria-modal="true"
      >
        <div className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-danger-500/10 text-danger-500">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-medium text-paper-100">{title}</h3>
          </div>
          <p className="text-sm text-paper-300 ml-14">{description}</p>
        </div>
        <div className="flex justify-end gap-3 border-t border-ink-800 bg-ink-950 px-6 py-4">
          <Button 
            variant="secondary" 
            onClick={onCancel} 
            disabled={isLoading}
          >
            {cancelText}
          </Button>
          <Button 
            variant="danger" 
            onClick={onConfirm} 
            disabled={isLoading}
          >
            {isLoading ? 'กำลังดำเนินการ...' : confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}

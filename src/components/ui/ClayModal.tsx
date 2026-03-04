import React, { Fragment } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../utils/cn';

interface ClayModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export const ClayModal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  className 
}: ClayModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div 
        className={cn(
          'relative w-full max-w-md transform rounded-clay bg-white/90 p-6 shadow-xl transition-all',
          'animate-in fade-in zoom-in-95 duration-200',
          className
        )}
      >
        <div className="flex items-center justify-between mb-4">
          {title && (
            <h3 className="text-xl font-bold text-gray-900">{title}</h3>
          )}
          <button 
            onClick={onClose}
            className="rounded-full p-1 hover:bg-gray-100 text-gray-500 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        {children}
      </div>
    </div>
  );
};

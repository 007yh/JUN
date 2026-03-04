import React, { forwardRef } from 'react';
import { cn } from '../../utils/cn';

interface ClayInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const ClayInput = forwardRef<HTMLInputElement, ClayInputProps>(
  ({ className, label, error, icon, ...props }, ref) => {
    return (
      <div className="w-full space-y-2">
        {label && (
          <label className="block text-sm font-medium text-gray-700 ml-1">
            {label}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            className={cn(
              'w-full rounded-2xl bg-white/50 px-4 py-3 text-gray-900 placeholder:text-gray-400',
              'shadow-clay-inset border-none outline-none ring-0',
              'focus:ring-2 focus:ring-primary/50 transition-all duration-200',
              icon && 'pl-11',
              error && 'ring-2 ring-red-500/50',
              className
            )}
            {...props}
          />
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              {icon}
            </div>
          )}
        </div>
        {error && (
          <p className="text-sm text-red-500 ml-1">{error}</p>
        )}
      </div>
    );
  }
);

ClayInput.displayName = 'ClayInput';

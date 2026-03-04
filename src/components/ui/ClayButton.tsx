import React from 'react';
import { cn } from '../../utils/cn';

interface ClayButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export const ClayButton = ({ 
  className, 
  variant = 'primary', 
  size = 'md',
  fullWidth = false,
  children, 
  ...props 
}: ClayButtonProps) => {
  const baseStyles = 'inline-flex items-center justify-center rounded-2xl font-semibold transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:pointer-events-none focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2';
  
  const variants = {
    primary: 'bg-primary text-white shadow-clay-btn hover:bg-primary-hover active:shadow-clay-inset',
    secondary: 'bg-secondary text-white shadow-clay-btn hover:bg-secondary/90 active:shadow-clay-inset',
    outline: 'bg-transparent border-2 border-primary text-primary hover:bg-primary/10',
    ghost: 'bg-transparent text-gray-600 hover:bg-gray-100/50',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-5 py-2.5 text-base',
    lg: 'px-8 py-3.5 text-lg',
  };

  return (
    <button
      className={cn(
        baseStyles,
        variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};

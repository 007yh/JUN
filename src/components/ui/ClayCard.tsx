import React from 'react';
import { cn } from '../../utils/cn';

interface ClayCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'secondary';
}

export const ClayCard = ({ 
  children, 
  className, 
  variant = 'default',
  ...props 
}: ClayCardProps) => {
  const variants = {
    default: 'bg-white/80',
    primary: 'bg-primary/90 text-white',
    secondary: 'bg-secondary/90 text-white',
  };

  return (
    <div 
      className={cn(
        'rounded-clay shadow-clay-card p-6 transition-all duration-300 hover:scale-[1.02]',
        'backdrop-blur-sm border border-white/40',
        variants[variant],
        className
      )} 
      {...props}
    >
      {children}
    </div>
  );
};

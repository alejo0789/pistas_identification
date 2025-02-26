/**
 * Reusable Button component with various styles and sizes
 * filepath: frontend/src/components/ui/Button.tsx
 */
import React, { ButtonHTMLAttributes, ReactNode } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  className = '',
  disabled,
  ...props
}) => {
  // Base classes
  const baseClasses = [
    'btn',
    `btn-${variant}`,
    `btn-${size}`,
  ];

  // Loading state
  if (isLoading) {
    baseClasses.push('relative !text-transparent');
  }

  return (
    <button 
      className={`${baseClasses.join(' ')} ${className}`} 
      disabled={disabled || isLoading}
      {...props}
    >
      {icon && !isLoading && (
        <span className="mr-2">{icon}</span>
      )}
      
      {children}
      
      {isLoading && (
        <span className="absolute inset-0 flex items-center justify-center">
          <svg 
            className="animate-spin h-5 w-5 text-white" 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24"
          >
            <circle 
              className="opacity-25" 
              cx="12" 
              cy="12" 
              r="10" 
              stroke="currentColor" 
              strokeWidth="4"
            />
            <path 
              className="opacity-75" 
              fill="currentColor" 
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        </span>
      )}
    </button>
  );
};
/**
 * Reusable Button component
 * filepath: frontend/src/components/ui/Button.tsx
 */
import React, { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'small';
  color?: 'primary' | 'secondary' | 'danger';
  fullWidth?: boolean;
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  color = 'primary',
  fullWidth = false,
  isLoading = false,
  className = '',
  disabled,
  ...props
}) => {
  // Base styles
  let baseStyles = 'focus:outline-none transition duration-150 ease-in-out';
  
  // Size and shape
  let sizeStyles = '';
  if (variant === 'small') {
    sizeStyles = 'px-3 py-1 text-sm';
  } else {
    sizeStyles = 'px-5 py-2 font-medium';
  }
  
  // Color styles
  let colorStyles = '';
  if (color === 'primary') {
    colorStyles = 'bg-blue-600 hover:bg-blue-700 text-white';
  } else if (color === 'secondary') {
    colorStyles = 'bg-gray-200 hover:bg-gray-300 text-gray-800';
  } else if (color === 'danger') {
    colorStyles = 'bg-red-600 hover:bg-red-700 text-white';
  }
  
  // Width
  let widthStyles = fullWidth ? 'w-full' : '';
  
  // Disabled state
  let disabledStyles = (disabled || isLoading) 
    ? 'opacity-50 cursor-not-allowed' 
    : 'hover:shadow-md';
  
  // Rounded corners
  let roundedStyles = 'rounded-md';
  
  // Combine all styles
  const buttonStyles = `${baseStyles} ${sizeStyles} ${colorStyles} ${widthStyles} ${disabledStyles} ${roundedStyles} ${className}`;
  
  return (
    <button
      className={buttonStyles}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <div className="flex items-center justify-center">
          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-t-transparent"></div>
          <span>Loading...</span>
        </div>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;
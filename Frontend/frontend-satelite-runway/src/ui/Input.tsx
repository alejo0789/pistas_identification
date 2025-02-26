/**
 * Reusable Input component
 * filepath: frontend/src/components/ui/Input.tsx
 */
import React, { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
  fullWidth?: boolean;
}

export const Input: React.FC<InputProps> = ({
  error,
  label,
  fullWidth = false,
  className = '',
  id,
  ...props
}) => {
  // Generate a random ID if not provided
  const inputId = id || `input-${Math.random().toString(36).substring(2, 9)}`;
  
  // Base styles
  const baseStyles = 'border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200';
  
  // Error styles
  const errorStyles = error 
    ? 'border-red-500' 
    : 'border-gray-300';
  
  // Width styles
  const widthStyles = fullWidth 
    ? 'w-full' 
    : '';
  
  // Disabled styles
  const disabledStyles = props.disabled 
    ? 'bg-gray-100 text-gray-500 cursor-not-allowed' 
    : '';
  
  // Combine all styles
  const inputStyles = `${baseStyles} ${errorStyles} ${widthStyles} ${disabledStyles} ${className}`;
  
  return (
    <div className={`input-container ${fullWidth ? 'w-full' : ''}`}>
      {label && (
        <label 
          htmlFor={inputId} 
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
        </label>
      )}
      
      <input
        id={inputId}
        className={inputStyles}
        {...props}
      />
      
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default Input;
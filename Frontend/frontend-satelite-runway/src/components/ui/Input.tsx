/**
 * Input UI component
 * filepath: frontend/src/components/ui/Input.tsx
 */
import React, { InputHTMLAttributes } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  fullWidth?: boolean;
}

export const Input: React.FC<InputProps> = ({
  id,
  name,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  className = '',
  fullWidth = true,
  disabled,
  ...rest
}) => {
  // Base classes
  const baseClasses = 'border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm';
  
  // Error styles
  const errorClasses = error ? 'border-red-300' : 'border-gray-300';
  
  // Disabled styles
  const disabledClasses = disabled ? 'bg-gray-100 opacity-75 cursor-not-allowed' : '';
  
  // Full width class
  const widthClass = fullWidth ? 'w-full' : '';
  
  // Combine all classes
  const inputClasses = `${baseClasses} ${errorClasses} ${disabledClasses} ${widthClass} ${className}`;
  
  return (
    <div className="input-wrapper">
      <input
        id={id}
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`px-3 py-2 ${inputClasses}`}
        disabled={disabled}
        {...rest}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};
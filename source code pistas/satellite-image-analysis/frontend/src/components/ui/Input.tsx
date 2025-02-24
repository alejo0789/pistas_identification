import React, { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export const Input: React.FC<InputProps> = ({
  className = '',
  error,
  ...props
}) => {
  // Base classes
  const baseClasses = 'block w-full px-4 py-2 text-gray-700 bg-white border rounded-md focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50';
  
  // Error classes
  const errorClasses = error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : '';
  
  // Disabled classes
  const disabledClasses = props.disabled ? 'bg-gray-100 cursor-not-allowed' : '';
  
  // Combine classes
  const inputClasses = `${baseClasses} ${errorClasses} ${disabledClasses} ${className}`;

  return (
    <div className="w-full">
      <input className={inputClasses} {...props} />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default Input;
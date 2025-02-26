/**
 * Reusable Input component
 * filepath: frontend/src/components/ui/Input.tsx
 */
import React, { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export const Input: React.FC<InputProps> = ({ 
  className = '',
  error, 
  ...props 
}) => {
  const baseClasses = "px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500";
  const errorClasses = error ? "border-red-300 text-red-900 placeholder-red-300" : "border-gray-300";
  const disabledClasses = props.disabled ? "bg-gray-100 text-gray-500 cursor-not-allowed" : "";
  
  return (
    <div className="w-full">
      <input
        className={`${baseClasses} ${errorClasses} ${disabledClasses} ${className}`}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default Input;
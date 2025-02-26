/**
 * Checkbox UI component
 * filepath: frontend/src/components/ui/Checkbox.tsx
 */
import React, { InputHTMLAttributes } from 'react';

export interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  id,
  name,
  checked,
  onChange,
  label,
  className,
  disabled,
  ...rest
}) => {
  return (
    <div className="flex items-center">
      <input
        id={id}
        type="checkbox"
        name={name}
        checked={checked}
        onChange={onChange}
        className={`h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        } ${className || ''}`}
        disabled={disabled}
        {...rest}
      />
      {label && (
        <label
          htmlFor={id}
          className={`ml-2 block text-sm text-gray-700 ${
            disabled ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {label}
        </label>
      )}
    </div>
  );
};
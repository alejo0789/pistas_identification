/**
 * SearchBar component for filtering and searching content
 * filepath: frontend/src/components/ui/SearchBar.tsx
 */
import React, { ChangeEvent, useState } from 'react';

interface SearchBarProps {
  placeholder?: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  value?: string;
  onClear?: () => void;
  className?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = 'Search...',
  onChange,
  value,
  onClear,
  className = '',
}) => {
  const [controlled] = useState(value !== undefined);
  const [internalValue, setInternalValue] = useState('');

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (!controlled) {
      setInternalValue(event.target.value);
    }
    onChange(event);
  };

  const handleClear = () => {
    if (!controlled) {
      setInternalValue('');
    }
    if (onClear) {
      onClear();
    }
  };

  const displayValue = controlled ? value : internalValue;

  return (
    <div className={`relative flex items-center ${className}`}>
      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        <svg 
          className="w-4 h-4 text-gray-500" 
          aria-hidden="true" 
          xmlns="http://www.w3.org/2000/svg" 
          fill="none" 
          viewBox="0 0 20 20"
        >
          <path 
            stroke="currentColor" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth="2" 
            d="M19 19l-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
          />
        </svg>
      </div>
      <input
        type="text"
        className="w-full py-2 pl-10 pr-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
        placeholder={placeholder}
        onChange={handleChange}
        value={displayValue}
      />
      {displayValue && (
        <button
          type="button"
          className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
          onClick={handleClear}
          aria-label="Clear search"
        >
          <svg 
            className="w-4 h-4" 
            aria-hidden="true" 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 14 14"
          >
            <path 
              stroke="currentColor" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth="2" 
              d="m1 1 12 12M1 13 13 1"
            />
          </svg>
        </button>
      )}
    </div>
  );
};
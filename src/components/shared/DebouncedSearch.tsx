import React, { useState, useEffect, useId } from 'react';
import { Search, X } from 'lucide-react';

interface DebouncedSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  delayMs?: number;
  className?: string;
  ariaLabel?: string;
}

export const DebouncedSearch: React.FC<DebouncedSearchProps> = ({
  value,
  onChange,
  placeholder = 'Search...',
  delayMs = 250,
  className = '',
  ariaLabel = 'Search input',
}) => {
  const [innerValue, setInnerValue] = useState(value);
  const inputId = useId();

  useEffect(() => {
    setInnerValue(value);
  }, [value]);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (innerValue !== value) {
        onChange(innerValue);
      }
    }, delayMs);

    return () => {
      clearTimeout(handler);
    };
  }, [innerValue, delayMs, onChange, value]);

  return (
    <div className={`relative flex items-center ${className}`}>
      <label htmlFor={inputId} className="sr-only">
        {ariaLabel}
      </label>
      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
      <input
        id={inputId}
        type="text"
        value={innerValue}
        onChange={(e) => setInnerValue(e.target.value)}
        placeholder={placeholder}
        aria-label={ariaLabel}
        className="w-full pl-10 pr-9 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all outline-none"
      />
      {innerValue && (
        <button
          type="button"
          onClick={() => {
            setInnerValue('');
            onChange('');
          }}
          aria-label="Clear search input"
          className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-white rounded transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

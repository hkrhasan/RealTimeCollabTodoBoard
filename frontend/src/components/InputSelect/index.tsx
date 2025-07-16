import { type SelectHTMLAttributes, forwardRef } from 'react';
import './InputSelect.css';

export interface InputSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
  containerClassName?: string;
}

export const InputSelect = forwardRef<HTMLSelectElement, InputSelectProps>(
  ({ label, error, options, containerClassName = '', className = '', ...props }, ref) => {
    const hasError = Boolean(error);
    return (
      <div className={`${containerClassName}`}>
        {label && <label className="input-label">{label}</label>}
        <select
          {...props}
          ref={ref}
          className={`input ${className} ${hasError ? 'input-error' : ''}`}
        >
          {options.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        {hasError && <p className="input-error-text mb-0">{error}</p>}
      </div>
    );
  }
);

InputSelect.displayName = 'InputSelect';
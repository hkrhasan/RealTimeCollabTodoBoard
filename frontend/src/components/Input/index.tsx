import { type InputHTMLAttributes, forwardRef } from 'react';
import './Input.css';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  containerClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, containerClassName = '', ...props }, ref) => {
    const hasError = Boolean(error);
    return (
      <div className={`${containerClassName}`}>
        {label && <label className="input-label">{label}</label>}
        <input
          {...props}
          ref={ref}
          className={`input ${props.className} ${hasError ? 'input-error' : ''}`}
        />
        {hasError && <p className="input-error-text mb-0">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
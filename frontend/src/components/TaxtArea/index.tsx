import { type TextareaHTMLAttributes, forwardRef } from 'react';
import '../Input/Input.css';

export interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  containerClassName?: string;
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ label, error, rows = 5, containerClassName = '', ...props }, ref) => {
    const hasError = Boolean(error);
    return (
      <div className={`${containerClassName}`}>
        {label && <label className="input-label">{label}</label>}
        <textarea
          {...props}
          ref={ref}
          className={`input ${props.className ?? ''} ${hasError ? 'input-error' : ''}`}
          rows={rows}
        ></textarea>
        {hasError && <p className="input-error-text mb-0">{error}</p>}
      </div>
    );
  }
);

TextArea.displayName = 'TextArea';
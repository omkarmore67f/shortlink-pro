import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

/**
 * Reusable form Input with label, error, and hint text support.
 * Uses forwardRef so it can be used with react-hook-form-style refs
 * or plain refs without breaking type-safety.
 */
const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className = '', id, ...props }, ref) => {
    const inputId = id || props.name;

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1.5">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`w-full glass-input rounded-xl px-3.5 py-2.5 text-sm text-gray-900
            placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500
            focus:border-primary-400 transition-colors
            ${error ? 'border-red-400 focus:ring-red-500 focus:border-red-500' : ''}
            ${className}`}
          {...props}
        />
        {hint && !error && <p className="mt-1.5 text-xs text-gray-500">{hint}</p>}
        {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;

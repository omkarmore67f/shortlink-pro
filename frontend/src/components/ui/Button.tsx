import { ButtonHTMLAttributes, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  children: ReactNode;
}

/**
 * Reusable Button component with consistent variants/sizes across
 * the app. Centralizing styles here means a future design tweak
 * (e.g., changing the primary color) only requires editing one file.
 */
const variantStyles: Record<string, string> = {
  primary: 'bg-primary-600/90 backdrop-blur-sm text-white hover:bg-primary-700 focus:ring-primary-500 shadow-sm',
  secondary: 'bg-white/50 backdrop-blur-sm border border-white/60 text-gray-900 hover:bg-white/70 focus:ring-gray-400',
  danger: 'bg-red-600/90 backdrop-blur-sm text-white hover:bg-red-700 focus:ring-red-500 shadow-sm',
  ghost: 'bg-transparent text-gray-700 hover:bg-white/40 focus:ring-gray-400',
  outline: 'bg-white/40 backdrop-blur-sm text-gray-700 border border-white/60 hover:bg-white/60 focus:ring-gray-400',
};

const sizeStyles: Record<string, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-5 py-2.5 text-base',
};

const Button = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) => {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-xl font-medium
        transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1
        disabled:opacity-60 disabled:cursor-not-allowed
        ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
};

export default Button;

import React, { forwardRef } from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  fullWidth?: boolean;
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  fullWidth = false,
  isLoading = false,
  className = '',
  disabled,
  ...props
}, ref) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return 'bg-navy-600 hover:bg-navy-700 text-white';
      case 'secondary':
        return 'bg-teal-500 hover:bg-teal-600 text-white';
      case 'danger':
        return 'bg-red-500 hover:bg-red-600 text-white';
      case 'outline':
        return 'bg-transparent border border-navy-600 text-navy-600 hover:bg-navy-50';
      case 'ghost':
        return 'bg-transparent text-navy-600 hover:bg-navy-50';
      default:
        return 'bg-navy-600 hover:bg-navy-700 text-white';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'text-sm py-1 px-3';
      case 'lg':
        return 'text-lg py-3 px-6';
      default:
        return 'text-base py-2 px-4';
    }
  };

  const baseClasses = 'rounded-lg font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-navy-400 focus:ring-opacity-50 flex items-center justify-center gap-2';
  const widthClass = fullWidth ? 'w-full' : '';
  const disabledClass = (disabled || isLoading) ? 'opacity-60 cursor-not-allowed' : '';
  
  return (
    <button
      ref={ref}
      className={`${baseClasses} ${getVariantClasses()} ${getSizeClasses()} ${widthClass} ${disabledClass} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading...
        </>
      ) : (
        <>
          {icon && <span>{icon}</span>}
          {children}
        </>
      )}
    </button>
  );
});

Button.displayName = 'Button';
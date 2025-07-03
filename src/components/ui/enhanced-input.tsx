import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const inputVariants = cva(
  'flex w-full rounded-lg border bg-white px-4 py-3 text-sm transition-all duration-200 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-900 dark:text-gray-100',
  {
    variants: {
      variant: {
        default: 'border-gray-300 focus-visible:border-blue-500 focus-visible:ring-blue-500/20',
        error: 'border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500/20 bg-red-50 dark:bg-red-950/20',
        success: 'border-emerald-500 focus-visible:border-emerald-500 focus-visible:ring-emerald-500/20 bg-emerald-50 dark:bg-emerald-950/20',
        warning: 'border-amber-500 focus-visible:border-amber-500 focus-visible:ring-amber-500/20 bg-amber-50 dark:bg-amber-950/20',
      },
      size: {
        sm: 'h-9 px-3 py-2 text-xs',
        default: 'h-11 px-4 py-3',
        lg: 'h-12 px-4 py-3 text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface EnhancedInputProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputVariants> {
  label?: string;
  error?: string;
  success?: string;
  warning?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  showPasswordToggle?: boolean;
  loading?: boolean;
}

const EnhancedInput = React.forwardRef<HTMLInputElement, EnhancedInputProps>(
  ({ 
    className, 
    variant, 
    size, 
    type, 
    label, 
    error, 
    success, 
    warning, 
    leftIcon, 
    rightIcon, 
    showPasswordToggle,
    loading,
    id,
    ...props 
  }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const [isFocused, setIsFocused] = React.useState(false);
    const inputId = id || React.useId();
    
    // Determine variant based on validation state
    const currentVariant = error ? 'error' : success ? 'success' : warning ? 'warning' : variant;
    
    const inputType = showPasswordToggle && type === 'password' 
      ? (showPassword ? 'text' : 'password') 
      : type;

    const validationMessage = error || success || warning;
    const validationIcon = error ? AlertCircle : success ? CheckCircle2 : null;

    return (
      <div className="space-y-2">
        {label && (
          <label 
            htmlFor={inputId}
            className={cn(
              "block text-sm font-medium transition-colors duration-200",
              error ? "text-red-700 dark:text-red-400" : 
              success ? "text-emerald-700 dark:text-emerald-400" :
              warning ? "text-amber-700 dark:text-amber-400" :
              "text-gray-700 dark:text-gray-300"
            )}
          >
            {label}
          </label>
        )}
        
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
              {leftIcon}
            </div>
          )}
          
          <input
            type={inputType}
            className={cn(
              inputVariants({ variant: currentVariant, size, className }),
              leftIcon && "pl-10",
              (rightIcon || showPasswordToggle || validationIcon) && "pr-10",
              isFocused && "ring-2 ring-offset-2",
              loading && "animate-pulse"
            )}
            ref={ref}
            id={inputId}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            {...props}
          />
          
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center space-x-1">
            {validationIcon && (
              <validationIcon className={cn(
                "h-4 w-4",
                error ? "text-red-500" : 
                success ? "text-emerald-500" :
                "text-amber-500"
              )} />
            )}
            
            {showPasswordToggle && type === 'password' && (
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            )}
            
            {rightIcon && !validationIcon && !showPasswordToggle && (
              <div className="text-gray-500">{rightIcon}</div>
            )}
          </div>
        </div>
        
        {validationMessage && (
          <p className={cn(
            "text-xs transition-all duration-200",
            error ? "text-red-600 dark:text-red-400" :
            success ? "text-emerald-600 dark:text-emerald-400" :
            "text-amber-600 dark:text-amber-400"
          )}>
            {validationMessage}
          </p>
        )}
      </div>
    );
  }
);
EnhancedInput.displayName = 'EnhancedInput';

export { EnhancedInput, inputVariants };
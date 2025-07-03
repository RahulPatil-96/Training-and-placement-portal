import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { CheckCircle2, Circle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const progressVariants = cva(
  'relative h-2 w-full overflow-hidden rounded-full',
  {
    variants: {
      variant: {
        default: 'bg-gray-200 dark:bg-gray-800',
        success: 'bg-emerald-200 dark:bg-emerald-800',
        error: 'bg-red-200 dark:bg-red-800',
        warning: 'bg-amber-200 dark:bg-amber-800',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

interface ProgressIndicatorProps extends VariantProps<typeof progressVariants> {
  value?: number;
  max?: number;
  showPercentage?: boolean;
  animated?: boolean;
  className?: string;
}

const ProgressIndicator = React.forwardRef<HTMLDivElement, ProgressIndicatorProps>(
  ({ className, variant, value = 0, max = 100, showPercentage = false, animated = true, ...props }, ref) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
    
    const barColor = {
      default: 'bg-blue-600',
      success: 'bg-emerald-600',
      error: 'bg-red-600',
      warning: 'bg-amber-600',
    }[variant || 'default'];

    return (
      <div className="space-y-2">
        <div
          ref={ref}
          className={cn(progressVariants({ variant }), className)}
          {...props}
        >
          <div
            className={cn(
              'h-full transition-all duration-500 ease-out',
              barColor,
              animated && 'animate-pulse'
            )}
            style={{ width: `${percentage}%` }}
          />
        </div>
        {showPercentage && (
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
            <span>{Math.round(percentage)}%</span>
            <span>{value} / {max}</span>
          </div>
        )}
      </div>
    );
  }
);
ProgressIndicator.displayName = 'ProgressIndicator';

// Step Progress Component
interface Step {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'current' | 'completed' | 'error';
}

interface StepProgressProps {
  steps: Step[];
  currentStep: number;
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

const StepProgress: React.FC<StepProgressProps> = ({
  steps,
  currentStep,
  orientation = 'horizontal',
  className,
}) => {
  return (
    <div className={cn(
      'flex',
      orientation === 'horizontal' ? 'items-center space-x-4' : 'flex-col space-y-4',
      className
    )}>
      {steps.map((step, index) => {
        const isCompleted = index < currentStep;
        const isCurrent = index === currentStep;
        const isError = step.status === 'error';
        
        const StepIcon = isError ? AlertCircle : isCompleted ? CheckCircle2 : Circle;
        
        return (
          <React.Fragment key={step.id}>
            <div className={cn(
              'flex items-center',
              orientation === 'vertical' ? 'w-full' : 'flex-col'
            )}>
              <div className={cn(
                'flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-200',
                isCompleted && 'bg-emerald-600 border-emerald-600 text-white',
                isCurrent && 'bg-blue-600 border-blue-600 text-white',
                isError && 'bg-red-600 border-red-600 text-white',
                !isCompleted && !isCurrent && !isError && 'border-gray-300 text-gray-500'
              )}>
                <StepIcon className="w-4 h-4" />
              </div>
              
              <div className={cn(
                'ml-3',
                orientation === 'horizontal' && 'text-center ml-0 mt-2'
              )}>
                <div className={cn(
                  'text-sm font-medium',
                  isCompleted && 'text-emerald-600',
                  isCurrent && 'text-blue-600',
                  isError && 'text-red-600',
                  !isCompleted && !isCurrent && !isError && 'text-gray-500'
                )}>
                  {step.title}
                </div>
                {step.description && (
                  <div className="text-xs text-gray-500 mt-1">
                    {step.description}
                  </div>
                )}
              </div>
            </div>
            
            {index < steps.length - 1 && (
              <div className={cn(
                'flex-1',
                orientation === 'horizontal' 
                  ? 'h-0.5 bg-gray-200 dark:bg-gray-700 mx-4' 
                  : 'w-0.5 bg-gray-200 dark:bg-gray-700 ml-4 h-8'
              )} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

// Circular Progress Component
interface CircularProgressProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'success' | 'error' | 'warning';
  showValue?: boolean;
  className?: string;
}

const CircularProgress: React.FC<CircularProgressProps> = ({
  value,
  max = 100,
  size = 'md',
  variant = 'default',
  showValue = true,
  className,
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const circumference = 2 * Math.PI * 45; // radius = 45
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  
  const sizes = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
  };
  
  const colors = {
    default: 'stroke-blue-600',
    success: 'stroke-emerald-600',
    error: 'stroke-red-600',
    warning: 'stroke-amber-600',
  };

  return (
    <div className={cn('relative', sizes[size], className)}>
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r="45"
          stroke="currentColor"
          strokeWidth="8"
          fill="none"
          className="text-gray-200 dark:text-gray-700"
        />
        <circle
          cx="50"
          cy="50"
          r="45"
          stroke="currentColor"
          strokeWidth="8"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className={cn('transition-all duration-500 ease-out', colors[variant])}
        />
      </svg>
      {showValue && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-semibold">{Math.round(percentage)}%</span>
        </div>
      )}
    </div>
  );
};

export { ProgressIndicator, StepProgress, CircularProgress };
export type { Step, StepProgressProps, CircularProgressProps };
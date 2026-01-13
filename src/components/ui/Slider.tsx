import React from 'react';
import { cn } from '@/lib/utils';

export interface SliderProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  showValue?: boolean;
  unit?: string;
  valueFormatter?: (value: number) => string;
}

const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  (
    {
      className,
      label,
      showValue = true,
      unit = '',
      valueFormatter,
      value,
      min = 0,
      max = 100,
      step = 1,
      ...props
    },
    ref
  ) => {
    const displayValue = valueFormatter
      ? valueFormatter(Number(value))
      : `${value}${unit}`;

    return (
      <div className={cn('w-full space-y-2', className)}>
        {(label || showValue) && (
          <div className="flex items-center justify-between">
            {label && (
              <label className="text-sm font-medium text-gray-700">
                {label}
              </label>
            )}
            {showValue && (
              <span className="text-sm font-semibold text-primary-600 bg-primary-50 px-3 py-1 rounded-full">
                {displayValue}
              </span>
            )}
          </div>
        )}
        <input
          ref={ref}
          type="range"
          value={value}
          min={min}
          max={max}
          step={step}
          className={cn(
            'w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer',
            'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
            '[&::-webkit-slider-thumb]:appearance-none',
            '[&::-webkit-slider-thumb]:w-5',
            '[&::-webkit-slider-thumb]:h-5',
            '[&::-webkit-slider-thumb]:rounded-full',
            '[&::-webkit-slider-thumb]:bg-primary-600',
            '[&::-webkit-slider-thumb]:shadow-lg',
            '[&::-webkit-slider-thumb]:hover:bg-primary-700',
            '[&::-webkit-slider-thumb]:transition-colors',
            '[&::-moz-range-thumb]:w-5',
            '[&::-moz-range-thumb]:h-5',
            '[&::-moz-range-thumb]:rounded-full',
            '[&::-moz-range-thumb]:bg-primary-600',
            '[&::-moz-range-thumb]:border-0',
            '[&::-moz-range-thumb]:shadow-lg',
            '[&::-moz-range-thumb]:hover:bg-primary-700',
            '[&::-moz-range-thumb]:transition-colors'
          )}
          {...props}
        />
        {min !== undefined && max !== undefined && (
          <div className="flex justify-between text-xs text-gray-500">
            <span>{min}{unit}</span>
            <span>{max}{unit}</span>
          </div>
        )}
      </div>
    );
  }
);

Slider.displayName = 'Slider';

export default Slider;
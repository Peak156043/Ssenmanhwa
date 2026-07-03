import { clsx } from 'clsx';
import {
  InputHTMLAttributes,
  LabelHTMLAttributes,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
  forwardRef,
} from 'react';

export function FieldLabel({
  className,
  ...props
}: LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={clsx('mb-1.5 block text-sm font-medium text-paper-300', className)}
      {...props}
    />
  );
}

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={clsx(
        'w-full rounded border border-ink-500 bg-ink-800 px-3 py-2 text-sm text-paper-100 placeholder:text-paper-500',
        'focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500',
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = 'Input';

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={clsx(
      'w-full rounded border border-ink-500 bg-ink-800 px-3 py-2 text-sm text-paper-100 placeholder:text-paper-500',
      'focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500',
      className,
    )}
    {...props}
  />
));
Textarea.displayName = 'Textarea';

export const Select = forwardRef<
  HTMLSelectElement,
  SelectHTMLAttributes<HTMLSelectElement>
>(({ className, children, ...props }, ref) => (
  <select
    ref={ref}
    className={clsx(
      'w-full rounded border border-ink-500 bg-ink-800 px-3 py-2 text-sm text-paper-100',
      'focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500',
      className,
    )}
    {...props}
  >
    {children}
  </select>
));
Select.displayName = 'Select';

import { useId, useState } from 'react';
import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react';

const BUTTON_VARIANTS = {
  primary: 'bg-brand text-white hover:bg-brand-ink shadow-sm',
  secondary: 'bg-white text-ink border border-line hover:bg-surface',
  ghost: 'text-muted hover:text-ink hover:bg-surface',
  danger: 'bg-white text-red-600 border border-red-200 hover:bg-red-50',
} as const;

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof BUTTON_VARIANTS;
  size?: 'sm' | 'md';
}) {
  const sizes = size === 'sm' ? 'h-8 px-3 text-[13px]' : 'h-10 px-4 text-sm';
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${BUTTON_VARIANTS[variant]} ${sizes} ${className}`}
      {...rest}
    />
  );
}

export function Field({
  label,
  hint,
  children,
  htmlFor,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
  htmlFor?: string;
}) {
  return (
    <label className="block" htmlFor={htmlFor}>
      <span className="mb-1 block text-[12px] font-medium text-muted">{label}</span>
      {children}
      {hint ? <span className="mt-1 block text-[11px] text-muted">{hint}</span> : null}
    </label>
  );
}

const controlClass =
  'w-full rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink placeholder:text-muted/60 focus:border-brand focus:outline-none';

export function TextInput({ className = '', ...rest }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={`${controlClass} ${className}`} {...rest} />;
}

export function TextArea({ className = '', ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={`${controlClass} min-h-[96px] resize-y leading-relaxed ${className}`} {...rest} />;
}

export function Select({
  className = '',
  children,
  ...rest
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={`${controlClass} cursor-pointer ${className}`} {...rest}>
      {children}
    </select>
  );
}

export function Segmented<T extends string | number>({
  label,
  value,
  options,
  onChange,
}: {
  label?: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
}) {
  return (
    <div>
      {label ? <span className="mb-1 block text-[12px] font-medium text-muted">{label}</span> : null}
      <div className="flex flex-wrap gap-1 rounded-lg bg-surface p-1">
        {options.map((option) => {
          const active = option.value === value;
          return (
            <button
              key={String(option.value)}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(option.value)}
              className={`flex-1 rounded-md px-2.5 py-1.5 text-[12px] font-medium transition ${
                active ? 'bg-white text-ink shadow-sm' : 'text-muted hover:text-ink'
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function Toggle({
  checked,
  onChange,
  label,
  hint,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  hint?: string;
}) {
  const id = useId();
  return (
    <div className="flex items-start justify-between gap-3 py-1.5">
      <div>
        <label htmlFor={id} className="cursor-pointer text-[13px] text-ink">
          {label}
        </label>
        {hint ? <p className="text-[11px] text-muted">{hint}</p> : null}
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={`mt-0.5 h-5 w-9 flex-none rounded-full transition ${checked ? 'bg-brand' : 'bg-line'}`}
      >
        <span
          className={`block h-4 w-4 rounded-full bg-white shadow transition ${checked ? 'translate-x-4' : 'translate-x-0.5'}`}
        />
      </button>
    </div>
  );
}

export function RangeControl({
  label,
  value,
  min,
  max,
  step = 1,
  suffix = '',
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  suffix?: string;
  onChange: (value: number) => void;
}) {
  const id = useId();
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between">
        <label htmlFor={id} className="text-[12px] font-medium text-muted">
          {label}
        </label>
        <span className="text-[12px] tabular-nums text-ink">
          {value}
          {suffix}
        </span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="w-full accent-[var(--color-brand)]"
      />
    </div>
  );
}

export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  wide,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  wide?: boolean;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4 sm:p-8">
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`relative w-full ${wide ? 'max-w-4xl' : 'max-w-lg'} rounded-2xl bg-white shadow-2xl`}
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="text-base font-semibold">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-md p-1.5 text-muted hover:bg-surface hover:text-ink"
          >
            <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M5 5l10 10M15 5L5 15" />
            </svg>
          </button>
        </div>
        <div className="px-5 py-4">{children}</div>
        {footer ? <div className="flex justify-end gap-2 border-t border-line px-5 py-3">{footer}</div> : null}
      </div>
    </div>
  );
}

export function Accordion({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-line last:border-0">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="flex w-full items-center justify-between py-3 text-left text-[13px] font-semibold text-ink"
      >
        {title}
        <svg
          viewBox="0 0 20 20"
          className={`h-3.5 w-3.5 text-muted transition ${open ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <path d="M5 8l5 5 5-5" />
        </svg>
      </button>
      {open ? <div className="pb-4">{children}</div> : null}
    </div>
  );
}

export function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-line bg-white p-10 text-center">
      <h3 className="text-base font-semibold">{title}</h3>
      <p className="mx-auto mt-2 max-w-sm text-sm text-muted">{body}</p>
      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </div>
  );
}

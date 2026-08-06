import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { clsx } from "clsx";

const fieldBase =
  "w-full rounded-lg border border-sand-200 bg-white px-3.5 py-2.5 text-sm text-charcoal-900 placeholder:text-charcoal-700/40 transition focus:border-pine-500 focus:ring-2 focus:ring-pine-500/20 focus:outline-none";

export function TextField({
  label,
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label?: string }) {
  return (
    <label className={clsx("block", className)}>
      {label && (
        <span className="mb-1.5 block text-sm font-medium text-charcoal-700">
          {label}
        </span>
      )}
      <input className={fieldBase} {...props} />
    </label>
  );
}

export function SelectField({
  label,
  className,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & { label?: string }) {
  return (
    <label className={clsx("block", className)}>
      {label && (
        <span className="mb-1.5 block text-sm font-medium text-charcoal-700">
          {label}
        </span>
      )}
      <select className={fieldBase} {...props}>
        {children}
      </select>
    </label>
  );
}

export function TextAreaField({
  label,
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string }) {
  return (
    <label className={clsx("block", className)}>
      {label && (
        <span className="mb-1.5 block text-sm font-medium text-charcoal-700">
          {label}
        </span>
      )}
      <textarea className={clsx(fieldBase, "min-h-32 resize-y")} {...props} />
    </label>
  );
}

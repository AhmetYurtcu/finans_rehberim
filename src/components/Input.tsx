import type {
  InputHTMLAttributes,
  LabelHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react'

interface FieldProps extends LabelHTMLAttributes<HTMLLabelElement> {
  label: string
  children: ReactNode
}

export function Field({ label, children, className = '', ...props }: FieldProps) {
  return (
    <label className={`flex flex-col gap-1.5 text-sm text-slate-300 ${className}`} {...props}>
      <span>{label}</span>
      {children}
    </label>
  )
}

export function Input({ className = '', ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`rounded-lg border border-slate-700 bg-slate-800 px-3 py-2.5 text-base text-slate-100 outline-none focus:border-emerald-500 ${className}`}
      {...props}
    />
  )
}

export function Select({ className = '', ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={`rounded-lg border border-slate-700 bg-slate-800 px-3 py-2.5 text-base text-slate-100 outline-none focus:border-emerald-500 ${className}`}
      {...props}
    />
  )
}

export function Textarea({ className = '', rows = 2, ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      rows={rows}
      className={`rounded-lg border border-slate-700 bg-slate-800 px-3 py-2.5 text-base text-slate-100 outline-none focus:border-emerald-500 ${className}`}
      {...rest}
    />
  )
}

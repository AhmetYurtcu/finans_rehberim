import type { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost'

const variantClasses: Record<Variant, string> = {
  primary: 'bg-emerald-500 text-slate-950 active:bg-emerald-400',
  secondary: 'bg-slate-700 text-slate-100 active:bg-slate-600',
  danger: 'bg-rose-600 text-white active:bg-rose-500',
  ghost: 'bg-transparent text-slate-300 active:bg-slate-800',
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
}

export function Button({ variant = 'primary', className = '', ...props }: ButtonProps) {
  return (
    <button
      className={`rounded-xl px-4 py-2.5 text-sm font-medium transition-colors disabled:opacity-50 ${variantClasses[variant]} ${className}`}
      {...props}
    />
  )
}

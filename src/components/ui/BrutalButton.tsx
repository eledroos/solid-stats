import { LucideIcon } from 'lucide-react';
import { ButtonHTMLAttributes } from 'react';

interface BrutalButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  icon?: LucideIcon;
}

export function BrutalButton({
  children,
  variant = 'primary',
  className = '',
  icon: Icon,
  disabled,
  ...props
}: BrutalButtonProps) {
  const baseStyles = "relative inline-flex items-center justify-center font-bold border-4 border-black transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary: "bg-primary text-white shadow-brutal hover:bg-primary-dark",
    secondary: "bg-white text-black shadow-brutal hover:bg-gray-50",
  };

  return (
    <button
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} px-6 py-3 text-lg ${className}`}
      {...props}
    >
      {Icon && <Icon className={`mr-2 w-5 h-5 ${disabled ? 'animate-spin' : ''}`} />}
      {children}
    </button>
  );
}

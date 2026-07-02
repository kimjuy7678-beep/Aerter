import { type ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'outline' | 'solid' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export function Button({ variant = 'outline', size = 'md', className = '', children, ...props }: ButtonProps) {
  const base = 'inline-flex items-center justify-center tracking-widest transition-all duration-300 cursor-pointer select-none';

  const variants = {
    outline: 'border border-foreground text-foreground hover:bg-foreground hover:text-background',
    solid: 'bg-foreground text-background hover:bg-foreground/80',
    ghost: 'text-foreground hover:opacity-60',
  };

  const sizes = {
    sm: 'px-5 py-2 text-[11px]',
    md: 'px-8 py-3 text-[12px]',
    lg: 'px-10 py-4 text-[13px]',
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} font-pretendard font-light ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

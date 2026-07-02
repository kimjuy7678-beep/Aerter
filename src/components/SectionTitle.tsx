import { useScrollReveal } from '../hooks/useScrollReveal';

interface SectionTitleProps {
  label: string;
  className?: string;
}

export function SectionTitle({ label, className = '' }: SectionTitleProps) {
  const { ref, visible } = useScrollReveal();

  return (
    <div
      ref={ref}
      className={`inline-flex flex-col items-center gap-0 ${className}`}
    >
      <div
        className={`border border-[#5b5b5b] px-10 py-4 transition-all duration-700 ${
          visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
      >
        <span className="font-cormorant text-[15px] tracking-[0.25em] text-foreground">
          {label}
        </span>
      </div>
    </div>
  );
}

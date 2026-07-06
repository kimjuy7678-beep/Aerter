import { useAnimatedNumber } from '../hooks/useAnimateNumber';

function formatPrice(n: number) {
    return Math.round(n).toLocaleString('ko-KR') + '원';
}

export default function AnimatedPrice({ value, className = '' }: { value: number; className?: string }) {
    const animated = useAnimatedNumber(value);
    return <span className={`tabular-nums ${className}`}>{formatPrice(animated)}</span>;
}
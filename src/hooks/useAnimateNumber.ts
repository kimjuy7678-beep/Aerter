import { useEffect, useRef, useState } from 'react';

function easeInOutCubic(t: number) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export function useAnimatedNumber(target: number, duration = 800) {
    const [value, setValue] = useState(target);
    const fromRef = useRef(target);
    const rafRef = useRef<number | undefined>(undefined);

    useEffect(() => {
        const from = fromRef.current;
        const to = target;
        if (from === to) return;

        const startTime = performance.now();

        const tick = (now: number) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = easeInOutCubic(progress);
            setValue(from + (to - from) * eased);

            if (progress < 1) {
                rafRef.current = requestAnimationFrame(tick);
            } else {
                fromRef.current = to;
            }
        };

        rafRef.current = requestAnimationFrame(tick);
        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, [target, duration]);

    return value;
}
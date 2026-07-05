import { useEffect, useRef, useState } from 'react';

export default function CustomCursor() {
    const ringRef = useRef<HTMLDivElement>(null);
    const [enabled, setEnabled] = useState(false);

    useEffect(() => {
        const hasFinePointer = window.matchMedia('(pointer: fine)').matches;
        setEnabled(hasFinePointer);
        if (!hasFinePointer) return;

        let mouseX = window.innerWidth / 2;
        let mouseY = window.innerHeight / 2;
        let ringX = mouseX;
        let ringY = mouseY;
        let scale = 1;
        let targetScale = 1;
        let rafId: number;

        const handleMouseMove = (e: MouseEvent) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        };

        const handleMouseOver = (e: MouseEvent) => {
            const target = (e.target as HTMLElement)?.closest(
                'a, button, [role="button"], input, textarea, select, summary'
            );
            targetScale = target ? 1.8 : 1;
        };

        const handleMouseLeaveWindow = () => {
            if (ringRef.current) ringRef.current.style.opacity = '0';
        };
        const handleMouseEnterWindow = () => {
            if (ringRef.current) ringRef.current.style.opacity = '1';
        };

        const animate = () => {
            ringX += (mouseX - ringX) * 0.18;
            ringY += (mouseY - ringY) * 0.18;
            scale += (targetScale - scale) * 0.15;

            if (ringRef.current) {
                ringRef.current.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%) scale(${scale})`;
            }
            rafId = requestAnimationFrame(animate);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseover', handleMouseOver);
        document.addEventListener('mouseleave', handleMouseLeaveWindow);
        document.addEventListener('mouseenter', handleMouseEnterWindow);
        document.body.classList.add('custom-cursor-active');
        rafId = requestAnimationFrame(animate);

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseover', handleMouseOver);
            document.removeEventListener('mouseleave', handleMouseLeaveWindow);
            document.removeEventListener('mouseenter', handleMouseEnterWindow);
            document.body.classList.remove('custom-cursor-active');
            cancelAnimationFrame(rafId);
        };
    }, []);

    if (!enabled) return null;

    return (
        <div
            ref={ringRef}
            aria-hidden="true"
            className="fixed top-0 left-0 w-8 h-8 rounded-full border border-foreground pointer-events-none z-[999] transition-[opacity] duration-200"
            style={{ willChange: 'transform', mixBlendMode: 'difference' }}
        />
    );
}
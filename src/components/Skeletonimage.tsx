import { useState } from 'react';

interface SkeletonImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    wrapperClassName?: string;
}

export default function SkeletonImage({
    wrapperClassName = 'w-full h-full',
    className = '',
    onLoad,
    alt,
    ...props
}: SkeletonImageProps) {
    const [loaded, setLoaded] = useState(false);

    return (
        <div className={`relative overflow-hidden ${wrapperClassName}`}>
            {!loaded && (
                <div className="absolute inset-0 bg-[#ece7e0] animate-pulse" aria-hidden="true" />
            )}
            <img
                {...props}
                alt={alt}
                className={`${className} transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'}`}
                onLoad={(e) => {
                    setLoaded(true);
                    onLoad?.(e);
                }}
            />
        </div>
    );
}
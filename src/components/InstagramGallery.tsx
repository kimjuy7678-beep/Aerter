import type { InstagramPost } from '../types';
import { useScrollReveal } from '../hooks/useScrollReveal';

interface InstagramGalleryProps {
  posts: InstagramPost[];
}

export default function InstagramGallery({ posts }: InstagramGalleryProps) {
  const { ref, visible } = useScrollReveal(0.1);

  return (
    <section
      id="instagram"
      className="w-full py-20 md:py-28 px-8 md:px-16 lg:px-20"
      aria-label="인스타그램 갤러리"
    >
      {/* Heading */}
      <div
        ref={ref}
        className={`text-center mb-4 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
      >
        <h2 className="font-cormorant font-bold text-[52px] md:text-[64px] lg:text-[70px] tracking-[0.04em] text-foreground">
          INSTAGRAM
        </h2>
        <p className="font-pretendard font-light text-[16px] md:text-[20px] text-foreground mt-3">
          Follow us on Instagram @aether__
        </p>
      </div>

      {/* Photo grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5 mt-12 max-w-[1600px] mx-auto">
        {posts.map((post, i) => (
          <a
            key={post.id}
            href={post.link}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={post.alt}
            className={`group relative block rounded-[10px] overflow-hidden bg-[#e8e4de] aspect-[499/609] transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
            style={{ transitionDelay: `${i * 120}ms` }}
          >
            <img
              src={post.image}
              alt={post.alt}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
              loading="lazy"
            />
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
              <span className="font-pretendard text-white text-[13px] tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                @aether__에서 더 많은 정보를 만나보세요.
              </span>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}

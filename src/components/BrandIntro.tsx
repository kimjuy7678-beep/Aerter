import { imgHeroAtmosphere } from '../assets/images';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { SectionTitle } from './SectionTitle';
import { Link } from 'react-router';

export default function BrandIntro() {
  const { ref: textRef, visible: textVisible } = useScrollReveal(0.2);

  return (
    <section
      id="brand"
      className="relative w-full overflow-hidden"
      aria-label="브랜드 소개"
    >
      {/* Atmospheric background image */}
      <div className="absolute inset-0 opacity-75">
        <img
          src={imgHeroAtmosphere}
          alt=""
          aria-hidden="true"
          className="w-full h-full object-cover object-center"
          loading="lazy"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center py-32 px-6 min-h-[560px]">
        {/* Large A mark */}
        <div
          ref={textRef}
          className={`flex flex-col items-center transition-all duration-1000 ${textVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
        >
          <div className="flex flex-col items-center gap-3 mb-4">
            <img src="/logo.png" alt="AERHER logo" className="h-14 w-auto" />
            <span className="font-cormorant text-[38px] md:text-[48px] tracking-[0.12em] text-foreground">
              AERHER
            </span>
          </div>

          {/* Korean tagline */}
          <p className="font-pretendard font-light text-[16px] md:text-[20px] leading-relaxed text-foreground text-center max-w-[620px] mb-12">
            에테르는 세상의 모든 감각을 아우르는 보이지 않는 공기,<br />
            그 순수한 향을 빚어내는 브랜드입니다.
          </p>

          {/* BRAND STORY label */}
          <Link to="/brand" className="inline-block group">
            <SectionTitle label="BRAND STORY" />
          </Link>
        </div>
      </div>
    </section>
  );
}

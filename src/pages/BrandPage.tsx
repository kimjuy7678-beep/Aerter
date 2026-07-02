import { Link } from 'react-router';
import { imgHeroAtmosphere, imgChildPeachHero, imgPureCottonHero, imgDeepWoodyHero } from '../assets/images';
import { useScrollReveal } from '../hooks/useScrollReveal';

function RevealSection({
  children,
  className = '',
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const { ref, visible } = useScrollReveal(0.1);
  return (
    <div
      ref={ref}
      className={`transition-all duration-800 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

const BRAND_VALUES = [
  {
    num: '01',
    title: 'Invisible Air',
    korean: '보이지 않는 공기',
    body: '에테르(Aether)는 고대 그리스 철학에서 하늘을 채우는 신성한 공기를 의미합니다. 보이지 않으나 언제나 존재하는 것, 그것이 향수의 본질입니다.',
  },
  {
    num: '02',
    title: 'Pure Ingredients',
    korean: '순수한 원료',
    body: '자연에서 얻은 최상의 원료만을 사용합니다. 합성 향료보다 천연 원료를 우선시하며, 지속 가능한 방식으로 조달된 재료만을 선별합니다.',
  },
  {
    num: '03',
    title: 'Emotional Memory',
    korean: '감각의 기억',
    body: '향기는 감정의 언어입니다. 에테르의 모든 향수는 특정 순간과 감정을 담아 조향됩니다. 당신의 가장 아름다운 기억을 깨우는 향기를 만듭니다.',
  },
];

const VISUAL_MOMENTS = [
  { image: imgChildPeachHero, label: 'Child Peach', sub: '달콤한 유년의 기억' },
  { image: imgPureCottonHero, label: 'Pure Cotton', sub: '포근한 일상의 위로' },
  { image: imgDeepWoodyHero, label: 'Deep Woody', sub: '깊은 숲의 고요함' },
];

export default function BrandPage() {
  return (
    <div className="pt-20 bg-white">
      {/* Hero — full viewport atmosphere */}
      <section className="relative h-[90vh] min-h-[560px] overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0">
          <img
            src={imgHeroAtmosphere}
            alt="AERHER 브랜드 분위기"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-white/30" />
        </div>
        <div className="relative z-10 text-center px-6">
          <RevealSection>
            <p className="font-pretendard font-light text-[12px] tracking-[0.4em] text-foreground/70 mb-5 uppercase">
              Brand Story
            </p>
            <div className="flex items-baseline justify-center gap-2 mb-6">
              <span className="font-cinzel text-[80px] md:text-[110px] leading-none text-foreground">A</span>
              <span className="font-cormorant text-[46px] md:text-[64px] tracking-[0.1em] text-foreground">ERHER</span>
            </div>
            <p className="font-pretendard font-light text-[16px] md:text-[20px] text-foreground/80 leading-relaxed max-w-[560px] mx-auto">
              에테르는 세상의 모든 감각을 아우르는<br />보이지 않는 공기, 그 순수한 향을 빚어내는 브랜드입니다.
            </p>
          </RevealSection>
        </div>
      </section>

      {/* Origin story */}
      <section className="max-w-[880px] mx-auto px-8 py-28 md:py-36 text-center">
        <RevealSection>
          <p className="font-pretendard font-light text-[12px] tracking-[0.35em] text-muted-foreground mb-8 uppercase">
            Our Origin
          </p>
          <h2 className="font-pretendard font-normal text-[36px] md:text-[48px] leading-snug text-foreground mb-10">
            향기는 가장 순수한 형태의<br />감각적 언어입니다
          </h2>
          <p className="font-pretendard font-light text-[15px] md:text-[17px] leading-[2] text-foreground/75 mb-6">
            2020년, 조향사 이아름과 디자이너 박서윤은 한 가지 질문으로 시작했습니다. "왜 우리가 기억하는 가장 아름다운 순간은 항상 특정 향기와 함께할까?" 그 질문이 AERHER의 첫 번째 향수 차일드피치로 이어졌습니다.
          </p>
          <p className="font-pretendard font-light text-[15px] md:text-[17px] leading-[2] text-foreground/75">
            에테르는 '의식적인 사치'를 추구합니다. 거창한 과시가 아닌, 매일 아침 나를 위해 선택하는 작은 의식. 그 의식이 하루를 특별하게 만드는 향기를 만듭니다.
          </p>
        </RevealSection>
      </section>

      {/* Brand values */}
      <section className="bg-[#f9f7f5] py-24 md:py-32 px-8 md:px-16 lg:px-24">
        <div className="max-w-[1200px] mx-auto">
          <RevealSection className="mb-16 text-center">
            <p className="font-pretendard font-light text-[12px] tracking-[0.35em] text-muted-foreground mb-4 uppercase">
              Our Values
            </p>
            <h2 className="font-pretendard font-normal text-[36px] md:text-[48px] text-foreground">
              에테르가 믿는 것들
            </h2>
          </RevealSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
            {BRAND_VALUES.map((v, i) => (
              <RevealSection key={v.num} delay={i * 120}>
                <p className="font-cormorant text-[48px] font-light text-foreground/15 leading-none mb-4">
                  {v.num}
                </p>
                <h3 className="font-cormorant text-[22px] tracking-[0.04em] text-foreground mb-1">
                  {v.title}
                </h3>
                <p className="font-pretendard text-[13px] text-muted-foreground mb-4">{v.korean}</p>
                <div className="w-8 h-px bg-foreground/30 mb-5" />
                <p className="font-pretendard font-light text-[14px] leading-relaxed text-foreground/70">
                  {v.body}
                </p>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* Visual moments — collection glimpse */}
      <section className="py-24 md:py-32 px-8 md:px-16 lg:px-20">
        <RevealSection className="text-center mb-14">
          <p className="font-pretendard font-light text-[12px] tracking-[0.35em] text-muted-foreground mb-4 uppercase">
            The World of AERHER
          </p>
          <h2 className="font-pretendard font-normal text-[36px] md:text-[48px] text-foreground">
            세 가지 향기, 세 가지 세계
          </h2>
        </RevealSection>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 max-w-[1400px] mx-auto">
          {VISUAL_MOMENTS.map((m, i) => (
            <RevealSection key={m.label} delay={i * 100}>
              <Link
                to="/collection"
                className="group block relative overflow-hidden rounded-[12px] aspect-[3/4] bg-[#e8e4de]"
              >
                <img
                  src={m.image}
                  alt={m.label}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-8">
                  <p className="font-cormorant text-[22px] text-white tracking-[0.05em] mb-0.5">{m.label}</p>
                  <p className="font-pretendard font-light text-[13px] text-white/80">{m.sub}</p>
                </div>
              </Link>
            </RevealSection>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 text-center border-t border-border">
        <RevealSection>
          <p className="font-pretendard font-light text-[13px] tracking-[0.25em] text-muted-foreground mb-5 uppercase">
            Discover Your Scent
          </p>
          <h2 className="font-pretendard font-normal text-[32px] md:text-[44px] text-foreground mb-8">
            당신을 위한 향기를 찾아보세요
          </h2>
          <Link
            to="/collection"
            className="inline-flex items-center gap-3 font-pretendard font-light text-[12px] tracking-[0.25em] text-foreground border border-foreground px-10 py-4 transition-all duration-300 hover:bg-foreground hover:text-background"
          >
            SHOP COLLECTION
          </Link>
        </RevealSection>
      </section>
    </div>
  );
}

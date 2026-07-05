import { Link } from 'react-router';
import { imgHeroMain, imgHeroProduct } from '../assets/images';

export default function Hero() {
  return (
    <section
      className="relative w-full h-screen min-h-[600px] max-h-[1048px] overflow-hidden"
      aria-label="AERHER 히어로 섹션"
    >
      <div className="absolute inset-0">
        <img
          src={imgHeroMain}
          alt="AERHER — 복숭아 향기를 담은 감각적인 장면"
          className="w-full h-full object-cover object-center"
          fetchPriority="high"
        />
        <div className="absolute inset-0 bg-white/10" />
      </div>

      <div className="absolute left-[7%] bottom-[12%] md:bottom-[10%] max-w-[340px] w-[44vw] md:w-[280px] lg:w-[330px]">
        <div className="relative rounded-[10px] overflow-hidden shadow-[4px_4px_34px_rgba(255,170,170,0.28)] mb-5 bg-[#faf7f5]">
          <img
            src={imgHeroProduct}
            alt="CHILD PEACH — 차일드피치 오 드 퍼퓸"
            className="w-full aspect-[329/377] object-cover"
            loading="eager"
          />
        </div>

        <div>
          <p className="font-cormorant text-[20px] tracking-[0.1em] text-foreground mb-0.5">
            CHILD PEACH
          </p>
          <p className="font-pretendard text-[17px] font-normal text-foreground mb-3">
            차일드피치
          </p>
          <p className="font-pretendard text-[13px] font-light text-foreground leading-relaxed mb-4">
            복숭아의 달콤함이 투명한 공기와 섞여,<br />
            잊고 있던 순수했던 시절의 기억을 깨웁니다.<br /><br />
            당신의 빈틈을 가장 다정하게 채워줄 첫 번째 향기를 만나보세요
          </p>

          <Link
            to="/collection"
            className="inline-flex items-center justify-center border border-[#353535] text-[11px] font-pretendard font-light tracking-[0.2em] text-foreground px-8 py-[10px] transition-all duration-300 hover:bg-foreground hover:text-background"
            aria-label="컬렉션 더 보기"
          >
            VIEW MORE
          </Link>
        </div>
      </div>
    </section>
  );
}

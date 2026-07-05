import { useState } from 'react';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { SectionTitle } from './SectionTitle';

export default function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const { ref, visible } = useScrollReveal(0.15);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubmitted(true);
    setEmail('');
  };

  return (
    <section
      id="newsletter"
      className="w-full py-24 md:py-32 px-6 bg-white"
      aria-label="뉴스레터 구독"
    >
      <div
        ref={ref}
        className={`flex flex-col items-center transition-all duration-800 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
      >
        <h2 className="font-cormorant font-bold text-[52px] md:text-[64px] lg:text-[70px] tracking-[0.04em] text-foreground text-center mb-4">
          NEWS LETTER
        </h2>

        <p className="font-pretendard font-light text-[16px] md:text-[20px] text-foreground text-center mb-10">
          AERTER의 향기로운 소식을 가장 먼저 받아보세요
        </p>

        {submitted ? (
          <p className="font-pretendard font-light text-[16px] text-foreground/70 tracking-wide">
            감사합니다. 곧 소식을 전해드릴게요 ✦
          </p>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-[1384px]"
            aria-label="이메일 구독 폼"
          >
            <div className="relative w-full border border-[#b0b0b0] rounded-[15px] flex flex-col md:flex-row items-stretch md:items-center gap-4 md:gap-0 px-6 md:px-10 py-6 md:py-0 md:h-[99px]">
              <label htmlFor="newsletter-email" className="sr-only">
                이메일 주소
              </label>
              <input
                id="newsletter-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="소식 받을 이메일을 입력해주세요"
                required
                className="w-full flex-1 bg-transparent outline-none font-pretendard font-light text-[16px] md:text-[22px] text-foreground placeholder-[#c9c9c9]"
                aria-required="true"
              />
              <button
                type="submit"
                className="w-full md:w-auto md:ml-4 shrink-0 font-pretendard font-light text-[14px] tracking-widest text-foreground border border-foreground px-6 md:px-8 py-3 transition-all duration-300 hover:bg-foreground hover:text-background"
                aria-label="구독하기"
              >
                SUBSCRIBE
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
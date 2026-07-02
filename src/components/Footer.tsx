import { Instagram } from 'lucide-react';
import { Link } from 'react-router';

const FOOTER_LINKS = [
  {
    heading: 'COLLECTION',
    items: [
      { label: 'Child Peach', href: '/collection/child-peach-edp' },
      { label: 'Pure Cotton', href: '/collection/pure-cotton-edp' },
      { label: 'Deep Woody', href: '/collection/deep-woody-edp' },
    ],
  },
  {
    heading: 'BRAND',
    items: [
      { label: 'Brand Story', href: '/brand' },
      { label: 'Sustainability', href: '#' },
      { label: 'Press', href: '#' },
    ],
  },
  {
    heading: 'SUPPORT',
    items: [
      { label: 'FAQ', href: '#' },
      { label: 'Shipping & Returns', href: '#' },
      { label: 'Contact Us', href: '#' },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="w-full bg-white border-t border-border pt-16 pb-10 px-8 md:px-16 lg:px-20" role="contentinfo">
      <div className="max-w-[1600px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8 mb-16">

          {/* Brand column */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-baseline gap-1 mb-3 w-fit">
              <span className="font-cinzel text-[60px] leading-none text-foreground"><img src="/logo.png" alt="logo" className="h-8 w-auto" /></span>
              <span className="font-cormorant text-[30px] tracking-[0.12em] text-foreground mt-1">AERHER</span>
            </Link>
            <p className="font-pretendard font-light text-[14px] text-muted-foreground leading-relaxed mb-3">
              에테르
            </p>
            <p className="font-pretendard font-light text-[13px] text-muted-foreground leading-relaxed mb-8 max-w-[260px]">
              보이지 않는 공기처럼 순수하고 섬세한 향을 빚어내는 프리미엄 향수 브랜드입니다.
            </p>

            {/* Instagram link */}
            <a
              href="https://www.instagram.com/aerher__?igsh=azVvNWozZGMyaTVv&utm_source=qr"
              aria-label="Instagram @aether__"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors duration-200 w-fit"
            >
              <Instagram size={18} />
              <span className="font-pretendard font-light text-[12px] tracking-wide">@aether__</span>
            </a>
          </div>

          {/* Link columns */}
          {FOOTER_LINKS.map((col) => (
            <div key={col.heading}>
              <h3 className="font-cormorant text-[14px] tracking-[0.2em] text-foreground mb-5">
                {col.heading}
              </h3>
              <ul className="space-y-3">
                {col.items.map((item) => (
                  <li key={item.label}>
                    <Link
                      to={item.href}
                      className="font-pretendard font-light text-[13px] text-muted-foreground hover:text-foreground transition-colors duration-200"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-border pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="font-pretendard font-light text-[12px] text-muted-foreground">
            © 2024 AERHER. All rights reserved.
          </p>
          <div className="flex gap-6">
            {['개인정보처리방침', '이용약관', '사업자정보'].map((item) => (
              <a
                key={item}
                href="#"
                className="font-pretendard font-light text-[12px] text-muted-foreground hover:text-foreground transition-colors duration-200"
              >
                {item}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

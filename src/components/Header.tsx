import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { Menu, X, Search, User, ShoppingBag, LogOut, ChevronDown } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuthStore } from '../store/useAuthStore';
import SearchOverlay from './SearchOverlay';

interface NavItem {
  label: string;
  href: string;
  isRoute: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'COLLECTION', href: '/collection', isRoute: true },
  { label: 'BRAND', href: '/brand', isRoute: true },
  { label: 'SCENT QUIZ', href: '/quiz', isRoute: true },
  { label: 'STORY', href: '/#brand', isRoute: false },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const location = useLocation();
  const navigate = useNavigate();
  const { totalCount } = useCart();
  const { isLoggedIn, user, logout } = useAuthStore();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setUserMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      setUserMenuOpen(false);
      setMenuOpen(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleHashNav = (hash: string) => {
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => document.querySelector(hash)?.scrollIntoView({ behavior: 'smooth' }), 300);
    } else {
      document.querySelector(hash)?.scrollIntoView({ behavior: 'smooth' });
    }
    setMenuOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    setUserMenuOpen(false);
    navigate('/');
  };

  const isActive = (href: string) =>
    href === '/collection'
      ? location.pathname.startsWith('/collection')
      : location.pathname === href;

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 h-15 transition-all duration-500 ${scrolled
          ? 'bg-white/95 shadow-[0_1px_0_rgba(0,0,0,0.06)] backdrop-blur-md'
          : 'bg-white/50 backdrop-blur-sm'
          }`}
        role="banner"
      >
        <div className="mx-auto flex h-full max-w-[1920px] items-center justify-between px-8 md:px-12">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-1 group" aria-label="AERHER — 홈으로">
            <span className="font-cinzel text-[38px] leading-none text-foreground transition-opacity duration-300 group-hover:opacity-60"><img src="/logo.png" alt="logo" className="h-8 w-auto" /></span>
            <span className="font-cormorant text-[22px] tracking-[0.15em] text-foreground transition-opacity duration-300 group-hover:opacity-60 mt-1">AERHER</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-14" aria-label="주요 메뉴">
            {NAV_ITEMS.map((item) =>
              item.isRoute ? (
                <Link
                  key={item.label}
                  to={item.href}
                  className={`font-cormorant text-[15px] tracking-[0.12em] relative pb-0.5 transition-all duration-200
                    after:absolute after:bottom-0 after:left-0 after:h-px after:bg-foreground after:transition-all after:duration-300
                    ${isActive(item.href)
                      ? 'text-foreground after:w-full'
                      : 'text-foreground/70 hover:text-foreground after:w-0 hover:after:w-full'}`}
                >
                  {item.label}
                </Link>
              ) : (
                <button
                  key={item.label}
                  onClick={() => handleHashNav('#brand')}
                  className="font-cormorant text-[15px] tracking-[0.12em] text-foreground/70 hover:text-foreground relative pb-0.5 after:absolute after:bottom-0 after:left-0 after:h-px after:w-0 after:bg-foreground after:transition-all after:duration-300 hover:after:w-full transition-colors"
                >
                  {item.label}
                </button>
              )
            )}
          </nav>

          {/* Right icons */}
          <div className="flex items-center gap-1">

            {/* Search */}
            <button
              onClick={() => setSearchOpen(true)}
              className="flex items-center justify-center w-10 h-10 text-foreground/70 hover:text-foreground transition-colors duration-200"
              aria-label="검색 열기"
            >
              <Search size={19} />
            </button>

            {/* User — logged in: dropdown / logged out: login page */}
            {isLoggedIn ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen((o) => !o)}
                  className="flex items-center gap-1 px-2 h-10 text-foreground/70 hover:text-foreground transition-colors duration-200"
                  aria-label="내 계정 메뉴"
                  aria-expanded={userMenuOpen}
                >
                  <User size={19} />
                  <ChevronDown
                    size={13}
                    className={`transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                {/* Dropdown */}
                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-1 w-52 bg-white/98 backdrop-blur-md border border-border shadow-lg py-2 z-50">
                    <div className="px-4 py-3 border-b border-border">
                      <p className="font-pretendard text-[13px] font-normal text-foreground truncate">{user?.name}</p>
                      <p className="font-pretendard text-[11px] font-light text-muted-foreground truncate mt-0.5">{user?.email}</p>
                    </div>
                    <Link to="/mypage"
                      className="flex items-center gap-3 px-4 py-3 font-pretendard text-[12px] tracking-wide text-foreground/70 hover:text-foreground hover:bg-foreground/5 transition-colors">
                      <User size={14} /> 마이페이지
                    </Link>
                    <Link to="/mypage"
                      className="flex items-center gap-3 px-4 py-3 font-pretendard text-[12px] tracking-wide text-foreground/70 hover:text-foreground hover:bg-foreground/5 transition-colors">
                      <ShoppingBag size={14} /> 주문 내역
                    </Link>
                    <div className="border-t border-border mt-1 pt-1">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-3 font-pretendard text-[12px] tracking-wide text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-colors"
                      >
                        <LogOut size={14} /> 로그아웃
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center justify-center w-10 h-10 text-foreground/70 hover:text-foreground transition-colors duration-200"
                aria-label="로그인"
              >
                <User size={19} />
              </Link>
            )}

            {/* Cart */}
            <Link
              to="/cart"
              className="relative flex items-center justify-center w-10 h-10 text-foreground/70 hover:text-foreground transition-colors duration-200"
              aria-label={`장바구니 (${totalCount}개)`}
            >
              <ShoppingBag size={19} />
              {totalCount > 0 && (
                <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 rounded-full bg-foreground text-background font-pretendard text-[9px] flex items-center justify-center px-1 leading-none">
                  {totalCount > 99 ? '99+' : totalCount}
                </span>
              )}
            </Link>

            {/* Mobile hamburger */}
            <button
              className="md:hidden flex items-center justify-center w-10 h-10 text-foreground ml-1"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label={menuOpen ? '메뉴 닫기' : '메뉴 열기'}
              aria-expanded={menuOpen}
            >
              {menuOpen ? <X size={21} /> : <Menu size={21} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <div
          className={`md:hidden absolute top-full left-0 right-0 bg-white/98 backdrop-blur-md border-t border-border transition-all duration-300 overflow-hidden ${menuOpen ? 'max-h-80 opacity-100' : 'max-h-0 opacity-0'
            }`}
          aria-hidden={!menuOpen}
        >
          <nav className="flex flex-col px-8 pt-6 pb-2 gap-5">
            {NAV_ITEMS.map((item) =>
              item.isRoute ? (
                <Link key={item.label} to={item.href}
                  className="font-cormorant text-[20px] tracking-widest text-foreground">
                  {item.label}
                </Link>
              ) : (
                <button key={item.label} onClick={() => handleHashNav('#brand')}
                  className="font-cormorant text-[20px] tracking-widest text-foreground text-left">
                  {item.label}
                </button>
              )
            )}
          </nav>
          <div className="flex flex-wrap gap-5 px-8 pb-6 border-t border-border/50 pt-4">
            <button onClick={() => { setMenuOpen(false); setSearchOpen(true); }}
              className="flex items-center gap-2 font-pretendard text-[12px] tracking-widest text-foreground/70">
              <Search size={15} /> 검색
            </button>
            {isLoggedIn ? (
              <>
                <Link to="/mypage" onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 font-pretendard text-[12px] tracking-widest text-foreground/70">
                  <User size={15} /> {user?.name}
                </Link>
                <button onClick={() => { setMenuOpen(false); handleLogout(); }}
                  className="flex items-center gap-2 font-pretendard text-[12px] tracking-widest text-foreground/70">
                  <LogOut size={15} /> 로그아웃
                </button>
              </>
            ) : (
              <Link to="/login" onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 font-pretendard text-[12px] tracking-widest text-foreground/70">
                <User size={15} /> 로그인
              </Link>
            )}
            <Link to="/cart" onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2 font-pretendard text-[12px] tracking-widest text-foreground/70">
              <ShoppingBag size={15} /> 장바구니{totalCount > 0 && ` (${totalCount})`}
            </Link>
          </div>
        </div>
      </header>

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
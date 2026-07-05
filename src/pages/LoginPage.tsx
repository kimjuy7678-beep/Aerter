import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router';
import { useAuthStore, type SocialProvider } from '../store/useAuthStore';

const PROVIDERS: {
  id: SocialProvider;
  label: string;
  bg: string;
  text: string;
  border: string;
  hover: string;
  icon: React.ReactNode;
}[] = [
    {
      id: 'kakao',
      label: '카카오로 계속하기',
      bg: 'bg-[#FEE500]',
      text: 'text-[#191919]',
      border: 'border-[#FEE500]',
      hover: 'hover:bg-[#f0d900]',
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M10 2C5.582 2 2 4.896 2 8.46c0 2.276 1.407 4.275 3.536 5.43l-.9 3.344a.3.3 0 0 0 .45.33L9.2 15.1a9.8 9.8 0 0 0 .8.034c4.418 0 8-2.896 8-6.46C18 4.896 14.418 2 10 2Z"
            fill="#191919"
          />
        </svg>
      ),
    },
    {
      id: 'naver',
      label: '네이버로 계속하기',
      bg: 'bg-[#03C75A]',
      text: 'text-white',
      border: 'border-[#03C75A]',
      hover: 'hover:bg-[#02b350]',
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path d="M11.4 10.56 8.52 6H6v8h2.6V9.44L11.48 14H14V6h-2.6v4.56Z" fill="white" />
        </svg>
      ),
    },
    {
      id: 'google',
      label: 'Google로 계속하기',
      bg: 'bg-white',
      text: 'text-[#3c4043]',
      border: 'border-[#dadce0]',
      hover: 'hover:bg-[#f8f9fa]',
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path d="M19.6 10.23c0-.68-.06-1.36-.18-2H10v3.79h5.4a4.63 4.63 0 0 1-2 3.04v2.52h3.23c1.89-1.74 2.97-4.3 2.97-7.35Z" fill="#4285F4" />
          <path d="M10 20c2.7 0 4.97-.9 6.63-2.42l-3.23-2.52c-.9.6-2.04.96-3.4.96-2.6 0-4.81-1.76-5.6-4.13H1.07v2.6A9.99 9.99 0 0 0 10 20Z" fill="#34A853" />
          <path d="M4.4 11.89A5.96 5.96 0 0 1 4.09 10c0-.65.12-1.28.31-1.89V5.51H1.07A10 10 0 0 0 0 10c0 1.61.38 3.14 1.07 4.49l3.33-2.6Z" fill="#FBBC05" />
          <path d="M10 3.98c1.47 0 2.79.5 3.83 1.5l2.87-2.87C14.96.9 12.7 0 10 0A9.99 9.99 0 0 0 1.07 5.51l3.33 2.6C5.19 5.74 7.4 3.98 10 3.98Z" fill="#EA4335" />
        </svg>
      ),
    },
  ];

export default function LoginPage() {
  const { loginWithGoogle, loginWithKakao, loginWithNaver } = useAuthStore();
  const [loadingProvider, setLoadingProvider] = useState<SocialProvider | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string })?.from ?? '/mypage';
  const isCheckoutFlow = from === '/checkout' || from.startsWith('/collection/');

  const handleSocialLogin = async (id: SocialProvider) => {
    setError(null);
    setLoadingProvider(id);
    try {
      if (id === 'google') await loginWithGoogle();
      if (id === 'kakao') await loginWithKakao();
      if (id === 'naver') await loginWithNaver();
      navigate(from, { replace: true });
    } catch (err) {
      console.error(err);
      setError('로그인에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setLoadingProvider(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-6 pt-20">
      <div className="w-full max-w-[400px]">
        {/* Logo */}
        <div className="flex flex-col items-center mb-12">
          <Link to="/" className="flex items-baseline gap-1 mb-6">
            <span className="font-cinzel text-[52px] leading-none text-foreground"><img src="/logo.png" alt="logo" className="h-8 w-auto" /></span>
            <span className="font-cormorant text-[28px] tracking-[0.15em] text-foreground">AERHER</span>
          </Link>
          <h1 className="font-cormorant text-[28px] font-normal text-foreground tracking-wide text-center mb-2">
            로그인 / 회원가입
          </h1>
          {isCheckoutFlow ? (
            <div className="flex flex-col items-center gap-1">
              <p className="font-pretendard font-light text-[13px] text-foreground/80 text-center">
                구매를 위해 로그인이 필요합니다.
              </p>
              <p className="font-pretendard font-light text-[12px] text-muted-foreground text-center">
                소셜 계정으로 간편하게 시작하세요.
              </p>
            </div>
          ) : (
            <p className="font-pretendard font-light text-[13px] text-muted-foreground text-center leading-relaxed">
              소셜 계정으로 간편하게 시작하세요.<br />
              처음이라면 자동으로 가입됩니다.
            </p>
          )}
        </div>

        {/* Error message */}
        {error && (
          <p className="font-pretendard font-light text-[12px] text-red-500 text-center mb-4" role="alert">
            {error}
          </p>
        )}

        {/* Social login buttons */}
        <div className="flex flex-col gap-3">
          {PROVIDERS.map((provider) => {
            const isLoading = loadingProvider === provider.id;
            return (
              <button
                key={provider.id}
                onClick={() => handleSocialLogin(provider.id)}
                disabled={loadingProvider !== null}
                className={`
                  relative flex items-center w-full h-[52px] px-5 border rounded-none
                  font-pretendard font-normal text-[14px] tracking-wide
                  transition-all duration-200 cursor-pointer
                  disabled:opacity-60 disabled:cursor-not-allowed
                  ${provider.bg} ${provider.text} ${provider.border} ${provider.hover}
                `}
                aria-label={provider.label}
                aria-busy={isLoading}
              >
                {/* Icon — left aligned */}
                <span className="absolute left-5 flex items-center">
                  {provider.icon}
                </span>
                {/* Label — centered */}
                <span className="w-full text-center">
                  {isLoading ? '로그인 중...' : provider.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Divider */}
        <div className="flex items-center gap-4 my-8">
          <div className="flex-1 h-px bg-border" />
          <span className="font-pretendard font-light text-[11px] text-muted-foreground tracking-widest">OR</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* Guest continue */}
        <div className="text-center">
          {isCheckoutFlow ? (
            <Link
              to="/cart"
              className="font-pretendard font-light text-[12px] tracking-widest text-muted-foreground underline underline-offset-4 hover:text-foreground transition-colors"
            >
              장바구니로 돌아가기
            </Link>
          ) : (
            <Link
              to="/"
              className="font-pretendard font-light text-[12px] tracking-widest text-muted-foreground underline underline-offset-4 hover:text-foreground transition-colors"
            >
              로그인 없이 둘러보기
            </Link>
          )}
        </div>

        {/* Terms notice */}
        <p className="font-pretendard font-light text-[11px] text-muted-foreground/70 text-center leading-relaxed mt-10">
          로그인 시{' '}
          <a href="#" className="underline underline-offset-2 hover:text-foreground transition-colors">이용약관</a>
          {' '}및{' '}
          <a href="#" className="underline underline-offset-2 hover:text-foreground transition-colors">개인정보처리방침</a>
          에 동의한 것으로 간주됩니다.
        </p>
      </div>
    </div>
  );
}
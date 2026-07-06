import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router';
import { Package } from 'lucide-react';
import { useAuthStore, type SocialProvider } from '../store/useAuthStore';
import { useOrders, type Order } from '../context/OrderContext';

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

const STATUS_STYLE: Record<string, string> = {
  '결제 완료': 'text-foreground/70',
  '배송 준비': 'text-amber-600',
  '배송 중': 'text-blue-600',
  '배송 완료': 'text-foreground/40',
};

type LookupType = 'orderId' | 'phone';

function OrderLookupPanel() {
  const { findOrderById, findOrdersByPhone } = useOrders();
  const [lookupType, setLookupType] = useState<LookupType>('orderId');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Order[] | null>(null);
  const [searched, setSearched] = useState(false);

  const switchType = (type: LookupType) => {
    setLookupType(type);
    setQuery('');
    setResults(null);
    setSearched(false);
  };

  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    if (lookupType === 'orderId') {
      const found = findOrderById(query);
      setResults(found ? [found] : []);
    } else {
      setResults(findOrdersByPhone(query));
    }
    setSearched(true);
  };

  return (
    <div>
      <div className="flex gap-2 mb-5">
        <button
          type="button"
          onClick={() => switchType('orderId')}
          className={`flex-1 py-2.5 font-pretendard text-[12px] tracking-wide border transition-colors duration-200 ${lookupType === 'orderId'
            ? 'border-foreground text-foreground bg-foreground/5'
            : 'border-border text-muted-foreground hover:border-foreground/40'
            }`}
        >
          주문번호로 조회
        </button>
        <button
          type="button"
          onClick={() => switchType('phone')}
          className={`flex-1 py-2.5 font-pretendard text-[12px] tracking-wide border transition-colors duration-200 ${lookupType === 'phone'
            ? 'border-foreground text-foreground bg-foreground/5'
            : 'border-border text-muted-foreground hover:border-foreground/40'
            }`}
        >
          전화번호로 조회
        </button>
      </div>

      <form onSubmit={handleLookup} className="flex gap-2 mb-8">
        <input
          type={lookupType === 'phone' ? 'tel' : 'text'}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={lookupType === 'orderId' ? '주문번호 입력 (예: ORD-20260706-AB12C)' : '주문 시 입력한 연락처'}
          className="flex-1 min-w-0 border-b border-border bg-transparent font-pretendard font-light text-[14px] text-foreground py-3 outline-none focus:border-foreground transition-colors placeholder-foreground/25"
        />
        <button
          type="submit"
          className="shrink-0 font-pretendard text-[12px] tracking-widest text-foreground border border-foreground px-5 hover:bg-foreground hover:text-background transition-all duration-200"
        >
          조회
        </button>
      </form>

      {searched && (
        results && results.length > 0 ? (
          <div className="flex flex-col gap-4">
            {results.map((order) => (
              <div key={order.id} className="border border-border p-5 rounded-[4px]">
                <div className="flex items-center justify-between mb-3">
                  <p className="font-pretendard text-[11px] tracking-widest text-muted-foreground">
                    {order.date} · {order.id}
                  </p>
                  <span className={`font-pretendard text-[12px] ${STATUS_STYLE[order.status] ?? 'text-foreground/60'}`}>
                    {order.status}
                  </span>
                </div>
                <div className="flex flex-col gap-3">
                  {order.items.map((item, i) => (
                    <div key={`${item.product.id}-${i}`} className="flex gap-3 items-center">
                      <div className="w-12 h-14 rounded-[8px] overflow-hidden bg-[#f5f3f0] shrink-0">
                        <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-pretendard text-[13px] text-foreground truncate">{item.product.name}</p>
                        <p className="font-pretendard text-[11px] text-foreground/55">{item.qty}개</p>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="font-pretendard font-medium text-[14px] text-foreground mt-3 pt-3 border-t border-border text-right">
                  {order.totalPrice.toLocaleString('ko-KR')}원
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 py-10 text-center">
            <Package size={28} className="text-foreground/20" />
            <p className="font-pretendard font-light text-[13px] text-muted-foreground">
              조회 결과가 없습니다
            </p>
          </div>
        )
      )}
    </div>
  );
}

export default function LoginPage() {
  const { loginWithGoogle, loginWithKakao, loginWithNaver } = useAuthStore();
  const [loadingProvider, setLoadingProvider] = useState<SocialProvider | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'login' | 'lookup'>('login');
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-6 pt-20 pb-16">
      <div className="w-full max-w-[400px]">
        <div className="flex flex-col items-center mb-8">
          <Link to="/" className="flex items-center gap-2 mb-6">
            <img src="/logo.png" alt="logo" className="h-8 w-auto" />
            <span className="font-cormorant text-[28px] tracking-[0.15em] text-foreground">AERHER</span>
          </Link>
        </div>

        <div className="flex w-full mb-8 border-b border-border">
          <button
            onClick={() => setMode('login')}
            className={`flex-1 pb-3 font-pretendard text-[13px] tracking-widest transition-colors duration-200 border-b-2 -mb-px ${mode === 'login'
              ? 'border-foreground text-foreground'
              : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
          >
            로그인
          </button>
          <button
            onClick={() => setMode('lookup')}
            className={`flex-1 pb-3 font-pretendard text-[13px] tracking-widest transition-colors duration-200 border-b-2 -mb-px ${mode === 'lookup'
              ? 'border-foreground text-foreground'
              : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
          >
            비회원 주문조회
          </button>
        </div>

        {mode === 'login' ? (
          <>
            <div className="flex flex-col items-center mb-10 text-center">
              <h1 className="font-cormorant text-[28px] font-normal text-foreground tracking-wide mb-2">
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

            {error && (
              <p className="font-pretendard font-light text-[12px] text-red-500 text-center mb-4" role="alert">
                {error}
              </p>
            )}

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
                    <span className="absolute left-5 flex items-center">
                      {provider.icon}
                    </span>
                    <span className="w-full text-center">
                      {isLoading ? '로그인 중...' : provider.label}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-4 my-8">
              <div className="flex-1 h-px bg-border" />
              <span className="font-pretendard font-light text-[11px] text-muted-foreground tracking-widest">OR</span>
              <div className="flex-1 h-px bg-border" />
            </div>

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

            <p className="font-pretendard font-light text-[11px] text-muted-foreground/70 text-center leading-relaxed mt-10">
              로그인 시{' '}
              <a href="#" className="underline underline-offset-2 hover:text-foreground transition-colors">이용약관</a>
              {' '}및{' '}
              <a href="#" className="underline underline-offset-2 hover:text-foreground transition-colors">개인정보처리방침</a>
              에 동의한 것으로 간주됩니다.
            </p>
          </>
        ) : (
          <>
            <div className="flex flex-col items-center mb-8 text-center">
              <h1 className="font-cormorant text-[28px] font-normal text-foreground tracking-wide mb-2">
                비회원 주문조회
              </h1>
              <p className="font-pretendard font-light text-[13px] text-muted-foreground text-center leading-relaxed">
                주문 시 입력하신 정보로 주문 내역을 조회하세요.
              </p>
            </div>

            <OrderLookupPanel />
          </>
        )}
      </div>
    </div>
  );
}
import { useParams, Link, useNavigate } from 'react-router';
import { useState } from 'react';
import { ArrowLeft, ChevronRight, Heart, Lock } from 'lucide-react';
import { collections } from '../data/collections';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuthStore } from '../store/useAuthStore';
import type { Product, Collection } from '../types';

function findProduct(id: string): { product: Product; collection: Collection } | null {
  for (const col of collections) {
    const product = col.products.find((p) => p.id === id);
    if (product) return { product, collection: col };
  }
  return null;
}

function getSiblings(collection: Collection, currentId: string): Product[] {
  return collection.products.filter((p) => p.id !== currentId);
}

function getRelated(currentCollectionId: string): Array<Product & { collectionName: string }> {
  return collections
    .filter((c) => c.id !== currentCollectionId)
    .map((c) => ({ ...c.products[0], collectionName: c.name }));
}

function RevealDiv({
  children,
  className = '',
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const { ref, visible } = useScrollReveal(0.05);
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

export default function ProductDetailPage() {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();
  const { toggle, isWished } = useWishlist();
  const { isLoggedIn } = useAuthStore();

  const wished = isWished(productId ?? '');

  const result = findProduct(productId ?? '');

  if (!result) {
    return (
      <div className="pt-20 min-h-screen flex flex-col items-center justify-center gap-6">
        <p className="font-cormorant text-[32px] text-foreground">상품을 찾을 수 없습니다</p>
        <Link to="/collection" className="font-pretendard text-[13px] tracking-widest text-muted-foreground underline underline-offset-4">
          컬렉션으로 돌아가기
        </Link>
      </div>
    );
  }

  const { product, collection } = result;
  const siblings = getSiblings(collection, product.id);
  const related = getRelated(collection.id);

  const handleAddToCart = () => {
    addItem(product, collection, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2200);
  };

  const handleBuyNow = () => {
    if (!isLoggedIn) {
      navigate('/login', { state: { from: `/collection/${product.id}` } });
      return;
    }
    navigate('/checkout', {
      state: { directProduct: { product, collection, qty } },
    });
  };

  return (
    <div className="pt-20 bg-white">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 px-8 md:px-16 lg:px-20 pt-8 pb-6" aria-label="탐색 경로">
        <Link to="/" className="font-pretendard text-[11px] tracking-widest text-muted-foreground hover:text-foreground transition-colors">
          HOME
        </Link>
        <ChevronRight size={12} className="text-muted-foreground" />
        <Link to="/collection" className="font-pretendard text-[11px] tracking-widest text-muted-foreground hover:text-foreground transition-colors">
          COLLECTION
        </Link>
        <ChevronRight size={12} className="text-muted-foreground" />
        <span className="font-pretendard text-[11px] tracking-widest text-foreground">
          {product.name}
        </span>
      </nav>

      {/* Main product layout */}
      <div className="max-w-[1400px] mx-auto px-8 md:px-16 lg:px-20 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-start">

          {/* Left — product image */}
          <div className="sticky top-28">
            <div className="group relative overflow-hidden rounded-[24px] bg-[#f5f3f0] aspect-[4/5]">
              <img
                src={product.image}
                alt={`${product.name} — ${product.type}`}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                fetchPriority="high"
              />
            </div>

            {/* Thumbnail row — siblings in same collection */}
            {siblings.length > 0 && (
              <div className="flex gap-3 mt-4">
                {siblings.map((sib) => (
                  <Link
                    key={sib.id}
                    to={`/collection/${sib.id}`}
                    className="relative w-20 h-20 rounded-[12px] overflow-hidden bg-[#f5f3f0] border-2 border-transparent hover:border-foreground/20 transition-colors duration-200"
                  >
                    <img src={sib.image} alt={sib.name} className="w-full h-full object-cover" />
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Right — product info */}
          <div className="pt-4">
            {/* Collection badge */}
            <div className="flex items-center gap-2 mb-6">
              <Link
                to="/collection"
                className="font-pretendard text-[11px] tracking-[0.3em] text-muted-foreground hover:text-foreground transition-colors"
              >
                {collection.name}
              </Link>
              <span className="text-muted-foreground text-xs">—</span>
              <span className="font-pretendard text-[11px] tracking-widest text-muted-foreground uppercase">
                {product.type}
              </span>
            </div>

            {/* Korean + English name */}
            <p className="font-pretendard font-normal text-[18px] text-foreground mb-1">
              {collection.koreanName}
            </p>
            <div className="flex items-start justify-between gap-4 mb-2">
              <h1 className="font-cormorant font-normal text-[48px] md:text-[58px] leading-none tracking-[0.02em] text-foreground">
                {product.name}
              </h1>
              <button
                onClick={() => toggle(product, collection)}
                aria-label={wished ? '위시리스트에서 제거' : '위시리스트에 추가'}
                className="mt-2 shrink-0 w-11 h-11 flex items-center justify-center border border-border hover:border-foreground transition-all duration-200 group"
              >
                <Heart
                  size={18}
                  className={`transition-all duration-200 ${wished
                    ? 'fill-foreground text-foreground'
                    : 'text-foreground/40 group-hover:text-foreground'
                    }`}
                />
              </button>
            </div>
            <p className="font-pretendard font-light text-[14px] text-muted-foreground mb-8">
              {product.volume}
            </p>

            {/* Price */}
            <p className="font-pretendard text-[32px] font-medium text-foreground mb-10">
              {product.price}
            </p>

            {/* Description */}
            <div className="border-t border-border pt-8 mb-10">
              {collection.description.map((line, i) => (
                <p key={i} className="font-pretendard font-light text-[14px] md:text-[15px] leading-loose text-foreground/75">
                  {line}
                </p>
              ))}
              <div className="flex gap-3 mt-4 flex-wrap">
                {collection.tags.map((tag) => (
                  <span key={tag} className="font-pretendard text-[12px] text-muted-foreground">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Quantity + add to cart */}
            <div className="flex flex-col gap-4 mb-10">
              <div className="flex items-center gap-0 border border-border w-fit">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="w-11 h-11 flex items-center justify-center font-pretendard text-[16px] text-foreground hover:bg-foreground/5 transition-colors"
                  aria-label="수량 감소"
                >
                  −
                </button>
                <span className="w-12 text-center font-pretendard text-[14px] text-foreground tabular-nums">
                  {qty}
                </span>
                <button
                  onClick={() => setQty((q) => q + 1)}
                  className="w-11 h-11 flex items-center justify-center font-pretendard text-[16px] text-foreground hover:bg-foreground/5 transition-colors"
                  aria-label="수량 증가"
                >
                  +
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                className={`w-full h-14 font-pretendard font-light text-[12px] tracking-[0.3em] transition-all duration-300 ${added
                  ? 'bg-foreground/80 text-background'
                  : 'bg-foreground text-background hover:bg-foreground/85'
                  }`}
                aria-live="polite"
              >
                {added ? '장바구니에 추가되었습니다 ✓' : '장바구니 담기'}
              </button>
              <button
                onClick={handleBuyNow}
                className="w-full h-14 font-pretendard font-light text-[12px] tracking-[0.3em] border border-foreground text-foreground hover:bg-foreground/5 transition-colors duration-300 flex items-center justify-center gap-2"
              >
                {!isLoggedIn && <Lock size={13} className="text-foreground/50" />}
                바로 구매하기
              </button>
              {!isLoggedIn && (
                <p className="font-pretendard font-light text-[11px] text-muted-foreground text-center -mt-2">
                  구매하려면{' '}
                  <button
                    onClick={() => navigate('/login', { state: { from: `/collection/${product.id}` } })}
                    className="underline underline-offset-2 hover:text-foreground transition-colors"
                  >
                    로그인
                  </button>
                  이 필요합니다
                </p>
              )}
            </div>

            {/* Product details accordion-style */}
            <div className="border-t border-border divide-y divide-border">
              {[
                {
                  title: '제품 정보',
                  content: `용량: ${product.volume} · 향 계열: ${collection.name} · 제형: ${product.type}`,
                },
                {
                  title: '배송 안내',
                  content: '주문 후 1–3 영업일 이내 출고됩니다. 5만원 이상 구매 시 무료 배송.',
                },
                {
                  title: '교환 · 반품',
                  content: '상품 수령 후 7일 이내 교환 및 반품 가능. 개봉 제품은 교환·반품이 제한될 수 있습니다.',
                },
              ].map((item) => (
                <details key={item.title} className="group py-4">
                  <summary className="flex items-center justify-between cursor-pointer list-none">
                    <span className="font-pretendard text-[13px] tracking-wide text-foreground">
                      {item.title}
                    </span>
                    <span className="font-pretendard text-[18px] text-muted-foreground group-open:rotate-45 transition-transform duration-200">
                      +
                    </span>
                  </summary>
                  <p className="font-pretendard font-light text-[13px] leading-relaxed text-foreground/65 mt-4">
                    {item.content}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </div>

        {/* Related products */}
        <section className="mt-28 pt-16 border-t border-border" aria-label="다른 컬렉션">
          <RevealDiv className="mb-10">
            <h2 className="font-cormorant text-[32px] md:text-[40px] font-normal text-foreground">
              Other Collections
            </h2>
            <p className="font-pretendard font-light text-[14px] text-muted-foreground mt-1">
              에테르의 다른 향기도 만나보세요
            </p>
          </RevealDiv>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-10">
            {related.map((p, i) => (
              <RevealDiv key={p.id} delay={i * 100}>
                <Link
                  to={`/collection/${p.id}`}
                  className="group block"
                  aria-label={`${p.name} 보기`}
                >
                  <div className="relative overflow-hidden rounded-[18px] aspect-[3/4] bg-[#f5f3f0] mb-4">
                    <img
                      src={p.image}
                      alt={p.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.05]"
                      loading="lazy"
                    />
                  </div>
                  <p className="font-pretendard text-[11px] tracking-widest text-muted-foreground uppercase mb-1">
                    {p.collectionName}
                  </p>
                  <p className="font-pretendard text-[15px] font-normal text-foreground">{p.name}</p>
                </Link>
              </RevealDiv>
            ))}
          </div>
        </section>
      </div>

      {/* Back button */}
      <div className="fixed bottom-8 left-8 z-40">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 bg-white/90 backdrop-blur-sm border border-border px-4 py-3 shadow-sm font-pretendard text-[11px] tracking-widest text-foreground hover:bg-foreground hover:text-background transition-all duration-300"
          aria-label="이전 페이지로"
        >
          <ArrowLeft size={14} />
          BACK
        </button>
      </div>
    </div>
  );
}
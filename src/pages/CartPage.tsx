import { Link, useNavigate } from 'react-router';
import { ShoppingBag, X } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuthStore } from '../store/useAuthStore';
import { useToast } from '../context/ToastContext';

function formatPrice(n: number) {
  return n.toLocaleString('ko-KR') + '원';
}

export default function CartPage() {
  const { items, totalPrice, totalCount, removeItem, updateQty } = useCart();
  const { isLoggedIn } = useAuthStore();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const SHIPPING = totalPrice >= 50000 || totalPrice === 0 ? 0 : 3000;
  const finalPrice = totalPrice + SHIPPING;

  const handleOrder = () => {
    navigate('/checkout', { state: { items, totalPrice: finalPrice } });
  };

  const handleRemove = (productId: string, productName: string) => {
    removeItem(productId);
    showToast(`${productName}을(를) 삭제했습니다`, 'info');
  };

  if (items.length === 0) {
    return (
      <div className="pt-20 min-h-screen flex flex-col items-center justify-center gap-8 px-6">
        <div className="flex flex-col items-center gap-4 text-center">
          <ShoppingBag size={48} className="text-foreground/20" />
          <h1 className="font-pretendard text-[36px] text-foreground">장바구니가 비어 있습니다</h1>
          <p className="font-pretendard font-light text-[14px] text-muted-foreground">
            에테르의 향기를 담아보세요
          </p>
        </div>
        <Link
          to="/collection"
          className="font-pretendard font-light text-[12px] tracking-[0.25em] text-foreground border border-foreground px-10 py-4 transition-all duration-300 hover:bg-foreground hover:text-background"
        >
          SHOP COLLECTION
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-20 pb-28 min-h-screen">
      <div className="border-b border-border px-8 md:px-16 lg:px-24 py-10">
        <h1 className="font-cormorant text-[42px] md:text-[52px] font-normal text-foreground">
          장바구니
        </h1>
        <p className="font-pretendard font-light text-[13px] text-muted-foreground mt-1">
          총 {totalCount}개의 상품
        </p>
      </div>

      <div className="max-w-[1300px] mx-auto px-8 md:px-16 lg:px-24 mt-10">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-12 items-start">

          <div className="flex flex-col divide-y divide-border">
            {items.map((item) => (
              <div key={item.product.id} className="relative flex gap-5 md:gap-8 py-8 group">
                <button
                  onClick={() => handleRemove(item.product.id, item.product.name)}
                  aria-label={`${item.product.name} 삭제`}
                  className="absolute top-8 right-0 w-7 h-7 flex items-center justify-center rounded-full text-foreground/40 hover:text-foreground hover:bg-foreground/5 transition-colors"
                >
                  <X size={15} />
                </button>

                <Link to={`/collection/${item.product.id}`} className="shrink-0">
                  <div className="w-[90px] md:w-[120px] aspect-[3/4] rounded-[14px] overflow-hidden bg-[#f5f3f0]">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                    />
                  </div>
                </Link>

                <div className="flex-1 flex flex-col justify-between min-w-0 pr-8">
                  <div>
                    <p className="font-pretendard text-[11px] tracking-widest text-muted-foreground uppercase mb-1">
                      {item.collection.name} · {item.product.type}
                    </p>
                    <Link to={`/collection/${item.product.id}`}>
                      <h2 className="font-pretendard text-[16px] md:text-[18px] font-normal text-foreground hover:opacity-70 transition-opacity">
                        {item.product.name}
                      </h2>
                    </Link>
                    <p className="font-pretendard text-[13px] font-light text-foreground/55 mt-0.5">
                      {item.product.volume}
                    </p>
                  </div>

                  <div className="flex items-center justify-between mt-5">
                    <div className="flex items-center border border-border">
                      <button
                        onClick={() => updateQty(item.product.id, item.qty - 1)}
                        className="w-9 h-9 flex items-center justify-center text-foreground/60 hover:text-foreground hover:bg-foreground/5 transition-colors text-lg"
                        aria-label="수량 감소"
                      >
                        −
                      </button>
                      <span className="w-10 text-center font-pretendard text-[14px] text-foreground tabular-nums">
                        {item.qty}
                      </span>
                      <button
                        onClick={() => updateQty(item.product.id, item.qty + 1)}
                        className="w-9 h-9 flex items-center justify-center text-foreground/60 hover:text-foreground hover:bg-foreground/5 transition-colors text-lg"
                        aria-label="수량 증가"
                      >
                        +
                      </button>
                    </div>

                    <p className="font-pretendard font-medium text-[18px] text-foreground">
                      {formatPrice(parseInt(item.product.price.replace(/[^0-9]/g, '')) * item.qty)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="lg:sticky lg:top-28">
            <div className="border border-border p-8 rounded-[4px]">
              <h2 className="font-cormorant text-[24px] font-normal text-foreground mb-8">
                주문 요약
              </h2>

              <div className="space-y-4 font-pretendard text-[14px] text-foreground">
                <div className="flex justify-between">
                  <span className="font-light text-foreground/65">상품 합계</span>
                  <span>{formatPrice(totalPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-light text-foreground/65">배송비</span>
                  <span>
                    {SHIPPING === 0
                      ? <span className="text-foreground/50">무료</span>
                      : formatPrice(SHIPPING)}
                  </span>
                </div>
                {SHIPPING > 0 && (
                  <p className="text-[11px] text-muted-foreground font-light">
                    5만원 이상 구매 시 무료 배송
                  </p>
                )}
              </div>

              <div className="border-t border-border mt-6 pt-6 flex justify-between font-pretendard">
                <span className="text-[15px] text-foreground">총 결제 금액</span>
                <span className="text-[20px] font-medium text-foreground">{formatPrice(finalPrice)}</span>
              </div>

              <button
                onClick={handleOrder}
                className="w-full mt-8 h-14 bg-foreground text-background font-pretendard font-light text-[12px] tracking-[0.3em] hover:bg-foreground/85 transition-colors duration-300 flex items-center justify-center gap-2"
              >
                주문하기
              </button>

              {!isLoggedIn && (
                <p className="font-pretendard font-light text-[11px] text-muted-foreground text-center mt-2">
                  <Link
                    to="/login"
                    state={{ from: '/checkout' }}
                    className="underline underline-offset-2 hover:text-foreground transition-colors"
                  >
                    로그인
                  </Link>
                  하면 주문 내역 확인과 재구매가 더 편리해요
                </p>
              )}

              <Link
                to="/collection"
                className="block text-center mt-4 font-pretendard font-light text-[12px] tracking-widest text-muted-foreground hover:text-foreground transition-colors"
              >
                쇼핑 계속하기
              </Link>
            </div>

            <div className="mt-6 space-y-3">
              {[
                '5만원 이상 무료 배송',
                '100% 정품 보장',
                '7일 이내 무료 교환·반품',
                '안전한 결제 시스템',
              ].map((b) => (
                <div key={b} className="flex items-center gap-3">
                  <div className="w-1 h-1 rounded-full bg-foreground/30 shrink-0" />
                  <p className="font-pretendard font-light text-[12px] text-muted-foreground">{b}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
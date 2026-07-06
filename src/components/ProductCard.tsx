import { useState } from 'react';
import { Link } from 'react-router';
import { Heart, ShoppingBag, Check } from 'lucide-react';
import type { Product, Collection } from '../types';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';

interface ProductCardProps {
  product: Product;
  collection: Collection;
}

export function ProductCard({ product, collection }: ProductCardProps) {
  const { toggle, isWished } = useWishlist();
  const { items, addItem } = useCart();
  const { showToast, showConfirm } = useToast();
  const [added, setAdded] = useState(false);
  const wished = isWished(product.id);

  const handleWish = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggle(product, collection);
  };

  const confirmAdd = () => {
    addItem(product, collection, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
    showToast('장바구니에 담았습니다');
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const alreadyInCart = items.some((item) => item.product.id === product.id);
    if (alreadyInCart) {
      showConfirm(`${product.name}은(는) 이미 장바구니에 있어요. 추가할까요?`, [
        { label: '추가하기', onClick: confirmAdd },
        { label: '취소', onClick: () => { }, variant: 'ghost' },
      ]);
      return;
    }
    confirmAdd();
  };

  return (
    <div className="group flex flex-col items-center">
      <div className="relative w-full aspect-[291/363] rounded-[18px] overflow-hidden bg-[#f5f3f0] mb-3 shadow-sm">
        <Link
          to={`/collection/${product.id}`}
          className="absolute inset-0 block"
          aria-label={`${product.name} — ${product.type} 상세 보기`}
        >
          <img
            src={product.image}
            alt={`${product.name} ${product.type}`}
            className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.05]"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
        </Link>

        <button
          type="button"
          onClick={handleWish}
          aria-label={wished ? '위시리스트에서 제거' : '위시리스트에 추가'}
          aria-pressed={wished}
          className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-sm shadow-sm transition-all duration-200 hover:scale-110 z-10"
        >
          <Heart
            size={14}
            className={wished ? 'fill-foreground text-foreground' : 'text-foreground/60'}
          />
        </button>

        <button
          type="button"
          onClick={handleAddToCart}
          aria-label="장바구니에 담기"
          className="absolute top-3 right-14 w-8 h-8 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-sm shadow-sm transition-all duration-200 hover:scale-110 z-10"
        >
          {added ? (
            <Check size={14} className="text-foreground" />
          ) : (
            <ShoppingBag size={14} className="text-foreground/60" />
          )}
        </button>
      </div>

      <Link
        to={`/collection/${product.id}`}
        className="text-center w-full space-y-1.5 cursor-pointer"
        aria-label={`${product.name} — ${product.type} 상세 보기`}
      >
        <p className="font-pretendard text-[10px] md:text-[11px] font-light tracking-wider text-foreground/75 uppercase leading-snug mt-5">
          {product.type}
        </p>
        <p className="font-pretendard text-[12px] md:text-[14px] font-normal tracking-wide text-foreground leading-snug">
          {product.name}
        </p>
        <p className="font-pretendard text-[11px] md:text-[13px] font-light text-foreground/65 leading-snug">
          {product.volume}
        </p>
        <p className="font-pretendard text-[15px] md:text-[18px] font-medium text-foreground pt-1">
          {product.price}
        </p>
      </Link>
    </div>
  );
}
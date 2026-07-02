import { useState } from 'react';
import { Link } from 'react-router';
import { Heart } from 'lucide-react';
import { collections } from '../data/collections';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { useWishlist } from '../context/WishlistContext';
import type { Product, Collection } from '../types';

const FILTERS = ['ALL', 'EAU DE PARFUM', 'PARFUM DIFFUSER', 'PARFUM HAND CREAM'];

interface FlatProduct extends Product {
  collectionId: string;
  collectionName: string;
  collectionKorean: string;
  collection: Collection;
}

const allProducts: FlatProduct[] = collections.flatMap((col) =>
  col.products.map((p) => ({
    ...p,
    collectionId: col.id,
    collectionName: col.name,
    collectionKorean: col.koreanName,
    collection: col,
  }))
);

function ProductItem({ product, index }: { product: FlatProduct; index: number }) {
  const { ref, visible } = useScrollReveal(0.05);
  const { toggle, isWished } = useWishlist();
  const wished = isWished(product.id);

  const handleWish = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggle(product, product.collection);
  };

  return (
    <Link
      to={`/collection/${product.id}`}
      ref={ref as React.Ref<HTMLAnchorElement>}
      className={`group block transition-all duration-700 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
      }`}
      style={{ transitionDelay: `${(index % 4) * 80}ms` }}
      aria-label={`${product.name} ${product.type} 상세 보기`}
    >
      <div className="relative overflow-hidden rounded-[18px] aspect-[3/4] bg-[#f5f3f0] mb-4">
        <img
          src={product.image}
          alt={`${product.name} — ${product.type}`}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.05]"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 flex items-end justify-center pb-6">
          <span className="font-pretendard text-[11px] tracking-[0.25em] text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 border border-white/80 px-5 py-2">
            VIEW DETAIL
          </span>
        </div>
        {/* Heart */}
        <button
          onClick={handleWish}
          aria-label={wished ? '위시리스트에서 제거' : '위시리스트에 추가'}
          className={`absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-sm shadow-sm transition-all duration-200 hover:scale-110 ${
            wished ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
          }`}
        >
          <Heart size={14} className={wished ? 'fill-foreground text-foreground' : 'text-foreground/60'} />
        </button>
      </div>

      <div className="space-y-0.5 px-1">
        <p className="font-pretendard text-[10px] font-light tracking-widest text-muted-foreground uppercase">
          {product.type}
        </p>
        <p className="font-pretendard text-[14px] font-normal text-foreground">{product.name}</p>
        <p className="font-pretendard text-[12px] font-light text-foreground/60">{product.volume}</p>
        <p className="font-pretendard text-[17px] font-medium text-foreground pt-1">{product.price}</p>
      </div>
    </Link>
  );
}

function CollectionBanner({ collection }: { collection: Collection }) {
  const { ref, visible } = useScrollReveal(0.1);
  return (
    <div
      ref={ref}
      className={`flex items-end gap-6 mb-10 pt-16 pb-5 border-b border-border transition-all duration-700 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
    >
      <div className="relative w-14 h-14 rounded-full overflow-hidden shrink-0">
        <img src={collection.heroImage} alt={collection.name} className="w-full h-full object-cover" />
      </div>
      <div>
        <p className="font-pretendard text-[13px] font-light text-muted-foreground">{collection.koreanName}</p>
        <h2 className="font-cormorant text-[28px] md:text-[36px] font-normal tracking-[0.04em] text-foreground leading-none">
          {collection.name}
        </h2>
      </div>
      <div className="ml-auto flex gap-3 flex-wrap">
        {collection.tags.map((tag) => (
          <span key={tag} className="font-pretendard text-[12px] text-muted-foreground">{tag}</span>
        ))}
      </div>
    </div>
  );
}

export default function CollectionPage() {
  const [activeFilter, setActiveFilter] = useState('ALL');

  const filteredProducts =
    activeFilter === 'ALL'
      ? allProducts
      : allProducts.filter((p) => p.type === activeFilter);

  const productsByCollection = collections
    .map((col) => ({
      collection: col,
      products: filteredProducts.filter((p) => p.collectionId === col.id),
    }))
    .filter((g) => g.products.length > 0);

  return (
    <div className="pt-20 pb-28">
      {/* Page hero */}
      <div className="relative h-[240px] md:h-[320px] overflow-hidden bg-[#f5f3f0]">
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
          <p className="font-pretendard font-light text-[13px] tracking-[0.3em] text-muted-foreground uppercase">AERHER</p>
          <h1 className="font-cormorant font-normal text-[52px] md:text-[72px] tracking-[0.06em] text-foreground">
            COLLECTION
          </h1>
          <p className="font-pretendard font-light text-[14px] text-muted-foreground">
            에테르의 시그니처 향수 컬렉션
          </p>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-8 md:px-16 lg:px-20">
        {/* Filter tabs */}
        <div className="flex gap-0 border-b border-border overflow-x-auto">
          {FILTERS.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`shrink-0 font-pretendard text-[11px] tracking-[0.2em] px-6 py-5 transition-all duration-300 border-b-[1.5px] -mb-px ${
                activeFilter === filter
                  ? 'border-foreground text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {activeFilter === 'ALL'
          ? productsByCollection.map(({ collection, products }) => (
              <div key={collection.id}>
                <CollectionBanner collection={collection} />
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8 mb-4">
                  {products.map((product, i) => (
                    <ProductItem key={product.id} product={product} index={i} />
                  ))}
                </div>
              </div>
            ))
          : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8 pt-12">
              {filteredProducts.map((product, i) => (
                <ProductItem key={product.id} product={product} index={i} />
              ))}
            </div>
          )}
      </div>
    </div>
  );
}

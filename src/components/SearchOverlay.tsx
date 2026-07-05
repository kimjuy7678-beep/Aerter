import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router';
import { X, Search } from 'lucide-react';
import { collections } from '../data/collections';
import type { Product, Collection } from '../types';

interface FlatProduct extends Product {
  collection: Collection;
}

const allProducts: FlatProduct[] = collections.flatMap((col) =>
  col.products.map((p) => ({ ...p, collection: col }))
);

interface SearchOverlayProps {
  open: boolean;
  onClose: () => void;
}

export default function SearchOverlay({ open, onClose }: SearchOverlayProps) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const results = query.trim().length > 0
    ? allProducts.filter((p) =>
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.collection.koreanName.includes(query) ||
      p.collection.name.toLowerCase().includes(query.toLowerCase()) ||
      p.type.toLowerCase().includes(query.toLowerCase())
    )
    : [];

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 80);
    } else {
      setQuery('');
    }
  }, [open]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] overflow-y-auto" role="dialog" aria-modal="true" aria-label="검색">
      <div
        className="fixed inset-0 bg-white/90 backdrop-blur-md"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-[760px] w-full mx-auto px-6 pt-28 pb-12 flex flex-col gap-8 min-h-full">
        <div className="sticky top-0 -mx-6 px-6 pt-2 pb-4 bg-white/95 backdrop-blur-md z-20 flex items-center gap-4 border-b-[1.5px] border-foreground">
          <Search size={20} className="text-foreground/50 shrink-0" />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="제품명, 컬렉션, 향 계열로 검색하세요"
            className="flex-1 bg-transparent font-pretendard font-light text-[20px] md:text-[24px] text-foreground placeholder-foreground/30 outline-none"
            aria-label="검색어 입력"
          />
          <button onClick={onClose} aria-label="검색 닫기" className="text-foreground/40 hover:text-foreground transition-colors">
            <X size={22} />
          </button>
        </div>

        {query.trim() === '' && (
          <div>
            <p className="font-pretendard text-[11px] tracking-[0.25em] text-muted-foreground mb-5 uppercase">
              인기 컬렉션
            </p>
            <div className="flex flex-wrap gap-3">
              {collections.map((col) => (
                <button
                  key={col.id}
                  onClick={() => setQuery(col.name)}
                  className="font-pretendard font-light text-[13px] tracking-wide text-foreground border border-border px-5 py-2 hover:border-foreground transition-colors duration-200"
                >
                  {col.name}
                </button>
              ))}
              {['EAU DE PARFUM', 'PARFUM DIFFUSER', 'PARFUM HAND CREAM'].map((t) => (
                <button
                  key={t}
                  onClick={() => setQuery(t)}
                  className="font-pretendard font-light text-[13px] tracking-wide text-muted-foreground border border-border px-5 py-2 hover:border-foreground hover:text-foreground transition-colors duration-200"
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        )}

        {query.trim() !== '' && (
          <div>
            <p className="font-pretendard text-[11px] tracking-[0.25em] text-muted-foreground mb-5 uppercase">
              {results.length > 0 ? `검색 결과 ${results.length}건` : '검색 결과가 없습니다'}
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
              {results.map((p) => (
                <Link
                  key={p.id}
                  to={`/collection/${p.id}`}
                  onClick={onClose}
                  className="group flex flex-col gap-3"
                  aria-label={`${p.name} 상세 보기`}
                >
                  <div className="relative aspect-[3/4] rounded-[14px] overflow-hidden bg-[#f5f3f0]">
                    <img
                      src={p.image}
                      alt={p.name}
                      className="w-full h-full object-cover transition-transform duration-400 group-hover:scale-[1.04]"
                    />
                  </div>
                  <div>
                    <p className="font-pretendard text-[10px] tracking-widest text-muted-foreground uppercase mb-0.5">
                      {p.type}
                    </p>
                    <p className="font-pretendard text-[14px] font-normal text-foreground">{p.name}</p>
                    <p className="font-pretendard font-medium text-[15px] text-foreground mt-1">{p.price}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
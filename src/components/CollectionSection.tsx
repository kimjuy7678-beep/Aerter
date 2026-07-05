import type { Collection } from '../types';
import { ProductGrid } from './ProductGrid';
import { useScrollReveal } from '../hooks/useScrollReveal';

interface CollectionSectionProps {
  collection: Collection;
}

export default function CollectionSection({ collection }: CollectionSectionProps) {
  const { ref: infoRef, visible: infoVisible } = useScrollReveal(0.08);
  const isLeft = collection.heroPosition === 'left';

  const infoPanel = (
    <div
      ref={infoRef}
      className={`flex flex-col w-full md:w-[55%] lg:w-[52%] transition-all duration-700 ${infoVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
        }`}
    >
      <div className="flex flex-col justify-center flex-1 px-10 md:px-14 lg:px-20 pt-14 pb-10">
        <p className="font-pretendard font-normal text-[18px] md:text-[22px] text-foreground mb-1 leading-snug">
          {collection.koreanName}
        </p>
        <h2 className="font-cormorant font-normal text-[40px] md:text-[52px] lg:text-[58px] leading-none tracking-[0.02em] text-foreground mb-7">
          {collection.name}
        </h2>
        <div className="mb-5 max-w-[520px]">
          {collection.description.map((line, i) => (
            <p
              key={i}
              className="font-pretendard font-light text-[14px] md:text-[16px] leading-loose text-foreground"
            >
              {line}
            </p>
          ))}
        </div>
        <div className="flex gap-4 flex-wrap">
          {collection.tags.map((tag) => (
            <span key={tag} className="font-pretendard font-normal text-[14px] text-muted-foreground">
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div className="px-6 md:px-10 lg:px-14 pb-14">
        <ProductGrid products={collection.products} collection={collection} />
      </div>
    </div>
  );

  const heroImage = (
    <div className="relative w-full md:w-[45%] lg:w-[48%] overflow-hidden bg-[#e8e4de] min-h-[400px] md:min-h-0 self-stretch">
      <img
        src={collection.heroImage}
        alt={`${collection.name} — ${collection.koreanName} 라이프스타일 이미지`}
        className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700 hover:scale-[1.03]"
        loading="lazy"
      />
    </div>
  );

  return (
    <section
      id={collection.id}
      className="w-full mb-24 md:mb-36"
      aria-label={`${collection.name} 컬렉션`}
    >
      <div className="flex flex-col md:hidden">
        <div className="w-full h-[320px] overflow-hidden bg-[#e8e4de] relative">
          <img
            src={collection.heroImage}
            alt={`${collection.name} — ${collection.koreanName}`}
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
          />
        </div>
        <div className="px-6 pt-10 pb-6">
          <p className="font-pretendard font-normal text-[16px] text-foreground mb-1">{collection.koreanName}</p>
          <h2 className="font-cormorant font-normal text-[36px] leading-none text-foreground mb-5">{collection.name}</h2>
          {collection.description.map((line, i) => (
            <p key={i} className="font-pretendard font-light text-[13px] leading-loose text-foreground">{line}</p>
          ))}
          <div className="flex gap-3 mt-4 mb-8 flex-wrap">
            {collection.tags.map((tag) => (
              <span key={tag} className="font-pretendard text-[13px] text-muted-foreground">{tag}</span>
            ))}
          </div>
        </div>
        <div className="px-6 pb-12">
          <ProductGrid products={collection.products} collection={collection} />
        </div>
      </div>

      <div
        className={`hidden md:flex w-full ${isLeft ? '' : 'flex-row-reverse'}`}
        style={{ minHeight: '680px' }}
      >
        {heroImage}
        {infoPanel}
      </div>
    </section>
  );
}

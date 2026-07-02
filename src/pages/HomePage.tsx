import Hero from '../components/Hero';
import BrandIntro from '../components/BrandIntro';
import CollectionSection from '../components/CollectionSection';
import InstagramGallery from '../components/InstagramGallery';
import NewsletterSection from '../components/NewsletterSection';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { collections } from '../data/collections';
import { instagramPosts } from '../data/instagram';

function CollectionHeading() {
  const { ref, visible } = useScrollReveal(0.2);
  return (
    <div
      ref={ref}
      className={`text-center py-20 md:py-28 px-6 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
    >
      <h2 className="font-cormorant font-bold text-[29px] md:text-[45px] lg:text-[55px] tracking-[0.04em] text-foreground">
        THE SIGNATURE COLLECTION
      </h2>
    </div>
  );
}

export default function HomePage() {
  return (
    <>
      <Hero />
      <BrandIntro />
      <section id="collection" aria-label="시그니처 컬렉션">
        <CollectionHeading />
        {collections.map((collection) => (
          <CollectionSection key={collection.id} collection={collection} />
        ))}
      </section>
      <InstagramGallery posts={instagramPosts} />
      <NewsletterSection />
    </>
  );
}

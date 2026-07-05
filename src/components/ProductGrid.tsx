import type { Product, Collection } from '../types';
import { ProductCard } from './ProductCard';

interface ProductGridProps {
  products: Product[];
  collection: Collection;
}

export function ProductGrid({ products, collection }: ProductGridProps) {
  return (
    <div
      className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4 w-full"
      role="list"
      aria-label="제품 목록"
    >
      {products.map((product) => (
        <div key={product.id} role="listitem">
          <ProductCard product={product} collection={collection} />
        </div>
      ))}
    </div>
  );
}
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { getBestSellers } from '@/data/products';
import { ProductCard } from '@/components/products/ProductCard';

export function BestSellers() {
  const products = getBestSellers();

  return (
    <section className="section-padding">
      <div className="container-shop">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold">Best Sellers</h2>
            <p className="text-muted-foreground mt-1">
              Customer favorites this month
            </p>
          </div>
          <Link
            to="/shop?filter=bestsellers"
            className="hidden sm:flex items-center gap-2 text-sm font-medium text-accent hover:underline"
          >
            View All <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="product-grid">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}

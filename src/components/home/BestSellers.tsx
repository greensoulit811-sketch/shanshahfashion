import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useBestSellers } from '@/hooks/useShopData';
import { useSiteSettings } from '@/contexts/SiteSettingsContext';
import { ProductCard } from '@/components/products/ProductCard';

export function BestSellers() {
  const { data: products = [], isLoading } = useBestSellers();
  const { t } = useSiteSettings();

  if (isLoading) {
    return (
      <section className="section-padding">
        <div className="container-shop">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold">{t('home.bestSellers')}</h2>
              <p className="text-muted-foreground mt-1">Customer favorites this month</p>
            </div>
          </div>
          <div className="product-grid">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-product rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) return null;

  return (
    <section className="section-padding">
      <div className="container-shop">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold">{t('home.bestSellers')}</h2>
            <p className="text-muted-foreground mt-1">Customer favorites this month</p>
          </div>
          <Link
            to="/shop?filter=bestsellers"
            className="hidden sm:flex items-center gap-2 text-sm font-medium text-accent hover:underline"
          >
            {t('common.viewAll')} <ArrowRight className="h-4 w-4" />
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

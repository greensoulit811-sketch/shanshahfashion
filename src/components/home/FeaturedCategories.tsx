import { Link } from 'react-router-dom';
import { useCategories } from '@/hooks/useShopData';
import { useSiteSettings } from '@/contexts/SiteSettingsContext';
import { ArrowRight } from 'lucide-react';

export function FeaturedCategories() {
  const { data: categories = [], isLoading } = useCategories();
  const { t } = useSiteSettings();

  if (isLoading) {
    return (
      <section className="section-padding">
        <div className="container-shop">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold">{t('home.shopByCategory')}</h2>
              <p className="text-muted-foreground mt-1">Find what you're looking for</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-square rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section-padding">
      <div className="container-shop">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold">{t('home.shopByCategory')}</h2>
            <p className="text-muted-foreground mt-1">Find what you're looking for</p>
          </div>
          <Link
            to="/categories"
            className="hidden sm:flex items-center gap-2 text-sm font-medium text-accent hover:underline"
          >
            {t('common.viewAll')} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {categories.map((category) => (
            <Link
              key={category.id}
              to={`/category/${category.slug}`}
              className="category-card group"
            >
              <img
                src={category.image}
                alt={category.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="category-card-content">
                <h3 className="text-lg md:text-xl font-semibold">{category.name}</h3>
              </div>
            </Link>
          ))}
        </div>

        <Link
          to="/categories"
          className="mt-6 flex sm:hidden items-center justify-center gap-2 text-sm font-medium text-accent hover:underline"
        >
          {t('common.viewAll')} {t('nav.categories')} <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}

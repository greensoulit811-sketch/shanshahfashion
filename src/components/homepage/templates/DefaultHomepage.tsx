import { Layout } from '@/components/layout/Layout';
import { HeroSlider } from '@/components/home/HeroSlider';
import { FeaturedCategories } from '@/components/home/FeaturedCategories';
import { FeaturedProducts } from '@/components/home/FeaturedProducts';
import { BestSellers } from '@/components/home/BestSellers';

import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useNewArrivals } from '@/hooks/useShopData';
import { ProductCard } from '@/components/products/ProductCard';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import type { HomepageSection } from '@/hooks/useHomepageTemplates';

const SECTION_COMPONENTS: Record<string, React.ComponentType<{ section: HomepageSection }>> = {
  hero_slider: () => <HeroSlider />,
  featured_categories: () => <FeaturedCategories />,
  featured_products: () => <FeaturedProducts />,
  best_sellers: () => <BestSellers />,
  
};

function NewArrivalsSection({ section }: { section: HomepageSection }) {
  const { data: newArrivals = [] } = useNewArrivals();
  const { ref, isVisible } = useScrollReveal();

  if (newArrivals.length === 0) return null;

  return (
    <section className="section-padding" ref={ref}>
      <div className="container-shop">
        <div className={`flex items-center justify-between mb-8 reveal-left ${isVisible ? 'reveal-visible' : ''}`}>
          <div>
            <h2 className="text-2xl md:text-3xl font-bold">{section.title || 'New Arrivals'}</h2>
            <p className="text-muted-foreground mt-1">{section.subtitle || 'Fresh styles just landed'}</p>
          </div>
          <Link to="/shop?filter=new" className="hidden sm:flex items-center gap-2 text-sm font-medium text-accent hover:underline">
            View All <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="product-grid">
          {newArrivals.map((product, index) => (
            <div key={product.id} className={`reveal-base stagger-${index + 1} ${isVisible ? 'reveal-visible' : ''}`}>
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function NewsletterSection({ section }: { section: HomepageSection }) {
  const { ref, isVisible } = useScrollReveal();
  return (
    <section className="section-padding bg-secondary/50" ref={ref}>
      <div className="container-shop">
        <div className={`max-w-2xl mx-auto text-center reveal-scale ${isVisible ? 'reveal-visible' : ''}`}>
          <h2 className="text-2xl md:text-3xl font-bold mb-4">{section.title || 'Stay in the Loop'}</h2>
          <p className="text-muted-foreground mb-8">{section.subtitle || 'Subscribe to our newsletter for exclusive offers and new arrivals'}</p>
          <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input type="email" placeholder="Enter your email" className="input-shop flex-1" />
            <button type="submit" className="btn-accent px-6 py-3 rounded-lg font-medium">Subscribe</button>
          </form>
        </div>
      </div>
    </section>
  );
}

export function DefaultHomepage({ sections }: { sections: HomepageSection[] }) {
  return (
    <Layout>
      {sections.map((section) => {
        if (section.section_type === 'new_arrivals') {
          return <NewArrivalsSection key={section.id} section={section} />;
        }
        if (section.section_type === 'newsletter') {
          return <NewsletterSection key={section.id} section={section} />;
        }
        const Component = SECTION_COMPONENTS[section.section_type];
        if (Component) return <Component key={section.id} section={section} />;
        return null;
      })}
    </Layout>
  );
}

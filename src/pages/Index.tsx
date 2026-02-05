import { Layout } from '@/components/layout/Layout';
import { HeroSlider } from '@/components/home/HeroSlider';
import { FeaturedCategories } from '@/components/home/FeaturedCategories';
import { FeaturedProducts } from '@/components/home/FeaturedProducts';
import { BestSellers } from '@/components/home/BestSellers';
import { CustomerReviews } from '@/components/home/CustomerReviews';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useNewArrivals } from '@/hooks/useShopData';
import { ProductCard } from '@/components/products/ProductCard';

const Index = () => {
  const { data: newArrivals = [], isLoading } = useNewArrivals();

  return (
    <Layout>
      {/* Hero Slider */}
      <HeroSlider />

      {/* Featured Categories */}
      <FeaturedCategories />

      {/* Featured Products */}
      <FeaturedProducts />

      {/* New Arrivals */}
      {newArrivals.length > 0 && (
        <section className="section-padding">
          <div className="container-shop">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold">New Arrivals</h2>
                <p className="text-muted-foreground mt-1">Fresh styles just landed</p>
              </div>
              <Link
                to="/shop?filter=new"
                className="hidden sm:flex items-center gap-2 text-sm font-medium text-accent hover:underline"
              >
                View All <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="product-grid">
              {newArrivals.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Best Sellers */}
      <BestSellers />

      {/* Customer Reviews */}
      <CustomerReviews />

      {/* Newsletter CTA */}
      <section className="section-padding bg-secondary/50">
        <div className="container-shop">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Stay in the Loop</h2>
            <p className="text-muted-foreground mb-8">
              Subscribe to our newsletter for exclusive offers and new arrivals
            </p>
            <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="input-shop flex-1"
              />
              <button type="submit" className="btn-accent px-6 py-3 rounded-lg font-medium">
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;

import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { categories } from '@/data/products';

export default function CategoriesPage() {
  return (
    <Layout>
      <div className="container-shop section-padding">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Categories</h1>
          <p className="text-muted-foreground">Browse our product categories</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <Link
              key={category.id}
              to={`/category/${category.slug}`}
              className="group relative overflow-hidden rounded-2xl aspect-[4/3]"
            >
              <img
                src={category.image}
                alt={category.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h2 className="text-2xl font-bold text-white mb-1">
                  {category.name}
                </h2>
                <p className="text-white/80">{category.productCount} Products</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </Layout>
  );
}

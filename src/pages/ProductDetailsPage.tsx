import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ChevronRight, Minus, Plus, ShoppingBag, Zap, Check } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { ProductCard } from '@/components/products/ProductCard';
import { useProduct, useRelatedProducts } from '@/hooks/useShopData';
import { useCart } from '@/contexts/CartContext';
import { useSiteSettings } from '@/contexts/SiteSettingsContext';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function ProductDetailsPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { t, formatCurrency } = useSiteSettings();
  const { data: product, isLoading } = useProduct(slug || '');
  const { data: relatedProducts = [] } = useRelatedProducts(product);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  if (isLoading) {
    return (
      <Layout>
        <div className="container-shop section-padding">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            <div className="aspect-square rounded-2xl bg-muted animate-pulse" />
            <div className="space-y-4">
              <div className="h-8 bg-muted rounded animate-pulse w-3/4" />
              <div className="h-6 bg-muted rounded animate-pulse w-1/2" />
              <div className="h-24 bg-muted rounded animate-pulse" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="container-shop section-padding text-center">
          <h1 className="text-2xl font-bold mb-4">{t('common.noResults')}</h1>
          <Link to="/shop" className="text-accent hover:underline">
            {t('cart.continueShopping')}
          </Link>
        </div>
      </Layout>
    );
  }

  const hasDiscount = product.sale_price && product.sale_price < product.price;

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      salePrice: product.sale_price ?? undefined,
      image: product.images[0] || '/placeholder.svg',
      quantity,
      stock: product.stock,
    });
    toast.success(t('product.addedToCart'), {
      description: `${quantity}x ${product.name}`,
    });
  };

  const handleBuyNow = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      salePrice: product.sale_price ?? undefined,
      image: product.images[0] || '/placeholder.svg',
      quantity,
      stock: product.stock,
    });
    navigate('/checkout?mode=buynow');
  };

  return (
    <Layout>
      <div className="container-shop section-padding">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <Link to="/" className="hover:text-foreground">{t('nav.home')}</Link>
          <ChevronRight className="h-4 w-4" />
          <Link to="/shop" className="hover:text-foreground">{t('nav.shop')}</Link>
          <ChevronRight className="h-4 w-4" />
          {product.category && (
            <>
              <Link to={`/category/${product.category.slug}`} className="hover:text-foreground">
                {product.category.name}
              </Link>
              <ChevronRight className="h-4 w-4" />
            </>
          )}
          <span className="text-foreground line-clamp-1">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Gallery */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="aspect-square rounded-2xl overflow-hidden bg-secondary">
              <img
                src={product.images[selectedImage] || '/placeholder.svg'}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            {/* Thumbnails */}
            {product.images.length > 1 && (
              <div className="flex gap-3">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                      selectedImage === index
                        ? 'border-accent'
                        : 'border-transparent'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="space-y-6">
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                {product.category?.name || t('product.uncategorized')}
              </p>
              <h1 className="text-3xl md:text-4xl font-bold mb-4">
                {product.name}
              </h1>

              {/* Price */}
              <div className="flex items-center gap-3">
                {hasDiscount ? (
                  <>
                    <span className="text-3xl font-bold text-accent">
                      {formatCurrency(product.sale_price!)}
                    </span>
                    <span className="text-xl text-muted-foreground line-through">
                      {formatCurrency(product.price)}
                    </span>
                    <span className="badge-sale px-2 py-1 text-sm font-semibold rounded">
                      Save {formatCurrency(product.price - product.sale_price!)}
                    </span>
                  </>
                ) : (
                  <span className="text-3xl font-bold">
                    {formatCurrency(product.price)}
                  </span>
                )}
              </div>
            </div>

            {/* Stock */}
            <div className="flex items-center gap-2">
              {product.stock > 0 ? (
                <>
                  <Check className="h-4 w-4 text-success" />
                  <span className="text-success font-medium">{t('product.inStock')}</span>
                  <span className="text-muted-foreground">
                    ({product.stock} available)
                  </span>
                </>
              ) : (
                <span className="text-destructive font-medium">{t('product.outOfStock')}</span>
              )}
            </div>

            {/* Short Description */}
            {product.short_description && (
              <p className="text-muted-foreground">{product.short_description}</p>
            )}

            {/* Quantity */}
            <div>
              <label className="text-sm font-medium mb-2 block">{t('product.quantity')}</label>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="text-lg font-medium w-12 text-center">
                  {quantity}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  disabled={quantity >= product.stock}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                variant="outline"
                className="flex-1"
                onClick={handleAddToCart}
                disabled={product.stock === 0}
              >
                <ShoppingBag className="h-5 w-5 mr-2" />
                {t('product.addToCart')}
              </Button>
              <Button
                size="lg"
                className="btn-accent flex-1"
                onClick={handleBuyNow}
                disabled={product.stock === 0}
              >
                <Zap className="h-5 w-5 mr-2" />
                {t('product.buyNow')}
              </Button>
            </div>

            {/* SKU */}
            <p className="text-sm text-muted-foreground">
              {t('product.sku')}: {product.sku}
            </p>

            {/* Description */}
            {product.description && (
              <div className="pt-6 border-t border-border">
                <h3 className="font-semibold mb-3">{t('product.description')}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {product.description}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mt-16 pt-12 border-t border-border">
            <h2 className="text-2xl font-bold mb-8">{t('product.relatedProducts')}</h2>
            <div className="product-grid">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </Layout>
  );
}

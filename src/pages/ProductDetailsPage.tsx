import { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ChevronRight, Minus, Plus, ShoppingBag, Zap, Check, Loader2 } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { ProductCard } from '@/components/products/ProductCard';
import { VariantSelector } from '@/components/products/VariantSelector';
import { WishlistButton } from '@/components/products/WishlistButton';
import { ReviewForm } from '@/components/reviews/ReviewForm';
import { ReviewList } from '@/components/reviews/ReviewList';
import { useProduct, useRelatedProducts } from '@/hooks/useShopData';
import { useProductVariants, ProductVariant } from '@/hooks/useVariants';
import { useProductReviews } from '@/hooks/useProductReviews';
import { useCart } from '@/contexts/CartContext';
import { useSiteSettings } from '@/contexts/SiteSettingsContext';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { trackViewContent, trackAddToCart } from '@/lib/facebook-pixel';
import { useIsMobile } from '@/hooks/use-mobile';

export default function ProductDetailsPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { t, formatCurrency, settings } = useSiteSettings();
  const { data: product, isLoading } = useProduct(slug || '');
  const { data: relatedProducts = [] } = useRelatedProducts(product);
  const { data: variants = [] } = useProductVariants(product?.id || '');
  const { data: reviews = [] } = useProductReviews(product?.id || '', true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isBuyingNow, setIsBuyingNow] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const isMobile = useIsMobile();

  // Track ViewContent when product loads
  useEffect(() => {
    if (product) {
      trackViewContent({
        contentId: product.id,
        contentName: product.name,
        value: product.sale_price || product.price,
        currency: settings.currency_code,
      });
    }
  }, [product, settings.currency_code]);

  // Auto-select first available variant
  useEffect(() => {
    if (variants.length > 0 && !selectedVariant) {
      const availableVariant = variants.find(v => v.is_active && v.stock > 0);
      if (availableVariant) setSelectedVariant(availableVariant);
    }
  }, [variants, selectedVariant]);

  // Calculate effective price and stock based on selected variant
  const effectivePrice = useMemo(() => {
    if (selectedVariant) {
      const basePrice = product?.sale_price || product?.price || 0;
      return basePrice + (selectedVariant.price_adjustment || 0);
    }
    return product?.sale_price || product?.price || 0;
  }, [product, selectedVariant]);

  const effectiveStock = selectedVariant?.stock ?? product?.stock ?? 0;
  const hasVariants = variants.length > 0;

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

  const handleAddToCart = async () => {
    if (hasVariants && !selectedVariant) {
      toast.error('Please select size/color');
      return;
    }
    
    setIsAddingToCart(true);
    
    // Brief delay for visual feedback
    await new Promise(resolve => setTimeout(resolve, 300));
    
    addItem({
      id: selectedVariant ? `${product.id}-${selectedVariant.id}` : product.id,
      name: selectedVariant
        ? `${product.name} (${[selectedVariant.size, selectedVariant.color].filter(Boolean).join(' / ')})`
        : product.name,
      price: product.price + (selectedVariant?.price_adjustment || 0),
      salePrice: product.sale_price
        ? product.sale_price + (selectedVariant?.price_adjustment || 0)
        : undefined,
      image: product.images[0] || '/placeholder.svg',
      quantity,
      stock: effectiveStock,
      variantId: selectedVariant?.id,
      variantInfo: selectedVariant
        ? { size: selectedVariant.size, color: selectedVariant.color }
        : undefined,
    });
    
    // Track AddToCart event
    trackAddToCart({
      contentId: product.id,
      contentName: product.name,
      value: effectivePrice * quantity,
      currency: settings.currency_code,
      quantity,
    });
    
    toast.success(t('product.addedToCart'), {
      description: `${quantity}x ${product.name}`,
    });
    
    setIsAddingToCart(false);
  };

  const handleBuyNow = async () => {
    if (hasVariants && !selectedVariant) {
      toast.error('Please select size/color');
      return;
    }
    
    setIsBuyingNow(true);
    
    addItem({
      id: selectedVariant ? `${product.id}-${selectedVariant.id}` : product.id,
      name: selectedVariant
        ? `${product.name} (${[selectedVariant.size, selectedVariant.color].filter(Boolean).join(' / ')})`
        : product.name,
      price: product.price + (selectedVariant?.price_adjustment || 0),
      salePrice: product.sale_price
        ? product.sale_price + (selectedVariant?.price_adjustment || 0)
        : undefined,
      image: product.images[0] || '/placeholder.svg',
      quantity,
      stock: effectiveStock,
      variantId: selectedVariant?.id,
      variantInfo: selectedVariant
        ? { size: selectedVariant.size, color: selectedVariant.color }
        : undefined,
    });
    
    // Track AddToCart event for buy now as well
    trackAddToCart({
      contentId: product.id,
      contentName: product.name,
      value: effectivePrice * quantity,
      currency: settings.currency_code,
      quantity,
    });
    
    navigate('/checkout?mode=buynow');
  };

  return (
    <Layout>
      <div className={`container-shop section-padding ${isMobile ? 'pb-24' : ''}`}>
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
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {product.category?.name || t('product.uncategorized')}
                  </p>
                  <h1 className="text-3xl md:text-4xl font-bold mb-4">
                    {product.name}
                  </h1>
                </div>
                <WishlistButton productId={product.id} size="md" />
              </div>

              {/* Price */}
              <div className="flex items-center gap-3">
                {hasDiscount ? (
                  <>
                    <span className="text-3xl font-bold text-accent">
                      {formatCurrency(effectivePrice)}
                    </span>
                    <span className="text-xl text-muted-foreground line-through">
                      {formatCurrency(product.price + (selectedVariant?.price_adjustment || 0))}
                    </span>
                    <span className="badge-sale px-2 py-1 text-sm font-semibold rounded">
                      Save {formatCurrency(product.price - product.sale_price!)}
                    </span>
                  </>
                ) : (
                  <span className="text-3xl font-bold">
                    {formatCurrency(effectivePrice)}
                  </span>
                )}
              </div>
            </div>

            {/* Variant Selector */}
            {hasVariants && (
              <VariantSelector
                variants={variants.filter(v => v.is_active)}
                selectedVariant={selectedVariant}
                onSelect={setSelectedVariant}
              />
            )}

            {/* Stock */}
            <div className="flex items-center gap-2">
              {effectiveStock > 0 ? (
                <>
                  <Check className="h-4 w-4 text-success" />
                  <span className="text-success font-medium">{t('product.inStock')}</span>
                  <span className="text-muted-foreground">
                    ({effectiveStock} available)
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
                  onClick={() => setQuantity(Math.min(effectiveStock, quantity + 1))}
                  disabled={quantity >= effectiveStock}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Actions - Hidden on mobile since we use sticky bar */}
            <div className="hidden md:flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                variant="outline"
                className="flex-1"
                onClick={handleAddToCart}
                disabled={isAddingToCart || effectiveStock === 0 || (hasVariants && !selectedVariant)}
              >
                {isAddingToCart ? (
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                ) : (
                  <ShoppingBag className="h-5 w-5 mr-2" />
                )}
                {t('product.addToCart')}
              </Button>
              <Button
                size="lg"
                className="btn-accent flex-1"
                onClick={handleBuyNow}
                disabled={isBuyingNow || effectiveStock === 0 || (hasVariants && !selectedVariant)}
              >
                {isBuyingNow ? (
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                ) : (
                  <Zap className="h-5 w-5 mr-2" />
                )}
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

        {/* Customer Reviews Section */}
        <section className="mt-16 pt-12 border-t border-border">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold">Customer Reviews</h2>
            <Button
              variant="outline"
              onClick={() => setShowReviewForm(!showReviewForm)}
            >
              {showReviewForm ? 'Cancel' : 'Write a Review'}
            </Button>
          </div>

          {showReviewForm && (
            <div className="bg-card rounded-xl border border-border p-6 mb-8">
              <ReviewForm
                productId={product.id}
                productName={product.name}
                onSuccess={() => setShowReviewForm(false)}
              />
            </div>
          )}

          <ReviewList reviews={reviews} />
        </section>
      </div>

      {/* Mobile Sticky Action Bar */}
      {isMobile && product && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] md:hidden">
          <div className="flex gap-3 max-w-7xl mx-auto">
            <Button
              variant="outline"
              className="flex-1 h-14 text-sm font-medium"
              onClick={handleAddToCart}
              disabled={isAddingToCart || effectiveStock === 0 || (hasVariants && !selectedVariant)}
              aria-label={t('product.addToCart')}
            >
              {isAddingToCart ? (
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              ) : (
                <ShoppingBag className="h-5 w-5 mr-2" />
              )}
              {t('product.addToCart')}
            </Button>
            <Button
              className="btn-accent flex-1 h-14 text-sm font-medium"
              onClick={handleBuyNow}
              disabled={isBuyingNow || effectiveStock === 0 || (hasVariants && !selectedVariant)}
              aria-label={t('product.buyNow')}
            >
              {isBuyingNow ? (
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              ) : (
                <Zap className="h-5 w-5 mr-2" />
              )}
              {t('product.buyNow')}
            </Button>
          </div>
        </div>
      )}
    </Layout>
  );
}

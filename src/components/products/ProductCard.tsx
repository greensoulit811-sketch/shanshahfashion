import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Zap, Loader2 } from 'lucide-react';
import { Product, Category } from '@/hooks/useShopData';
import { useCart } from '@/contexts/CartContext';
import { useSiteSettings } from '@/contexts/SiteSettingsContext';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface ProductCardProps {
  product: Product & { category?: Category | null };
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const { t, formatCurrency } = useSiteSettings();
  const navigate = useNavigate();
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isBuyingNow, setIsBuyingNow] = useState(false);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsAddingToCart(true);
    
    // Simulate brief loading state for feedback
    await new Promise(resolve => setTimeout(resolve, 300));
    
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      salePrice: product.sale_price ?? undefined,
      image: product.images[0] || '/placeholder.svg',
      quantity: 1,
      stock: product.stock,
    });
    
    toast.success(t('product.addedToCart'), {
      description: product.name,
    });
    
    setIsAddingToCart(false);
  };

  const handleBuyNow = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsBuyingNow(true);
    
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      salePrice: product.sale_price ?? undefined,
      image: product.images[0] || '/placeholder.svg',
      quantity: 1,
      stock: product.stock,
    });
    
    navigate('/checkout?mode=buynow');
  };

  const hasDiscount = product.sale_price && product.sale_price < product.price;
  const discountPercent = hasDiscount
    ? Math.round((1 - product.sale_price! / product.price) * 100)
    : 0;

  return (
    <div className="product-card group bg-card rounded-xl overflow-visible border border-border flex flex-col">
      <Link to={`/product/${product.slug}`} className="block">
        {/* Image */}
        <div className="relative aspect-product overflow-hidden bg-secondary rounded-t-xl">
          <img
            src={product.images[0] || '/placeholder.svg'}
            alt={product.name}
            className="product-image-zoom w-full h-full object-cover"
          />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
            {product.is_new && (
              <span className="badge-new px-2 py-1 text-xs font-semibold rounded">
                {t('product.new')}
              </span>
            )}
            {hasDiscount && (
              <span className="badge-sale px-2 py-1 text-xs font-semibold rounded">
                -{discountPercent}%
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-3 md:p-4">
          <p className="text-xs text-muted-foreground mb-1">
            {product.category?.name || t('product.uncategorized')}
          </p>
          <h3 className="font-medium text-sm md:text-base line-clamp-2 mb-2 group-hover:text-accent transition-colors min-h-[2.5rem]">
            {product.name}
          </h3>
          <div className="flex items-center gap-2 flex-wrap">
            {hasDiscount ? (
              <>
                <span className="font-bold text-accent text-base md:text-lg">
                  {formatCurrency(product.sale_price!)}
                </span>
                <span className="text-xs md:text-sm text-muted-foreground line-through">
                  {formatCurrency(product.price)}
                </span>
              </>
            ) : (
              <span className="font-bold text-base md:text-lg">{formatCurrency(product.price)}</span>
            )}
          </div>
        </div>
      </Link>

      {/* Action Buttons - Always visible */}
      <div className="p-3 md:p-4 pt-0 mt-auto">
        {/* Mobile: Stacked full-width buttons */}
        <div className="flex flex-col gap-2 md:hidden">
          <Button
            variant="outline"
            className="w-full h-11 text-sm font-medium"
            onClick={handleAddToCart}
            disabled={isAddingToCart || product.stock === 0}
            aria-label={t('product.addToCart')}
          >
            {isAddingToCart ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <ShoppingBag className="h-4 w-4 mr-2" />
            )}
            {t('product.addToCart')}
          </Button>
          <Button
            className="btn-accent w-full h-11 text-sm font-medium"
            onClick={handleBuyNow}
            disabled={isBuyingNow || product.stock === 0}
            aria-label={t('product.buyNow')}
          >
            {isBuyingNow ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Zap className="h-4 w-4 mr-2" />
            )}
            {t('product.buyNow')}
          </Button>
        </div>
        
        {/* Desktop: Side-by-side buttons */}
        <div className="hidden md:flex gap-2">
          <Button
            size="sm"
            variant="outline"
            className="flex-1 text-xs"
            onClick={handleAddToCart}
            disabled={isAddingToCart || product.stock === 0}
            aria-label={t('product.addToCart')}
          >
            {isAddingToCart ? (
              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
            ) : (
              <ShoppingBag className="h-3 w-3 mr-1" />
            )}
            {t('product.addToCart')}
          </Button>
          <Button
            size="sm"
            className="btn-accent flex-1 text-xs"
            onClick={handleBuyNow}
            disabled={isBuyingNow || product.stock === 0}
            aria-label={t('product.buyNow')}
          >
            {isBuyingNow ? (
              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
            ) : (
              <Zap className="h-3 w-3 mr-1" />
            )}
            {t('product.buyNow')}
          </Button>
        </div>
      </div>
    </div>
  );
}

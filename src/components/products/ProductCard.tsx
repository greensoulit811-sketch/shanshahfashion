import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Zap, Loader2 } from 'lucide-react';
import { Product, Category } from '@/hooks/useShopData';
import { useCart } from '@/contexts/CartContext';
import { useSiteSettings } from '@/contexts/SiteSettingsContext';
import { Button } from '@/components/ui/button';
import { WishlistButton } from '@/components/products/WishlistButton';
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

    // If product has variants, redirect to product page for selection
    if (product.has_variants) {
      toast.info('Please select size/color options');
      navigate(`/product/${product.slug}`);
      return;
    }

    setIsAddingToCart(true);
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

    // If product has variants, redirect to product page for selection
    if (product.has_variants) {
      toast.info('Please select size/color options');
      navigate(`/product/${product.slug}`);
      return;
    }

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
    <div className="product-card group bg-card rounded-xl border border-border flex flex-col h-full">
      <Link to={`/product/${product.slug}`} className="block flex-1">
        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-secondary rounded-t-xl">
          <img
            src={product.images[0] || '/placeholder.svg'}
            alt={product.name}
            className="product-image-zoom w-full h-full object-cover"
          />

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1.5 z-10">
            {product.is_new && (
              <span className="badge-new px-2 py-0.5 text-[10px] font-semibold rounded">
                {t('product.new')}
              </span>
            )}
            {hasDiscount && (
              <span className="badge-sale px-2 py-0.5 text-[10px] font-semibold rounded">
                -{discountPercent}%
              </span>
            )}
          </div>
          
          {/* Wishlist Button */}
          <div className="absolute top-2 right-2 z-10">
            <WishlistButton productId={product.id} size="sm" className="bg-background/80 backdrop-blur-sm" />
          </div>
        </div>

        {/* Content */}
        <div className="p-3">
          <p className="text-[10px] text-muted-foreground mb-0.5 uppercase tracking-wide">
            {product.category?.name || t('product.uncategorized')}
          </p>
          <h3 className="font-medium text-sm line-clamp-2 mb-1.5 group-hover:text-accent transition-colors leading-tight">
            {product.name}
          </h3>
          <div className="flex items-center gap-1.5 flex-wrap">
            {hasDiscount ? (
              <>
                <span className="font-bold text-accent text-sm">
                  {formatCurrency(product.sale_price!)}
                </span>
                <span className="text-[10px] text-muted-foreground line-through">
                  {formatCurrency(product.price)}
                </span>
              </>
            ) : (
              <span className="font-bold text-sm">{formatCurrency(product.price)}</span>
            )}
          </div>
        </div>
      </Link>

      {/* Action Buttons */}
      <div className="p-3 pt-0 mt-auto space-y-2">
        <Button
          variant="outline"
          size="sm"
          className="w-full h-9 text-xs font-medium"
          onClick={handleAddToCart}
          disabled={isAddingToCart || product.stock === 0}
          aria-label={product.has_variants ? t('product.selectOptions') || 'Select Options' : t('product.addToCart')}
        >
          {isAddingToCart ? (
            <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
          ) : (
            <ShoppingBag className="h-3.5 w-3.5 mr-1.5" />
          )}
          {product.has_variants ? 'Select Options' : t('product.addToCart')}
        </Button>
        <Button
          size="sm"
          className="btn-accent w-full h-9 text-xs font-medium"
          onClick={handleBuyNow}
          disabled={isBuyingNow || product.stock === 0}
          aria-label={t('product.buyNow')}
        >
          {isBuyingNow ? (
            <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
          ) : (
            <Zap className="h-3.5 w-3.5 mr-1.5" />
          )}
          {t('product.buyNow')}
        </Button>
      </div>
    </div>
  );
}
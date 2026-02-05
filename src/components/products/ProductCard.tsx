import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Zap } from 'lucide-react';
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

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
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
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
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
    <div className="product-card group bg-card rounded-xl overflow-hidden border border-border">
      <Link to={`/product/${product.slug}`}>
        {/* Image */}
        <div className="relative aspect-product overflow-hidden bg-secondary">
          <img
            src={product.images[0] || '/placeholder.svg'}
            alt={product.name}
            className="product-image-zoom w-full h-full object-cover"
          />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
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
        <div className="p-4">
          <p className="text-xs text-muted-foreground mb-1">
            {product.category?.name || t('product.uncategorized')}
          </p>
          <h3 className="font-medium text-sm md:text-base line-clamp-2 mb-2 group-hover:text-accent transition-colors">
            {product.name}
          </h3>
          <div className="flex items-center gap-2">
            {hasDiscount ? (
              <>
                <span className="font-bold text-accent">
                  {formatCurrency(product.sale_price!)}
                </span>
                <span className="text-sm text-muted-foreground line-through">
                  {formatCurrency(product.price)}
                </span>
              </>
            ) : (
              <span className="font-bold">{formatCurrency(product.price)}</span>
            )}
          </div>
        </div>
      </Link>

      {/* Action buttons - always visible */}
      <div className="px-4 pb-4 flex gap-2">
        <Button
          size="sm"
          variant="outline"
          className="flex-1 text-xs"
          onClick={handleAddToCart}
        >
          <ShoppingBag className="h-3 w-3 mr-1" />
          {t('common.cart')}
        </Button>
        <Button
          size="sm"
          className="btn-accent flex-1 text-xs"
          onClick={handleBuyNow}
        >
          <Zap className="h-3 w-3 mr-1" />
          {t('product.buyNow')}
        </Button>
      </div>
    </div>
  );
}

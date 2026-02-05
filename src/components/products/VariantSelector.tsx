import { ProductVariant } from '@/hooks/useVariants';
import { cn } from '@/lib/utils';

interface VariantSelectorProps {
  variants: ProductVariant[];
  selectedVariant: ProductVariant | null;
  onSelect: (variant: ProductVariant) => void;
}

export function VariantSelector({ variants, selectedVariant, onSelect }: VariantSelectorProps) {
  // Group variants by attribute
  const sizes = [...new Set(variants.filter(v => v.size).map(v => v.size))];
  const colors = [...new Set(variants.filter(v => v.color).map(v => v.color))];
  
  const selectedSize = selectedVariant?.size || null;
  const selectedColor = selectedVariant?.color || null;

  const handleSizeSelect = (size: string) => {
    const variant = variants.find(
      v => v.size === size && (colors.length === 0 || v.color === selectedColor || !selectedColor)
    );
    if (variant) onSelect(variant);
  };

  const handleColorSelect = (color: string) => {
    const variant = variants.find(
      v => v.color === color && (sizes.length === 0 || v.size === selectedSize || !selectedSize)
    );
    if (variant) onSelect(variant);
  };

  const isVariantAvailable = (size?: string | null, color?: string | null) => {
    return variants.some(
      v => (!size || v.size === size) && (!color || v.color === color) && v.stock > 0 && v.is_active
    );
  };

  return (
    <div className="space-y-4">
      {/* Size Selector */}
      {sizes.length > 0 && (
        <div>
          <label className="text-sm font-medium mb-2 block">Size</label>
          <div className="flex flex-wrap gap-2">
            {sizes.map((size) => {
              const available = isVariantAvailable(size, selectedColor);
              return (
                <button
                  key={size}
                  onClick={() => handleSizeSelect(size!)}
                  disabled={!available}
                  className={cn(
                    "min-w-[44px] h-11 px-4 rounded-lg border text-sm font-medium transition-colors",
                    selectedSize === size
                      ? "border-accent bg-accent text-accent-foreground"
                      : available
                      ? "border-border hover:border-accent"
                      : "border-border opacity-40 cursor-not-allowed line-through"
                  )}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Color Selector */}
      {colors.length > 0 && (
        <div>
          <label className="text-sm font-medium mb-2 block">
            Color{selectedColor && <span className="text-muted-foreground ml-2">({selectedColor})</span>}
          </label>
          <div className="flex flex-wrap gap-2">
            {colors.map((color) => {
              const available = isVariantAvailable(selectedSize, color);
              return (
                <button
                  key={color}
                  onClick={() => handleColorSelect(color!)}
                  disabled={!available}
                  title={color!}
                  className={cn(
                    "min-w-[44px] h-11 px-4 rounded-lg border text-sm font-medium transition-colors",
                    selectedColor === color
                      ? "border-accent bg-accent text-accent-foreground"
                      : available
                      ? "border-border hover:border-accent"
                      : "border-border opacity-40 cursor-not-allowed line-through"
                  )}
                >
                  {color}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

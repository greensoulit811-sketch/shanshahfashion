import { ProductVariant } from '@/hooks/useVariants';
import { cn } from '@/lib/utils';

interface VariantSelectorProps {
  variants: ProductVariant[];
  selectedVariant: ProductVariant | null;
  onSelect: (variant: ProductVariant) => void;
}

export function VariantSelector({ variants, selectedVariant, onSelect }: VariantSelectorProps) {
  const sizes = [...new Set(variants.filter(v => v.size).map(v => v.size))];
  
  // Split comma-separated colors into individual options
  const colors = [...new Set(
    variants
      .filter(v => v.color)
      .flatMap(v => v.color!.split(',').map(c => c.trim()))
      .filter(Boolean)
  )];
  
  const selectedSize = selectedVariant?.size || null;
  const selectedColors = selectedVariant?.color?.split(',').map(c => c.trim()) || [];

  const handleSizeSelect = (size: string) => {
    const variant = variants.find(
      v => v.size === size && (colors.length === 0 || (selectedColors.length > 0 && v.color?.split(',').map(c => c.trim()).some(c => selectedColors.includes(c))) || selectedColors.length === 0)
    );
    if (variant) onSelect(variant);
  };

  const handleColorSelect = (color: string) => {
    // Find variant that contains this color
    const variant = variants.find(
      v => v.color?.split(',').map(c => c.trim()).includes(color) && (sizes.length === 0 || v.size === selectedSize || !selectedSize)
    );
    if (variant) onSelect(variant);
  };

  const isVariantAvailable = (size?: string | null, color?: string | null) => {
    return variants.some(
      v => (!size || v.size === size) && (!color || v.color?.split(',').map(c => c.trim()).includes(color)) && v.stock > 0 && v.is_active
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
              const available = isVariantAvailable(size, null);
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
            Color{selectedColors.length > 0 && <span className="text-muted-foreground ml-2">({selectedColors.join(', ')})</span>}
          </label>
          <div className="flex flex-wrap gap-2">
            {colors.map((color) => {
              const available = isVariantAvailable(selectedSize, color);
              const isSelected = selectedColors.includes(color);
              return (
                <button
                  key={color}
                  onClick={() => handleColorSelect(color)}
                  disabled={!available}
                  title={color}
                  className={cn(
                    "min-w-[44px] h-11 px-4 rounded-lg border text-sm font-medium transition-colors",
                    isSelected
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

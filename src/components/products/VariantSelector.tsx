import { useState } from 'react';
import { ProductVariant } from '@/hooks/useVariants';
import { cn } from '@/lib/utils';

interface VariantSelectorProps {
  variants: ProductVariant[];
  selectedVariant: ProductVariant | null;
  onSelect: (variant: ProductVariant) => void;
}

export function VariantSelector({ variants, selectedVariant, onSelect }: VariantSelectorProps) {
  const [selectedColor, setSelectedColor] = useState<string | null>(null);

  const sizes = [...new Set(variants.filter(v => v.size).map(v => v.size))];
  const selectedSize = selectedVariant?.size || null;

  // Get colors available for the currently selected variant
  const colorsForSelectedVariant = selectedVariant?.color
    ? selectedVariant.color.split(',').map(c => c.trim()).filter(Boolean)
    : [];

  // Get all unique colors across all variants
  const allColors = [...new Set(
    variants
      .filter(v => v.color)
      .flatMap(v => v.color!.split(',').map(c => c.trim()))
      .filter(Boolean)
  )];

  const handleSizeSelect = (size: string) => {
    // Find variant matching the size, prefer one that also has the selected color
    const variantWithColor = selectedColor
      ? variants.find(v => v.size === size && v.color?.split(',').map(c => c.trim()).includes(selectedColor) && v.is_active && v.stock > 0)
      : null;
    const variant = variantWithColor || variants.find(v => v.size === size && v.is_active && v.stock > 0)
      || variants.find(v => v.size === size);
    
    if (variant) {
      onSelect(variant);
      // Reset color selection if the new variant doesn't have the selected color
      const newColors = variant.color?.split(',').map(c => c.trim()) || [];
      if (selectedColor && !newColors.includes(selectedColor)) {
        setSelectedColor(newColors.length > 0 ? newColors[0] : null);
      }
    }
  };

  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
    // Find variant that contains this color, prefer one matching selected size
    const variantWithSize = selectedSize
      ? variants.find(v => v.color?.split(',').map(c => c.trim()).includes(color) && v.size === selectedSize && v.is_active && v.stock > 0)
      : null;
    const variant = variantWithSize
      || variants.find(v => v.color?.split(',').map(c => c.trim()).includes(color) && v.is_active && v.stock > 0)
      || variants.find(v => v.color?.split(',').map(c => c.trim()).includes(color));
    
    if (variant) onSelect(variant);
  };

  const isSizeAvailable = (size: string) => {
    return variants.some(v => v.size === size && v.stock > 0 && v.is_active);
  };

  const isColorAvailable = (color: string) => {
    return variants.some(
      v => v.color?.split(',').map(c => c.trim()).includes(color) && v.stock > 0 && v.is_active
        && (!selectedSize || v.size === selectedSize || !v.size)
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
              const available = isSizeAvailable(size!);
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

      {/* Color Selector - show colors available for current context */}
      {allColors.length > 0 && (
        <div>
          <label className="text-sm font-medium mb-2 block">
            Color{selectedColor && <span className="text-muted-foreground ml-2">({selectedColor})</span>}
          </label>
          <div className="flex flex-wrap gap-2">
            {allColors.map((color) => {
              const available = isColorAvailable(color);
              const isSelected = selectedColor === color || 
                (!selectedColor && colorsForSelectedVariant.includes(color) && colorsForSelectedVariant.length > 0);
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

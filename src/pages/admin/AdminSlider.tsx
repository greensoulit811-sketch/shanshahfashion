import { useState } from 'react';
import { Plus, Edit, Trash2, MoreHorizontal, GripVertical } from 'lucide-react';
import { sliderSlides as initialSlides, SliderSlide } from '@/data/products';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

export default function AdminSlider() {
  const [slides, setSlides] = useState<SliderSlide[]>(initialSlides);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState<SliderSlide | null>(null);

  const [formData, setFormData] = useState({
    image: '',
    heading: '',
    text: '',
    ctaText: '',
    ctaLink: '',
  });

  const handleEdit = (slide: SliderSlide) => {
    setEditingSlide(slide);
    setFormData({
      image: slide.image,
      heading: slide.heading,
      text: slide.text,
      ctaText: slide.ctaText,
      ctaLink: slide.ctaLink,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setSlides(slides.filter((s) => s.id !== id));
    toast.success('Slide deleted');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const slideData: SliderSlide = {
      id: editingSlide?.id || Date.now().toString(),
      image: formData.image,
      heading: formData.heading,
      text: formData.text,
      ctaText: formData.ctaText,
      ctaLink: formData.ctaLink,
    };

    if (editingSlide) {
      setSlides(slides.map((s) => (s.id === editingSlide.id ? slideData : s)));
      toast.success('Slide updated');
    } else {
      setSlides([...slides, slideData]);
      toast.success('Slide created');
    }

    setIsDialogOpen(false);
    setEditingSlide(null);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      image: '',
      heading: '',
      text: '',
      ctaText: '',
      ctaLink: '',
    });
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Hero Slider</h1>
          <p className="text-muted-foreground mt-1">
            Manage homepage hero slider images
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              className="btn-accent"
              onClick={() => {
                setEditingSlide(null);
                resetForm();
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Slide
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingSlide ? 'Edit Slide' : 'Add New Slide'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div>
                <label className="block text-sm font-medium mb-2">Image URL</label>
                <input
                  type="url"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="input-shop"
                  placeholder="https://..."
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Heading</label>
                <input
                  type="text"
                  value={formData.heading}
                  onChange={(e) => setFormData({ ...formData, heading: e.target.value })}
                  className="input-shop"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Text</label>
                <input
                  type="text"
                  value={formData.text}
                  onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                  className="input-shop"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">CTA Text</label>
                  <input
                    type="text"
                    value={formData.ctaText}
                    onChange={(e) => setFormData({ ...formData, ctaText: e.target.value })}
                    className="input-shop"
                    placeholder="Shop Now"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">CTA Link</label>
                  <input
                    type="text"
                    value={formData.ctaLink}
                    onChange={(e) => setFormData({ ...formData, ctaLink: e.target.value })}
                    className="input-shop"
                    placeholder="/shop"
                    required
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <Button type="submit" className="btn-accent flex-1">
                  {editingSlide ? 'Update Slide' : 'Create Slide'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Slides List */}
      <div className="space-y-4">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className="bg-card rounded-xl border border-border overflow-hidden"
          >
            <div className="flex flex-col sm:flex-row">
              {/* Image Preview */}
              <div className="sm:w-64 h-40 sm:h-auto shrink-0">
                <img
                  src={slide.image}
                  alt={slide.heading}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Content */}
              <div className="flex-1 p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="hidden sm:block text-muted-foreground">
                    <GripVertical className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Slide {index + 1}
                    </p>
                    <h3 className="font-semibold">{slide.heading}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {slide.text}
                    </p>
                    <p className="text-xs text-accent mt-2">
                      {slide.ctaText} → {slide.ctaLink}
                    </p>
                  </div>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleEdit(slide)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleDelete(slide.id)}
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        ))}
      </div>

      {slides.length === 0 && (
        <div className="text-center py-16 bg-card rounded-xl border border-border">
          <p className="text-muted-foreground">No slides yet. Add your first slide!</p>
        </div>
      )}
    </div>
  );
}

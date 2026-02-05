import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useSliderSlides } from '@/hooks/useShopData';
import { Button } from '@/components/ui/button';

export function HeroSlider() {
  const {
    data: slides = [],
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useSliderSlides();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isStuck, setIsStuck] = useState(false);

  const nextSlide = useCallback(() => {
    if (slides.length === 0) return;
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = () => {
    if (slides.length === 0) return;
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  useEffect(() => {
    if (!(isLoading || isFetching)) {
      setIsStuck(false);
      return;
    }

    const t = window.setTimeout(() => setIsStuck(true), 10000);
    return () => window.clearTimeout(t);
  }, [isLoading, isFetching]);

  useEffect(() => {
    if (slides.length === 0) return;
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, [nextSlide, slides.length]);

  if (isError) {
    return (
      <section className="relative overflow-hidden bg-secondary h-[60vh] md:h-[70vh] lg:h-[80vh]">
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center p-6">
          <p className="text-muted-foreground">
            Couldn’t load the slider. {error instanceof Error ? error.message : ''}
          </p>
          <Button className="btn-accent" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      </section>
    );
  }

  if (isLoading || isFetching) {
    return (
      <section className="relative overflow-hidden bg-secondary h-[60vh] md:h-[70vh] lg:h-[80vh]">
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent" />
          {isStuck && (
            <Button className="btn-accent" onClick={() => refetch()}>
              Loading too long — Retry
            </Button>
          )}
        </div>
      </section>
    );
  }

  if (slides.length === 0) {
    return (
      <section className="relative overflow-hidden bg-secondary h-[60vh] md:h-[70vh] lg:h-[80vh]">
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-muted-foreground">No slides configured</p>
        </div>
      </section>
    );
  }

  return (
    <section className="relative overflow-hidden bg-secondary">
      <div className="relative h-[60vh] md:h-[70vh] lg:h-[80vh]">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            {/* Background Image */}
            <div className="absolute inset-0">
              <img
                src={slide.image}
                alt={slide.heading}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/30 to-transparent" />
            </div>

            {/* Content */}
            <div className="relative container-shop h-full flex items-center">
              <div className="max-w-xl text-white">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 animate-fade-up">
                  {slide.heading}
                </h1>
                <p className="text-lg md:text-xl text-white/90 mb-8">
                  {slide.text}
                </p>
                <Link to={slide.cta_link}>
                  <Button size="lg" className="btn-accent text-base px-8">
                    {slide.cta_text}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-colors"
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-colors"
        aria-label="Next slide"
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`slider-dot ${index === currentSlide ? 'active' : ''}`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}

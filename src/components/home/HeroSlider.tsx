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
  const [direction, setDirection] = useState<'next' | 'prev'>('next');

  const nextSlide = useCallback(() => {
    if (slides.length === 0) return;
    setDirection('next');
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = () => {
    if (slides.length === 0) return;
    setDirection('prev');
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
            Couldn't load the slider. {error instanceof Error ? error.message : ''}
          </p>
          <Button className="btn-accent" onClick={() => refetch()}>Retry</Button>
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
            <Button className="btn-accent" onClick={() => refetch()}>Loading too long — Retry</Button>
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
        {slides.map((slide, index) => {
          const isActive = index === currentSlide;
          return (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-all duration-1000 ease-[cubic-bezier(0.4,0,0.2,1)] ${
                isActive
                  ? 'opacity-100 z-10 scale-100'
                  : 'opacity-0 z-0 scale-105'
              }`}
            >
              {/* Background Image with Ken Burns effect */}
              <div className="absolute inset-0">
                <img
                  src={slide.image}
                  alt={slide.heading}
                  className={`w-full h-full object-cover transition-transform duration-[8000ms] ease-linear ${
                    isActive ? 'scale-110' : 'scale-100'
                  }`}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              </div>

              {/* Content */}
              <div className="relative container-shop h-full flex items-center">
                <div className="max-w-xl">
                  <div
                    className={`transition-all duration-700 delay-300 ${
                      isActive
                        ? 'opacity-100 translate-y-0'
                        : direction === 'next'
                        ? 'opacity-0 translate-y-8'
                        : 'opacity-0 -translate-y-8'
                    }`}
                  >
                    <span className="inline-block text-accent text-sm font-semibold tracking-widest uppercase mb-4 px-4 py-1.5 rounded-full bg-accent/10 backdrop-blur-sm border border-accent/20">
                      {slide.cta_text}
                    </span>
                  </div>
                  <h1
                    className={`text-4xl md:text-5xl lg:text-6xl font-bold mb-5 text-white leading-tight transition-all duration-700 delay-500 ${
                      isActive
                        ? 'opacity-100 translate-y-0'
                        : direction === 'next'
                        ? 'opacity-0 translate-y-10'
                        : 'opacity-0 -translate-y-10'
                    }`}
                  >
                    {slide.heading}
                  </h1>
                  <p
                    className={`text-lg md:text-xl text-white/85 mb-8 leading-relaxed max-w-md transition-all duration-700 delay-700 ${
                      isActive
                        ? 'opacity-100 translate-y-0'
                        : direction === 'next'
                        ? 'opacity-0 translate-y-10'
                        : 'opacity-0 -translate-y-10'
                    }`}
                  >
                    {slide.text}
                  </p>
                  <div
                    className={`transition-all duration-700 delay-[900ms] ${
                      isActive
                        ? 'opacity-100 translate-y-0'
                        : 'opacity-0 translate-y-10'
                    }`}
                  >
                    <Link to={slide.cta_link}>
                      <Button
                        size="lg"
                        className="btn-accent text-base px-10 py-6 rounded-full shadow-lg shadow-accent/25 hover:shadow-xl hover:shadow-accent/30 hover:scale-105 transition-all duration-300"
                      >
                        Shop Now
                        <ChevronRight className="h-5 w-5 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white/25 hover:scale-110 transition-all duration-300"
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white/25 hover:scale-110 transition-all duration-300"
        aria-label="Next slide"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      {/* Progress Dots */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setDirection(index > currentSlide ? 'next' : 'prev');
              setCurrentSlide(index);
            }}
            className="group relative flex items-center justify-center"
            aria-label={`Go to slide ${index + 1}`}
          >
            <span
              className={`block rounded-full transition-all duration-500 ${
                index === currentSlide
                  ? 'w-10 h-3 bg-accent shadow-lg shadow-accent/40'
                  : 'w-3 h-3 bg-white/40 group-hover:bg-white/70'
              }`}
            />
          </button>
        ))}
      </div>

      {/* Slide Counter */}
      <div className="absolute bottom-8 right-8 z-20 text-white/60 text-sm font-medium tracking-wider hidden md:block">
        <span className="text-white text-lg font-bold">{String(currentSlide + 1).padStart(2, '0')}</span>
        <span className="mx-1">/</span>
        <span>{String(slides.length).padStart(2, '0')}</span>
      </div>
    </section>
  );
}

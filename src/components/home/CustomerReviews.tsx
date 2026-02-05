import { Star, Quote } from 'lucide-react';
import { useReviews } from '@/hooks/useShopData';

export function CustomerReviews() {
  const { data: reviews = [], isLoading } = useReviews();

  if (isLoading || reviews.length === 0) return null;

  return (
    <section className="section-padding bg-primary text-primary-foreground">
      <div className="container-shop">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold">What Our Customers Say</h2>
          <p className="text-primary-foreground/70 mt-2">
            Real reviews from real customers
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {reviews.slice(0, 3).map((review) => (
            <div
              key={review.id}
              className="bg-primary-foreground/5 backdrop-blur-sm rounded-xl p-6 border border-primary-foreground/10"
            >
              <Quote className="h-8 w-8 text-accent mb-4" />
              <p className="text-primary-foreground/90 mb-6 leading-relaxed">
                "{review.text}"
              </p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">{review.name}</p>
                  <div className="flex gap-0.5 mt-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < review.rating
                            ? 'text-accent fill-accent'
                            : 'text-primary-foreground/30'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-primary-foreground/50">
                  {new Date(review.created_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

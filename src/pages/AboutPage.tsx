import { Layout } from '@/components/layout/Layout';
import { Users, Award, Truck, Shield } from 'lucide-react';

export default function AboutPage() {
  return (
    <Layout>
      {/* Hero */}
      <section className="relative h-64 md:h-80 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1920&q=80"
          alt="About us"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="absolute inset-0 flex items-center justify-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white">About Us</h1>
        </div>
      </section>

      <div className="container-shop section-padding">
        {/* Story */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-2xl md:text-3xl font-bold mb-6">Our Story</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Founded in 2020, STORE began with a simple mission: to bring premium
            quality products to everyone at fair prices. We believe that great
            design and quality shouldn't be exclusive or expensive.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Today, we serve thousands of happy customers across Bangladesh,
            offering a curated selection of products that combine style,
            functionality, and value. Every item in our collection is carefully
            chosen to meet our high standards.
          </p>
        </div>

        {/* Values */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <div className="text-center p-6">
            <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
              <Award className="h-7 w-7 text-accent" />
            </div>
            <h3 className="font-semibold mb-2">Quality First</h3>
            <p className="text-sm text-muted-foreground">
              We never compromise on quality. Every product is carefully vetted.
            </p>
          </div>
          <div className="text-center p-6">
            <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
              <Users className="h-7 w-7 text-accent" />
            </div>
            <h3 className="font-semibold mb-2">Customer Focus</h3>
            <p className="text-sm text-muted-foreground">
              Your satisfaction is our priority. We're here to help.
            </p>
          </div>
          <div className="text-center p-6">
            <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
              <Truck className="h-7 w-7 text-accent" />
            </div>
            <h3 className="font-semibold mb-2">Fast Delivery</h3>
            <p className="text-sm text-muted-foreground">
              Quick and reliable shipping across Bangladesh.
            </p>
          </div>
          <div className="text-center p-6">
            <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
              <Shield className="h-7 w-7 text-accent" />
            </div>
            <h3 className="font-semibold mb-2">Secure Shopping</h3>
            <p className="text-sm text-muted-foreground">
              Shop with confidence. Your data is always protected.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="bg-primary text-primary-foreground rounded-2xl p-8 md:p-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-3xl md:text-4xl font-bold mb-2">5K+</p>
              <p className="text-primary-foreground/70">Happy Customers</p>
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-bold mb-2">500+</p>
              <p className="text-primary-foreground/70">Products</p>
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-bold mb-2">4.9</p>
              <p className="text-primary-foreground/70">Average Rating</p>
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-bold mb-2">24/7</p>
              <p className="text-primary-foreground/70">Support</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

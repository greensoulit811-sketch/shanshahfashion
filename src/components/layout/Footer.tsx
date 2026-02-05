import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from 'lucide-react';
import { useSiteSettings } from '@/contexts/SiteSettingsContext';

const socialLinks = [
  { name: 'Facebook', href: '#', icon: Facebook },
  { name: 'Instagram', href: '#', icon: Instagram },
  { name: 'Twitter', href: '#', icon: Twitter },
];

export function Footer() {
  const { t } = useSiteSettings();

  const footerLinks = {
    shop: [
      { name: t('nav.shop'), href: '/shop' },
      { name: t('home.newArrivals'), href: '/shop?filter=new' },
      { name: t('home.bestSellers'), href: '/shop?filter=bestsellers' },
      { name: t('product.sale'), href: '/shop?filter=sale' },
    ],
    company: [
      { name: t('footer.aboutUs'), href: '/about' },
      { name: t('nav.contact'), href: '/contact' },
      { name: t('nav.faq'), href: '/faq' },
    ],
    support: [
      { name: t('footer.shippingInfo'), href: '/shipping' },
      { name: t('footer.returnPolicy'), href: '/returns' },
    ],
  };

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container-shop section-padding">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link to="/" className="inline-block mb-4">
              <span className="text-2xl font-bold tracking-tight">STORE</span>
            </Link>
            <p className="text-primary-foreground/80 text-sm mb-6 max-w-xs">
              {t('home.heroSubtitle')}
            </p>
            <div className="flex gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-accent transition-colors"
                  aria-label={social.name}
                >
                  <social.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Shop Links */}
          <div>
            <h4 className="font-semibold mb-4">{t('nav.shop')}</h4>
            <ul className="space-y-3">
              {footerLinks.shop.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="font-semibold mb-4">{t('footer.quickLinks')}</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">{t('footer.contactUs')}</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm text-primary-foreground/70">
                <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                <span>123 Store Street, Dhaka, Bangladesh</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-primary-foreground/70">
                <Phone className="h-4 w-4 shrink-0" />
                <span>+880 1234 567890</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-primary-foreground/70">
                <Mail className="h-4 w-4 shrink-0" />
                <span>hello@store.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-primary-foreground/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-primary-foreground/60">
              © {new Date().getFullYear()} STORE. {t('footer.allRightsReserved')}.
            </p>
            <div className="flex gap-6">
              <Link
                to="/privacy"
                className="text-sm text-primary-foreground/60 hover:text-primary-foreground transition-colors"
              >
                {t('footer.privacyPolicy')}
              </Link>
              <Link
                to="/terms"
                className="text-sm text-primary-foreground/60 hover:text-primary-foreground transition-colors"
              >
                {t('footer.termsConditions')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { useCart } from '@/contexts/CartContext';
import { useSiteSettings } from '@/contexts/SiteSettingsContext';
import { useAuth } from '@/hooks/useAuth';
import { useCreateOrder } from '@/hooks/useOrders';
import { useIncrementCouponUsage, Coupon } from '@/hooks/useCoupons';
import { useShippingMethods } from '@/hooks/useShippingMethods';
import { CouponInput } from '@/components/checkout/CouponInput';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { trackInitiateCheckout } from '@/lib/facebook-pixel';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items, subtotal, clearCart } = useCart();
  const { user } = useAuth();
  const { t, formatCurrency, settings } = useSiteSettings();
  const createOrder = useCreateOrder();
  const incrementCouponUsage = useIncrementCouponUsage();
  const { data: shippingMethods = [], isLoading: isLoadingMethods } = useShippingMethods(true);

  // Coupon state
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    country: settings.default_country_name,
    notes: '',
    shippingMethodId: '',
    paymentMethod: 'cod',
  });

  // Set default shipping method when methods load
  useEffect(() => {
    if (shippingMethods.length > 0 && !formData.shippingMethodId) {
      setFormData(prev => ({ ...prev, shippingMethodId: shippingMethods[0].id }));
    }
  }, [shippingMethods]);

  const selectedMethod = shippingMethods.find(m => m.id === formData.shippingMethodId);
  const shippingCost = selectedMethod?.base_rate || 0;
  const total = subtotal - discountAmount + shippingCost;

  const handleApplyCoupon = (coupon: Coupon, discount: number) => {
    setAppliedCoupon(coupon);
    setDiscountAmount(discount);
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setDiscountAmount(0);
  };

  // Track InitiateCheckout when page loads
  useEffect(() => {
    if (items.length > 0) {
      trackInitiateCheckout({
        numItems: items.reduce((sum, item) => sum + item.quantity, 0),
        value: subtotal,
        currency: settings.currency_code,
      });
    }
  }, []); // Only on mount

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.fullName || !formData.phone || !formData.address || !formData.city) {
      toast.error(t('validation.fillRequired'));
      return;
    }

    if (items.length === 0) {
      toast.error(t('validation.cartEmpty'));
      return;
    }

    const orderNumber = `ORD-${Date.now().toString().slice(-8)}`;

    try {
      await createOrder.mutateAsync({
        order: {
          order_number: orderNumber,
          user_id: user?.id || null,
          customer_name: formData.fullName,
          customer_phone: formData.phone,
          customer_email: formData.email || null,
          shipping_address: formData.address,
          shipping_city: formData.city,
          shipping_method: selectedMethod?.name || 'Standard',
          shipping_cost: shippingCost,
          payment_method: formData.paymentMethod,
          subtotal,
          total,
          status: 'pending',
          notes: formData.notes || null,
        },
        items: items.map((item) => ({
          product_id: item.id,
          product_name: item.name,
          product_image: item.image,
          quantity: item.quantity,
          price: item.salePrice ?? item.price,
        })),
      });

      // Increment coupon usage if one was applied
      if (appliedCoupon) {
        incrementCouponUsage.mutate(appliedCoupon.id);
      }

      clearCart();
      // Pass order data to success page for Purchase tracking
      navigate(`/order-success?orderId=${orderNumber}`, {
        state: {
          orderData: {
            total,
            items: items.map((item) => ({
              id: item.id,
              quantity: item.quantity,
              price: item.salePrice ?? item.price,
            })),
          },
        },
      });
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  if (items.length === 0) {
    return (
      <Layout>
        <div className="container-shop section-padding text-center">
          <h1 className="text-2xl font-bold mb-4">{t('cart.emptyCart')}</h1>
          <Button onClick={() => navigate('/shop')} className="btn-accent">
            {t('cart.continueShopping')}
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container-shop section-padding">
        <h1 className="text-3xl md:text-4xl font-bold mb-8">{t('checkout.title')}</h1>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Contact Information */}
              <div className="bg-card rounded-xl border border-border p-6">
                <h2 className="text-lg font-semibold mb-4">{t('checkout.contactInfo')}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium mb-2">
                      {t('checkout.fullName')} <span className="text-destructive">*</span>
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      className="input-shop"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      {t('checkout.phone')} <span className="text-destructive">*</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="input-shop"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      {t('checkout.emailOptional')}
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="input-shop"
                    />
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="bg-card rounded-xl border border-border p-6">
                <h2 className="text-lg font-semibold mb-4">{t('checkout.shippingAddress')}</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      {t('checkout.country')}
                    </label>
                    <input
                      type="text"
                      name="country"
                      value={formData.country}
                      readOnly
                      className="input-shop bg-muted cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      {t('checkout.address')} <span className="text-destructive">*</span>
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      className="input-shop"
                      placeholder={t('checkout.addressPlaceholder')}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      {t('checkout.city')} <span className="text-destructive">*</span>
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className="input-shop"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      {t('checkout.orderNotes')}
                    </label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      className="input-shop min-h-[100px]"
                      placeholder={t('checkout.orderNotesPlaceholder')}
                    />
                  </div>
                </div>
              </div>

              {/* Shipping Method */}
              <div className="bg-card rounded-xl border border-border p-6">
                <h2 className="text-lg font-semibold mb-4">{t('checkout.shippingMethod')}</h2>
                {isLoadingMethods ? (
                  <div className="space-y-3">
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" />
                  </div>
                ) : shippingMethods.length === 0 ? (
                  <p className="text-muted-foreground">No shipping methods available</p>
                ) : (
                  <div className="space-y-3">
                    {shippingMethods.map((method) => (
                      <label
                        key={method.id}
                        className="flex items-center gap-3 p-4 border border-border rounded-lg cursor-pointer hover:border-accent transition-colors"
                      >
                        <input
                          type="radio"
                          name="shippingMethodId"
                          value={method.id}
                          checked={formData.shippingMethodId === method.id}
                          onChange={handleChange}
                          className="w-4 h-4 text-accent"
                        />
                        <div className="flex-1">
                          <p className="font-medium">{method.name}</p>
                          {method.estimated_days && (
                            <p className="text-sm text-muted-foreground">{method.estimated_days}</p>
                          )}
                          {method.description && (
                            <p className="text-xs text-muted-foreground mt-1">{method.description}</p>
                          )}
                        </div>
                        <span className="font-semibold">{formatCurrency(method.base_rate)}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Payment Method */}
              <div className="bg-card rounded-xl border border-border p-6">
                <h2 className="text-lg font-semibold mb-4">{t('checkout.paymentMethod')}</h2>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 p-4 border border-border rounded-lg cursor-pointer hover:border-accent transition-colors">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={formData.paymentMethod === 'cod'}
                      onChange={handleChange}
                      className="w-4 h-4 text-accent"
                    />
                    <div className="flex-1">
                      <p className="font-medium">{t('checkout.cashOnDelivery')}</p>
                      <p className="text-sm text-muted-foreground">
                        {t('checkout.codDescription')}
                      </p>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 p-4 border border-border rounded-lg cursor-pointer hover:border-accent transition-colors opacity-50">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="card"
                      disabled
                      className="w-4 h-4 text-accent"
                    />
                    <div className="flex-1">
                      <p className="font-medium">{t('checkout.cardPayment')}</p>
                      <p className="text-sm text-muted-foreground">{t('checkout.comingSoon')}</p>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-card rounded-xl border border-border p-6 sticky top-24">
                <h2 className="text-lg font-semibold mb-4">{t('checkout.orderSummary')}</h2>

                {/* Items */}
                <div className="space-y-3 mb-6 max-h-60 overflow-y-auto">
                  {items.map((item) => {
                    const price = item.salePrice ?? item.price;
                    return (
                      <div key={item.id} className="flex gap-3">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-14 h-14 rounded-lg object-cover bg-secondary"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium line-clamp-1">
                            {item.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {t('product.quantity')}: {item.quantity}
                          </p>
                        </div>
                        <span className="text-sm font-medium">
                          {formatCurrency(price * item.quantity)}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <hr className="border-border mb-4" />

                {/* Coupon Input */}
                <div className="mb-4">
                  <CouponInput
                    subtotal={subtotal}
                    onApply={handleApplyCoupon}
                    onRemove={handleRemoveCoupon}
                    appliedCoupon={appliedCoupon}
                    discountAmount={discountAmount}
                  />
                </div>

                <hr className="border-border mb-4" />

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('cart.subtotal')}</span>
                    <span className="font-medium">{formatCurrency(subtotal)}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-accent">
                      <span>{t('checkout.discount') || 'Discount'}</span>
                      <span>-{formatCurrency(discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('cart.shipping')}</span>
                    <span className="font-medium">{formatCurrency(shippingCost)}</span>
                  </div>
                </div>

                <hr className="border-border mb-4" />

                <div className="flex justify-between mb-6">
                  <span className="font-semibold">{t('cart.total')}</span>
                  <span className="text-xl font-bold">
                    {formatCurrency(total)}
                  </span>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="btn-accent w-full"
                  disabled={createOrder.isPending}
                >
                  {createOrder.isPending ? t('checkout.processing') : t('checkout.placeOrder')}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </Layout>
  );
}

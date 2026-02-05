import { useState } from 'react';
import { Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    storeName: 'STORE',
    storeEmail: 'hello@store.com',
    storePhone: '+880 1234 567890',
    storeAddress: '123 Store Street, Gulshan-1, Dhaka 1212, Bangladesh',
    shippingInsideDhaka: '60',
    shippingOutsideDhaka: '120',
    siteTitle: 'STORE - Premium Products for Modern Living',
    metaDescription: 'Discover premium quality products at STORE. Shop electronics, fashion, home & living, and sports items with fast delivery across Bangladesh.',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setSettings({ ...settings, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Settings saved successfully');
  };

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-bold mb-6">Settings</h1>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Store Information */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h2 className="text-lg font-semibold mb-4">Store Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Store Name</label>
              <input
                type="text"
                name="storeName"
                value={settings.storeName}
                onChange={handleChange}
                className="input-shop"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                name="storeEmail"
                value={settings.storeEmail}
                onChange={handleChange}
                className="input-shop"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Phone</label>
              <input
                type="tel"
                name="storePhone"
                value={settings.storePhone}
                onChange={handleChange}
                className="input-shop"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium mb-2">Address</label>
              <input
                type="text"
                name="storeAddress"
                value={settings.storeAddress}
                onChange={handleChange}
                className="input-shop"
              />
            </div>
          </div>
        </div>

        {/* Shipping Settings */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h2 className="text-lg font-semibold mb-4">Shipping Charges</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Inside Dhaka (৳)
              </label>
              <input
                type="number"
                name="shippingInsideDhaka"
                value={settings.shippingInsideDhaka}
                onChange={handleChange}
                className="input-shop"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Outside Dhaka (৳)
              </label>
              <input
                type="number"
                name="shippingOutsideDhaka"
                value={settings.shippingOutsideDhaka}
                onChange={handleChange}
                className="input-shop"
              />
            </div>
          </div>
        </div>

        {/* SEO Settings */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h2 className="text-lg font-semibold mb-4">SEO Settings</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Site Title</label>
              <input
                type="text"
                name="siteTitle"
                value={settings.siteTitle}
                onChange={handleChange}
                className="input-shop"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {settings.siteTitle.length}/60 characters
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Meta Description
              </label>
              <textarea
                name="metaDescription"
                value={settings.metaDescription}
                onChange={handleChange}
                className="input-shop min-h-[100px]"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {settings.metaDescription.length}/160 characters
              </p>
            </div>
          </div>
        </div>

        <Button type="submit" className="btn-accent">
          <Save className="h-4 w-4 mr-2" />
          Save Settings
        </Button>
      </form>
    </div>
  );
}

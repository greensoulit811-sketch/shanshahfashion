import { useState, useEffect } from 'react';
import { Save, RotateCcw, Globe, Languages, DollarSign, Clock, Store, Mail, Phone, MapPin, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useSiteSettings, useUpdateSiteSettings } from '@/contexts/SiteSettingsContext';
import { useStoreSettings, useUpdateStoreSettings } from '@/hooks/useStoreSettings';
import { countries, getCountryByCode, getDefaultCountry } from '@/data/countries';
import { format } from 'date-fns';
import { ImageUpload } from '@/components/admin/ImageUpload';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AdminSettings() {
  const { settings, t, isLoading: siteLoading } = useSiteSettings();
  const { data: storeSettings, isLoading: storeLoading } = useStoreSettings();
  const updateSettings = useUpdateSiteSettings();
  const updateStoreSettings = useUpdateStoreSettings();

  const [formData, setFormData] = useState({
    countryCode: settings.default_country_code,
    countryName: settings.default_country_name,
    currencyCode: settings.currency_code,
    currencySymbol: settings.currency_symbol,
    currencyLocale: settings.currency_locale,
    language: settings.language,
  });

  const [storeData, setStoreData] = useState({
    store_name: '',
    store_logo: '',
    store_tagline: '',
    store_email: '',
    store_phone: '',
    store_address: '',
    store_city: '',
    store_postal_code: '',
    facebook_url: '',
    instagram_url: '',
    twitter_url: '',
    youtube_url: '',
    whatsapp_number: '',
    footer_text: '',
  });

  const [countryOpen, setCountryOpen] = useState(false);

  // Update form when settings load
  useEffect(() => {
    if (settings) {
      setFormData({
        countryCode: settings.default_country_code,
        countryName: settings.default_country_name,
        currencyCode: settings.currency_code,
        currencySymbol: settings.currency_symbol,
        currencyLocale: settings.currency_locale,
        language: settings.language,
      });
    }
  }, [settings]);

  // Update store data when loaded
  useEffect(() => {
    if (storeSettings) {
      setStoreData(storeSettings);
    }
  }, [storeSettings]);

  const handleCountrySelect = (countryCode: string) => {
    const country = getCountryByCode(countryCode);
    if (country) {
      setFormData({
        ...formData,
        countryCode: country.code,
        countryName: country.name,
        currencyCode: country.currencyCode,
        currencySymbol: country.currencySymbol,
        currencyLocale: country.currencyLocale,
      });
    }
    setCountryOpen(false);
  };

  const handleLanguageChange = (lang: 'en' | 'hi' | 'bn') => {
    setFormData({ ...formData, language: lang });
  };

  const handleReset = () => {
    const defaultCountry = getDefaultCountry();
    setFormData({
      countryCode: defaultCountry.code,
      countryName: defaultCountry.name,
      currencyCode: defaultCountry.currencyCode,
      currencySymbol: defaultCountry.currencySymbol,
      currencyLocale: defaultCountry.currencyLocale,
      language: 'en',
    });
  };

  const handleSiteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.countryCode) {
      toast.error('Please select a country');
      return;
    }

    try {
      await updateSettings.mutateAsync({
        default_country_code: formData.countryCode,
        default_country_name: formData.countryName,
        currency_code: formData.currencyCode,
        currency_symbol: formData.currencySymbol,
        currency_locale: formData.currencyLocale,
        language: formData.language,
      });
      toast.success(t('admin.settingsSaved'));
    } catch (error) {
      toast.error('Failed to save settings');
    }
  };

  const handleStoreSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await updateStoreSettings.mutateAsync(storeData);
      toast.success('Store settings saved successfully');
    } catch (error) {
      toast.error('Failed to save store settings');
    }
  };

  const languageOptions = [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
    { code: 'bn', name: 'Bangla', nativeName: 'বাংলা' },
  ];

  const isLoading = siteLoading || storeLoading;

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 w-48 bg-muted rounded"></div>
        <div className="bg-card rounded-xl border border-border p-6 space-y-4">
          <div className="h-6 w-32 bg-muted rounded"></div>
          <div className="h-10 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-bold mb-6">{t('admin.settingsTitle')}</h1>

      <Tabs defaultValue="store" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
          <TabsTrigger value="store" className="gap-2">
            <Store className="h-4 w-4" />
            Store Info
          </TabsTrigger>
          <TabsTrigger value="global" className="gap-2">
            <Globe className="h-4 w-4" />
            {t('admin.globalSettings')}
          </TabsTrigger>
        </TabsList>

        {/* Store Settings Tab */}
        <TabsContent value="store">
          <form onSubmit={handleStoreSubmit} className="space-y-6">
            {/* Basic Store Info */}
            <div className="bg-card rounded-xl border border-border p-6">
              <div className="flex items-center gap-2 mb-4">
                <Store className="h-5 w-5 text-accent" />
                <h2 className="text-lg font-semibold">Store Information</h2>
              </div>

              <div className="space-y-6">
                {/* Logo Upload */}
                <div>
                  <label className="block text-sm font-medium mb-2">Store Logo</label>
                  <ImageUpload
                    value={storeData.store_logo}
                    onChange={(url) => setStoreData({ ...storeData, store_logo: url })}
                    folder="branding"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Store Name</label>
                    <input
                      type="text"
                      value={storeData.store_name}
                      onChange={(e) => setStoreData({ ...storeData, store_name: e.target.value })}
                      className="input-shop"
                      placeholder="My Store"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Tagline / Slogan</label>
                    <input
                      type="text"
                      value={storeData.store_tagline}
                      onChange={(e) => setStoreData({ ...storeData, store_tagline: e.target.value })}
                      className="input-shop"
                      placeholder="Your one-stop shop"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Footer Text</label>
                  <input
                    type="text"
                    value={storeData.footer_text}
                    onChange={(e) => setStoreData({ ...storeData, footer_text: e.target.value })}
                    className="input-shop"
                    placeholder="© 2024 My Store. All rights reserved."
                  />
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-card rounded-xl border border-border p-6">
              <div className="flex items-center gap-2 mb-4">
                <Mail className="h-5 w-5 text-accent" />
                <h2 className="text-lg font-semibold">Contact Information</h2>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      <Mail className="h-4 w-4 inline mr-1" />
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={storeData.store_email}
                      onChange={(e) => setStoreData({ ...storeData, store_email: e.target.value })}
                      className="input-shop"
                      placeholder="contact@mystore.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      <Phone className="h-4 w-4 inline mr-1" />
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={storeData.store_phone}
                      onChange={(e) => setStoreData({ ...storeData, store_phone: e.target.value })}
                      className="input-shop"
                      placeholder="+880 1234 567890"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    <MapPin className="h-4 w-4 inline mr-1" />
                    Street Address
                  </label>
                  <input
                    type="text"
                    value={storeData.store_address}
                    onChange={(e) => setStoreData({ ...storeData, store_address: e.target.value })}
                    className="input-shop"
                    placeholder="123 Main Street"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">City</label>
                    <input
                      type="text"
                      value={storeData.store_city}
                      onChange={(e) => setStoreData({ ...storeData, store_city: e.target.value })}
                      className="input-shop"
                      placeholder="Dhaka"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Postal Code</label>
                    <input
                      type="text"
                      value={storeData.store_postal_code}
                      onChange={(e) => setStoreData({ ...storeData, store_postal_code: e.target.value })}
                      className="input-shop"
                      placeholder="1205"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Social Media */}
            <div className="bg-card rounded-xl border border-border p-6">
              <div className="flex items-center gap-2 mb-4">
                <Share2 className="h-5 w-5 text-accent" />
                <h2 className="text-lg font-semibold">Social Media & Messaging</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Facebook URL</label>
                  <input
                    type="url"
                    value={storeData.facebook_url}
                    onChange={(e) => setStoreData({ ...storeData, facebook_url: e.target.value })}
                    className="input-shop"
                    placeholder="https://facebook.com/yourstore"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Instagram URL</label>
                  <input
                    type="url"
                    value={storeData.instagram_url}
                    onChange={(e) => setStoreData({ ...storeData, instagram_url: e.target.value })}
                    className="input-shop"
                    placeholder="https://instagram.com/yourstore"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Twitter / X URL</label>
                  <input
                    type="url"
                    value={storeData.twitter_url}
                    onChange={(e) => setStoreData({ ...storeData, twitter_url: e.target.value })}
                    className="input-shop"
                    placeholder="https://twitter.com/yourstore"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">YouTube URL</label>
                  <input
                    type="url"
                    value={storeData.youtube_url}
                    onChange={(e) => setStoreData({ ...storeData, youtube_url: e.target.value })}
                    className="input-shop"
                    placeholder="https://youtube.com/@yourstore"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">WhatsApp Number</label>
                  <input
                    type="tel"
                    value={storeData.whatsapp_number}
                    onChange={(e) => setStoreData({ ...storeData, whatsapp_number: e.target.value })}
                    className="input-shop"
                    placeholder="+880 1234 567890"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Include country code for WhatsApp click-to-chat
                  </p>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex gap-4">
              <Button
                type="submit"
                className="btn-accent"
                disabled={updateStoreSettings.isPending}
              >
                <Save className="h-4 w-4 mr-2" />
                {updateStoreSettings.isPending ? 'Saving...' : 'Save Store Settings'}
              </Button>
            </div>
          </form>
        </TabsContent>

        {/* Global Settings Tab */}
        <TabsContent value="global">
          <form onSubmit={handleSiteSubmit} className="space-y-6">
            {/* Country & Currency */}
            <div className="bg-card rounded-xl border border-border p-6">
              <div className="flex items-center gap-2 mb-4">
                <Globe className="h-5 w-5 text-accent" />
                <h2 className="text-lg font-semibold">{t('admin.globalSettings')}</h2>
              </div>

              <div className="space-y-6">
                {/* Country Selector */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {t('admin.selectCountry')} <span className="text-destructive">*</span>
                  </label>
                  <Popover open={countryOpen} onOpenChange={setCountryOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={countryOpen}
                        className="w-full justify-between h-10 bg-background"
                      >
                        {formData.countryCode
                          ? countries.find((c) => c.code === formData.countryCode)?.name
                          : t('admin.selectCountry')}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[400px] p-0 z-50" align="start">
                      <Command>
                        <CommandInput placeholder={t('admin.searchCountry')} />
                        <CommandList>
                          <CommandEmpty>{t('admin.noCountryFound')}</CommandEmpty>
                          <CommandGroup className="max-h-[300px] overflow-auto">
                            {countries.map((country) => (
                              <CommandItem
                                key={country.code}
                                value={country.name}
                                onSelect={() => handleCountrySelect(country.code)}
                              >
                                <Check
                                  className={cn(
                                    'mr-2 h-4 w-4',
                                    formData.countryCode === country.code
                                      ? 'opacity-100'
                                      : 'opacity-0'
                                  )}
                                />
                                <span className="flex-1">{country.name}</span>
                                <span className="text-muted-foreground text-xs">
                                  {country.currencyCode} ({country.currencySymbol})
                                </span>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Currency Display */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <label className="block text-sm font-medium">{t('admin.currency')}</label>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs text-muted-foreground mb-1">
                        {t('admin.currencyCode')}
                      </label>
                      <input
                        type="text"
                        value={formData.currencyCode}
                        readOnly
                        className="input-shop bg-muted cursor-not-allowed"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-muted-foreground mb-1">
                        {t('admin.currencySymbol')}
                      </label>
                      <input
                        type="text"
                        value={formData.currencySymbol}
                        readOnly
                        className="input-shop bg-muted cursor-not-allowed"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-muted-foreground mb-1">
                        {t('admin.currencyLocale')}
                      </label>
                      <input
                        type="text"
                        value={formData.currencyLocale}
                        readOnly
                        className="input-shop bg-muted cursor-not-allowed"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Currency is auto-filled based on the selected country
                  </p>
                </div>
              </div>
            </div>

            {/* Language Settings */}
            <div className="bg-card rounded-xl border border-border p-6">
              <div className="flex items-center gap-2 mb-4">
                <Languages className="h-5 w-5 text-accent" />
                <h2 className="text-lg font-semibold">{t('admin.websiteLanguage')}</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {languageOptions.map((lang) => (
                  <label
                    key={lang.code}
                    className={cn(
                      'flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-all',
                      formData.language === lang.code
                        ? 'border-accent bg-accent/5'
                        : 'border-border hover:border-accent/50'
                    )}
                  >
                    <input
                      type="radio"
                      name="language"
                      value={lang.code}
                      checked={formData.language === lang.code}
                      onChange={() => handleLanguageChange(lang.code as 'en' | 'hi' | 'bn')}
                      className="w-4 h-4 text-accent"
                    />
                    <div>
                      <p className="font-medium">{lang.nativeName}</p>
                      <p className="text-sm text-muted-foreground">{lang.name}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Last Updated */}
            <div className="bg-card rounded-xl border border-border p-6">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span className="text-sm">
                  {t('admin.lastUpdated')}:{' '}
                  {settings.updated_at
                    ? format(new Date(settings.updated_at), 'PPpp')
                    : 'Never'}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-4">
              <Button
                type="submit"
                className="btn-accent"
                disabled={updateSettings.isPending}
              >
                <Save className="h-4 w-4 mr-2" />
                {updateSettings.isPending ? 'Saving...' : t('admin.saveSettings')}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleReset}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                {t('admin.resetToDefault')}
              </Button>
            </div>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  );
}

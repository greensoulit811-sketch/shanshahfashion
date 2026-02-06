import { useState, useEffect, useCallback } from 'react';
import { Save, RotateCcw, Globe, Languages, DollarSign, Clock, Store, Mail, Phone, MapPin, Share2, Megaphone, CheckCircle, XCircle, Loader2, Palette, Server, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useSiteSettings, useUpdateSiteSettings } from '@/contexts/SiteSettingsContext';
import { useStoreSettings, useUpdateStoreSettings } from '@/hooks/useStoreSettings';
import { countries, getCountryByCode, getDefaultCountry } from '@/data/countries';
import { format } from 'date-fns';
import { ImageUpload } from '@/components/admin/ImageUpload';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { validatePixelId, testPixelConnection, testCapiEvent } from '@/lib/facebook-pixel';
import { supabase } from '@/integrations/supabase/client';
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
    themeAccentColor: settings.theme_accent_color || '#e85a4f',
    // Brand theme
    brand_primary: settings.brand_primary || '#1a1a2e',
    brand_secondary: settings.brand_secondary || '#f0f0f0',
    brand_accent: settings.brand_accent || '#e85a4f',
    brand_background: settings.brand_background || '#faf9f7',
    brand_foreground: settings.brand_foreground || '#1a1a2e',
    brand_muted: settings.brand_muted || '#6b7280',
    brand_border: settings.brand_border || '#e5e7eb',
    brand_card: settings.brand_card || '#ffffff',
    brand_radius: settings.brand_radius || '0.5',
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

  const [pixelData, setPixelData] = useState({
    fb_pixel_enabled: false,
    fb_pixel_id: '',
    fb_pixel_test_event_code: '',
    cookie_consent_enabled: false,
    fb_capi_enabled: false,
    fb_capi_dataset_id: '',
    fb_capi_test_event_code: '',
    fb_capi_api_version: 'v20.0',
  });

  const [countryOpen, setCountryOpen] = useState(false);
  const [isTestingPixel, setIsTestingPixel] = useState(false);
  const [pixelTestResult, setPixelTestResult] = useState<'success' | 'error' | null>(null);
  const [isTestingCapi, setIsTestingCapi] = useState(false);
  const [capiTestResult, setCapiTestResult] = useState<{ success: boolean; message: string } | null>(null);
  
  // CAPI Token state
  const [capiToken, setCapiToken] = useState('');
  const [capiTokenMasked, setCapiTokenMasked] = useState<string | null>(null);
  const [hasCapiToken, setHasCapiToken] = useState(false);
  const [isSavingToken, setIsSavingToken] = useState(false);
  const [showTokenInput, setShowTokenInput] = useState(false);
  const [showTokenValue, setShowTokenValue] = useState(false);
  const [tokenLastUpdated, setTokenLastUpdated] = useState<string | null>(null);

  // Fetch CAPI token status on mount
  const fetchTokenStatus = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await supabase.functions.invoke('manage-capi-token', {
        method: 'GET',
      });

      if (response.data) {
        setHasCapiToken(response.data.has_token || false);
        setCapiTokenMasked(response.data.masked || null);
        setTokenLastUpdated(response.data.updated_at || null);
      }
    } catch {
      // Silently fail
    }
  }, []);

  useEffect(() => {
    fetchTokenStatus();
  }, [fetchTokenStatus]);

  const handleSaveToken = async () => {
    if (!capiToken.trim()) {
      toast.error('Please enter an access token');
      return;
    }
    setIsSavingToken(true);
    try {
      const response = await supabase.functions.invoke('manage-capi-token', {
        body: { access_token: capiToken.trim() },
      });

      if (response.data?.success) {
        toast.success('Access token saved securely');
        setCapiToken('');
        setShowTokenInput(false);
        await fetchTokenStatus();
      } else {
        toast.error(response.data?.error || 'Failed to save token');
      }
    } catch {
      toast.error('Failed to save access token');
    } finally {
      setIsSavingToken(false);
    }
  };

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
        themeAccentColor: settings.theme_accent_color || '#e85a4f',
        brand_primary: settings.brand_primary || '#1a1a2e',
        brand_secondary: settings.brand_secondary || '#f0f0f0',
        brand_accent: settings.brand_accent || '#e85a4f',
        brand_background: settings.brand_background || '#faf9f7',
        brand_foreground: settings.brand_foreground || '#1a1a2e',
        brand_muted: settings.brand_muted || '#6b7280',
        brand_border: settings.brand_border || '#e5e7eb',
        brand_card: settings.brand_card || '#ffffff',
        brand_radius: settings.brand_radius || '0.5',
      });
      setPixelData({
        fb_pixel_enabled: settings.fb_pixel_enabled,
        fb_pixel_id: settings.fb_pixel_id || '',
        fb_pixel_test_event_code: settings.fb_pixel_test_event_code || '',
        cookie_consent_enabled: settings.cookie_consent_enabled,
        fb_capi_enabled: settings.fb_capi_enabled || false,
        fb_capi_dataset_id: settings.fb_capi_dataset_id || '',
        fb_capi_test_event_code: settings.fb_capi_test_event_code || '',
        fb_capi_api_version: settings.fb_capi_api_version || 'v20.0',
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
      themeAccentColor: '#e85a4f',
      brand_primary: '#1a1a2e',
      brand_secondary: '#f0f0f0',
      brand_accent: '#e85a4f',
      brand_background: '#faf9f7',
      brand_foreground: '#1a1a2e',
      brand_muted: '#6b7280',
      brand_border: '#e5e7eb',
      brand_card: '#ffffff',
      brand_radius: '0.5',
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
        theme_accent_color: formData.brand_accent,
        brand_primary: formData.brand_primary,
        brand_secondary: formData.brand_secondary,
        brand_accent: formData.brand_accent,
        brand_background: formData.brand_background,
        brand_foreground: formData.brand_foreground,
        brand_muted: formData.brand_muted,
        brand_border: formData.brand_border,
        brand_card: formData.brand_card,
        brand_radius: formData.brand_radius,
      } as any);
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

  const handlePixelSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate pixel ID if enabled
    if (pixelData.fb_pixel_enabled) {
      if (!pixelData.fb_pixel_id.trim()) {
        toast.error('Please enter a Facebook Pixel ID');
        return;
      }
      if (!validatePixelId(pixelData.fb_pixel_id.trim())) {
        toast.error('Pixel ID must be 10-20 digits');
        return;
      }
    }

    // Validate CAPI
    if (pixelData.fb_capi_enabled) {
      if (!pixelData.fb_capi_dataset_id.trim() && !pixelData.fb_pixel_id.trim()) {
        toast.error('Please enter a Dataset ID or Pixel ID for Conversion API');
        return;
      }
    }

    try {
      await updateSettings.mutateAsync({
        fb_pixel_enabled: pixelData.fb_pixel_enabled,
        fb_pixel_id: pixelData.fb_pixel_id.trim() || null,
        fb_pixel_test_event_code: pixelData.fb_pixel_test_event_code.trim() || null,
        cookie_consent_enabled: pixelData.cookie_consent_enabled,
        fb_capi_enabled: pixelData.fb_capi_enabled,
        fb_capi_dataset_id: pixelData.fb_capi_dataset_id.trim() || null,
        fb_capi_test_event_code: pixelData.fb_capi_test_event_code.trim() || null,
        fb_capi_api_version: pixelData.fb_capi_api_version || 'v20.0',
      } as any);
      toast.success('Marketing settings saved successfully');
    } catch (error) {
      toast.error('Failed to save marketing settings');
    }
  };

  const handleTestCapi = async () => {
    setIsTestingCapi(true);
    setCapiTestResult(null);
    try {
      const result = await testCapiEvent();
      setCapiTestResult({
        success: result.success,
        message: result.success ? 'Test event sent successfully!' : (result.error || 'Failed'),
      });
      if (result.success) {
        toast.success('CAPI test event sent!');
      } else {
        toast.error(result.error || 'CAPI test failed');
      }
    } catch {
      setCapiTestResult({ success: false, message: 'Unexpected error' });
      toast.error('Failed to test CAPI');
    } finally {
      setIsTestingCapi(false);
    }
  };

  const handleTestPixel = async () => {
    if (!pixelData.fb_pixel_id.trim()) {
      toast.error('Enter a Pixel ID first');
      return;
    }

    if (!validatePixelId(pixelData.fb_pixel_id.trim())) {
      toast.error('Invalid Pixel ID format');
      return;
    }

    setIsTestingPixel(true);
    setPixelTestResult(null);

    try {
      const result = await testPixelConnection(pixelData.fb_pixel_id.trim());
      setPixelTestResult(result ? 'success' : 'error');
      if (result) {
        toast.success('Pixel connection successful!');
      } else {
        toast.error('Could not verify pixel. Check the ID or try again.');
      }
    } catch {
      setPixelTestResult('error');
      toast.error('Failed to test pixel connection');
    } finally {
      setIsTestingPixel(false);
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
        <TabsList className="grid w-full grid-cols-4 lg:w-[800px]">
          <TabsTrigger value="store" className="gap-2">
            <Store className="h-4 w-4" />
            Store Info
          </TabsTrigger>
          <TabsTrigger value="global" className="gap-2">
            <Globe className="h-4 w-4" />
            {t('admin.globalSettings')}
          </TabsTrigger>
          <TabsTrigger value="theme" className="gap-2">
            <Palette className="h-4 w-4" />
            Theme
          </TabsTrigger>
          <TabsTrigger value="marketing" className="gap-2">
            <Megaphone className="h-4 w-4" />
            Marketing
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

            {/* Active Settings Debug Info */}
            <div className="bg-card rounded-xl border border-border p-6">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="h-5 w-5 text-accent" />
                <h2 className="text-lg font-semibold">Current Active Settings</h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="bg-secondary/50 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground mb-1">Country</p>
                  <p className="font-semibold">{settings.default_country_name} ({settings.default_country_code})</p>
                </div>
                <div className="bg-secondary/50 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground mb-1">Currency</p>
                  <p className="font-semibold">{settings.currency_symbol} {settings.currency_code}</p>
                </div>
                <div className="bg-secondary/50 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground mb-1">Language</p>
                  <p className="font-semibold">{settings.language.toUpperCase()}</p>
                </div>
                <div className="bg-secondary/50 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground mb-1">Last Updated</p>
                  <p className="font-semibold text-xs">
                    {settings.updated_at
                      ? format(new Date(settings.updated_at), 'PPpp')
                      : 'Never'}
                  </p>
                </div>
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

        {/* Theme Tab */}
        <TabsContent value="theme">
          <form onSubmit={handleSiteSubmit} className="space-y-6">
            {/* Brand Theme Settings */}
            <div className="bg-card rounded-xl border border-border p-6">
              <div className="flex items-center gap-2 mb-4">
                <Palette className="h-5 w-5 text-accent" />
                <h2 className="text-lg font-semibold">Brand Colors</h2>
              </div>

              <div className="space-y-6">
                {/* Color Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { key: 'brand_accent', label: 'Accent / CTA', desc: 'Buttons, links, badges' },
                    { key: 'brand_primary', label: 'Primary', desc: 'Header, headings, text' },
                    { key: 'brand_secondary', label: 'Secondary', desc: 'Secondary surfaces' },
                    { key: 'brand_background', label: 'Background', desc: 'Page background' },
                    { key: 'brand_foreground', label: 'Text', desc: 'Main text color' },
                    { key: 'brand_muted', label: 'Muted Text', desc: 'Secondary text' },
                    { key: 'brand_border', label: 'Border', desc: 'Borders, dividers' },
                    { key: 'brand_card', label: 'Card / Surface', desc: 'Cards, modals, popups' },
                  ].map((item) => (
                    <div key={item.key} className="space-y-1">
                      <label className="block text-sm font-medium">{item.label}</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={(formData as any)[item.key]}
                          onChange={(e) => setFormData({ ...formData, [item.key]: e.target.value })}
                          className="w-10 h-10 rounded-lg border border-border cursor-pointer shrink-0"
                        />
                        <input
                          type="text"
                          value={(formData as any)[item.key]}
                          onChange={(e) => setFormData({ ...formData, [item.key]: e.target.value })}
                          className="input-shop text-xs font-mono"
                          placeholder="#000000"
                          maxLength={7}
                        />
                      </div>
                      <p className="text-[10px] text-muted-foreground">{item.desc}</p>
                    </div>
                  ))}
                </div>

                {/* Border Radius */}
                <div>
                  <label className="block text-sm font-medium mb-2">Border Radius</label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="0"
                      max="1.5"
                      step="0.125"
                      value={formData.brand_radius}
                      onChange={(e) => setFormData({ ...formData, brand_radius: e.target.value })}
                      className="flex-1"
                    />
                    <span className="text-sm font-mono w-16 text-right">{formData.brand_radius}rem</span>
                  </div>
                  <div className="flex gap-2 mt-2">
                    {[
                      { val: '0', label: 'Sharp' },
                      { val: '0.375', label: 'Subtle' },
                      { val: '0.5', label: 'Default' },
                      { val: '0.75', label: 'Rounded' },
                      { val: '1', label: 'Pill' },
                    ].map((r) => (
                      <button
                        key={r.val}
                        type="button"
                        onClick={() => setFormData({ ...formData, brand_radius: r.val })}
                        className={cn(
                          'px-3 py-1 text-xs border transition-colors',
                          formData.brand_radius === r.val
                            ? 'border-accent bg-accent/10 text-accent'
                            : 'border-border hover:border-accent/50'
                        )}
                        style={{ borderRadius: `${r.val}rem` }}
                      >
                        {r.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Accent Presets */}
                <div>
                  <label className="block text-sm font-medium mb-2">Quick Accent Presets</label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { color: '#e85a4f', name: 'Coral' },
                      { color: '#3b82f6', name: 'Blue' },
                      { color: '#10b981', name: 'Emerald' },
                      { color: '#8b5cf6', name: 'Violet' },
                      { color: '#f59e0b', name: 'Amber' },
                      { color: '#ec4899', name: 'Pink' },
                      { color: '#06b6d4', name: 'Cyan' },
                      { color: '#ef4444', name: 'Red' },
                      { color: '#16a34a', name: 'Green' },
                    ].map((preset) => (
                      <button
                        key={preset.color}
                        type="button"
                        onClick={() => setFormData({ ...formData, brand_accent: preset.color, themeAccentColor: preset.color })}
                        className={cn(
                          'w-10 h-10 rounded-lg border-2 transition-all hover:scale-110',
                          formData.brand_accent === preset.color
                            ? 'border-foreground ring-2 ring-offset-2 ring-foreground'
                            : 'border-transparent'
                        )}
                        style={{ backgroundColor: preset.color }}
                        title={preset.name}
                      />
                    ))}
                  </div>
                </div>

                {/* Live Preview */}
                <div>
                  <label className="block text-sm font-medium mb-3">Live Preview</label>
                  <div
                    className="rounded-xl border-2 overflow-hidden"
                    style={{ borderColor: formData.brand_border, borderRadius: `${formData.brand_radius}rem` }}
                  >
                    <div className="px-4 py-3 flex items-center justify-between" style={{ backgroundColor: formData.brand_primary }}>
                      <span className="text-sm font-bold" style={{ color: formData.brand_background }}>Store Name</span>
                      <div className="flex gap-2">
                        <span className="text-xs" style={{ color: formData.brand_background }}>Shop</span>
                        <span className="text-xs" style={{ color: formData.brand_background }}>Cart</span>
                      </div>
                    </div>
                    <div className="p-4 space-y-3" style={{ backgroundColor: formData.brand_background }}>
                      <div className="p-3" style={{ backgroundColor: formData.brand_card, borderRadius: `${formData.brand_radius}rem`, border: `1px solid ${formData.brand_border}` }}>
                        <h3 className="text-sm font-semibold" style={{ color: formData.brand_foreground }}>Product Card</h3>
                        <p className="text-xs mt-1" style={{ color: formData.brand_muted }}>This is how content looks</p>
                        <div className="flex gap-2 mt-3">
                          <button
                            className="px-3 py-1.5 text-xs font-medium text-white"
                            style={{ backgroundColor: formData.brand_accent, borderRadius: `${formData.brand_radius}rem` }}
                          >
                            Buy Now
                          </button>
                          <button
                            className="px-3 py-1.5 text-xs font-medium"
                            style={{
                              border: `1px solid ${formData.brand_border}`,
                              borderRadius: `${formData.brand_radius}rem`,
                              color: formData.brand_foreground,
                              backgroundColor: formData.brand_background,
                            }}
                          >
                            Add to Cart
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="px-4 py-2 text-center" style={{ backgroundColor: formData.brand_primary }}>
                      <span className="text-[10px]" style={{ color: formData.brand_muted }}>© 2026 Store</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Save */}
            <div className="flex flex-wrap gap-4">
              <Button
                type="submit"
                className="btn-accent"
                disabled={updateSettings.isPending}
              >
                <Save className="h-4 w-4 mr-2" />
                {updateSettings.isPending ? 'Saving...' : 'Save Theme'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleReset}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset to Defaults
              </Button>
            </div>
          </form>
        </TabsContent>

        {/* Marketing Tab */}
        <TabsContent value="marketing">
          <form onSubmit={handlePixelSubmit} className="space-y-6">
            {/* Facebook Pixel */}
            <div className="bg-card rounded-xl border border-border p-6">
              <div className="flex items-center gap-2 mb-4">
                <svg className="h-5 w-5 text-[#1877F2]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                <h2 className="text-lg font-semibold">Facebook Pixel</h2>
              </div>

              <div className="space-y-6">
                {/* Enable Toggle */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Enable Facebook Pixel</p>
                    <p className="text-sm text-muted-foreground">
                      Track page views, add to cart, and purchase events
                    </p>
                  </div>
                  <Switch
                    checked={pixelData.fb_pixel_enabled}
                    onCheckedChange={(checked) => setPixelData({ ...pixelData, fb_pixel_enabled: checked })}
                  />
                </div>

                {/* Pixel ID */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Facebook Pixel ID <span className="text-destructive">*</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={pixelData.fb_pixel_id}
                      onChange={(e) => {
                        setPixelData({ ...pixelData, fb_pixel_id: e.target.value.replace(/\D/g, '') });
                        setPixelTestResult(null);
                      }}
                      className="input-shop flex-1"
                      placeholder="123456789012345"
                      maxLength={20}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleTestPixel}
                      disabled={isTestingPixel || !pixelData.fb_pixel_id}
                    >
                      {isTestingPixel ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : pixelTestResult === 'success' ? (
                        <CheckCircle className="h-4 w-4 text-success" />
                      ) : pixelTestResult === 'error' ? (
                        <XCircle className="h-4 w-4 text-destructive" />
                      ) : (
                        'Validate'
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Enter your Pixel ID (10-20 digits). Find it in Facebook Events Manager.
                  </p>
                </div>

                {/* Test Event Code */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Test Event Code (Optional)
                  </label>
                  <input
                    type="text"
                    value={pixelData.fb_pixel_test_event_code}
                    onChange={(e) => setPixelData({ ...pixelData, fb_pixel_test_event_code: e.target.value })}
                    className="input-shop"
                    placeholder="TEST12345"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Use this for testing events in Facebook's Test Events tool
                  </p>
                </div>
              </div>
            </div>

            {/* Conversion API (CAPI) */}
            <div className="bg-card rounded-xl border border-border p-6">
              <div className="flex items-center gap-2 mb-4">
                <Server className="h-5 w-5 text-accent" />
                <h2 className="text-lg font-semibold">Conversion API (Server-Side)</h2>
              </div>

              <div className="space-y-6">
                {/* Enable Toggle */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Enable Conversion API</p>
                    <p className="text-sm text-muted-foreground">
                      Send events server-side for improved tracking accuracy and reliability
                    </p>
                  </div>
                  <Switch
                    checked={pixelData.fb_capi_enabled}
                    onCheckedChange={(checked) => setPixelData({ ...pixelData, fb_capi_enabled: checked })}
                  />
                </div>

                {pixelData.fb_capi_enabled && (
                  <>
                    {/* Dataset ID */}
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Dataset ID
                      </label>
                      <input
                        type="text"
                        value={pixelData.fb_capi_dataset_id}
                        onChange={(e) => setPixelData({ ...pixelData, fb_capi_dataset_id: e.target.value.replace(/\D/g, '') })}
                        className="input-shop"
                        placeholder="Same as Pixel ID (leave blank to use Pixel ID)"
                        maxLength={20}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Usually the same as your Pixel ID. Leave blank to use the Pixel ID above.
                      </p>
                    </div>

                    {/* Access Token */}
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        <ShieldCheck className="h-4 w-4 inline mr-1" />
                        CAPI Access Token <span className="text-destructive">*</span>
                      </label>

                      {hasCapiToken && !showTokenInput ? (
                        <div className="space-y-2">
                          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg border border-border">
                            <ShieldCheck className="h-5 w-5 text-green-600 shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-green-700">Token configured</p>
                              <p className="text-xs text-muted-foreground font-mono">{capiTokenMasked}</p>
                              {tokenLastUpdated && (
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  Updated: {new Date(tokenLastUpdated).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setShowTokenInput(true)}
                            >
                              Update
                            </Button>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            🔒 Token is stored securely and never exposed to the browser.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="flex gap-2">
                            <div className="relative flex-1">
                              <Input
                                type={showTokenValue ? 'text' : 'password'}
                                value={capiToken}
                                onChange={(e) => setCapiToken(e.target.value)}
                                placeholder="Paste your CAPI access token here"
                                className="pr-10"
                              />
                              <button
                                type="button"
                                onClick={() => setShowTokenValue(!showTokenValue)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                              >
                                {showTokenValue ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </button>
                            </div>
                            <Button
                              type="button"
                              onClick={handleSaveToken}
                              disabled={isSavingToken || !capiToken.trim()}
                            >
                              {isSavingToken ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Save className="h-4 w-4" />
                              )}
                              <span className="ml-2">{isSavingToken ? 'Saving...' : 'Save Token'}</span>
                            </Button>
                          </div>
                          {hasCapiToken && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => { setShowTokenInput(false); setCapiToken(''); }}
                            >
                              Cancel
                            </Button>
                          )}
                          <p className="text-xs text-muted-foreground">
                            🔒 Token will be stored securely server-side. It is never sent to the browser.
                            Generate it from Meta Events Manager → Settings → Conversions API.
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Test Event Code */}
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        CAPI Test Event Code (Optional)
                      </label>
                      <input
                        type="text"
                        value={pixelData.fb_capi_test_event_code}
                        onChange={(e) => setPixelData({ ...pixelData, fb_capi_test_event_code: e.target.value })}
                        className="input-shop"
                        placeholder="TEST12345"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Events with this code appear in Facebook's Test Events tool
                      </p>
                    </div>

                    {/* API Version */}
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        API Version
                      </label>
                      <input
                        type="text"
                        value={pixelData.fb_capi_api_version}
                        onChange={(e) => setPixelData({ ...pixelData, fb_capi_api_version: e.target.value })}
                        className="input-shop"
                        placeholder="v20.0"
                      />
                    </div>

                    {/* Test Button */}
                    <div>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleTestCapi}
                        disabled={isTestingCapi}
                      >
                        {isTestingCapi ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Server className="h-4 w-4 mr-2" />
                        )}
                        Send Test Event
                      </Button>
                      {capiTestResult && (
                        <div className={`mt-2 flex items-center gap-2 text-sm ${capiTestResult.success ? 'text-green-600' : 'text-destructive'}`}>
                          {capiTestResult.success ? (
                            <CheckCircle className="h-4 w-4" />
                          ) : (
                            <XCircle className="h-4 w-4" />
                          )}
                          {capiTestResult.message}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="bg-card rounded-xl border border-border p-6">
              <div className="flex items-center gap-2 mb-4">
                <svg className="h-5 w-5 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5"/>
                  <path d="M8.5 8.5v.01"/>
                  <path d="M16 15.5v.01"/>
                  <path d="M12 12v.01"/>
                  <path d="M11 17v.01"/>
                  <path d="M7 14v.01"/>
                </svg>
                <h2 className="text-lg font-semibold">Cookie Consent (GDPR)</h2>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Require Cookie Consent</p>
                  <p className="text-sm text-muted-foreground">
                    Show a cookie banner and only load pixel after user accepts
                  </p>
                </div>
                <Switch
                  checked={pixelData.cookie_consent_enabled}
                  onCheckedChange={(checked) => setPixelData({ ...pixelData, cookie_consent_enabled: checked })}
                />
              </div>
            </div>

            {/* Events Tracked */}
            <div className="bg-card rounded-xl border border-border p-6">
              <h3 className="font-medium mb-4">Events Tracked Automatically</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {[
                  { name: 'PageView', desc: 'Every page load' },
                  { name: 'ViewContent', desc: 'Product page views' },
                  { name: 'AddToCart', desc: 'Add to cart clicks' },
                  { name: 'InitiateCheckout', desc: 'Checkout page load' },
                  { name: 'Purchase', desc: 'Successful orders' },
                  { name: 'Search', desc: 'Product searches' },
                ].map((event) => (
                  <div key={event.name} className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
                    <CheckCircle className="h-4 w-4 text-success shrink-0" />
                    <div>
                      <p className="text-sm font-medium">{event.name}</p>
                      <p className="text-xs text-muted-foreground">{event.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Save Button */}
            <div className="flex gap-4">
              <Button
                type="submit"
                className="btn-accent"
                disabled={updateSettings.isPending}
              >
                <Save className="h-4 w-4 mr-2" />
                {updateSettings.isPending ? 'Saving...' : 'Save Marketing Settings'}
              </Button>
            </div>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  );
}

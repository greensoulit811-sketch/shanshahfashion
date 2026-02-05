import { useState } from 'react';
import { Save, RotateCcw, Globe, Languages, DollarSign, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useSiteSettings, useUpdateSiteSettings } from '@/contexts/SiteSettingsContext';
import { countries, getCountryByCode, getDefaultCountry } from '@/data/countries';
import { format } from 'date-fns';
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
  const { settings, t, isLoading } = useSiteSettings();
  const updateSettings = useUpdateSiteSettings();

  const [formData, setFormData] = useState({
    countryCode: settings.default_country_code,
    countryName: settings.default_country_name,
    currencyCode: settings.currency_code,
    currencySymbol: settings.currency_symbol,
    currencyLocale: settings.currency_locale,
    language: settings.language,
  });

  const [countryOpen, setCountryOpen] = useState(false);

  // Update form when settings load
  useState(() => {
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
  });

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

  const handleSubmit = async (e: React.FormEvent) => {
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

  const languageOptions = [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
    { code: 'bn', name: 'Bangla', nativeName: 'বাংলা' },
  ];

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

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Global Settings */}
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
    </div>
  );
}

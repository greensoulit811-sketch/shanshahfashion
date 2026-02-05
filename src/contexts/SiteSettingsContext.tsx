import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import enTranslations from '@/i18n/translations/en.json';
import hiTranslations from '@/i18n/translations/hi.json';
import bnTranslations from '@/i18n/translations/bn.json';

// Helper function to convert hex color to HSL string
function hexToHSL(hex: string): string {
  // Remove # if present
  hex = hex.replace(/^#/, '');
  
  // Parse hex values
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }
  
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

export interface SiteSettings {
  id: string;
  default_country_code: string;
  default_country_name: string;
  currency_code: string;
  currency_symbol: string;
  currency_locale: string;
  language: 'en' | 'hi' | 'bn';
  updated_at: string;
  // Facebook Pixel fields
  fb_pixel_enabled: boolean;
  fb_pixel_id: string | null;
  fb_pixel_test_event_code: string | null;
  cookie_consent_enabled: boolean;
  // Theme settings
  theme_accent_color: string;
}

type TranslationsType = typeof enTranslations;

const translations: Record<string, TranslationsType> = {
  en: enTranslations,
  hi: hiTranslations,
  bn: bnTranslations,
};

const defaultSettings: SiteSettings = {
  id: 'global',
  default_country_code: 'BD',
  default_country_name: 'Bangladesh',
  currency_code: 'BDT',
  currency_symbol: '৳',
  currency_locale: 'bn-BD',
  language: 'en',
  updated_at: new Date().toISOString(),
  fb_pixel_enabled: false,
  fb_pixel_id: null,
  fb_pixel_test_event_code: null,
  cookie_consent_enabled: false,
  theme_accent_color: '#e85a4f',
};

interface SiteSettingsContextType {
  settings: SiteSettings;
  isLoading: boolean;
  isError: boolean;
  t: (key: string) => string;
  formatCurrency: (amount: number) => string;
  userLanguagePreference: string | null;
  setUserLanguagePreference: (lang: string | null) => void;
  activeLanguage: 'en' | 'hi' | 'bn';
  refetch: () => void;
}

const SiteSettingsContext = createContext<SiteSettingsContextType | undefined>(undefined);

export const SiteSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = useQueryClient();
  const [userLanguagePreference, setUserLanguagePreferenceState] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('userLanguagePreference');
    }
    return null;
  });

  const { data: settings, isLoading, isError, refetch } = useQuery({
    queryKey: ['site_settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .eq('id', 'global')
        .maybeSingle();
      
      if (error) throw error;
      return (data as SiteSettings) || defaultSettings;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });

  const setUserLanguagePreference = useCallback((lang: string | null) => {
    setUserLanguagePreferenceState(lang);
    if (lang) {
      localStorage.setItem('userLanguagePreference', lang);
    } else {
      localStorage.removeItem('userLanguagePreference');
    }
  }, []);

  const activeSettings = settings || defaultSettings;

  // Apply theme color to CSS variables
  useEffect(() => {
    if (activeSettings.theme_accent_color) {
      const color = activeSettings.theme_accent_color;
      // Convert hex to HSL for CSS variables
      const hsl = hexToHSL(color);
      document.documentElement.style.setProperty('--accent', hsl);
      document.documentElement.style.setProperty('--ring', hsl);
    }
  }, [activeSettings.theme_accent_color]);
  
  // User preference overrides global setting
  const activeLanguage = (userLanguagePreference as 'en' | 'hi' | 'bn') || activeSettings.language;

  // Translation function
  const t = useCallback((key: string): string => {
    const keys = key.split('.');
    let value: unknown = translations[activeLanguage] || translations.en;
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = (value as Record<string, unknown>)[k];
      } else {
        // Fallback to English
        value = translations.en;
        for (const fallbackKey of keys) {
          if (value && typeof value === 'object' && fallbackKey in value) {
            value = (value as Record<string, unknown>)[fallbackKey];
          } else {
            return key; // Return key if not found
          }
        }
        break;
      }
    }
    
    return typeof value === 'string' ? value : key;
  }, [activeLanguage]);

  // Currency formatting function
  const formatCurrency = useCallback((amount: number): string => {
    try {
      return new Intl.NumberFormat(activeSettings.currency_locale, {
        style: 'currency',
        currency: activeSettings.currency_code,
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }).format(amount);
    } catch {
      // Fallback if locale/currency is not supported
      return `${activeSettings.currency_symbol}${amount.toFixed(2)}`;
    }
  }, [activeSettings.currency_locale, activeSettings.currency_code, activeSettings.currency_symbol]);

  return (
    <SiteSettingsContext.Provider
      value={{
        settings: activeSettings,
        isLoading,
        isError,
        t,
        formatCurrency,
        userLanguagePreference,
        setUserLanguagePreference,
        activeLanguage,
        refetch,
      }}
    >
      {children}
    </SiteSettingsContext.Provider>
  );
};

export const useSiteSettings = () => {
  const context = useContext(SiteSettingsContext);
  if (!context) {
    throw new Error('useSiteSettings must be used within a SiteSettingsProvider');
  }
  return context;
};

// Hook for admin to update settings
export const useUpdateSiteSettings = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (settings: Partial<Omit<SiteSettings, 'id' | 'updated_at'>>) => {
      const { data, error } = await supabase
        .from('site_settings')
        .update(settings)
        .eq('id', 'global')
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site_settings'] });
    },
  });
};

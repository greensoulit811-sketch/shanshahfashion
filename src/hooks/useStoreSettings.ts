import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface StoreSettings {
  store_name: string;
  store_logo: string;
  store_tagline: string;
  store_email: string;
  store_phone: string;
  store_address: string;
  store_city: string;
  store_postal_code: string;
  facebook_url: string;
  instagram_url: string;
  twitter_url: string;
  youtube_url: string;
  whatsapp_number: string;
  footer_text: string;
}

const DEFAULT_STORE_SETTINGS: StoreSettings = {
  store_name: 'My Store',
  store_logo: '',
  store_tagline: 'Your one-stop shop',
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
};

export const STORE_SETTINGS_QUERY_KEY = ['store-settings'];

export function useStoreSettings() {
  return useQuery({
    queryKey: STORE_SETTINGS_QUERY_KEY,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('store_settings')
        .select('key, value');

      if (error) throw error;

      // Convert array of key-value pairs to object
      const settings: StoreSettings = { ...DEFAULT_STORE_SETTINGS };
      data?.forEach((row) => {
        if (row.key in settings) {
          (settings as any)[row.key] = row.value;
        }
      });

      return settings;
    },
    staleTime: 1000 * 30, // 30 seconds - much shorter for faster updates
    refetchOnWindowFocus: true,
  });
}

export function useUpdateStoreSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: Partial<StoreSettings>) => {
      // Upsert each key-value pair
      const upserts = Object.entries(updates).map(([key, value]) => ({
        key,
        value: value || '',
        updated_at: new Date().toISOString(),
      }));

      for (const upsert of upserts) {
        const { error } = await supabase
          .from('store_settings')
          .upsert(upsert, { onConflict: 'key' });

        if (error) throw error;
      }

      return true;
    },
    onSuccess: () => {
      // Immediately invalidate and refetch store settings
      queryClient.invalidateQueries({ queryKey: STORE_SETTINGS_QUERY_KEY });
      // Also refetch to ensure immediate update
      queryClient.refetchQueries({ queryKey: STORE_SETTINGS_QUERY_KEY });
    },
  });
}

// Hook for manually refreshing store settings
export function useRefreshStoreSettings() {
  const queryClient = useQueryClient();
  
  return () => {
    queryClient.invalidateQueries({ queryKey: STORE_SETTINGS_QUERY_KEY });
    queryClient.refetchQueries({ queryKey: STORE_SETTINGS_QUERY_KEY });
  };
}

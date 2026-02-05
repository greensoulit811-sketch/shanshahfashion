import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

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

export function useStoreSettings() {
  return useQuery({
    queryKey: ['store-settings'],
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
    staleTime: 1000 * 60 * 5, // 5 minutes
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
      queryClient.invalidateQueries({ queryKey: ['store-settings'] });
    },
  });
}

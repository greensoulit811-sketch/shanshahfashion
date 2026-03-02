import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface CourierMetrics {
  total_parcels: number;
  delivered_count: number;
  returned_count: number;
  cancelled_count: number;
  in_transit_count: number;
  success_rate: number;
  return_rate: number;
  last_delivery_date: string | null;
  last_status: string | null;
  recent_parcels: Array<{
    order_number: string;
    tracking_id: string | null;
    status: string;
    courier_status: string | null;
    created_at: string;
    total: number;
  }>;
}

export interface CourierHistoryResponse {
  success: boolean;
  cached: boolean;
  data: CourierMetrics;
  last_checked_at: string;
}

async function fetchCourierHistory(phone: string, refresh = false): Promise<CourierHistoryResponse> {
  const { data: { session } } = await supabase.auth.getSession();
  const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
  const url = `https://${projectId}.supabase.co/functions/v1/customer-courier-history?phone=${encodeURIComponent(phone)}${refresh ? '&refresh=true' : ''}`;

  const res = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${session?.access_token}`,
      'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(err.error || 'Failed to fetch courier history');
  }

  return res.json();
}

export const useCustomerCourierHistory = (phone: string | undefined) => {
  return useQuery({
    queryKey: ['customer-courier-history', phone],
    queryFn: () => fetchCourierHistory(phone!),
    enabled: !!phone && phone.length >= 5,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
};

export const useRefreshCourierHistory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (phone: string) => fetchCourierHistory(phone, true),
    onSuccess: (data, phone) => {
      queryClient.setQueryData(['customer-courier-history', phone], data);
    },
  });
};

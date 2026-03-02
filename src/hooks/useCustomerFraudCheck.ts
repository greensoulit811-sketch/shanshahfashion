import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface CustomerFraudData {
  totalOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  pendingOrders: number;
  receivingPercentage: number;
  cancelPercentage: number;
  isSuspicious: boolean;
  riskLevel: 'low' | 'medium' | 'high';
}

export const useCustomerFraudCheck = (phone: string, currentOrderId?: string) => {
  return useQuery({
    queryKey: ['customer_fraud_check', phone],
    queryFn: async (): Promise<CustomerFraudData> => {
      // Clean phone - get last 10 digits for matching
      const cleanPhone = phone.replace(/[^0-9]/g, '');
      const phoneSuffix = cleanPhone.slice(-10);

      // Fetch all orders with this phone number
      const { data: orders, error } = await supabase
        .from('orders')
        .select('id, status, courier_status, customer_phone')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Filter by phone match (last 10 digits)
      const matchedOrders = (orders || []).filter((o) => {
        const oPhone = o.customer_phone.replace(/[^0-9]/g, '');
        return oPhone.slice(-10) === phoneSuffix && o.id !== currentOrderId;
      });

      const totalOrders = matchedOrders.length;
      const deliveredOrders = matchedOrders.filter((o) => o.status === 'delivered').length;
      const cancelledOrders = matchedOrders.filter(
        (o) => o.status === 'cancelled' || o.courier_status === 'cancelled'
      ).length;
      const pendingOrders = totalOrders - deliveredOrders - cancelledOrders;

      const completedOrders = deliveredOrders + cancelledOrders;
      const receivingPercentage = completedOrders > 0
        ? Math.round((deliveredOrders / completedOrders) * 100)
        : totalOrders === 0 ? -1 : 100; // -1 means new customer
      const cancelPercentage = completedOrders > 0
        ? Math.round((cancelledOrders / completedOrders) * 100)
        : 0;

      let riskLevel: 'low' | 'medium' | 'high' = 'low';
      if (cancelledOrders >= 3 || (completedOrders >= 2 && cancelPercentage >= 60)) {
        riskLevel = 'high';
      } else if (cancelledOrders >= 2 || (completedOrders >= 2 && cancelPercentage >= 40)) {
        riskLevel = 'medium';
      }

      return {
        totalOrders,
        deliveredOrders,
        cancelledOrders,
        pendingOrders,
        receivingPercentage,
        cancelPercentage,
        isSuspicious: riskLevel !== 'low',
        riskLevel,
      };
    },
    enabled: !!phone && phone.length >= 4,
  });
};

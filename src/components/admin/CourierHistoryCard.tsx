import { RefreshCw, Package, TruckIcon, XCircle, Undo2, CheckCircle2, Clock } from 'lucide-react';
import { useCustomerCourierHistory, useRefreshCourierHistory } from '@/hooks/useCustomerCourierHistory';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { useSiteSettings } from '@/contexts/SiteSettingsContext';

interface CourierHistoryCardProps {
  phone: string;
}

export function CourierHistoryCard({ phone }: CourierHistoryCardProps) {
  const { data: history, isLoading, error } = useCustomerCourierHistory(phone);
  const refreshMutation = useRefreshCourierHistory();
  const { formatCurrency } = useSiteSettings();

  const handleRefresh = async () => {
    try {
      await refreshMutation.mutateAsync(phone);
      toast.success('Courier history refreshed');
    } catch (err: any) {
      toast.error('Failed to refresh: ' + err.message);
    }
  };

  const getRateColor = (rate: number) => {
    if (rate >= 80) return 'text-green-600';
    if (rate >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getRateBg = (rate: number) => {
    if (rate >= 80) return 'bg-green-500';
    if (rate >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getStatusBadge = (status: string | null, courierStatus: string | null) => {
    const s = courierStatus || status || 'pending';
    const lower = s.toLowerCase();
    if (lower === 'delivered') return <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">Delivered</span>;
    if (lower === 'cancelled') return <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-medium">Cancelled</span>;
    if (lower === 'shipped' || lower === 'in_transit') return <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium">In Transit</span>;
    return <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 font-medium capitalize">{s}</span>;
  };

  if (isLoading) {
    return (
      <div className="bg-card rounded-xl border border-border p-6 space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-8 w-8 rounded" />
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (error || !history?.success) {
    return (
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold flex items-center gap-2">
            <TruckIcon className="h-4 w-4" />
            Courier History
          </h2>
          <Button variant="ghost" size="icon" onClick={handleRefresh} disabled={refreshMutation.isPending}>
            <RefreshCw className={`h-4 w-4 ${refreshMutation.isPending ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">No courier history available for this customer.</p>
      </div>
    );
  }

  const m = history.data;

  return (
    <div className="bg-card rounded-xl border border-border p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="font-semibold flex items-center gap-2">
          <TruckIcon className="h-4 w-4" />
          Courier History
        </h2>
        <Button variant="ghost" size="icon" onClick={handleRefresh} disabled={refreshMutation.isPending} title="Refresh from database">
          <RefreshCw className={`h-4 w-4 ${refreshMutation.isPending ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {m.total_parcels === 0 ? (
        <p className="text-sm text-muted-foreground">No previous orders found for this customer.</p>
      ) : (
        <>
          {/* Success Rate */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm text-muted-foreground">Success Rate</span>
              <span className={`text-sm font-bold ${getRateColor(m.success_rate)}`}>{m.success_rate}%</span>
            </div>
            <div className="w-full bg-secondary rounded-full h-2.5 overflow-hidden">
              <div className={`h-full rounded-full transition-all ${getRateBg(m.success_rate)}`} style={{ width: `${m.success_rate}%` }} />
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 bg-secondary/50 rounded-lg p-2.5">
              <Package className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Total</p>
                <p className="font-semibold text-sm">{m.total_parcels}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-green-50 rounded-lg p-2.5">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-xs text-muted-foreground">Delivered</p>
                <p className="font-semibold text-sm text-green-700">{m.delivered_count}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-orange-50 rounded-lg p-2.5">
              <Undo2 className="h-4 w-4 text-orange-600" />
              <div>
                <p className="text-xs text-muted-foreground">Returned</p>
                <p className="font-semibold text-sm text-orange-700">{m.returned_count}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-red-50 rounded-lg p-2.5">
              <XCircle className="h-4 w-4 text-red-600" />
              <div>
                <p className="text-xs text-muted-foreground">Cancelled</p>
                <p className="font-semibold text-sm text-red-700">{m.cancelled_count}</p>
              </div>
            </div>
          </div>

          {/* Last delivery */}
          {m.last_delivery_date && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              Last delivered: {format(new Date(m.last_delivery_date), 'MMM dd, yyyy')}
            </div>
          )}

          {/* Recent Parcels */}
          {m.recent_parcels.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase mb-2">Recent Orders</h3>
              <div className="space-y-2">
                {m.recent_parcels.map((p, i) => (
                  <div key={i} className="flex items-center justify-between text-sm py-1.5 border-b border-border last:border-0">
                    <div>
                      <span className="font-medium">{p.order_number}</span>
                      <span className="text-xs text-muted-foreground ml-2">{format(new Date(p.created_at), 'MMM dd')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium">{formatCurrency(p.total)}</span>
                      {getStatusBadge(p.status, p.courier_status)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Cache info */}
          {history.cached && (
            <p className="text-[10px] text-muted-foreground text-right">
              Cached · Last checked: {format(new Date(history.last_checked_at), 'MMM dd, hh:mm a')}
            </p>
          )}
        </>
      )}
    </div>
  );
}

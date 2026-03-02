import { useCustomerCourierHistory } from '@/hooks/useCustomerCourierHistory';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Skeleton } from '@/components/ui/skeleton';

interface CourierHistoryBadgeProps {
  phone: string;
}

export function CourierHistoryBadge({ phone }: CourierHistoryBadgeProps) {
  const { data: history, isLoading } = useCustomerCourierHistory(phone);

  if (isLoading) {
    return <Skeleton className="h-5 w-16 rounded-full" />;
  }

  if (!history?.success || !history.data || history.data.total_parcels === 0) {
    return <span className="text-xs text-muted-foreground">New</span>;
  }

  const m = history.data;
  const rate = m.success_rate;

  const badgeColor = rate >= 80
    ? 'bg-green-100 text-green-700 border-green-200'
    : rate >= 50
    ? 'bg-yellow-100 text-yellow-700 border-yellow-200'
    : 'bg-red-100 text-red-700 border-red-200';

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full border ${badgeColor} cursor-default`}>
            {rate}% · {m.total_parcels}
          </span>
        </TooltipTrigger>
        <TooltipContent side="top" className="text-xs max-w-[200px]">
          <div className="space-y-1">
            <p className="font-semibold">Delivery History</p>
            <p>Total: {m.total_parcels} orders</p>
            <p>Delivered: {m.delivered_count}</p>
            <p>Returned: {m.returned_count}</p>
            <p>Cancelled: {m.cancelled_count}</p>
            <p>Success Rate: {m.success_rate}%</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

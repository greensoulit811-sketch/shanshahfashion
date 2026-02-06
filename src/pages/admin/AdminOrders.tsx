import { useState } from 'react';
import { Search, Eye, MoreHorizontal, RefreshCw, Printer, FileText, Truck, Tag, CheckCircle } from 'lucide-react';
import { useOrders, useUpdateOrderStatus } from '@/hooks/useOrders';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useSiteSettings } from '@/contexts/SiteSettingsContext';
import { useStoreSettings } from '@/hooks/useStoreSettings';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';
import { PrintModal } from '@/components/admin/PrintModal';
import { OrderCourierSection } from '@/components/admin/OrderCourierSection';

const statusOptions = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'] as const;

export default function AdminOrders() {
  const { data: orders = [], isLoading, error, refetch } = useOrders();
  const { data: storeSettings } = useStoreSettings();
  const updateStatus = useUpdateOrderStatus();
  const { t, formatCurrency } = useSiteSettings();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [printModal, setPrintModal] = useState<{ open: boolean; type: 'invoice' | 'courier-slip' | 'courier-label'; order: any | null }>({
    open: false,
    type: 'invoice',
    order: null,
  });

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer_phone.includes(searchQuery);
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    await updateStatus.mutateAsync({ id: orderId, status: newStatus as any });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    return t(`order.status.${status}`);
  };

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-destructive mb-4">Failed to load orders. Check RLS policies.</p>
        <Button onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">{t('admin.orders')}</h1>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search by order ID, customer, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-shop pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent className="bg-popover z-50">
            <SelectItem value="all">All Status</SelectItem>
            {statusOptions.map((status) => (
              <SelectItem key={status} value={status}>
                {getStatusLabel(status)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Orders Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-secondary/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">{t('order.orderNumber')}</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">{t('checkout.phone')}</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">{t('cart.total')}</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Date</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-muted-foreground uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-muted-foreground">
                      {t('common.noResults')}
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-secondary/30 transition-colors">
                      <td className="px-6 py-4 font-medium">{order.order_number}</td>
                      <td className="px-6 py-4">{order.customer_name}</td>
                      <td className="px-6 py-4 text-muted-foreground">{order.customer_phone}</td>
                      <td className="px-6 py-4 font-medium">{formatCurrency(order.total)}</td>
                      <td className="px-6 py-4">
                        <Select
                          value={order.status}
                          onValueChange={(value) => handleStatusChange(order.id, value)}
                        >
                          <SelectTrigger className={`w-32 ${getStatusColor(order.status)}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-popover z-50">
                            {statusOptions.map((status) => (
                              <SelectItem key={status} value={status}>
                                {getStatusLabel(status)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {format(new Date(order.created_at), 'MMM dd, yyyy')}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-popover z-50">
                            <DropdownMenuItem onClick={() => setSelectedOrder(order)}>
                              <Eye className="h-4 w-4 mr-2" />
                              {t('common.view')} Details
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => setPrintModal({ open: true, type: 'invoice', order })}>
                              <FileText className="h-4 w-4 mr-2" />
                              Print Invoice
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setPrintModal({ open: true, type: 'courier-slip', order })}>
                              <Printer className="h-4 w-4 mr-2" />
                              Print Courier Slip
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Details Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Order Details - {selectedOrder?.order_number}</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="mt-4 space-y-6">
              {/* Customer Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">{t('checkout.contactInfo')}</h4>
                  <p className="text-sm">{selectedOrder.customer_name}</p>
                  <p className="text-sm text-muted-foreground">{selectedOrder.customer_phone}</p>
                  <p className="text-sm text-muted-foreground">{selectedOrder.customer_email || 'N/A'}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">{t('checkout.shippingAddress')}</h4>
                  <p className="text-sm">{selectedOrder.shipping_address}</p>
                  <p className="text-sm text-muted-foreground">{selectedOrder.shipping_city}</p>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h4 className="font-semibold mb-2">Order Items</h4>
                <div className="bg-secondary/50 rounded-lg p-4 space-y-2">
                  {selectedOrder.order_items?.map((item: any, index: number) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span>
                        {item.product_name} x {item.quantity}
                      </span>
                      <span>{formatCurrency(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Summary */}
              <div className="border-t border-border pt-4">
                <div className="flex justify-between text-sm mb-1">
                  <span>{t('cart.subtotal')}</span>
                  <span>{formatCurrency(selectedOrder.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm mb-1">
                  <span>{t('cart.shipping')}</span>
                  <span>{formatCurrency(selectedOrder.shipping_cost)}</span>
                </div>
                <div className="flex justify-between font-semibold mt-2 pt-2 border-t border-border">
                  <span>{t('cart.total')}</span>
                  <span>{formatCurrency(selectedOrder.total)}</span>
                </div>
              </div>

              {/* Payment Details */}
              <div className="border-t border-border pt-4">
                <h4 className="font-semibold mb-2">Payment Info</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-muted-foreground">Method:</span>
                    <p className="font-medium">{selectedOrder.payment_method_name || selectedOrder.payment_method}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Status:</span>
                    <p className="font-medium">
                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                        selectedOrder.payment_status === 'paid' ? 'bg-green-100 text-green-800' :
                        selectedOrder.payment_status === 'partial_paid' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {selectedOrder.payment_status === 'paid' ? 'Paid' :
                         selectedOrder.payment_status === 'partial_paid' ? 'Partial Paid' : 'Unpaid'}
                      </span>
                    </p>
                  </div>
                  {(selectedOrder.paid_amount > 0 || selectedOrder.due_amount > 0) && (
                    <>
                      <div>
                        <span className="text-muted-foreground">Paid:</span>
                        <p className="font-medium">{formatCurrency(selectedOrder.paid_amount)}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Due:</span>
                        <p className="font-medium">{formatCurrency(selectedOrder.due_amount)}</p>
                      </div>
                    </>
                  )}
                  {selectedOrder.transaction_id && (
                    <div className="col-span-2">
                      <span className="text-muted-foreground">Transaction ID:</span>
                      <p className="font-medium font-mono">{selectedOrder.transaction_id}</p>
                    </div>
                  )}
                </div>
                {selectedOrder.payment_status !== 'paid' && (
                  <Button
                    size="sm"
                    className="mt-3 gap-2"
                    variant="outline"
                    onClick={async () => {
                      await supabase
                        .from('orders')
                        .update({
                          payment_status: 'paid',
                          paid_amount: selectedOrder.total,
                          due_amount: 0,
                        })
                        .eq('id', selectedOrder.id);
                      refetch();
                      setSelectedOrder({ ...selectedOrder, payment_status: 'paid', paid_amount: selectedOrder.total, due_amount: 0 });
                      toast.success('Marked as paid');
                    }}
                  >
                    <CheckCircle className="h-4 w-4" />
                    Mark as Paid
                  </Button>
                )}
              </div>

              {/* Notes */}
              {selectedOrder.notes && (
                <div>
                  <h4 className="font-semibold mb-2">{t('checkout.orderNotes')}</h4>
                  <p className="text-sm text-muted-foreground">{selectedOrder.notes}</p>
                </div>
              )}

              {/* Courier Section */}
              <OrderCourierSection 
                order={selectedOrder}
                onPrintLabel={() => {
                  setSelectedOrder(null);
                  setPrintModal({ open: true, type: 'courier-label', order: selectedOrder });
                }}
              />

              {/* Print Actions */}
              <div className="flex gap-3 pt-4 border-t border-border">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedOrder(null);
                    setPrintModal({ open: true, type: 'invoice', order: selectedOrder });
                  }}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Print Invoice
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedOrder(null);
                    setPrintModal({ open: true, type: 'courier-slip', order: selectedOrder });
                  }}
                >
                  <Printer className="h-4 w-4 mr-2" />
                  Print Courier Slip
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Print Modal */}
      <PrintModal
        open={printModal.open}
        onClose={() => setPrintModal({ open: false, type: 'invoice', order: null })}
        type={printModal.type}
        order={printModal.order}
        storeSettings={storeSettings || {
          store_name: 'My Store',
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
        }}
        formatCurrency={formatCurrency}
      />
    </div>
  );
}

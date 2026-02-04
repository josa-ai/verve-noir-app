import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  MapPin, 
  Edit2, 
  Send,
  CheckCircle,
  RefreshCw,
  Package
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge, MatchStatusBadge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { useOrderStore } from '../store/orderStore';
import { matchingService } from '../lib/matching';
import { formatDate, formatCurrency, formatPhone } from '../utils/format';
import toast from 'react-hot-toast';
import type { OrderItem } from '../types';

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { selectedOrder, fetchOrderById, updateOrderStatus } = useOrderStore();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (id) {
      fetchOrderById(id);
    }
  }, [id, fetchOrderById]);

  const handleReprocessMatch = async (itemId: string) => {
    setIsProcessing(true);
    try {
      await matchingService.reprocessMatch(itemId);
      toast.success('Item reprocessed successfully');
      await fetchOrderById(id!);
    } catch (error) {
      toast.error('Failed to reprocess item');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSendInvoice = async () => {
    setIsProcessing(true);
    // TODO: Integrate with GHL API
    toast.success('Invoice sent!');
    setIsProcessing(false);
  };

  const handleMarkAsPaid = async () => {
    await updateOrderStatus(id!, 'paid');
    toast.success('Order marked as paid');
  };

  const handleMarkAsShipped = async () => {
    await updateOrderStatus(id!, 'shipped');
    toast.success('Order marked as shipped');
  };

  if (!selectedOrder) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-gray-500">Loading order...</p>
      </div>
    );
  }

  const order = selectedOrder;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate('/orders')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">
          Order Details
        </h1>
        <Badge variant="primary">{order.status.replace('_', ' ')}</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer Info */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer</h3>
          <div className="space-y-3">
            <p className="font-medium text-gray-900">{order.customer_name}</p>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Mail className="h-4 w-4" />
              {order.customer_email}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Phone className="h-4 w-4" />
              {formatPhone(order.customer_phone)}
            </div>
            <div className="flex items-start gap-2 text-sm text-gray-600">
              <MapPin className="h-4 w-4 mt-0.5" />
              <span className="whitespace-pre-line">{order.customer_address}</span>
            </div>
          </div>
        </div>

        {/* Order Info */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Info</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Order Date</span>
              <span className="font-medium">{formatDate(order.created_at)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total</span>
              <span className="font-medium text-lg">{formatCurrency(order.total_amount || 0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Status</span>
              <Badge variant="primary">{order.status}</Badge>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 space-y-2">
            {order.status === 'draft' && (
              <Button 
                variant="primary" 
                className="w-full gap-2"
                onClick={handleSendInvoice}
                isLoading={isProcessing}
              >
                <Send className="h-4 w-4" />
                Send Invoice
              </Button>
            )}
            {order.status === 'pending' && (
              <Button 
                variant="primary" 
                className="w-full gap-2 bg-green-600 hover:bg-green-700"
                onClick={handleMarkAsPaid}
              >
                <CheckCircle className="h-4 w-4" />
                Mark as Paid
              </Button>
            )}
            {order.status === 'paid' && (
              <Button 
                variant="gold" 
                className="w-full gap-2"
                onClick={handleMarkAsShipped}
              >
                <Package className="h-4 w-4" />
                Mark as Shipped
              </Button>
            )}
            <Button 
              variant="ghost" 
              className="w-full gap-2"
              onClick={() => setIsEditModalOpen(true)}
            >
              <Edit2 className="h-4 w-4" />
              Edit Order
            </Button>
          </div>
        </div>

        {/* Notes */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Notes</h3>
          <p className="text-gray-600">
            {order.notes || 'No notes added.'}
          </p>
        </div>
      </div>

      {/* Order Items */}
      <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Order Items</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {order.items?.map((item: OrderItem) => (
            <div key={item.id} className="p-6">
              <div className="flex items-start gap-6">
                {/* Image */}
                <div className="h-24 w-24 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  {item.image_url ? (
                    <img 
                      src={item.image_url} 
                      alt={item.description || ''}
                      className="h-full w-full object-cover rounded-lg"
                    />
                  ) : (
                    <Package className="h-8 w-8 text-gray-400" />
                  )}
                </div>

                {/* Details */}
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-gray-900">
                        {item.item_number || 'No Item Number'}
                      </p>
                      <p className="text-gray-600 mt-1">{item.description}</p>
                      <p className="text-sm text-gray-500 mt-1">Qty: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <MatchStatusBadge status={item.match_status} />
                      {item.match_confidence && (
                        <p className="text-sm text-gray-500 mt-1">
                          Confidence: {item.match_confidence}%
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Matched Product */}
                  {item.product && (
                    <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                      <p className="text-sm font-medium text-green-800">
                        Matched Product: {item.product.item_number}
                      </p>
                      <p className="text-sm text-green-700">{item.product.description}</p>
                      <p className="text-sm text-green-700 font-medium mt-1">
                        Price: {formatCurrency(item.product.price)}
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="mt-4 flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleReprocessMatch(item.id)}
                      isLoading={isProcessing}
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Reprocess
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Edit2 className="h-4 w-4 mr-2" />
                      Edit Match
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Order"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary">Save Changes</Button>
          </>
        }
      >
        <p className="text-gray-600">Order editing form will be implemented here.</p>
      </Modal>
    </div>
  );
}

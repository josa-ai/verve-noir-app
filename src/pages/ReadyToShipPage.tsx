import { useEffect, useState } from 'react';
import { Truck, Package, CheckCircle } from 'lucide-react';
import { Header } from '../components/layout/Header';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { useOrderStore } from '../store/orderStore';
import { formatDate, formatCurrency, formatOrderNumber } from '../utils/format';
import toast from 'react-hot-toast';

export function ReadyToShipPage() {
  const { orders, fetchOrders, updateOrderStatus } = useOrderStore();
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Filter paid orders
  const paidOrders = orders.filter(order => order.status === 'paid');

  const handleMarkShipped = async (order: any) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const confirmShipped = async () => {
    if (!selectedOrder) return;
    
    setIsProcessing(true);
    try {
      await updateOrderStatus(selectedOrder.id, 'shipped');
      toast.success('Order marked as shipped!');
      setIsModalOpen(false);
      setTrackingNumber('');
    } catch (error) {
      toast.error('Failed to update order');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div>
      <Header 
        title="Ready to Ship" 
        subtitle={`${paidOrders.length} orders waiting to be shipped`}
      />

      {paidOrders.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No orders ready to ship</h3>
          <p className="text-gray-500 mt-2">
            Orders will appear here once they are paid and ready for fulfillment.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {paidOrders.map((order) => (
            <div 
              key={order.id} 
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <span className="text-sm text-primary-600 font-medium">
                    {formatOrderNumber(order.id)}
                  </span>
                  <h3 className="text-lg font-semibold text-gray-900 mt-1">
                    {order.customer_name}
                  </h3>
                  <p className="text-sm text-gray-500">{order.customer_email}</p>
                </div>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Paid
                </span>
              </div>

              <div className="border-t border-gray-200 pt-4 mb-4">
                <div className="flex items-start gap-2 text-sm text-gray-600 mb-2">
                  <Truck className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span className="whitespace-pre-line">{order.customer_address}</span>
                </div>
                <p className="text-sm text-gray-500">
                  Order Date: {formatDate(order.created_at)}
                </p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div>
                  <p className="text-sm text-gray-500">Total Amount</p>
                  <p className="text-xl font-bold text-gray-900">
                    {formatCurrency(order.total_amount || 0)}
                  </p>
                </div>
                <Button
                  variant="gold"
                  className="gap-2"
                  onClick={() => handleMarkShipped(order)}
                >
                  <Truck className="h-4 w-4" />
                  Mark Shipped
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Mark as Shipped Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Mark as Shipped"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="gold" 
              onClick={confirmShipped}
              isLoading={isProcessing}
            >
              Confirm Shipped
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Mark order <strong>{selectedOrder && formatOrderNumber(selectedOrder.id)}</strong> as shipped?
          </p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tracking Number (Optional)
            </label>
            <input
              type="text"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              placeholder="Enter tracking number"
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}

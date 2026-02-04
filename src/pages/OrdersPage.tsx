import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Filter, ArrowUpDown } from 'lucide-react';
import { Header } from '../components/layout/Header';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import { OrderStatusBadge } from '../components/ui/Badge';
import { OrderForm } from '../components/order/OrderForm';
import { useOrderStore } from '../store/orderStore';
import { formatDate, formatCurrency, formatOrderNumber } from '../utils/format';
import type { OrderStatus } from '../types';

const statusOptions = [
  { value: 'all', label: 'All Statuses' },
  { value: 'draft', label: 'Draft' },
  { value: 'pending', label: 'Pending' },
  { value: 'paid', label: 'Paid' },
  { value: 'ready_to_ship', label: 'Ready to Ship' },
  { value: 'shipped', label: 'Shipped' },
];

export function OrdersPage() {
  const navigate = useNavigate();
  const { 
    orders, 
    filters, 
    isLoading, 
    fetchOrders, 
    setFilters 
  } = useOrderStore();
  
  const [isOrderFormOpen, setIsOrderFormOpen] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders, filters.status, filters.search]);

  const handleStatusChange = (value: string) => {
    setFilters({ status: value as OrderStatus | 'all' });
  };

  return (
    <div>
      <Header title="Orders" subtitle="Manage and process customer orders" />

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="w-48">
            <Select
              options={statusOptions}
              value={filters.status}
              onChange={(e) => handleStatusChange(e.target.value)}
            />
          </div>
          
          <Button variant="ghost" size="sm" className="gap-2">
            <Filter className="h-4 w-4" />
            More Filters
          </Button>

          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowUpDown className="h-4 w-4" />
            Sort
          </Button>

          <div className="flex-1" />

          <Button 
            variant="primary" 
            className="gap-2"
            onClick={() => setIsOrderFormOpen(true)}
          >
            <Plus className="h-4 w-4" />
            New Order
          </Button>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    Loading orders...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    No orders found. Click "New Order" to create one.
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr 
                    key={order.id} 
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => navigate(`/orders/${order.id}`)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-medium text-primary-600">
                        {formatOrderNumber(order.id)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{order.customer_name}</p>
                        <p className="text-sm text-gray-500">{order.customer_email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <OrderStatusBadge status={order.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-medium text-gray-900">
                        {formatCurrency(order.total_amount || 0)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(order.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Form Modal */}
      <OrderForm 
        isOpen={isOrderFormOpen} 
        onClose={() => setIsOrderFormOpen(false)} 
      />
    </div>
  );
}

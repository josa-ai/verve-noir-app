import { useEffect } from 'react';
import { 
  ShoppingCart, 
  DollarSign, 
  Truck,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { Header } from '../components/layout/Header';
import { useOrderStore } from '../store/orderStore';
import { useProductStore } from '../store/productStore';
import { formatCurrency } from '../utils/format';

export function DashboardPage() {
  const { orders, fetchOrders } = useOrderStore();
  const { products, fetchProducts } = useProductStore();

  useEffect(() => {
    fetchOrders();
    fetchProducts();
  }, [fetchOrders, fetchProducts]);

  const stats = {
    totalOrders: orders.length,
    pendingOrders: orders.filter(o => o.status === 'pending').length,
    paidOrders: orders.filter(o => o.status === 'paid').length,
    shippedOrders: orders.filter(o => o.status === 'shipped').length,
    totalRevenue: orders
      .filter(o => o.status === 'paid' || o.status === 'shipped')
      .reduce((sum, o) => sum + (o.total_amount || 0), 0),
    productsCount: products.length,
  };

  const recentOrders = orders.slice(0, 5);

  const statCards = [
    { 
      title: 'Total Orders', 
      value: stats.totalOrders, 
      icon: ShoppingCart, 
      color: 'bg-blue-500',
      trend: '+12%' 
    },
    { 
      title: 'Pending', 
      value: stats.pendingOrders, 
      icon: AlertCircle, 
      color: 'bg-yellow-500',
      trend: '3 new' 
    },
    { 
      title: 'Revenue', 
      value: formatCurrency(stats.totalRevenue), 
      icon: DollarSign, 
      color: 'bg-green-500',
      trend: '+8%' 
    },
    { 
      title: 'Shipped', 
      value: stats.shippedOrders, 
      icon: Truck, 
      color: 'bg-gold-500',
      trend: 'On track' 
    },
  ];

  return (
    <div>
      <Header 
        title="Dashboard" 
        subtitle="Welcome back! Here's what's happening with your orders."
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div 
              key={stat.title} 
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-green-600 font-medium">{stat.trend}</span>
                <span className="text-gray-400 ml-2">vs last month</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {recentOrders.length > 0 ? (
            recentOrders.map((order) => (
              <div 
                key={order.id} 
                className="px-6 py-4 flex items-center justify-between hover:bg-gray-50"
              >
                <div>
                  <p className="font-medium text-gray-900">{order.customer_name}</p>
                  <p className="text-sm text-gray-500">{order.customer_email}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">
                    {formatCurrency(order.total_amount || 0)}
                  </p>
                  <span className={`
                    inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                    ${order.status === 'paid' ? 'bg-green-100 text-green-800' : ''}
                    ${order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                    ${order.status === 'shipped' ? 'bg-gold-100 text-gold-800' : ''}
                  `}>
                    {order.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="px-6 py-8 text-center text-gray-500">
              No orders yet. Orders will appear here when they come in from GoHighLevel.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

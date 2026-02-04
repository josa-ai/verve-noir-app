import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';
import { useOrderStore } from '../../store/orderStore';
import { matchingService } from '../../lib/matching';
import toast from 'react-hot-toast';
import type { OrderItemInput } from '../../types';

interface OrderFormProps {
  isOpen: boolean;
  onClose: () => void;
}

interface OrderItemForm {
  item_number: string;
  description: string;
  quantity: number;
  image_url: string;
}

export function OrderForm({ isOpen, onClose }: OrderFormProps) {
  const { createOrder, fetchOrders } = useOrderStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [customerData, setCustomerData] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    customer_address: '',
  });
  
  const [items, setItems] = useState<OrderItemForm[]>([
    { item_number: '', description: '', quantity: 1, image_url: '' }
  ]);

  const addItem = () => {
    if (items.length < 3) {
      setItems([...items, { item_number: '', description: '', quantity: 1, image_url: '' }]);
    }
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof OrderItemForm, value: string | number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!customerData.customer_name || !customerData.customer_email) {
      toast.error('Please fill in customer name and email');
      return;
    }

    // Check if at least one item has data
    const validItems = items.filter(item => item.item_number || item.description);
    if (validItems.length === 0) {
      toast.error('Please add at least one item');
      return;
    }

    setIsSubmitting(true);

    try {
      // Create order
      const result = await createOrder({
        ...customerData,
        status: 'draft',
      });

      if (!result?.id) {
        throw new Error('Failed to create order');
      }

      const orderId = result.id;

      // Create order items
      const itemInserts = validItems.map((item, index) => ({
        order_id: orderId,
        position: index + 1,
        item_number: item.item_number || null,
        description: item.description || null,
        quantity: item.quantity || 1,
        image_url: item.image_url || null,
        match_status: 'pending',
      }));

      const { error: itemsError } = await import('../../lib/supabase').then(m => 
        m.supabase.from('order_items').insert(itemInserts)
      );

      if (itemsError) {
        throw itemsError;
      }

      // Run AI matching on each item
      for (let i = 0; i < validItems.length; i++) {
        const itemInput: OrderItemInput = {
          item_number: validItems[i].item_number,
          description: validItems[i].description,
          quantity: validItems[i].quantity,
          image_url: validItems[i].image_url,
        };

        // Get the order item ID
        const { data: orderItem } = await import('../../lib/supabase').then(m =>
          m.supabase
            .from('order_items')
            .select('id')
            .eq('order_id', orderId)
            .eq('position', i + 1)
            .single()
        );

        if (orderItem) {
          await matchingService.processOrderItem(orderItem.id, itemInput);
        }
      }

      toast.success('Order created successfully!');
      await fetchOrders();
      onClose();
      
      // Reset form
      setCustomerData({
        customer_name: '',
        customer_email: '',
        customer_phone: '',
        customer_address: '',
      });
      setItems([{ item_number: '', description: '', quantity: 1, image_url: '' }]);
      
    } catch (error) {
      console.error('Error creating order:', error);
      toast.error('Failed to create order');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Order"
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleSubmit}
            isLoading={isSubmitting}
          >
            Create Order
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer Information */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-gray-900 mb-4">Customer Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Name *"
              value={customerData.customer_name}
              onChange={(e) => setCustomerData({ ...customerData, customer_name: e.target.value })}
              required
            />
            <Input
              label="Email *"
              type="email"
              value={customerData.customer_email}
              onChange={(e) => setCustomerData({ ...customerData, customer_email: e.target.value })}
              required
            />
            <Input
              label="Phone"
              value={customerData.customer_phone}
              onChange={(e) => setCustomerData({ ...customerData, customer_phone: e.target.value })}
            />
            <Input
              label="Address"
              value={customerData.customer_address}
              onChange={(e) => setCustomerData({ ...customerData, customer_address: e.target.value })}
            />
          </div>
        </div>

        {/* Order Items */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-900">Order Items</h3>
            {items.length < 3 && (
              <Button type="button" variant="ghost" size="sm" onClick={addItem} className="gap-1">
                <Plus className="h-4 w-4" />
                Add Item
              </Button>
            )}
          </div>

          <div className="space-y-4">
            {items.map((item, index) => (
              <div key={index} className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-700">Item {index + 1}</span>
                  {items.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItem(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Item Number"
                    value={item.item_number}
                    onChange={(e) => updateItem(index, 'item_number', e.target.value)}
                    placeholder="e.g., VN-001"
                  />
                  <Input
                    label="Quantity"
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                  />
                  <Input
                    label="Description"
                    value={item.description}
                    onChange={(e) => updateItem(index, 'description', e.target.value)}
                    placeholder="Product description"
                    className="col-span-2"
                  />
                  <Input
                    label="Image URL (optional)"
                    value={item.image_url}
                    onChange={(e) => updateItem(index, 'image_url', e.target.value)}
                    placeholder="https://..."
                    className="col-span-2"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </form>
    </Modal>
  );
}

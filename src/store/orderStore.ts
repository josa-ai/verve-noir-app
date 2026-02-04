import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { Order, OrderStatus } from '../types';

interface OrderFilters {
  status: OrderStatus | 'all';
  search: string;
  sortBy: 'created_at' | 'customer_name' | 'status' | 'total_amount';
  sortOrder: 'asc' | 'desc';
}

interface OrderState {
  orders: Order[];
  selectedOrder: Order | null;
  filters: OrderFilters;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchOrders: () => Promise<void>;
  fetchOrderById: (id: string) => Promise<void>;
  createOrder: (order: Partial<Order>) => Promise<{ id: string } | null>;
  updateOrder: (id: string, updates: Partial<Order>) => Promise<void>;
  updateOrderStatus: (id: string, status: OrderStatus) => Promise<void>;
  setFilters: (filters: Partial<OrderFilters>) => void;
  setSelectedOrder: (order: Order | null) => void;
  clearError: () => void;
}

export const useOrderStore = create<OrderState>((set, get) => ({
  orders: [],
  selectedOrder: null,
  filters: {
    status: 'all',
    search: '',
    sortBy: 'created_at',
    sortOrder: 'desc',
  },
  isLoading: false,
  error: null,

  fetchOrders: async () => {
    set({ isLoading: true, error: null });
    
    const { filters } = get();
    let query = supabase
      .from('orders')
      .select('*');

    if (filters.status !== 'all') {
      query = query.eq('status', filters.status);
    }

    if (filters.search) {
      query = query.or(`customer_name.ilike.%${filters.search}%,customer_email.ilike.%${filters.search}%`);
    }

    query = query.order(filters.sortBy, { ascending: filters.sortOrder === 'asc' });

    const { data, error } = await query;

    if (error) {
      set({ error: error.message, isLoading: false });
      return;
    }

    set({ orders: data as Order[], isLoading: false });
  },

  fetchOrderById: async (id: string) => {
    set({ isLoading: true, error: null });

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();

    if (orderError) {
      set({ error: orderError.message, isLoading: false });
      return;
    }

    // Fetch order items with products
    const { data: items, error: itemsError } = await supabase
      .from('order_items')
      .select(`
        *,
        product:matched_product_id (*)
      `)
      .eq('order_id', id)
      .order('position');

    if (itemsError) {
      set({ error: itemsError.message, isLoading: false });
      return;
    }

    set({
      selectedOrder: { ...order, items } as Order,
      isLoading: false,
    });
  },

  createOrder: async (order: Partial<Order>) => {
    set({ isLoading: true, error: null });

    const { data, error } = await supabase
      .from('orders')
      .insert(order)
      .select('id')
      .single();

    if (error) {
      set({ error: error.message, isLoading: false });
      return null;
    }

    set({ isLoading: false });
    return { id: data.id };
  },

  updateOrder: async (id: string, updates: Partial<Order>) => {
    set({ isLoading: true, error: null });

    const { error } = await supabase
      .from('orders')
      .update(updates)
      .eq('id', id);

    if (error) {
      set({ error: error.message, isLoading: false });
      return;
    }

    // Refresh order
    await get().fetchOrderById(id);
    set({ isLoading: false });
  },

  updateOrderStatus: async (id: string, status: OrderStatus) => {
    await get().updateOrder(id, { status });
  },

  setFilters: (filters) => set((state) => ({ 
    filters: { ...state.filters, ...filters } 
  })),
  
  setSelectedOrder: (order) => set({ selectedOrder: order }),
  
  clearError: () => set({ error: null }),
}));

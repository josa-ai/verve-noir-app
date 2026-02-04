import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { Product } from '../types';

interface ProductState {
  products: Product[];
  selectedProduct: Product | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchProducts: () => Promise<void>;
  fetchProductById: (id: string) => Promise<void>;
  createProduct: (product: Partial<Product>) => Promise<{ id: string } | null>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  setSelectedProduct: (product: Product | null) => void;
  uploadImage: (file: File, productId: string) => Promise<string | null>;
  clearError: () => void;
}

export const useProductStore = create<ProductState>((set, get) => ({
  products: [],
  selectedProduct: null,
  isLoading: false,
  error: null,

  fetchProducts: async () => {
    set({ isLoading: true, error: null });

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .order('item_number');

    if (error) {
      set({ error: error.message, isLoading: false });
      return;
    }

    set({ products: (data as unknown as Product[]) || [], isLoading: false });
  },

  fetchProductById: async (id: string) => {
    set({ isLoading: true, error: null });

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      set({ error: error.message, isLoading: false });
      return;
    }

    set({ selectedProduct: data as unknown as Product, isLoading: false });
  },

  createProduct: async (product: Partial<Product>) => {
    set({ isLoading: true, error: null });

    const { data, error } = await supabase
      .from('products')
      .insert(product as Record<string, unknown>)
      .select('id')
      .single();

    if (error) {
      set({ error: error.message, isLoading: false });
      return null;
    }

    await get().fetchProducts();
    set({ isLoading: false });
    return { id: data.id };
  },

  updateProduct: async (id: string, updates: Partial<Product>) => {
    set({ isLoading: true, error: null });

    const { error } = await supabase
      .from('products')
      .update(updates as Record<string, unknown>)
      .eq('id', id);

    if (error) {
      set({ error: error.message, isLoading: false });
      return;
    }

    await get().fetchProducts();
    set({ isLoading: false });
  },

  deleteProduct: async (id: string) => {
    set({ isLoading: true, error: null });

    // Soft delete - just mark as inactive
    const { error } = await supabase
      .from('products')
      .update({ is_active: false })
      .eq('id', id);

    if (error) {
      set({ error: error.message, isLoading: false });
      return;
    }

    await get().fetchProducts();
    set({ isLoading: false });
  },

  uploadImage: async (file: File, productId: string) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${productId}-${Date.now()}.${fileExt}`;
    const filePath = `products/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('images')
      .upload(filePath, file);

    if (uploadError) {
      set({ error: uploadError.message });
      return null;
    }

    const { data } = supabase.storage.from('images').getPublicUrl(filePath);
    return data.publicUrl;
  },

  setSelectedProduct: (product) => set({ selectedProduct: product }),
  clearError: () => set({ error: null }),
}));

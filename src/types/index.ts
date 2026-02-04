export type OrderStatus = 'draft' | 'pending' | 'paid' | 'ready_to_ship' | 'shipped';
export type UserRole = 'admin' | 'user';
export type MatchStatus = 'pending' | 'auto_matched' | 'manual_review' | 'confirmed' | 'rejected';

export interface User {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  item_number: string;
  description: string;
  quantity_on_hand: number;
  price: number;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  position: number;
  item_number: string | null;
  description: string | null;
  image_url: string | null;
  quantity: number;
  matched_product_id: string | null;
  match_confidence: number | null;
  match_status: MatchStatus;
  final_price: number | null;
  created_at: string;
  updated_at: string;
  product?: Product;
}

export interface Order {
  id: string;
  customer_name: string;
  customer_address: string;
  customer_email: string;
  customer_phone: string;
  ghl_contact_id: string | null;
  ghl_invoice_id: string | null;
  status: OrderStatus;
  total_amount: number | null;
  notes: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
}

export interface MatchResult {
  productId: string | null;
  confidence: number;
  method: 'exact' | 'fuzzy' | 'ai' | 'none';
  reasoning?: string;
}

export interface OrderItemInput {
  item_number?: string;
  description?: string;
  quantity: number;
  image_url?: string;
}

export interface AuditLog {
  id: string;
  table_name: string;
  record_id: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  old_data: Record<string, unknown> | null;
  new_data: Record<string, unknown> | null;
  performed_by: string;
  created_at: string;
}

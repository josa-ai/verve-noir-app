export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          role: 'admin' | 'user'
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          role?: 'admin' | 'user'
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          role?: 'admin' | 'user'
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      products: {
        Row: {
          id: string
          item_number: string
          description: string
          quantity_on_hand: number
          price: number
          image_url: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          item_number: string
          description: string
          quantity_on_hand?: number
          price: number
          image_url?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          item_number?: string
          description?: string
          quantity_on_hand?: number
          price?: number
          image_url?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          customer_name: string
          customer_address: string
          customer_email: string
          customer_phone: string
          ghl_contact_id: string | null
          ghl_invoice_id: string | null
          status: 'draft' | 'pending' | 'paid' | 'ready_to_ship' | 'shipped'
          total_amount: number | null
          notes: string | null
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          customer_name: string
          customer_address: string
          customer_email: string
          customer_phone: string
          ghl_contact_id?: string | null
          ghl_invoice_id?: string | null
          status?: 'draft' | 'pending' | 'paid' | 'ready_to_ship' | 'shipped'
          total_amount?: number | null
          notes?: string | null
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          customer_name?: string
          customer_address?: string
          customer_email?: string
          customer_phone?: string
          ghl_contact_id?: string | null
          ghl_invoice_id?: string | null
          status?: 'draft' | 'pending' | 'paid' | 'ready_to_ship' | 'shipped'
          total_amount?: number | null
          notes?: string | null
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          position: number
          item_number: string | null
          description: string | null
          image_url: string | null
          quantity: number
          matched_product_id: string | null
          match_confidence: number | null
          match_status: 'pending' | 'auto_matched' | 'manual_review' | 'confirmed' | 'rejected'
          final_price: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          order_id: string
          position: number
          item_number?: string | null
          description?: string | null
          image_url?: string | null
          quantity: number
          matched_product_id?: string | null
          match_confidence?: number | null
          match_status?: 'pending' | 'auto_matched' | 'manual_review' | 'confirmed' | 'rejected'
          final_price?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          position?: number
          item_number?: string | null
          description?: string | null
          image_url?: string | null
          quantity?: number
          matched_product_id?: string | null
          match_confidence?: number | null
          match_status?: 'pending' | 'auto_matched' | 'manual_review' | 'confirmed' | 'rejected'
          final_price?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      audit_logs: {
        Row: {
          id: string
          table_name: string
          record_id: string
          action: 'CREATE' | 'UPDATE' | 'DELETE'
          old_data: Json | null
          new_data: Json | null
          performed_by: string
          created_at: string
        }
        Insert: {
          id?: string
          table_name: string
          record_id: string
          action: 'CREATE' | 'UPDATE' | 'DELETE'
          old_data?: Json | null
          new_data?: Json | null
          performed_by: string
          created_at?: string
        }
        Update: {
          id?: string
          table_name?: string
          record_id?: string
          action?: 'CREATE' | 'UPDATE' | 'DELETE'
          old_data?: Json | null
          new_data?: Json | null
          performed_by?: string
          created_at?: string
        }
      }
    }
    Enums: {
      order_status: 'draft' | 'pending' | 'paid' | 'ready_to_ship' | 'shipped'
      user_role: 'admin' | 'user'
      audit_action: 'CREATE' | 'UPDATE' | 'DELETE'
      match_status: 'pending' | 'auto_matched' | 'manual_review' | 'confirmed' | 'rejected'
    }
  }
}

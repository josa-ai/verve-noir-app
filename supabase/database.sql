-- ============================================================================
-- Verve Noir Order Processing System Database Schema
-- Run this in Supabase SQL Editor
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- ENUM TYPES
-- ============================================================================

CREATE TYPE order_status AS ENUM (
    'draft',
    'pending',
    'paid',
    'ready_to_ship',
    'shipped'
);

CREATE TYPE user_role AS ENUM (
    'admin',
    'user'
);

CREATE TYPE match_status AS ENUM (
    'pending',
    'auto_matched',
    'manual_review',
    'confirmed',
    'rejected'
);

CREATE TYPE audit_action AS ENUM (
    'CREATE',
    'UPDATE',
    'DELETE'
);

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Get current user ID
CREATE OR REPLACE FUNCTION get_current_user_id()
RETURNS UUID AS $$
BEGIN
    RETURN auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get current user role
CREATE OR REPLACE FUNCTION get_current_user_role()
RETURNS user_role AS $$
DECLARE
    v_role user_role;
BEGIN
    SELECT role INTO v_role
    FROM public.users
    WHERE id = auth.uid();
    RETURN v_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- TABLES
-- ============================================================================

-- Users table (extends Supabase Auth)
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    role user_role NOT NULL DEFAULT 'user',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_email ON users(email);

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Products table
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    item_number VARCHAR(255) UNIQUE NOT NULL,
    description TEXT NOT NULL,
    quantity_on_hand INTEGER NOT NULL DEFAULT 0,
    price DECIMAL(10, 2) NOT NULL,
    image_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_products_item_number ON products(item_number);
CREATE INDEX idx_products_active ON products(is_active);

CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Orders table
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_name VARCHAR(255) NOT NULL,
    customer_address TEXT NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(50) NOT NULL,
    ghl_contact_id VARCHAR(255),
    ghl_invoice_id VARCHAR(255),
    status order_status NOT NULL DEFAULT 'draft',
    total_amount DECIMAL(10, 2),
    notes TEXT,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX idx_orders_customer ON orders(customer_name);
CREATE INDEX idx_orders_ghl_contact ON orders(ghl_contact_id);

CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Order items table
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    position INTEGER NOT NULL CHECK (position BETWEEN 1 AND 3),
    item_number VARCHAR(255),
    description TEXT,
    image_url TEXT,
    quantity INTEGER NOT NULL DEFAULT 1,
    matched_product_id UUID REFERENCES products(id),
    match_confidence DECIMAL(5, 2),
    match_status match_status NOT NULL DEFAULT 'pending',
    final_price DECIMAL(10, 2),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(order_id, position)
);

CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_product ON order_items(matched_product_id);
CREATE INDEX idx_order_items_match_status ON order_items(match_status);

CREATE TRIGGER update_order_items_updated_at
    BEFORE UPDATE ON order_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Audit logs table
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    table_name VARCHAR(255) NOT NULL,
    record_id UUID NOT NULL,
    action audit_action NOT NULL,
    old_data JSONB,
    new_data JSONB,
    performed_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_table ON audit_logs(table_name);
CREATE INDEX idx_audit_logs_record ON audit_logs(record_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at DESC);

-- ============================================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view their own profile"
    ON users FOR SELECT
    USING (id = auth.uid());

CREATE POLICY "Admins can view all users"
    ON users FOR SELECT
    USING (get_current_user_role() = 'admin');

CREATE POLICY "Admins can insert users"
    ON users FOR INSERT
    WITH CHECK (get_current_user_role() = 'admin');

CREATE POLICY "Admins can update users"
    ON users FOR UPDATE
    USING (get_current_user_role() = 'admin');

-- Products policies
CREATE POLICY "Anyone can view active products"
    ON products FOR SELECT
    USING (is_active = TRUE);

CREATE POLICY "Admins can manage products"
    ON products FOR ALL
    USING (get_current_user_role() = 'admin');

-- Orders policies
CREATE POLICY "Admins can view all orders"
    ON orders FOR SELECT
    USING (get_current_user_role() = 'admin');

CREATE POLICY "Users can view orders they created"
    ON orders FOR SELECT
    USING (created_by = auth.uid());

CREATE POLICY "Admins can insert orders"
    ON orders FOR INSERT
    WITH CHECK (get_current_user_role() = 'admin');

CREATE POLICY "Admins can update orders"
    ON orders FOR UPDATE
    USING (get_current_user_role() = 'admin');

-- Order items policies
CREATE POLICY "Admins can view all order items"
    ON order_items FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM orders 
        WHERE orders.id = order_items.order_id 
        AND get_current_user_role() = 'admin'
    ));

CREATE POLICY "Users can view order items for their orders"
    ON order_items FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM orders 
        WHERE orders.id = order_items.order_id 
        AND orders.created_by = auth.uid()
    ));

CREATE POLICY "Admins can manage order items"
    ON order_items FOR ALL
    USING (get_current_user_role() = 'admin');

-- Audit logs policies
CREATE POLICY "Admins can view audit logs"
    ON audit_logs FOR SELECT
    USING (get_current_user_role() = 'admin');

CREATE POLICY "System can insert audit logs"
    ON audit_logs FOR INSERT
    WITH CHECK (TRUE);

-- ============================================================================
-- FUNCTIONS FOR ORDER PROCESSING
-- ============================================================================

-- Calculate order total
CREATE OR REPLACE FUNCTION calculate_order_total(p_order_id UUID)
RETURNS DECIMAL AS $$
DECLARE
    v_total DECIMAL(10, 2);
BEGIN
    SELECT COALESCE(SUM(final_price * quantity), 0)
    INTO v_total
    FROM order_items
    WHERE order_id = p_order_id
    AND match_status IN ('auto_matched', 'confirmed');
    
    RETURN v_total;
END;
$$ LANGUAGE plpgsql;

-- Update order total trigger
CREATE OR REPLACE FUNCTION update_order_total()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE orders
    SET total_amount = calculate_order_total(
        CASE 
            WHEN TG_OP = 'DELETE' THEN OLD.order_id
            ELSE NEW.order_id
        END
    )
    WHERE id = CASE 
        WHEN TG_OP = 'DELETE' THEN OLD.order_id
        ELSE NEW.order_id
    END;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_order_total_on_item_change
    AFTER INSERT OR UPDATE OR DELETE ON order_items
    FOR EACH ROW
    EXECUTE FUNCTION update_order_total();

-- ============================================================================
-- SEED DATA (Sample Products)
-- ============================================================================

INSERT INTO products (item_number, description, quantity_on_hand, price) VALUES
('VN-001', 'Classic Black T-Shirt - Premium Cotton', 100, 29.99),
('VN-002', 'Gold Accent Hoodie - Limited Edition', 50, 79.99),
('VN-003', 'Verve Noir Logo Cap - Adjustable', 75, 24.99),
('VN-004', 'Purple Streetwear Jacket', 30, 149.99),
('VN-005', 'Gold Chain Necklace - 18k Plated', 40, 59.99),
('VN-006', 'Noir Signature Sunglasses', 60, 89.99),
('VN-007', 'Urban Street Sneakers - Black/Gold', 25, 199.99),
('VN-008', 'Embroidered Crew Socks - 3 Pack', 200, 19.99),
('VN-009', 'Leather Crossbody Bag - Mini', 35, 129.99),
('VN-010', 'Statement Ring - Gold Finish', 45, 39.99);

-- ============================================================================
-- STORAGE BUCKET SETUP (Run in Supabase Dashboard)
-- ============================================================================
-- Create a bucket named 'images' for product and order images
-- Set bucket to public for image access
-- Add policy: Allow authenticated users to upload images
-- Add policy: Allow public access to view images
-- ============================================================================

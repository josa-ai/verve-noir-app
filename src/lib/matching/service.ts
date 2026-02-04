import { aiMatcher } from './ai-matcher';
import { MATCHING_CONFIG } from './config';
import { supabase } from '../supabase';
import type { OrderItemInput, MatchResult, MatchStatus } from '../../types';

export class MatchingService {
  async processOrderItem(
    orderItemId: string,
    item: OrderItemInput
  ): Promise<MatchResult> {
    // Perform AI matching
    const result = await aiMatcher.match(item);

    // Determine match status based on confidence
    const matchStatus = this.determineMatchStatus(result.confidence);

    // Update order item in database
    const { error } = await supabase
      .from('order_items')
      .update({
        matched_product_id: result.productId,
        match_confidence: result.confidence,
        match_status: matchStatus,
        final_price: result.productId ? await this.getProductPrice(result.productId) : null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderItemId);

    if (error) {
      console.error('Failed to update order item:', error);
      throw error;
    }

    return result;
  }

  async batchProcess(orderId: string, items: OrderItemInput[]): Promise<MatchResult[]> {
    const results: MatchResult[] = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      
      // Get the order item ID from the database
      const { data: orderItem } = await supabase
        .from('order_items')
        .select('id')
        .eq('order_id', orderId)
        .eq('position', i + 1)
        .single();

      if (orderItem) {
        const result = await this.processOrderItem(orderItem.id, item);
        results.push(result);
      }
    }

    return results;
  }

  async confirmMatch(
    orderItemId: string,
    productId: string,
    finalPrice?: number
  ): Promise<void> {
    const { error } = await supabase
      .from('order_items')
      .update({
        matched_product_id: productId,
        match_status: 'confirmed',
        final_price: finalPrice || (await this.getProductPrice(productId)),
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderItemId);

    if (error) {
      throw error;
    }
  }

  async rejectMatch(orderItemId: string): Promise<void> {
    const { error } = await supabase
      .from('order_items')
      .update({
        matched_product_id: null,
        match_status: 'rejected',
        final_price: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderItemId);

    if (error) {
      throw error;
    }
  }

  async reprocessMatch(orderItemId: string): Promise<MatchResult> {
    // Get current order item data
    const { data: orderItem, error } = await supabase
      .from('order_items')
      .select('*')
      .eq('id', orderItemId)
      .single();

    if (error || !orderItem) {
      throw new Error('Order item not found');
    }

    // Re-run matching
    const result = await this.processOrderItem(orderItemId, {
      item_number: orderItem.item_number || undefined,
      description: orderItem.description || undefined,
      quantity: orderItem.quantity,
      image_url: orderItem.image_url || undefined,
    });

    return result;
  }

  private determineMatchStatus(confidence: number): MatchStatus {
    if (confidence >= MATCHING_CONFIG.thresholds.autoAccept) {
      return 'auto_matched';
    } else if (confidence >= MATCHING_CONFIG.thresholds.quickReview) {
      return 'manual_review';
    }
    return 'manual_review';
  }

  private async getProductPrice(productId: string): Promise<number | null> {
    const { data: product } = await supabase
      .from('products')
      .select('price')
      .eq('id', productId)
      .single();

    return product?.price || null;
  }
}

// Singleton instance
export const matchingService = new MatchingService();

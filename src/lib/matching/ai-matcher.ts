import Fuse from 'fuse.js';
import { MATCHING_CONFIG, FIREWORKS_CONFIG } from './config';
import { supabase } from '../supabase';
import type { Product, MatchResult, OrderItemInput } from '../../types';

export class AIMatcher {
  private fuse: Fuse<Product> | null = null;
  private products: Product[] = [];

  async initialize(): Promise<void> {
    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true);

    if (error) {
      console.error('Failed to load products:', error);
      throw error;
    }

    this.products = products || [];
    this.fuse = new Fuse(this.products, {
      keys: MATCHING_CONFIG.fuzzy.keys,
      threshold: MATCHING_CONFIG.fuzzy.threshold,
      distance: MATCHING_CONFIG.fuzzy.distance,
      includeScore: true,
    });
  }

  async match(item: OrderItemInput): Promise<MatchResult> {
    // Ensure initialized
    if (!this.fuse) {
      await this.initialize();
    }

    // Step 1: Try exact match on item_number
    const exactMatch = this.findExactMatch(item.item_number);
    if (exactMatch) {
      return {
        productId: exactMatch.id,
        confidence: 100,
        method: 'exact',
        reasoning: 'Exact item number match',
      };
    }

    // Step 2: Get candidate products using fuzzy search
    const candidates = this.getCandidates(item);
    
    if (candidates.length === 0) {
      return {
        productId: null,
        confidence: 0,
        method: 'none',
        reasoning: 'No candidate products found',
      };
    }

    // Step 3: Use Kimi K2.5 via Fireworks.ai for intelligent matching
    try {
      const aiResult = await this.callKimiAI(item, candidates);
      return aiResult;
    } catch (error) {
      console.warn('AI matching failed, falling back to fuzzy:', error);
      
      // Fallback to best fuzzy match
      if (candidates.length > 0 && candidates[0].score !== undefined) {
        const bestMatch = candidates[0];
        const confidence = Math.round((1 - (bestMatch.score || 0)) * 100);
        return {
          productId: bestMatch.item.id,
          confidence,
          method: 'fuzzy',
          reasoning: 'Fuzzy match fallback (AI unavailable)',
        };
      }

      return {
        productId: null,
        confidence: 0,
        method: 'none',
        reasoning: 'Matching failed',
      };
    }
  }

  private findExactMatch(itemNumber?: string): Product | null {
    if (!itemNumber) return null;
    
    const normalized = itemNumber.toLowerCase().trim();
    const match = this.products.find(
      p => p.item_number.toLowerCase().trim() === normalized
    );
    
    return match || null;
  }

  private getCandidates(item: OrderItemInput): Array<{ item: Product; score?: number }> {
    if (!this.fuse) return [];

    const searchTerm = `${item.item_number || ''} ${item.description || ''}`.trim();
    
    if (!searchTerm) {
      return this.products.slice(0, MATCHING_CONFIG.ai.maxCandidates).map(p => ({ item: p }));
    }

    const results = this.fuse.search(searchTerm, {
      limit: MATCHING_CONFIG.ai.maxCandidates,
    });

    return results.map(r => ({ item: r.item, score: r.score }));
  }

  private async callKimiAI(
    item: OrderItemInput,
    candidates: Array<{ item: Product; score?: number }>
  ): Promise<MatchResult> {
    const prompt = this.buildPrompt(item, candidates);

    const response = await fetch(FIREWORKS_CONFIG.endpoint, {
      method: 'POST',
      headers: FIREWORKS_CONFIG.headers,
      body: JSON.stringify({
        model: FIREWORKS_CONFIG.model,
        messages: [
          {
            role: 'system',
            content: 'You are a product matching assistant for an order processing system. Your task is to match order items to products from a catalog. Respond only with valid JSON.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.1,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Fireworks API error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('Empty response from AI');
    }

    // Parse JSON response
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? jsonMatch[0] : content;
      const result = JSON.parse(jsonStr);

      return {
        productId: result.product_id || null,
        confidence: Math.min(100, Math.max(0, Math.round(result.confidence || 0))),
        method: 'ai',
        reasoning: result.reasoning || 'AI match',
      };
    } catch (parseError) {
      console.error('Failed to parse AI response:', content);
      throw new Error('Invalid JSON response from AI');
    }
  }

  private buildPrompt(
    item: OrderItemInput,
    candidates: Array<{ item: Product; score?: number }>
  ): string {
    const candidatesText = candidates
      .map((c, i) => {
        const product = c.item;
        return `${i + 1}. ID: ${product.id}
   Item Number: ${product.item_number}
   Description: ${product.description}
   Price: $${product.price}`;
      })
      .join('\n\n');

    return `Match this order item to the best product from the catalog:

ORDER ITEM:
- Item Number: ${item.item_number || 'N/A'}
- Description: ${item.description || 'N/A'}
- Quantity: ${item.quantity}

CANDIDATE PRODUCTS:
${candidatesText}

Instructions:
1. Compare the order item to each candidate product
2. Consider item number similarity, description similarity, and context
3. Return the ID of the best matching product
4. Provide a confidence score (0-100)
5. Explain your reasoning briefly

If no product matches well, return null for product_id.

Respond with ONLY this JSON format:
{
  "product_id": "uuid-string-or-null",
  "confidence": 85,
  "reasoning": "Brief explanation of why this matches"
}`;
  }
}

// Singleton instance
export const aiMatcher = new AIMatcher();

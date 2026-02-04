import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GHLContact {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address1?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  customFields?: Array<{ id: string; value: string }>;
}

interface WebhookPayload {
  type: string;
  contact?: GHLContact;
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify webhook signature (optional but recommended)
    // const signature = req.headers.get('X-Webhook-Signature');
    // TODO: Implement HMAC verification

    const payload: WebhookPayload = await req.json();
    console.log('Received webhook:', payload.type);

    switch (payload.type) {
      case 'contact.created':
      case 'contact.updated': {
        if (!payload.contact) {
          throw new Error('No contact data in webhook');
        }
        await handleContactWebhook(supabase, payload.contact);
        break;
      }
      case 'invoice.paid': {
        // Handle invoice payment
        console.log('Invoice paid webhook received');
        break;
      }
      default: {
        console.log('Unhandled webhook type:', payload.type);
      }
    }

    return new Response(
      JSON.stringify({ success: true }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});

async function handleContactWebhook(supabase: any, contact: GHLContact) {
  // Get default admin user for created_by
  const { data: adminUser } = await supabase
    .from('users')
    .select('id')
    .eq('role', 'admin')
    .limit(1)
    .single();

  if (!adminUser) {
    throw new Error('No admin user found');
  }

  // Check if order already exists for this contact
  const { data: existingOrder } = await supabase
    .from('orders')
    .select('id')
    .eq('ghl_contact_id', contact.id)
    .eq('status', 'draft')
    .single();

  // Build address string
  const addressParts = [
    contact.address1,
    contact.city,
    contact.state,
    contact.postalCode,
  ].filter(Boolean);
  const fullAddress = addressParts.join(', ');

  // Extract custom fields for items
  const customFields = contact.customFields || [];
  
  const getCustomField = (name: string) => {
    const field = customFields.find((f: any) => 
      f.id.toLowerCase().includes(name.toLowerCase())
    );
    return field?.value || '';
  };

  if (existingOrder) {
    // Update existing order
    await supabase
      .from('orders')
      .update({
        customer_name: `${contact.firstName || ''} ${contact.lastName || ''}`.trim(),
        customer_email: contact.email || '',
        customer_phone: contact.phone || '',
        customer_address: fullAddress,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existingOrder.id);

    // Update order items from custom fields
    await updateOrderItems(supabase, existingOrder.id, customFields);
  } else {
    // Create new order
    const { data: newOrder, error: orderError } = await supabase
      .from('orders')
      .insert({
        ghl_contact_id: contact.id,
        customer_name: `${contact.firstName || ''} ${contact.lastName || ''}`.trim(),
        customer_email: contact.email || '',
        customer_phone: contact.phone || '',
        customer_address: fullAddress,
        status: 'draft',
        created_by: adminUser.id,
      })
      .select('id')
      .single();

    if (orderError) {
      throw orderError;
    }

    // Create order items from custom fields
    await createOrderItems(supabase, newOrder.id, customFields);
  }
}

async function createOrderItems(supabase: any, orderId: string, customFields: any[]) {
  const items = [];
  
  // Try to extract up to 3 items from custom fields
  for (let i = 1; i <= 3; i++) {
    const itemNumber = getCustomFieldValue(customFields, `item_${i}_number`);
    const description = getCustomFieldValue(customFields, `item_${i}_description`);
    const quantity = parseInt(getCustomFieldValue(customFields, `item_${i}_quantity`)) || 1;
    const imageUrl = getCustomFieldValue(customFields, `item_${i}_image`);

    if (itemNumber || description) {
      items.push({
        order_id: orderId,
        position: i,
        item_number: itemNumber || null,
        description: description || null,
        quantity: quantity,
        image_url: imageUrl || null,
        match_status: 'pending',
      });
    }
  }

  if (items.length > 0) {
    const { error } = await supabase
      .from('order_items')
      .insert(items);

    if (error) {
      console.error('Error creating order items:', error);
    }
  }
}

async function updateOrderItems(supabase: any, orderId: string, customFields: any[]) {
  // Similar to create but updates existing
  for (let i = 1; i <= 3; i++) {
    const itemNumber = getCustomFieldValue(customFields, `item_${i}_number`);
    const description = getCustomFieldValue(customFields, `item_${i}_description`);
    const quantity = parseInt(getCustomFieldValue(customFields, `item_${i}_quantity`)) || 1;
    const imageUrl = getCustomFieldValue(customFields, `item_${i}_image`);

    if (itemNumber || description) {
      await supabase
        .from('order_items')
        .upsert({
          order_id: orderId,
          position: i,
          item_number: itemNumber || null,
          description: description || null,
          quantity: quantity,
          image_url: imageUrl || null,
        }, {
          onConflict: 'order_id,position'
        });
    }
  }
}

function getCustomFieldValue(customFields: any[], fieldName: string): string {
  // Try exact match first
  let field = customFields.find((f: any) => 
    f.id.toLowerCase() === fieldName.toLowerCase()
  );
  
  // Try partial match
  if (!field) {
    field = customFields.find((f: any) => 
      f.id.toLowerCase().includes(fieldName.toLowerCase())
    );
  }
  
  return field?.value || '';
}

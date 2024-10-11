import { createClient } from '@supabase/supabase-js'
import cuid from 'cuid'

export interface Env {
  SUPABASE_URL: string
  SUPABASE_KEY: string
}

async function fetchTokenPrice(address: string): Promise<number> {
  const response = await fetch(`https://api.jup.ag/price/v2?ids=${address}`);
  const data = await response.json();
  return parseFloat(data.data[address].price);
}

async function updateTokenPrices(supabase: any) {
  const { data: tokens, error } = await supabase.from('Token').select('*');
  if (error) throw error;

  for (const token of tokens) {
    const price = await fetchTokenPrice(token.address);
    await supabase
      .from('Token')
      .update({ price, updatedAt: new Date().toISOString() })
      .eq('id', token.id);
  }
}

async function updateIndexPrices(supabase: any) {
  const { data: indexes, error } = await supabase
    .from('Index')
    .select('*,tokens:TokenInIndex(token:Token(price),percentage)');
  if (error) throw error;

  for (const index of indexes) {
    let indexPrice = 0;
    for (const tokenInIndex of index.tokens) {
      indexPrice += tokenInIndex.token.price * (tokenInIndex.percentage / 100);
    }

    const now = new Date().toISOString();

    // Update Index price and updatedAt
    await supabase
      .from('Index')
      .update({ price: indexPrice, updatedAt: now })
      .eq('id', index.id);

    // Create new IndexChart record with manually generated CUID
    const { error: insertError } = await supabase
      .from('IndexChart')
      .insert({
        id: cuid(),  // Manually generate CUID
        indexAddress: index.address,
        price: indexPrice,
        timestamp: now,
        createdAt: now,
        updatedAt: now
      });

    if (insertError) {
      console.error('Error inserting IndexChart:', insertError);
    } else {
      console.log(`Successfully inserted IndexChart for index ${index.address}`);
    }
  }
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_KEY);

    const { data: indexes, error } = await supabase.from('Index').select('*');
    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify(indexes), {
      headers: { 'Content-Type': 'application/json' }
    });
  },

  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
    const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_KEY);

    try {
      await updateTokenPrices(supabase);
      await updateIndexPrices(supabase);
      console.log('Prices updated successfully');
    } catch (error) {
      console.error('Error updating prices:', error);
    }
  }
};
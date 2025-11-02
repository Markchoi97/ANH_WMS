import { supabase } from '../supabase';

export interface Outbound {
  id: string;
  product_name: string;
  customer_name: string;
  quantity: number;
  unit: string;
  outbound_date: string;
  status: string;
  created_at: string;
}

export async function getRecentOutbounds(limit: number = 5) {
  const { data, error } = await supabase
    .from('outbounds')
    .select('*')
    .order('outbound_date', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data as Outbound[];
}


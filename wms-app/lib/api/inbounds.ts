import { supabase } from '../supabase';

export interface Inbound {
  id: string;
  product_name: string;
  supplier_name: string;
  quantity: number;
  unit: string;
  inbound_date: string;
  status: string;
  created_at: string;
}

export async function getRecentInbounds(limit: number = 5) {
  const { data, error } = await supabase
    .from('inbounds')
    .select('*')
    .order('inbound_date', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data as Inbound[];
}


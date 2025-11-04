import { supabase } from '../supabase';
import { Product } from '@/types';

export async function getProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  
  return data.map(item => ({
    ...item,
    createdAt: new Date(item.created_at),
    updatedAt: new Date(item.updated_at),
  })) as Product[];
}

export async function getProduct(id: string) {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  
  return {
    ...data,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
  } as Product;
}

export async function createProduct(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) {
  const { data, error } = await supabase
    .from('products')
    .insert({
      name: product.name,
      sku: product.sku,
      category: product.category,
      quantity: product.quantity,
      unit: product.unit,
      min_stock: product.minStock,
      price: product.price,
      location: product.location,
      description: product.description,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateProduct(id: string, updates: Partial<Product>) {
  const { data, error } = await supabase
    .from('products')
    .update({
      name: updates.name,
      sku: updates.sku,
      category: updates.category,
      quantity: updates.quantity,
      unit: updates.unit,
      min_stock: updates.minStock,
      price: updates.price,
      location: updates.location,
      description: updates.description,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteProduct(id: string) {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function getLowStockProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .filter('quantity', 'lt', supabase.rpc('min_stock'));

  if (error) {
    // Fallback: get all products and filter in JS
    const allProducts = await getProducts();
    return allProducts.filter(p => p.quantity < p.minStock);
  }

  return data.map(item => ({
    ...item,
    createdAt: new Date(item.created_at),
    updatedAt: new Date(item.updated_at),
  })) as Product[];
}


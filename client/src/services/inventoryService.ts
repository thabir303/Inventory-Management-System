// src/services/inventoryService.ts
import api from '../utils/api';

// Types
export interface Category {
  id: number;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: number;
  name: string;
  category: number;
  category_name?: string;
  price: number;
  quantity: number;
  description: string | null;
  stock_threshold: number;
  sku: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Sale {
  id: number;
  product: number;
  product_name?: string;
  quantity_sold: number;
  sale_date: string;
  sold_by: number;
  sold_by_name?: string;
  total_price: number;
  created_at: string;
  updated_at: string;
}

export interface ProductFilters {
  category?: number;
  is_active?: boolean;
  min_price?: number;
  max_price?: number;
  min_quantity?: number;
  max_quantity?: number;
  low_stock?: boolean;
  search?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  count?: number;
}

// Categories
export const getCategories = async (): Promise<ApiResponse<Category[]>> => {
  const response = await api.get('/inventory/categories/');
  return response.data;
};

export const getCategory = async (id: number): Promise<ApiResponse<Category>> => {
  const response = await api.get(`/inventory/categories/${id}/`);
  return response.data;
};

export const createCategory = async (category: Partial<Category>): Promise<ApiResponse<Category>> => {
  const response = await api.post('/inventory/categories/', category);
  return response.data;
};

export const updateCategory = async (id: number, category: Partial<Category>): Promise<ApiResponse<Category>> => {
  const response = await api.put(`/inventory/categories/${id}/`, category);
  return response.data;
};

export const deleteCategory = async (id: number): Promise<ApiResponse<null>> => {
  const response = await api.delete(`/inventory/categories/${id}/`);
  return response.data;
};

// Products
export const getProducts = async (filters?: ProductFilters): Promise<ApiResponse<Product[]>> => {
  const params = new URLSearchParams();
  
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });
  }
  
  const response = await api.get(`/inventory/products/?${params.toString()}`);
  return response.data;
};

export const getLowStockProducts = async (): Promise<ApiResponse<Product[]>> => {
  const response = await api.get('/inventory/products/low-stock/');
  return response.data;
};

export const getProduct = async (id: number): Promise<ApiResponse<Product>> => {
  const response = await api.get(`/inventory/products/${id}/`);
  return response.data;
};

export const createProduct = async (product: Partial<Product>): Promise<ApiResponse<Product>> => {
  const response = await api.post('/inventory/products/', product);
  return response.data;
};

export const updateProduct = async (id: number, product: Partial<Product>): Promise<ApiResponse<Product>> => {
  const response = await api.put(`/inventory/products/${id}/`, product);
  return response.data;
};

export const deleteProduct = async (id: number): Promise<ApiResponse<null>> => {
  const response = await api.delete(`/inventory/products/${id}/`);
  return response.data;
};

// Sales
export const getSales = async (): Promise<ApiResponse<Sale[]>> => {
  const response = await api.get('/inventory/sales/');
  return response.data;
};

export const getSale = async (id: number): Promise<ApiResponse<Sale>> => {
  const response = await api.get(`/inventory/sales/${id}/`);
  return response.data;
};

export const createSale = async (sale: Partial<Sale>): Promise<ApiResponse<Sale>> => {
  const response = await api.post('/inventory/sales/', sale);
  return response.data;
};

export const updateSale = async (id: number, sale: Partial<Sale>): Promise<ApiResponse<Sale>> => {
  const response = await api.put(`/inventory/sales/${id}/`, sale);
  return response.data;
};

export const deleteSale = async (id: number): Promise<ApiResponse<null>> => {
  const response = await api.delete(`/inventory/sales/${id}/`);
  return response.data;
};
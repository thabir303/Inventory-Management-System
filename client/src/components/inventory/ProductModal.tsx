// client/src/components/ProductModal.tsx
import { useState, useEffect } from 'react';
import api from '../../utils/api';

interface Category {
    id: number;
    name: string;
  }
  
  interface Product {
    id?: number;
    name: string;
    category: number;
    price: number;
    quantity: number;
    description?: string;
    stock_threshold: number;
    sku?: string;
    is_active: boolean;
  }
  
  interface ProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    product: Product | null; // Changed from "product?: Product" to "product: Product | null"
    onSave: (product: Product) => void;
    categories: Category[]; // Added this prop since it's passed from ProductList
  }
  
  const ProductModal = ({ isOpen, onClose, product, onSave, categories }: ProductModalProps) => {
    // Removed the categories state since it's passed as a prop
    const [formData, setFormData] = useState<Product>({
      name: '',
      category: categories.length > 0 ? categories[0].id : 0,
      price: 0,
      quantity: 0,
      description: '',
      stock_threshold: 5,
      sku: '',
      is_active: true
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
  
    useEffect(() => {
      if (isOpen) {
        if (product) {
          setFormData(product);
        } else {
          resetForm();
        }
      }
    }, [isOpen, product, categories]);
  
    // Removed fetchCategories since categories are passed as props
  
    const resetForm = () => {
      setFormData({
        name: '',
        category: categories.length > 0 ? categories[0].id : 0,
        price: 0,
        quantity: 0,
        description: '',
        stock_threshold: 5,
        sku: '',
        is_active: true
      });
      setError('');
    };
  
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const { name, value, type } = e.target;
      let newValue: string | number | boolean = value;
  
      if (type === 'number') {
        newValue = parseFloat(value) || 0;
      } else if (type === 'checkbox') {
        newValue = (e.target as HTMLInputElement).checked;
      }
  
      setFormData({ ...formData, [name]: newValue });
    };
  
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      setError('');
  
      try {
        onSave(formData);
        onClose();
      } catch (error) {
        console.error('Error saving product:', error);
        setError('Failed to save product');
      } finally {
        setLoading(false);
      }
    };
  
    if (!isOpen) return null;
  
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <h2 className="text-xl font-bold mb-4">
            {product?.id ? 'Edit Product' : 'Add New Product'}
          </h2>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
                required
              >
                <option value="">Select a category</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="mb-4 grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Price</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Quantity</label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  min="0"
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                name="description"
                value={formData.description || ''}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
                rows={3}
              />
            </div>
            
            <div className="mb-4 grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Stock Threshold</label>
                <input
                  type="number"
                  name="stock_threshold"
                  value={formData.stock_threshold}
                  onChange={handleChange}
                  min="0"
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">SKU</label>
                <input
                  type="text"
                  name="sku"
                  value={formData.sku || ''}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
            </div>
            
            <div className="mb-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleChange}
                  className="mr-2"
                />
                <span className="text-sm font-medium">Active</span>
              </label>
            </div>
            
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border rounded"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded"
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };
  
  export default ProductModal;
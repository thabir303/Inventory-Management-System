// src/pages/inventory/ProductList.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiFilter } from 'react-icons/fi';
import { getProducts, deleteProduct, getCategories, ProductFilters, Product, Category } from '../../services/inventoryService';
import { useAuth } from '../../contexts/AuthContext';
import ProductModal from '../../components/inventory/ProductModal';
import DeleteConfirmationModal from '../../components/DeleteConfirmationModal';

const ProductList = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  console.log(isAdmin);
  
  
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  
  const [filters, setFilters] = useState<ProductFilters>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [productsResponse, categoriesResponse] = await Promise.all([
          getProducts(filters),
          getCategories()
        ]);
        
        const productsWithCategoryNames = productsResponse.data.map(product => {
          const category = categoriesResponse.data.find(cat => cat.id === product.category);
          return {
            ...product,
            category_name: category ? category.name : 'Unknown'
          };
        });
        
        setProducts(productsWithCategoryNames);
        setCategories(categoriesResponse.data);
        setError(null);
      } catch (err) {
        setError('Failed to load products. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [filters]);
  
  const handleSearch = () => {
    setFilters({
      ...filters,
      search: searchTerm
    });
  };
  
  const handleFilterChange = (key: keyof ProductFilters, value: any) => {
    setFilters({
      ...filters,
      [key]: value
    });
  };
  
  const handleAddProduct = () => {
    setEditingProduct(null);
    setShowAddModal(true);
  };
  
  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setShowAddModal(true);
  };
  
  const handleDeleteProduct = async () => {
    if (!productToDelete) return;
    
    try {
      await deleteProduct(productToDelete.id);
      setProducts(products.filter(p => p.id !== productToDelete.id));
      setProductToDelete(null);
    } catch (err) {
      setError('Failed to delete product. Please try again.');
      console.error(err);
    }
  };
  
  // Changed from Product to any to handle the different Product types
  const handleProductSaved = (savedProduct: any) => {
    const category = categories.find(cat => cat.id === savedProduct.category);
    const productWithCategory = {
      ...savedProduct,
      category_name: category ? category.name : 'Unknown'
    };
    
    if (editingProduct) {
      setProducts(products.map(p => p.id === savedProduct.id ? productWithCategory : p));
    } else {
      setProducts([productWithCategory, ...products]);
    }
    
    setShowAddModal(false);
    setEditingProduct(null);
  };
  
  const clearFilters = () => {
    setFilters({});
    setSearchTerm('');
  };
  
  return (
    <div className="page-container">
      <div className="page-header flex justify-between items-center">
        <h1 className="page-title">Products</h1>
        {isAdmin && (
          <button 
            className="btn btn-primary"
            onClick={handleAddProduct}
          >
            <FiPlus className="mr-2" />
            Add Product
          </button>
        )}
      </div>
      
      <div className="mb-6">
        <div className="flex items-center space-x-4 mb-4">
          <div className="flex-grow relative">
            <input
              type="text"
              placeholder="Search products..."
              className="form-input pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
          <button 
            className="btn btn-outline flex items-center"
            onClick={() => setShowFilters(!showFilters)}
          >
            <FiFilter className="mr-2" />
            Filters
          </button>
          <button 
            className="btn btn-outline"
            onClick={handleSearch}
          >
            Search
          </button>
        </div>
        
        {showFilters && (
          <div className="bg-white rounded-lg shadow-sm p-4 mb-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="form-label">Category</label>
              <select 
                className="form-select"
                value={filters.category || ''}
                onChange={(e) => handleFilterChange('category', e.target.value ? Number(e.target.value) : undefined)}
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="form-label">Status</label>
              <select 
                className="form-select"
                value={filters.is_active === undefined ? '' : filters.is_active ? 'true' : 'false'}
                onChange={(e) => {
                  const value = e.target.value;
                  handleFilterChange('is_active', value === '' ? undefined : value === 'true');
                }}
              >
                <option value="">All Status</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
            
            <div>
              <label className="form-label">Stock Level</label>
              <select 
                className="form-select"
                value={filters.low_stock ? 'true' : 'false'}
                onChange={(e) => handleFilterChange('low_stock', e.target.value === 'true')}
              >
                <option value="false">All Stock Levels</option>
                <option value="true">Low Stock Only</option>
              </select>
            </div>
            
            <div>
              <label className="form-label">Min Price</label>
              <input 
                type="number" 
                className="form-input"
                value={filters.min_price || ''}
                onChange={(e) => handleFilterChange('min_price', e.target.value ? Number(e.target.value) : undefined)}
                placeholder="Min Price"
              />
            </div>
            
            <div>
              <label className="form-label">Max Price</label>
              <input 
                type="number" 
                className="form-input"
                value={filters.max_price || ''}
                onChange={(e) => handleFilterChange('max_price', e.target.value ? Number(e.target.value) : undefined)}
                placeholder="Max Price"
              />
            </div>
            
            <div className="flex items-end">
              <button 
                className="btn btn-secondary w-full"
                onClick={clearFilters}
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}
      </div>
      
      {loading ? (
        <div className="text-center py-10">
          <div className="inline-block w-8 h-8 border-4 border-gray-200 border-t-teal-500 rounded-full animate-spin"></div>
          <p className="mt-2 text-gray-600">Loading products...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-800 p-4 rounded-md">
          {error}
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-10 text-center">
          <p className="text-gray-500 mb-4">No products found</p>
          {isAdmin && (
            <button 
              className="btn btn-primary"
              onClick={handleAddProduct}
            >
              <FiPlus className="mr-2" />
              Add First Product
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Quantity</th>
                  <th>Status</th>
                  <th>Stock Level</th>
                  {isAdmin && <th>Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {products.map(product => (
                  <tr key={product.id}>
                    <td className="font-medium text-gray-900">{product.name}</td>
                    <td>{product.category_name}</td>
                    <td>${product.price.toFixed(2)}</td>
                    <td>{product.quantity}</td>
                    <td>
                      <span className={`badge ${product.is_active ? 'badge-success' : 'badge-error'}`}>
                        {product.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${product.quantity <= product.stock_threshold ? 'badge-warning' : 'badge-success'}`}>
                        {product.quantity <= product.stock_threshold ? 'Low Stock' : 'In Stock'}
                      </span>
                    </td>
                    {isAdmin && (
                      <td className="flex space-x-2">
                        <button 
                          className="p-1 text-teal-600 hover:text-teal-800"
                          onClick={() => handleEditProduct(product)}
                        >
                          <FiEdit2 />
                        </button>
                        <button 
                          className="p-1 text-red-600 hover:text-red-800"
                          onClick={() => setProductToDelete(product)}
                        >
                          <FiTrash2 />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {showAddModal && (
        <ProductModal
          isOpen={showAddModal}
          onClose={() => {
            setShowAddModal(false);
            setEditingProduct(null);
          }}
          onSave={handleProductSaved}
          product={editingProduct}
          categories={categories}
        />
      )}
      
      {productToDelete && (
        <DeleteConfirmationModal
          isOpen={!!productToDelete}
          title="Delete Product"
          message={`Are you sure you want to delete ${productToDelete.name}? This action cannot be undone.`}
          onConfirm={handleDeleteProduct}
          onClose={() => setProductToDelete(null)}  
        />
      )}
    </div>
  );
};

export default ProductList;
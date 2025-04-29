// client/src/pages/Dashboard.tsx
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getLowStockProducts, getProducts, getCategories,Product } from '../services/inventoryService';
import LoadingSpinner from '../components/LoadingSpinner';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';


interface DashboardStats {
  totalProducts: number;
  lowStockProducts: number;
  activeProducts: number;
  averagePrice: number;
  totalInventoryValue: number;
  categoryDistribution: { name: string; value: number }[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d', '#ffc658'];

const Dashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    lowStockProducts: 0,
    activeProducts: 0,
    averagePrice: 0,
    totalInventoryValue: 0,
    categoryDistribution: []
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Fetch low stock products
        const lowStockResponse = await getLowStockProducts();
        if (lowStockResponse.success) {
          setLowStockProducts(lowStockResponse.data);
        }

        // Fetch categories
        const categoriesResponse = await getCategories();
        const categories = categoriesResponse.success ? categoriesResponse.data : [];
        
        // Fetch general product stats
        const productsResponse = await getProducts();
        if (productsResponse.success) {
          const products = productsResponse.data;
          const activeProducts = products.filter((p: Product) => p.is_active);
          
          const totalPrice = products.reduce((sum: number, product: Product) => 
            sum + parseFloat(product.price.toString()), 0);
          
          const totalValue = products.reduce((sum: number, product: Product) => 
            sum + (parseFloat(product.price.toString()) * product.quantity), 0);
          
          // Calculate category distribution
          const categoryMap = new Map<string, number>();
          products.forEach((product: Product) => {
            const categoryName = product.category_name || 'Uncategorized';
            categoryMap.set(categoryName, (categoryMap.get(categoryName) || 0) + 1);
          });

          const barChartData = lowStockProducts.map(product => ({
            name: product.name.length > 15 ? product.name.substring(0, 15) + '...' : product.name,
            current: product.quantity,
            threshold: product.stock_threshold
          })).slice(0, 5);
          
          const categoryDistribution = Array.from(categoryMap).map(([name, value]) => ({
            name,
            value
          }));
          
          setStats({
            totalProducts: products.length,
            lowStockProducts: lowStockResponse.data.length,
            activeProducts: activeProducts.length,
            averagePrice: products.length ? totalPrice / products.length : 0,
            totalInventoryValue: totalValue,
            categoryDistribution
          });
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const getBarChartData = () => {
    return lowStockProducts.map(product => ({
      name: product.name.length > 15 ? product.name.substring(0, 15) + '...' : product.name,
      current: product.quantity,
      threshold: product.stock_threshold
    })).slice(0, 5); // Show only top 5 low stock items for better visibility
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      
      {/* Welcome message */}
      <div className="bg-white p-6 rounded shadow mb-6">
        <h2 className="text-xl font-semibold mb-2">Welcome, {user?.first_name}!</h2>
        <p className="text-gray-600">
          {user?.role === 'admin' 
            ? 'You have admin access to manage inventory, users, and view sales data.'
            : 'You have access to view inventory and product information.'}
        </p>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-6 rounded shadow">
          <p className="text-sm text-gray-500 mb-1">Total Products</p>
          <h3 className="text-3xl font-bold">{stats.totalProducts}</h3>
        </div>
        
        <div className="bg-white p-6 rounded shadow">
          <p className="text-sm text-gray-500 mb-1">Active Products</p>
          <h3 className="text-3xl font-bold">{stats.activeProducts}</h3>
        </div>
        
        <div className="bg-white p-6 rounded shadow">
          <p className="text-sm text-gray-500 mb-1">Low Stock Items</p>
          <h3 className="text-3xl font-bold text-orange-500">{stats.lowStockProducts}</h3>
        </div>
        
        <div className="bg-white p-6 rounded shadow">
          <p className="text-sm text-gray-500 mb-1">Inventory Value</p>
          <h3 className="text-3xl font-bold">${stats.totalInventoryValue.toFixed(2)}</h3>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Category Distribution */}
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-xl font-semibold mb-4">Product Categories</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.categoryDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {stats.categoryDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Stock Levels */}
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-xl font-semibold mb-4">Low Stock Items</h2>
          {lowStockProducts.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <p className="text-gray-500">No products are currently low in stock.</p>
            </div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={getBarChartData()}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="current" fill="#82ca9d" name="Current Stock" />
                  <Bar dataKey="threshold" fill="#ff7f0e" name="Threshold" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
      
      {/* Low Stock Products Table */}
      <div className="bg-white p-6 rounded shadow mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Low Stock Products</h2>
          <a 
            href="/inventory/products" 
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            View All Products →
          </a>
        </div>
        
        {lowStockProducts.length === 0 ? (
          <p className="text-gray-500 py-4">No products are currently low in stock.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Product</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">SKU</th>
                  <th className="px-4 py-2 text-right text-sm font-medium text-gray-500">Price</th>
                  <th className="px-4 py-2 text-right text-sm font-medium text-gray-500">Current Stock</th>
                  <th className="px-4 py-2 text-right text-sm font-medium text-gray-500">Threshold</th>
                </tr>
              </thead>
              <tbody>
                {lowStockProducts.map(product => (
                  <tr key={product.id} className="border-t">
                    <td className="px-4 py-3">
                      <div>
                        <div className="font-medium">{product.name}</div>
                        <div className="text-sm text-gray-500">{product.category_name}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{product.sku || '-'}</td>
                    <td className="px-4 py-3 text-right font-medium">${product.price.toFixed(2)}</td>
                    <td className="px-4 py-3 text-right font-medium text-red-500">
                      {product.quantity}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-500">{product.stock_threshold}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* Account Information */}
      <div className="bg-white p-6 rounded shadow">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Account Information</h2>
          <a 
            href="/profile" 
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            Edit Profile →
          </a>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-gray-50 rounded">
            <p className="text-sm text-gray-500 mb-1">Name</p>
            <p className="font-medium">{user?.first_name} {user?.last_name}</p>
          </div>
          
          <div className="p-4 bg-gray-50 rounded">
            <p className="text-sm text-gray-500 mb-1">Email</p>
            <p className="font-medium">{user?.email}</p>
          </div>
          
          <div className="p-4 bg-gray-50 rounded">
            <p className="text-sm text-gray-500 mb-1">Role</p>
            <p className="font-medium">
              <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium 
                ${user?.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                {user?.role === 'admin' ? 'Administrator' : 'Regular User'}
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
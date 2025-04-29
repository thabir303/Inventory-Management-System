import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import PublicLayout from './layouts/PublicLayout';
import PrivateLayout from './layouts/PrivateLayout';
import AdminLayout from './layouts/AdminLayout';
import Register from './pages/auth/Register';
import GoogleCallback from './components/GoogleCallback';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Login from './pages/auth/Login';
import AdminDashboard from './pages/admin/AdminDashboard';
import UserDetails from './pages/admin/UserDetails';
import UserList from './pages/admin/UserList';
import ProductList from './pages/inventory/ProductList';

const App = () => {
  const { isAuthenticated, user } = useAuth();
  const isAdmin = user?.role === 'admin';

  return (
    <Routes>
      {/* Public Routes */}
      <Route element={<PublicLayout/>}>
        <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />} />
        <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/dashboard" />} />
        <Route path="/auth/google/callback" element={<GoogleCallback />} />
        <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} />
        <Route path='/inventory/products' element={<ProductList/>} />'
      </Route>

      {/* Private Routes */}
      <Route element={<PrivateLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
      </Route>

      {/* Admin Routes */}
      <Route element={<AdminLayout />}>
        <Route path="/admin" element={isAdmin ? <AdminDashboard/> : <Navigate to="/dashboard" />} />
        <Route path="/admin/users" element={isAdmin ? <UserList /> : <Navigate to="/dashboard" />} />
        <Route path="/admin/users/:userId" element={isAdmin ? <UserDetails /> : <Navigate to="/dashboard" />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default App;
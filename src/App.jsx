import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { ContentProvider } from './context/ContentContext';
import { AuthProvider } from './context/AuthContext';
import Home from './pages/Home';
import Productos from './pages/Productos';
import CartModal from './components/CartModal';
import ConfirmModal from './components/ConfirmModal';

// Admin
import ProtectedRoute from './components/admin/ProtectedRoute';
import Login from './pages/admin/Login';
import AdminLayout from './pages/admin/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import AdminHeader from './pages/admin/AdminHeader';
import AdminCategories from './pages/admin/AdminCategories';
import AdminUniquePieces from './pages/admin/AdminUniquePieces';
import AdminAbout from './pages/admin/AdminAbout';
import AdminProcess from './pages/admin/AdminProcess';
import AdminWorldwide from './pages/admin/AdminWorldwide';
import AdminTestimonials from './pages/admin/AdminTestimonials';
import AdminFooter from './pages/admin/AdminFooter';
import AdminProducts from './pages/admin/AdminProducts';
import AdminProductsPage from './pages/admin/AdminProductsPage';
import AdminControl from './pages/admin/AdminControl';

// Importar estilos
import './styles/variables.css';
import './styles/header.css';
import './styles/hero.css';
import './styles/secciones.css';
import './styles/productos.css';
import './styles/footer.css';
import './styles/admin.css';

function App() {
  return (
    <AuthProvider>
      <ContentProvider>
        <CartProvider>
          <Router>
            <Routes>
              {/* Public */}
              <Route path="/" element={<Home />} />
              <Route path="/productos" element={<Productos />} />

              {/* Admin */}
              <Route path="/admin/login" element={<Login />} />
              <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
                <Route index element={<AdminHeader />} />
                <Route path="categories" element={<AdminCategories />} />
                <Route path="unique-pieces" element={<AdminUniquePieces />} />
                <Route path="about" element={<AdminAbout />} />
                <Route path="process" element={<AdminProcess />} />
                <Route path="worldwide" element={<AdminWorldwide />} />
                <Route path="testimonials" element={<AdminTestimonials />} />
                <Route path="footer" element={<AdminFooter />} />
                <Route path="products" element={<AdminProducts />} />
                <Route path="products-page" element={<AdminProductsPage />} />
                <Route path="control" element={<AdminControl />} />
              </Route>
            </Routes>
            <CartModal />
            <ConfirmModal />
          </Router>
        </CartProvider>
      </ContentProvider>
    </AuthProvider>
  );
}

export default App;

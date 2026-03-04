import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { ContentProvider } from './context/ContentContext';
import { AuthProvider } from './context/AuthContext';
import Home from './pages/Home';
import Productos from './pages/Productos';
import CartModal from './components/CartModal';
import ConfirmModal from './components/ConfirmModal';

// Admin (lazy loading - no se cargan en el bundle público)
import ProtectedRoute from './components/admin/ProtectedRoute';
const Login = lazy(() => import('./pages/admin/Login'));
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'));
const Dashboard = lazy(() => import('./pages/admin/Dashboard'));
const AdminHeader = lazy(() => import('./pages/admin/AdminHeader'));
const AdminCategories = lazy(() => import('./pages/admin/AdminCategories'));
const AdminUniquePieces = lazy(() => import('./pages/admin/AdminUniquePieces'));
const AdminAbout = lazy(() => import('./pages/admin/AdminAbout'));
const AdminProcess = lazy(() => import('./pages/admin/AdminProcess'));
const AdminWorldwide = lazy(() => import('./pages/admin/AdminWorldwide'));
const AdminTestimonials = lazy(() => import('./pages/admin/AdminTestimonials'));
const AdminFooter = lazy(() => import('./pages/admin/AdminFooter'));
const AdminProducts = lazy(() => import('./pages/admin/AdminProducts'));
const AdminProductsPage = lazy(() => import('./pages/admin/AdminProductsPage'));
const AdminControl = lazy(() => import('./pages/admin/AdminControl'));

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

              {/* Admin (lazy loaded) */}
                <Route path="/admin/login" element={<Suspense fallback={<div style={{display:'flex',justifyContent:'center',alignItems:'center',height:'100vh'}}>Cargando...</div>}><Login /></Suspense>} />
                <Route path="/admin" element={<Suspense fallback={<div style={{display:'flex',justifyContent:'center',alignItems:'center',height:'100vh'}}>Cargando...</div>}><ProtectedRoute><AdminLayout /></ProtectedRoute></Suspense>}>
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

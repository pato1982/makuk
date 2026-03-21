import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useContent } from '../../context/ContentContext';


const navItems = [
  { to: '/admin', label: 'Header', icon: 'fa-heading', end: true },
  { to: '/admin/categories', label: 'Categorías', icon: 'fa-th-large' },
  { to: '/admin/unique-pieces', label: 'Piezas Únicas', icon: 'fa-gem' },
  { to: '/admin/about', label: 'Nosotros', icon: 'fa-users' },
  { to: '/admin/process', label: 'Proceso', icon: 'fa-cogs' },
  { to: '/admin/worldwide', label: 'Presencia Global', icon: 'fa-globe' },
  { to: '/admin/testimonials', label: 'Testimonios', icon: 'fa-quote-left' },
  { to: '/admin/footer', label: 'Footer', icon: 'fa-shoe-prints' },
  { to: '/admin/control', label: 'Control', icon: 'fa-database' },
];

function AdminLayout() {
  const { logout } = useAuth();
  const { contentLoading } = useContent();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  return (
    <div className="admin-layout">
      <button className="admin-menu-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
        <i className={`fas ${sidebarOpen ? 'fa-times' : 'fa-bars'}`}></i>
      </button>

      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="admin-sidebar-header">
          <h2>MAKUK</h2>
          <span>Admin Panel</span>
        </div>
        <nav className="admin-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <i className={`fas ${item.icon}`}></i>
              <span>{item.label}</span>
            </NavLink>
          ))}
          <div className="admin-sidebar-footer">
            <div className="admin-sidebar-footer-row">
              <button onClick={handleLogout} className="btn-logout">
                <i className="fas fa-sign-out-alt"></i> Salir
              </button>
              <a href="/" target="_blank" rel="noopener noreferrer" className="btn-view-site">
                <i className="fas fa-external-link-alt"></i> Ver sitio
              </a>
            </div>
          </div>
        </nav>
      </aside>

      {sidebarOpen && <div className="admin-overlay" onClick={() => setSidebarOpen(false)}></div>}

      <main className="admin-main">
        {contentLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
            <i className="fas fa-spinner fa-spin" style={{ fontSize: '2rem', color: '#b87333' }}></i>
          </div>
        ) : (
          <Outlet />
        )}
      </main>
    </div>
  );
}

export default AdminLayout;

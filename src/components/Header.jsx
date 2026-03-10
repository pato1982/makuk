import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useContent } from '../context/ContentContext';
import ContactModal from './ContactModal';
import TrackingModal from './TrackingModal';

function Header({ alwaysScrolled = false }) {
  const [isScrolled, setIsScrolled] = useState(alwaysScrolled);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showTrackingModal, setShowTrackingModal] = useState(false);
  const { cantidadProductos, setShowCartModal } = useCart();
  const { content } = useContent();
  const location = useLocation();
  const navigate = useNavigate();
  const headerRef = useRef(null);

  const { logo, tagline, navItems } = content.header;

  useEffect(() => {
    if (alwaysScrolled) {
      setIsScrolled(true);
      return;
    }

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [alwaysScrolled]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuOpen && headerRef.current && !headerRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [menuOpen]);

  const scrollToSection = (sectionId) => {
    setMenuOpen(false);
    if (sectionId === 'categorias') {
      navigate('/productos');
      return;
    }
    if (sectionId === 'contacto') {
      setShowContactModal(true);
      return;
    }
    if (location.pathname !== '/') {
      navigate('/', { state: { scrollTo: sectionId } });
      return;
    }
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <>
    <header ref={headerRef} className={`header ${isScrolled ? 'scrolled' : ''}`}>
      <div className="header-container">
        <div className="logo">
          <Link to="/">
            <h1>{logo}</h1>
            <span className="tagline">{tagline}</span>
          </Link>
        </div>

        <nav className={`nav-menu ${menuOpen ? 'active' : ''}`}>
          <ul>
            {navItems.map((item, i) => (
              <li key={i}><a onClick={() => scrollToSection(item.sectionId)}>{item.label}</a></li>
            ))}
          </ul>
        </nav>

        <div className="header-actions">
          <button
            className="cart-icon"
            onClick={() => setShowCartModal(true)}
            aria-label="Ver carrito"
          >
            <i className="fas fa-shopping-cart"></i>
            <span className={`cart-count ${cantidadProductos > 0 ? 'visible' : ''}`}>
              {cantidadProductos}
            </span>
          </button>
          <button
            className="cart-icon"
            onClick={() => setShowTrackingModal(true)}
            aria-label="Seguimiento de orden"
          >
            <i className="fas fa-box-open"></i>
          </button>
          <button
            className="cart-icon"
            onClick={() => navigate('/admin/login')}
            aria-label="Iniciar sesión"
          >
            <i className="fas fa-user"></i>
          </button>
        </div>

        <button
          className={`menu-toggle ${menuOpen ? 'active' : ''}`}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </header>

    <ContactModal show={showContactModal} onClose={() => setShowContactModal(false)} />
    <TrackingModal show={showTrackingModal} onClose={() => setShowTrackingModal(false)} />
    </>
  );
}

export default Header;

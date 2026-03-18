import { useState, useEffect, useRef } from 'react';
import { loginApi } from '../services/api';
import '../styles/coming-soon.css';

function ComingSoon() {
  const [loaded, setLoaded] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const emailRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (showLogin && emailRef.current) {
      emailRef.current.focus();
    }
  }, [showLogin]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await loginApi(email, password);
      sessionStorage.setItem('makuk_site_unlocked', 'true');
      window.location.reload();
    } catch {
      // Credenciales incorrectas: cerrar sin aviso
      setShowLogin(false);
      setEmail('');
      setPassword('');
    }
  };

  return (
    <div className={`coming-soon ${loaded ? 'loaded' : ''}`}>
      {/* Partículas decorativas */}
      <div className="cs-particles">
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i} className="cs-particle" style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 8}s`,
            animationDuration: `${6 + Math.random() * 8}s`,
          }} />
        ))}
      </div>

      {/* Contenido principal */}
      <div className="cs-content">
        <div className="cs-brand">
          <h1 className="cs-logo">MAKUK</h1>
          <div className="cs-divider" />
          <p className="cs-tagline">Joyería Tejida en Cobre</p>
        </div>

        <div className="cs-message">
          <h2 className="cs-title">Estamos preparando algo especial</h2>
          <p className="cs-subtitle">
            Nuestra tienda online está en desarrollo.<br />
            Pronto podrás descubrir piezas únicas, tejidas a mano con cobre.
          </p>
        </div>

        <div className="cs-ornament">
          <span className="cs-line" />
          <i className="fas fa-gem cs-icon" />
          <span className="cs-line" />
        </div>

        <div className="cs-social">
          <a href="https://www.instagram.com/invites/contact/?i=1kcr0azttpohv&utm_content=1fwlfjd" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
            <i className="fab fa-instagram" />
          </a>
          <a href="mailto:makukcobre@gmail.com" aria-label="Email">
            <i className="fas fa-envelope" />
          </a>
        </div>
      </div>

      {/* Acceso admin discreto */}
      <button
        className="cs-admin-access"
        onClick={() => setShowLogin(!showLogin)}
        aria-label="Acceso administrador"
      >
        <i className="fas fa-lock" />
      </button>

      {/* Mini login oculto */}
      {showLogin && (
        <form className="cs-login-form" onSubmit={handleLogin}>
          <input
            ref={emailRef}
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">
            <i className="fas fa-arrow-right" />
          </button>
        </form>
      )}
    </div>
  );
}

export default ComingSoon;

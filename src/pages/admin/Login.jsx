import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (login(email, password)) {
      navigate('/admin');
    } else {
      setError('Credenciales incorrectas');
    }
  };

  return (
    <div className="admin-login">
      <div className="login-card">
        <h1>MAKUK</h1>
        <p className="login-subtitle">Panel de Administración</p>
        <form onSubmit={handleSubmit}>
          {error && <div className="login-error">{error}</div>}
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@makuk.cl"
              required
            />
          </div>
          <div className="form-group">
            <label>Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          <button type="submit" className="btn-login">Iniciar Sesión</button>
        </form>
        <button
          type="button"
          className="btn-quick-login"
          onClick={() => {
            const user = import.meta.env.VITE_ADMIN_USER || 'admin@makuk.cl';
            const pass = import.meta.env.VITE_ADMIN_PASS || 'makuk2024';
            if (login(user, pass)) {
              navigate('/admin');
            }
          }}
        >
          <i className="fas fa-bolt"></i> Acceso rápido
        </button>
      </div>
    </div>
  );
}

export default Login;

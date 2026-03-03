import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { requestRecovery } from '../../services/api';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showRecovery, setShowRecovery] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoverySent, setRecoverySent] = useState(false);
  const [recoveryError, setRecoveryError] = useState('');
  const { login, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  // Si ya está logueado, redirigir al admin
  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate('/admin', { replace: true });
    }
  }, [loading, isAuthenticated, navigate]);

  const handleRecovery = async (e) => {
    e.preventDefault();
    setRecoveryError('');
    try {
      await requestRecovery(recoveryEmail);
      setRecoverySent(true);
    } catch (err) {
      setRecoveryError(err.message || 'Error al enviar recuperación');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(email, password);
      navigate('/admin');
    } catch (err) {
      setError(err.message || 'Credenciales incorrectas');
    } finally {
      setSubmitting(false);
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
              placeholder="correo@ejemplo.com"
              required
              disabled={submitting}
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
              disabled={submitting}
            />
          </div>
          <button type="submit" className="btn-login" disabled={submitting}>
            {submitting ? 'Ingresando...' : 'Iniciar Sesión'}
          </button>
        </form>
        <button type="button" className="btn-forgot" onClick={() => { setShowRecovery(true); setRecoverySent(false); setRecoveryEmail(''); setRecoveryError(''); }}>
          ¿Olvidaste tu contraseña?
        </button>
      </div>

      {showRecovery && (
        <div className="admin-modal-overlay" onClick={() => setShowRecovery(false)}>
          <div className="login-recovery-popup" onClick={(e) => e.stopPropagation()}>
            <button className="admin-modal-close" onClick={() => setShowRecovery(false)}>
              <i className="fas fa-times"></i>
            </button>
            {!recoverySent ? (
              <>
                <h3>Recuperar contraseña</h3>
                <p>Ingresa tu correo y te enviaremos una llave provisoria para generar una nueva contraseña.</p>
                {recoveryError && <div className="login-error">{recoveryError}</div>}
                <form onSubmit={handleRecovery}>
                  <div className="form-group">
                    <label>Correo electrónico</label>
                    <input
                      type="email"
                      value={recoveryEmail}
                      onChange={(e) => setRecoveryEmail(e.target.value)}
                      placeholder="tu@correo.com"
                      required
                    />
                  </div>
                  <button type="submit" className="btn-login">Enviar llave</button>
                </form>
              </>
            ) : (
              <div className="login-recovery-sent">
                <i className="fas fa-check-circle"></i>
                <h3>Llave enviada</h3>
                <p>Se envió una llave provisoria a <strong>{recoveryEmail}</strong>. Revisa tu bandeja de entrada.</p>
                <button type="button" className="btn-login" onClick={() => setShowRecovery(false)}>Cerrar</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Login;

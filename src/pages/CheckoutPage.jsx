import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import '../styles/checkout.css';

function CheckoutPage() {
  const navigate = useNavigate();
  const { carrito, formatearPrecio, calcularDesglose, getTotales, vaciarCarrito } = useCart();
  const { totalNeto, totalIva, totalTotal } = getTotales();

  const [customer, setCustomer] = useState({ name: '', email: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Si el carrito está vacío, redirigir
  if (carrito.length === 0) {
    return (
      <div className="checkout-page">
        <div className="checkout-container">
          <div className="checkout-empty">
            <i className="fas fa-shopping-cart"></i>
            <h2>Tu carrito está vacío</h2>
            <p>Agrega productos antes de continuar con el pago.</p>
            <button className="checkout-btn secondary" onClick={() => navigate('/productos')}>
              <i className="fas fa-arrow-left"></i> Ver productos
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Preparar items para el backend
      const items = carrito.map(item => ({
        nombre: item.nombre,
        precioUnitario: item.precioTotal,
        cantidad: item.cantidad,
      }));

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customer, items }),
      });

      const data = await res.json();

      if (!res.ok) {
        const detail = data.details
          ? (typeof data.details === 'string' ? data.details : JSON.stringify(data.details))
          : '';
        throw new Error(`${data.error || 'Error al crear la orden'}${detail ? ` — ${detail}` : ''}`);
      }

      // Vaciar carrito y redirigir a Flow checkout
      vaciarCarrito();
      window.location.href = data.checkoutUrl;

    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="checkout-page">
      <div className="checkout-container">
        <div className="checkout-header">
          <button className="checkout-back" onClick={() => navigate(-1)}>
            <i className="fas fa-arrow-left"></i> Volver
          </button>
          <h1>Finalizar Compra</h1>
          <div className="copper-divider center"></div>
        </div>

        <div className="checkout-grid">
          {/* Columna izquierda: Formulario */}
          <div className="checkout-form-section">
            <h2><i className="fas fa-user"></i> Datos del Comprador</h2>
            <form onSubmit={handleSubmit} className="checkout-form">
              <div className="checkout-field">
                <label htmlFor="name">Nombre completo *</label>
                <input
                  id="name"
                  type="text"
                  required
                  placeholder="Ej: María González"
                  value={customer.name}
                  onChange={e => setCustomer(p => ({ ...p, name: e.target.value }))}
                />
              </div>

              <div className="checkout-field">
                <label htmlFor="email">Email *</label>
                <input
                  id="email"
                  type="email"
                  required
                  placeholder="Ej: maria@email.com"
                  value={customer.email}
                  onChange={e => setCustomer(p => ({ ...p, email: e.target.value }))}
                />
                <span className="checkout-field-hint">
                  Recibirás la confirmación de pago en este email
                </span>
              </div>

              <div className="checkout-field">
                <label htmlFor="phone">Teléfono (opcional)</label>
                <input
                  id="phone"
                  type="tel"
                  placeholder="Ej: +56 9 1234 5678"
                  value={customer.phone}
                  onChange={e => setCustomer(p => ({ ...p, phone: e.target.value }))}
                />
              </div>

              {error && (
                <div className="checkout-error">
                  <i className="fas fa-exclamation-circle"></i> {error}
                </div>
              )}

              <button
                type="submit"
                className="checkout-btn primary"
                disabled={loading}
              >
                {loading ? (
                  <><i className="fas fa-spinner fa-spin"></i> Procesando...</>
                ) : (
                  <>Pagar con Flow <i className="fas fa-lock"></i></>
                )}
              </button>

              <div className="checkout-secure">
                <i className="fas fa-shield-alt"></i>
                <span>Pago seguro procesado por Flow.cl</span>
              </div>
            </form>
          </div>

          {/* Columna derecha: Resumen */}
          <div className="checkout-summary-section">
            <h2><i className="fas fa-receipt"></i> Resumen del Pedido</h2>
            <div className="checkout-summary">
              <div className="checkout-items">
                {carrito.map((item, i) => {
                  const desglose = calcularDesglose(item.precioTotal, item.cantidad);
                  return (
                    <div key={i} className="checkout-item">
                      <div className="checkout-item-info">
                        <span className="checkout-item-name">{item.nombre}</span>
                        <span className="checkout-item-qty">x{item.cantidad}</span>
                      </div>
                      <span className="checkout-item-price">{formatearPrecio(desglose.total)}</span>
                    </div>
                  );
                })}
              </div>

              <div className="checkout-totals">
                <div className="checkout-total-row">
                  <span>Subtotal (Neto)</span>
                  <span>{formatearPrecio(totalNeto)}</span>
                </div>
                <div className="checkout-total-row">
                  <span>IVA (19%)</span>
                  <span>{formatearPrecio(totalIva)}</span>
                </div>
                <div className="checkout-total-row total">
                  <span>Total a pagar</span>
                  <span>{formatearPrecio(totalTotal)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CheckoutPage;

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { REGIONES, getComunasByRegion } from '../data/comunasChile';
import '../styles/checkout.css';

// Zonas de despacho para mostrar en el frontend
const SHIPPING_ZONES = [
  { communes: ['Santiago', 'Providencia', 'La Florida'], price: 3600, label: 'RM Central' },
  { communes: ['Colina', 'Buin', 'San Bernardo', 'Maipú', 'Padre Hurtado'], price: 6000, label: 'RM Periferia 1' },
  { communes: ['Melipilla', 'Talagante', 'Lo Barnechea', 'Chicureo', 'Huechuraba', 'Quilicura', 'Las Condes'], price: 6900, label: 'RM Periferia 2' },
];
const DEFAULT_SHIPPING = 7000;

function calcShippingCost(commune) {
  if (!commune) return null;
  const norm = commune.trim().toLowerCase();
  for (const zone of SHIPPING_ZONES) {
    if (zone.communes.some(c => c.toLowerCase() === norm)) return zone.price;
  }
  return DEFAULT_SHIPPING;
}

function CheckoutPage() {
  const navigate = useNavigate();
  const { carrito, formatearPrecio, calcularDesglose, getTotales, vaciarCarrito } = useCart();
  const { totalNeto, totalIva, totalTotal } = getTotales();

  const [customer, setCustomer] = useState({ name: '', email: '', phone: '' });
  const [region, setRegion] = useState('');
  const [commune, setCommune] = useState('');
  const [comunas, setComunas] = useState([]);
  const [shippingCost, setShippingCost] = useState(null);
  const [documentType, setDocumentType] = useState('boleta');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Actualizar comunas cuando cambia la región
  useEffect(() => {
    setComunas(getComunasByRegion(region));
    setCommune('');
    setShippingCost(null);
  }, [region]);

  // Calcular costo de despacho cuando cambia la comuna
  useEffect(() => {
    if (commune) {
      setShippingCost(calcShippingCost(commune));
    } else {
      setShippingCost(null);
    }
  }, [commune]);

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

  const grandTotal = totalTotal + (shippingCost ?? 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!region || !commune) {
      setError('Debes seleccionar tu región y comuna de despacho');
      return;
    }

    setLoading(true);

    try {
      const items = carrito.map(item => ({
        nombre: item.nombre,
        precioUnitario: item.precioTotal,
        cantidad: item.cantidad,
      }));

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer,
          items,
          shipping: { region, commune, cost: shippingCost ?? DEFAULT_SHIPPING },
          documentType,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        const detail = data.details
          ? (typeof data.details === 'string' ? data.details : JSON.stringify(data.details))
          : '';
        throw new Error(`${data.error || 'Error al crear la orden'}${detail ? ` — ${detail}` : ''}`);
      }

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

              {/* Nombre */}
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

              {/* Email */}
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

              {/* Teléfono */}
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

              {/* Separador despacho */}
              <div className="checkout-section-divider">
                <i className="fas fa-truck"></i> Datos de Despacho
              </div>

              {/* Región */}
              <div className="checkout-field">
                <label htmlFor="region">Región *</label>
                <select
                  id="region"
                  required
                  value={region}
                  onChange={e => setRegion(e.target.value)}
                  className="checkout-select"
                >
                  <option value="">Selecciona tu región</option>
                  {REGIONES.map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              {/* Comuna */}
              <div className="checkout-field">
                <label htmlFor="commune">Comuna *</label>
                <select
                  id="commune"
                  required
                  value={commune}
                  onChange={e => setCommune(e.target.value)}
                  disabled={!region}
                  className="checkout-select"
                >
                  <option value="">{region ? 'Selecciona tu comuna' : 'Primero selecciona una región'}</option>
                  {comunas.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Costo de despacho dinámico */}
              {shippingCost !== null && (
                <div className="checkout-shipping-info">
                  <i className="fas fa-map-marker-alt"></i>
                  <span>Despacho a <strong>{commune}</strong>: <strong>{formatearPrecio(shippingCost)}</strong></span>
                </div>
              )}

              {/* Separador documento */}
              <div className="checkout-section-divider">
                <i className="fas fa-file-invoice"></i> Documento Tributario
              </div>

              {/* Tipo de documento */}
              <div className="checkout-doc-selector">
                <button
                  type="button"
                  className={`checkout-doc-btn${documentType === 'boleta' ? ' active' : ''}`}
                  onClick={() => setDocumentType('boleta')}
                >
                  <i className="fas fa-receipt"></i>
                  <span>Boleta</span>
                </button>
                <button
                  type="button"
                  className={`checkout-doc-btn${documentType === 'factura' ? ' active' : ''}`}
                  onClick={() => setDocumentType('factura')}
                >
                  <i className="fas fa-file-invoice-dollar"></i>
                  <span>Factura</span>
                </button>
              </div>

              {error && (
                <div className="checkout-error">
                  <i className="fas fa-exclamation-circle"></i> {error}
                </div>
              )}

              <button
                type="submit"
                className="checkout-btn primary"
                disabled={loading || shippingCost === null}
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
                <div className="checkout-total-row">
                  <span>Productos</span>
                  <span>{formatearPrecio(totalTotal)}</span>
                </div>
                <div className="checkout-total-row checkout-total-shipping">
                  <span><i className="fas fa-truck"></i> Despacho</span>
                  <span>{shippingCost !== null ? formatearPrecio(shippingCost) : '—'}</span>
                </div>
                <div className="checkout-total-row total">
                  <span>Total a pagar</span>
                  <span>{shippingCost !== null ? formatearPrecio(grandTotal) : '—'}</span>
                </div>
              </div>

              {shippingCost === null && (
                <p className="checkout-shipping-pending">
                  <i className="fas fa-info-circle"></i> Selecciona tu comuna para ver el total con despacho
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CheckoutPage;

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { REGIONES, getComunasByRegion } from '../data/comunasChile';
import '../styles/checkout.css';

// El despacho es siempre $0 en plataforma — el costo Starken es cargo del comprador

// Validar dígito verificador de RUT chileno
function validarRut(rut) {
  const clean = rut.replace(/[.\-]/g, '').toUpperCase();
  if (clean.length < 8 || clean.length > 9) return false;
  const body = clean.slice(0, -1);
  const dv = clean.slice(-1);
  if (!/^\d+$/.test(body)) return false;
  let sum = 0, mul = 2;
  for (let i = body.length - 1; i >= 0; i--) {
    sum += parseInt(body[i]) * mul;
    mul = mul === 7 ? 2 : mul + 1;
  }
  const expected = 11 - (sum % 11);
  const dvCalc = expected === 11 ? '0' : expected === 10 ? 'K' : String(expected);
  return dv === dvCalc;
}

// Formatear RUT: 12.345.678-9
function formatRut(value) {
  let clean = value.replace(/[^0-9kK]/g, '').toUpperCase();
  if (clean.length <= 1) return clean;
  const dv = clean.slice(-1);
  let body = clean.slice(0, -1);
  body = body.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${body}-${dv}`;
}

function CheckoutPage() {
  const navigate = useNavigate();
  const { carrito, formatearPrecio, calcularDesglose, getTotales, vaciarCarrito } = useCart();
  const { totalNeto, totalIva, totalTotal } = getTotales();

  const [customer, setCustomer] = useState({ name: '', email: '', phone: '' });
  const [region, setRegion] = useState('');
  const [commune, setCommune] = useState('');
  const [comunas, setComunas] = useState([]);
  const shippingCost = 0; // Starken a cargo del comprador — siempre $0 en plataforma
  const [documentType, setDocumentType] = useState('boleta');
  const [factura, setFactura] = useState({ rut: '', razonSocial: '', giro: '', direccion: '', comuna: '' });
  const [rutError, setRutError] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Actualizar comunas cuando cambia la región
  useEffect(() => {
    setComunas(getComunasByRegion(region));
    setCommune('');
  }, [region]);

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

  const grandTotal = totalTotal; // despacho Starken a cargo del comprador, no se suma

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!region || !commune) {
      setError('Debes seleccionar tu región y comuna de despacho');
      return;
    }

    if (documentType === 'factura') {
      if (!factura.rut || !factura.razonSocial || !factura.giro || !factura.direccion || !factura.comuna) {
        setError('Todos los campos de factura son requeridos');
        return;
      }
      if (!validarRut(factura.rut)) {
        setError('El RUT ingresado no es válido. Verifica el dígito verificador.');
        return;
      }
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
          shipping: { region, commune, cost: 0 },
          documentType,
          ...(documentType === 'factura' ? { factura } : {}),
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

              {/* Aviso despacho Starken */}
              {commune && (
                <div className="checkout-shipping-info checkout-shipping-starken">
                  <i className="fas fa-box"></i>
                  <span>El despacho a <strong>{commune}</strong> es por <strong>Starken</strong> a cargo del comprador. Te contactaremos para coordinar el envío.</span>
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

              {/* Campos de factura (condicional) */}
              {documentType === 'factura' && (
                <div className="checkout-factura-fields">
                  <div className="checkout-field">
                    <label htmlFor="factura-rut">RUT Empresa *</label>
                    <input
                      id="factura-rut"
                      type="text"
                      required
                      placeholder="Ej: 76.123.456-7"
                      value={factura.rut}
                      onChange={e => {
                        const formatted = formatRut(e.target.value);
                        setFactura(p => ({ ...p, rut: formatted }));
                        if (formatted.replace(/[.\-]/g, '').length >= 8) {
                          setRutError(validarRut(formatted) ? '' : 'RUT inválido');
                        } else {
                          setRutError('');
                        }
                      }}
                      maxLength={12}
                    />
                    {rutError && <span className="checkout-field-error">{rutError}</span>}
                  </div>
                  <div className="checkout-field">
                    <label htmlFor="factura-razon">Razón Social *</label>
                    <input
                      id="factura-razon"
                      type="text"
                      required
                      placeholder="Ej: Empresa SpA"
                      value={factura.razonSocial}
                      onChange={e => setFactura(p => ({ ...p, razonSocial: e.target.value }))}
                      maxLength={200}
                    />
                  </div>
                  <div className="checkout-field">
                    <label htmlFor="factura-giro">Giro Comercial *</label>
                    <input
                      id="factura-giro"
                      type="text"
                      required
                      placeholder="Ej: Venta al por menor"
                      value={factura.giro}
                      onChange={e => setFactura(p => ({ ...p, giro: e.target.value }))}
                      maxLength={200}
                    />
                  </div>
                  <div className="checkout-field">
                    <label htmlFor="factura-dir">Dirección de Facturación *</label>
                    <input
                      id="factura-dir"
                      type="text"
                      required
                      placeholder="Ej: Av. Libertador Bernardo O'Higgins 1234"
                      value={factura.direccion}
                      onChange={e => setFactura(p => ({ ...p, direccion: e.target.value }))}
                      maxLength={300}
                    />
                  </div>
                  <div className="checkout-field">
                    <label htmlFor="factura-comuna">Comuna de Facturación *</label>
                    <input
                      id="factura-comuna"
                      type="text"
                      required
                      placeholder="Ej: Santiago"
                      value={factura.comuna}
                      onChange={e => setFactura(p => ({ ...p, comuna: e.target.value }))}
                      maxLength={100}
                    />
                  </div>
                </div>
              )}

              {error && (
                <div className="checkout-error">
                  <i className="fas fa-exclamation-circle"></i> {error}
                </div>
              )}

              <button
                type="submit"
                className="checkout-btn primary"
                disabled={loading || !commune}
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
                <div className="checkout-total-row total">
                  <span>Total a pagar</span>
                  <span>{formatearPrecio(grandTotal)}</span>
                </div>
              </div>

              <p className="checkout-shipping-pending">
                <i className="fas fa-box"></i> Despacho Starken coordinado con el comprador — no incluido en el pago
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CheckoutPage;

import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useCart } from '../context/CartContext';
import { useContent } from '../context/ContentContext';
import { getThumb } from '../utils/imageUtils';

function ProductoCard({ producto, onImageClick }) {
  const [cantidad, setCantidad] = useState(1);
  const { agregarAlCarrito } = useCart();

  const formatearPrecio = (valor) => {
    return '$' + Math.round(valor).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  const handleComprar = () => {
    agregarAlCarrito(producto.nombre, producto.precioActual, cantidad);
    setCantidad(1);
  };

  return (
    <div className="producto-card">
      <div className="producto-img" onClick={() => onImageClick(producto)} style={{ cursor: 'pointer' }}>
        <img src={getThumb(producto.imagen)} alt={producto.nombre} loading="lazy" style={{
          objectPosition: `${producto.imagePosX ?? 50}% ${producto.imagePosY ?? 50}%`,
          '--img-zoom': producto.imageZoom ?? 1,
        }} />
      </div>
      <div className="producto-info">
        <h4>{producto.nombre}</h4>
        <div className="producto-precios">
          <span className="precio-actual">{formatearPrecio(producto.precioActual)}</span>
          <span className="precio-anterior">{formatearPrecio(producto.precioAnterior)}</span>
        </div>
        <div className="producto-acciones">
          <div className="cantidad-selector">
            <button
              className="cantidad-btn menos"
              onClick={() => cantidad > 1 && setCantidad(cantidad - 1)}
            >
              -
            </button>
            <span className="cantidad-numero">{cantidad}</span>
            <button
              className="cantidad-btn mas"
              onClick={() => cantidad < 10 && setCantidad(cantidad + 1)}
            >
              +
            </button>
          </div>
          <button className="btn-comprar" onClick={handleComprar}>
            Comprar
          </button>
        </div>
      </div>
    </div>
  );
}

function Productos() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { content } = useContent();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 700);

  const productos = content.products.items;
  const nombresCategorias = content.products.nombresCategorias;
  const pageConfig = content.productsPage;

  const categoriaURL = searchParams.get('cat');
  const [categoriaFiltro, setCategoriaFiltro] = useState(categoriaURL || 'todos');
  const [orden, setOrden] = useState('destacados');
  const [popupProducto, setPopupProducto] = useState(null);
  const [popupZoom, setPopupZoom] = useState(1);
  const [popupPosX, setPopupPosX] = useState(50);
  const [popupPosY, setPopupPosY] = useState(50);

  const formatearPrecio = (valor) => {
    return '$' + Math.round(valor).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 700);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    setCategoriaFiltro(categoriaURL || 'todos');
  }, [categoriaURL]);

  const productosFiltrados = useMemo(() => {
    let filtrados = [...productos];

    if (categoriaFiltro !== 'todos') {
      filtrados = filtrados.filter(p => p.categoria === categoriaFiltro);
    }

    switch (orden) {
      case 'precio-menor':
        filtrados.sort((a, b) => a.precioActual - b.precioActual);
        break;
      case 'precio-mayor':
        filtrados.sort((a, b) => b.precioActual - a.precioActual);
        break;
      case 'nombre':
        filtrados.sort((a, b) => a.nombre.localeCompare(b.nombre));
        break;
      case 'destacados':
      default:
        filtrados.sort((a, b) => (b.destacado ? 1 : 0) - (a.destacado ? 1 : 0));
        break;
    }

    return filtrados;
  }, [categoriaFiltro, orden, productos]);

  const productosEnFilas = useMemo(() => {
    const filas = [];
    for (let i = 0; i < productosFiltrados.length; i += 5) {
      filas.push(productosFiltrados.slice(i, i + 5));
    }
    return filas;
  }, [productosFiltrados]);

  useEffect(() => {
    if (popupProducto) {
      setPopupZoom(popupProducto.imageZoom ?? 1);
      setPopupPosX(popupProducto.imagePosX ?? 50);
      setPopupPosY(popupProducto.imagePosY ?? 50);
    }
  }, [popupProducto]);

  const popupMoveImg = (axis, delta) => {
    if (axis === 'x') {
      setPopupPosX(prev => Math.max(0, Math.min(100, prev + delta)));
    } else {
      setPopupPosY(prev => Math.max(0, Math.min(100, prev + delta)));
    }
  };

  const titulo = categoriaFiltro === 'todos'
    ? 'Todos los Productos'
    : nombresCategorias[categoriaFiltro] || 'Productos';

  return (
    <>
      <Header alwaysScrolled={true} />

      <section className="productos-page">
        <div className="container">
          <div className="productos-header">
            <h1 className="productos-titulo">{titulo}</h1>
            <p className="productos-subtitulo">
              {pageConfig.subtitle}
            </p>
          </div>

          <div className="filtros-bar">
            <div className="filtro-categoria">
              <select
                value={categoriaFiltro}
                onChange={(e) => setCategoriaFiltro(e.target.value)}
              >
                <option value="todos">{pageConfig.filterAllText}</option>
                {Object.entries(nombresCategorias).map(([slug, name]) => (
                  <option key={slug} value={slug}>{name}</option>
                ))}
              </select>
            </div>
            <div className="filtro-orden">
              <select
                value={orden}
                onChange={(e) => setOrden(e.target.value)}
              >
                {Object.entries(pageConfig.sortLabels).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
          </div>

          {isMobile ? (
            <div className="productos-filas-mobile">
              {productosEnFilas.map((fila, idx) => (
                <div className="productos-fila-scroll" key={idx}>
                  {fila.map((producto) => (
                    <ProductoCard key={producto.id} producto={producto} onImageClick={setPopupProducto} />
                  ))}
                </div>
              ))}
            </div>
          ) : (
            <div className="productos-grid">
              {productosFiltrados.map((producto) => (
                <ProductoCard key={producto.id} producto={producto} onImageClick={setPopupProducto} />
              ))}
            </div>
          )}
        </div>
      </section>

      <button className="btn-flotante-volver" onClick={() => navigate('/', { state: { scrollTo: 'categorias' } })}>
        <i className="fas fa-arrow-left"></i>
      </button>

      <Footer />

      {popupProducto && (
        <div className="producto-popup-overlay" onClick={() => setPopupProducto(null)}>
          <div className="producto-popup" onClick={(e) => e.stopPropagation()}>
            <button className="producto-popup-close" onClick={() => setPopupProducto(null)}>
              <i className="fas fa-times"></i>
            </button>
            <div className="popup-img-editor">
              <button type="button" className="popup-arrow popup-arrow-top" onClick={() => popupMoveImg('y', -5)}>
                <i className="fas fa-chevron-up"></i>
              </button>
              <div className="popup-img-editor-middle">
                <button type="button" className="popup-arrow" onClick={() => popupMoveImg('x', -5)}>
                  <i className="fas fa-chevron-left"></i>
                </button>
                <div className="producto-popup-img">
                  <img
                    src={popupProducto.imagen}
                    alt={popupProducto.nombre}
                    style={{
                      objectPosition: `${popupPosX}% ${popupPosY}%`,
                      transform: `scale(${popupZoom})`,
                    }}
                  />
                </div>
                <button type="button" className="popup-arrow" onClick={() => popupMoveImg('x', 5)}>
                  <i className="fas fa-chevron-right"></i>
                </button>
              </div>
              <button type="button" className="popup-arrow popup-arrow-bottom" onClick={() => popupMoveImg('y', 5)}>
                <i className="fas fa-chevron-down"></i>
              </button>
              <div className="popup-zoom-bar">
                <i className="fas fa-search-minus"></i>
                <input
                  type="range"
                  min="0.5"
                  max="3"
                  step="0.05"
                  value={popupZoom}
                  onChange={(e) => setPopupZoom(parseFloat(e.target.value))}
                />
                <i className="fas fa-search-plus"></i>
              </div>
            </div>
            <div className="producto-popup-info">
              <div className="producto-popup-nombre-desc-row">
                <h3 className="producto-popup-nombre">{popupProducto.nombre}</h3>
                {popupProducto.descripcion && (
                  <p className="producto-popup-desc">{popupProducto.descripcion}</p>
                )}
              </div>
              <div className="producto-popup-precios">
                {popupProducto.precioAnterior && popupProducto.precioAnterior !== popupProducto.precioActual && (
                  <span className="precio-anterior">{formatearPrecio(popupProducto.precioAnterior)}</span>
                )}
                <span className="precio-actual">{formatearPrecio(popupProducto.precioActual)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Productos;

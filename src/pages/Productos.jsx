import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useCart } from '../context/CartContext';
import { useContent } from '../context/ContentContext';

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
        <img src={producto.imagen} alt={producto.nombre} />
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
  const [showPanTip, setShowPanTip] = useState(false);

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

  // Pan de imagen en popup
  const imgContainerRef = useRef(null);
  const imgRef = useRef(null);
  const panState = useRef({ dragging: false, startX: 0, startY: 0, posX: 50, posY: 50 });

  const handlePanStart = useCallback((clientX, clientY) => {
    panState.current.dragging = true;
    panState.current.startX = clientX;
    panState.current.startY = clientY;
  }, []);

  const handlePanMove = useCallback((clientX, clientY) => {
    if (!panState.current.dragging || !imgRef.current || !imgContainerRef.current) return;
    const img = imgRef.current;
    const container = imgContainerRef.current;
    const natW = img.naturalWidth, natH = img.naturalHeight;
    const contW = container.offsetWidth, contH = container.offsetHeight;
    const scaleX = natW / contW, scaleY = natH / contH;
    const dx = clientX - panState.current.startX;
    const dy = clientY - panState.current.startY;
    // Solo permitir pan en el eje que se recorta
    let newX = panState.current.posX;
    let newY = panState.current.posY;
    if (scaleX > scaleY) {
      newX = panState.current.posX - (dx / contW) * 100;
    } else {
      newY = panState.current.posY - (dy / contH) * 100;
    }
    newX = Math.max(0, Math.min(100, newX));
    newY = Math.max(0, Math.min(100, newY));
    img.style.objectPosition = `${newX}% ${newY}%`;
    panState.current.startX = clientX;
    panState.current.startY = clientY;
    panState.current.posX = newX;
    panState.current.posY = newY;
  }, []);

  const handlePanEnd = useCallback(() => {
    panState.current.dragging = false;
  }, []);

  useEffect(() => {
    if (popupProducto) {
      panState.current = { dragging: false, startX: 0, startY: 0, posX: 50, posY: 50 };
      setShowPanTip(false);
      if (imgRef.current) imgRef.current.style.objectPosition = '50% 50%';
    }
  }, [popupProducto]);

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
            <div
              className="producto-popup-img"
              ref={imgContainerRef}
              onMouseDown={(e) => { e.preventDefault(); handlePanStart(e.clientX, e.clientY); }}
              onMouseMove={(e) => handlePanMove(e.clientX, e.clientY)}
              onMouseUp={handlePanEnd}
              onMouseLeave={handlePanEnd}
              onTouchStart={(e) => handlePanStart(e.touches[0].clientX, e.touches[0].clientY)}
              onTouchMove={(e) => { e.preventDefault(); handlePanMove(e.touches[0].clientX, e.touches[0].clientY); }}
              onTouchEnd={handlePanEnd}
            >
              <img ref={imgRef} src={popupProducto.imagen} alt={popupProducto.nombre} />
              <button
                className="popup-pan-hint-btn"
                onClick={(e) => { e.stopPropagation(); setShowPanTip(!showPanTip); }}
              >
                <i className="fas fa-hand-paper"></i>
              </button>
              {showPanTip && (
                <div className="popup-pan-tooltip">
                  {isMobile
                    ? 'Mantene presionada la imagen y desliza para moverla'
                    : 'Haz click y arrastra para mover la imagen'}
                </div>
              )}
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

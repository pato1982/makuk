import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

const IVA_RATE = 0.19;
const STORAGE_KEY = 'makuk_carrito';

export function CartProvider({ children }) {
  const [carrito, setCarrito] = useState([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showCartModal, setShowCartModal] = useState(false);

  // Cargar carrito desde localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setCarrito(JSON.parse(saved));
      } catch (e) {
        setCarrito([]);
      }
    }
  }, []);

  // Guardar carrito en localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(carrito));
  }, [carrito]);

  const formatearPrecio = (valor) => {
    return '$' + Math.round(valor).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  const calcularDesglose = (precioTotal, cantidad) => {
    const totalLinea = precioTotal * cantidad;
    const neto = Math.round(totalLinea / (1 + IVA_RATE));
    const iva = totalLinea - neto;
    return { neto, iva, total: totalLinea };
  };

  const agregarAlCarrito = (nombre, precioTotal, cantidad) => {
    setCarrito(prev => {
      const existente = prev.find(item => item.nombre === nombre);
      if (existente) {
        return prev.map(item =>
          item.nombre === nombre
            ? { ...item, cantidad: item.cantidad + cantidad }
            : item
        );
      }
      return [...prev, { nombre, precioTotal, cantidad }];
    });
    setShowConfirmModal(true);
  };

  const eliminarDelCarrito = (nombre) => {
    setCarrito(prev => prev.filter(item => item.nombre !== nombre));
  };

  const vaciarCarrito = () => {
    localStorage.removeItem(STORAGE_KEY);
    setCarrito([]);
  };

  const getTotales = () => {
    let totalCantidad = 0;
    let totalNeto = 0;
    let totalIva = 0;
    let totalTotal = 0;

    carrito.forEach(item => {
      const desglose = calcularDesglose(item.precioTotal, item.cantidad);
      totalCantidad += item.cantidad;
      totalNeto += desglose.neto;
      totalIva += desglose.iva;
      totalTotal += desglose.total;
    });

    return { totalCantidad, totalNeto, totalIva, totalTotal };
  };

  const value = {
    carrito,
    showConfirmModal,
    setShowConfirmModal,
    showCartModal,
    setShowCartModal,
    agregarAlCarrito,
    eliminarDelCarrito,
    vaciarCarrito,
    formatearPrecio,
    calcularDesglose,
    getTotales,
    cantidadProductos: carrito.length
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart debe usarse dentro de CartProvider');
  }
  return context;
}

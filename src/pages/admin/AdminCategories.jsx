import { useState, useRef, useCallback } from 'react';
import { useContent } from '../../context/ContentContext';
import AdminFormField from '../../components/admin/AdminFormField';
import AdminCard from '../../components/admin/AdminCard';
import ImageUploader from '../../components/admin/ImageUploader';

function AdminCategories() {
  const { content, updateSection } = useContent();
  const [data, setData] = useState(JSON.parse(JSON.stringify(content.categories)));
  const [editIndex, setEditIndex] = useState(null);
  const [productsData, setProductsData] = useState(() => {
    const products = JSON.parse(JSON.stringify(content.products));
    const vistos = {};
    products.items = products.items.map(p => {
      if (p.destacado && p.categoria !== 'piezas-unicas') {
        if (vistos[p.categoria]) {
          return { ...p, destacado: false };
        }
        vistos[p.categoria] = true;
      }
      return p;
    });
    return products;
  });
  const [selectedCategory, setSelectedCategory] = useState(data.items.length > 0 ? data.items[0].slug : '');
  const [editProduct, setEditProduct] = useState(null);
  const [isNewProduct, setIsNewProduct] = useState(false);
  const [saved, setSaved] = useState(false);
  const [tab, setTab] = useState('tipos');
  const [showLimitPopup, setShowLimitPopup] = useState(false);
  const [showSelectPopup, setShowSelectPopup] = useState(false);

  const [modalPos, setModalPos] = useState({ x: 0, y: 0 });
  const [productModalPos, setProductModalPos] = useState({ x: 0, y: 0 });
  const dragging = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  const openModal = (index) => {
    setModalPos({ x: 0, y: 0 });
    setEditIndex(index);
  };

  const handleDragStart = useCallback((e) => {
    dragging.current = true;
    dragOffset.current = { x: e.clientX - modalPos.x, y: e.clientY - modalPos.y };

    const handleDragMove = (e) => {
      if (!dragging.current) return;
      setModalPos({ x: e.clientX - dragOffset.current.x, y: e.clientY - dragOffset.current.y });
    };

    const handleDragEnd = () => {
      dragging.current = false;
      document.removeEventListener('mousemove', handleDragMove);
      document.removeEventListener('mouseup', handleDragEnd);
    };

    document.addEventListener('mousemove', handleDragMove);
    document.addEventListener('mouseup', handleDragEnd);
  }, [modalPos]);

  const handleSave = () => {
    updateSection('categories', data);
    const nombres = {};
    data.items.forEach(cat => { nombres[cat.slug] = cat.nombre; });
    if (productsData.nombresCategorias['unicas']) {
      nombres['unicas'] = productsData.nombresCategorias['unicas'];
    }
    const updatedProducts = { ...productsData, nombresCategorias: nombres };
    updateSection('products', updatedProducts);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };


  const filteredProducts = productsData.items.filter(p => p.categoria === selectedCategory);

  const faltaPortada = () => {
    const prods = productsData.items.filter(p => p.categoria === selectedCategory);
    return prods.length > 0 && !prods.some(p => p.destacado);
  };

  const handleChangeCategory = (slug) => {
    if (faltaPortada()) {
      setShowSelectPopup(true);
      return;
    }
    setSelectedCategory(slug);
  };

  const handleChangeTab = (newTab) => {
    if (tab === 'productos' && faltaPortada()) {
      setShowSelectPopup(true);
      return;
    }
    setTab(newTab);
  };

  const addProduct = () => {
    const maxId = productsData.items.reduce((max, p) => Math.max(max, p.id), 0);
    const newProduct = {
      id: maxId + 1,
      nombre: 'Nuevo Producto',
      categoria: selectedCategory,
      imagen: '',
      precioActual: 0,
      precioAnterior: 0,
      destacado: false,
      descripcion: ''
    };
    setProductsData({ ...productsData, items: [...productsData.items, newProduct] });
    setEditProduct(newProduct.id);
    setIsNewProduct(true);
  };

  const updateProduct = (id, field, value) => {
    const items = productsData.items.map(p => p.id === id ? { ...p, [field]: value } : p);
    setProductsData({ ...productsData, items });
  };

  const removeProduct = (id) => {
    if (!window.confirm('¿Eliminar este producto?')) return;
    setProductsData({ ...productsData, items: productsData.items.filter(p => p.id !== id) });
    setEditProduct(null);
  };

  const cancelProduct = () => {
    if (isNewProduct) {
      setProductsData({ ...productsData, items: productsData.items.filter(p => p.id !== editProduct) });
    }
    setEditProduct(null);
    setIsNewProduct(false);
  };

  const saveProduct = () => {
    setEditProduct(null);
    setIsNewProduct(false);
  };

  const toggleDestacado = (id) => {
    const prod = productsData.items.find(p => p.id === id);
    if (!prod.destacado) {
      const yaHayDestacado = productsData.items.some(p => p.categoria === prod.categoria && p.destacado);
      if (yaHayDestacado) {
        setShowLimitPopup(true);
        return;
      }
    }
    const items = productsData.items.map(p => p.id === id ? { ...p, destacado: !p.destacado } : p);
    setProductsData({ ...productsData, items });
  };

  const getEditingProduct = () => productsData.items.find(p => p.id === editProduct);

  const handleProductDragStart = useCallback((e) => {
    dragging.current = true;
    dragOffset.current = { x: e.clientX - productModalPos.x, y: e.clientY - productModalPos.y };
    const handleDragMove = (e) => {
      if (!dragging.current) return;
      setProductModalPos({ x: e.clientX - dragOffset.current.x, y: e.clientY - dragOffset.current.y });
    };
    const handleDragEnd = () => {
      dragging.current = false;
      document.removeEventListener('mousemove', handleDragMove);
      document.removeEventListener('mouseup', handleDragEnd);
    };
    document.addEventListener('mousemove', handleDragMove);
    document.addEventListener('mouseup', handleDragEnd);
  }, [productModalPos]);

  const toSlug = (text) => text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const updateItem = (index, field, value) => {
    const items = [...data.items];
    items[index] = { ...items[index], [field]: value };
    if (field === 'nombre') {
      items[index].slug = toSlug(value);
    }
    setData({ ...data, items });
  };

  const addItem = () => {
    const newIndex = data.items.length;
    setData({
      ...data,
      items: [...data.items, { slug: 'nueva', nombre: 'Nueva Categoría', descripcion: 'Descripción', imagen: '' }]
    });
    setEditIndex(newIndex);
  };

  const removeItem = (index) => {
    if (!window.confirm('¿Eliminar esta categoría?')) return;
    setData({ ...data, items: data.items.filter((_, i) => i !== index) });
    setEditIndex(null);
  };

  const moveItem = (index, direction) => {
    const items = [...data.items];
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= items.length) return;
    [items[index], items[newIndex]] = [items[newIndex], items[index]];
    setData({ ...data, items });
  };

  return (
    <div className="admin-page">
      <h1 className="admin-page-title">Categorías</h1>
      <p className="admin-page-subtitle">Gestiona las colecciones de joyería</p>

      <div className="admin-tabs">
        <button className={`admin-tab ${tab === 'tipos' ? 'active' : ''}`} onClick={() => handleChangeTab('tipos')}>
          <i className="fas fa-th-large"></i> Tipos de categorías
        </button>
        <button className={`admin-tab ${tab === 'productos' ? 'active' : ''}`} onClick={() => handleChangeTab('productos')}>
          <i className="fas fa-upload"></i> Subir productos
        </button>
      </div>

      <div className="admin-tab-content">
        {tab === 'tipos' && (
          <>
            <AdminCard title="Textos de la sección">
              <div className="admin-row">
                <AdminFormField label="Título" value={data.title} onChange={(v) => setData({ ...data, title: v })} />
                <AdminFormField label="Subtítulo" value={data.subtitle} onChange={(v) => setData({ ...data, subtitle: v })} />
              </div>
            </AdminCard>

            <AdminCard title={`Categorías (${data.items.length})`}>
              <div className="admin-grid-4">
                {data.items.map((item, i) => (
                  <div key={i} className="admin-grid-card" onClick={() => openModal(i)}>
                    {item.imagen && <img src={item.imagen} alt={item.nombre} className="admin-grid-card-img" />}
                    <div className="admin-grid-card-info">
                      <span className="admin-grid-card-name">{item.nombre}</span>
                    </div>
                  </div>
                ))}
                <div className="admin-grid-card admin-grid-card-add" onClick={addItem}>
                  <span className="upload-text">+ Agregar</span>
                </div>
              </div>
            </AdminCard>
          </>
        )}

        {tab === 'productos' && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, whiteSpace: 'nowrap', fontSize: '0.95rem' }}>Selecciona una categoría</h3>
              <select
                value={selectedCategory}
                onChange={(e) => handleChangeCategory(e.target.value)}
                style={{ padding: '4px 8px', fontSize: '0.8rem', borderRadius: '4px', border: '1px solid #ccc', maxWidth: '180px' }}
              >
                {data.items.map(cat => (
                  <option key={cat.slug} value={cat.slug}>{cat.nombre}</option>
                ))}
              </select>
            </div>

            <AdminCard title={`Productos en "${data.items.find(c => c.slug === selectedCategory)?.nombre || selectedCategory}" (${filteredProducts.length})`}>
              <div className="admin-grid-4">
                <div className="admin-grid-card admin-grid-card-add" onClick={addProduct}>
                  <span className="upload-text">+ Agregar producto</span>
                </div>
                {filteredProducts.map((prod) => (
                  <div key={prod.id} className="admin-grid-card-wrapper">
                    <div
                      className={`card-toggle-bar ${prod.destacado ? 'active' : ''}`}
                      onClick={() => toggleDestacado(prod.id)}
                      title={prod.destacado ? 'Visible en página principal' : 'No visible en página principal'}
                    >
                      <div className="card-toggle-bar-knob"></div>
                    </div>
                    <div className="admin-grid-card">
                      {prod.imagen && <img src={prod.imagen} alt={prod.nombre} className="admin-grid-card-img" />}
                      <div className="admin-grid-card-info">
                        <span className="admin-grid-card-name">{prod.nombre}</span>
                        <span className="admin-grid-card-slug">${prod.precioActual?.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="admin-grid-card-actions">
                      <button className="btn-card-edit" onClick={() => { setProductModalPos({ x: 0, y: 0 }); setIsNewProduct(false); setEditProduct(prod.id); }}>
                        <i className="fas fa-edit btn-card-icon"></i><span className="btn-card-label">Editar</span>
                      </button>
                      <button className="btn-card-delete" onClick={() => removeProduct(prod.id)}>
                        <i className="fas fa-trash btn-card-icon"></i><span className="btn-card-label">Eliminar</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </AdminCard>
          </>
        )}

      </div>

      {/* Modal de edición */}
      {editIndex !== null && data.items[editIndex] && (
        <div className="admin-modal-overlay" onClick={() => setEditIndex(null)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()} style={{ transform: `translate(${modalPos.x}px, ${modalPos.y}px)` }}>
            <button className="admin-modal-close" onClick={() => setEditIndex(null)}>
              <i className="fas fa-times"></i>
            </button>
            <h3 className="admin-modal-title" onMouseDown={handleDragStart} style={{ cursor: 'grab', userSelect: 'none' }}>Editar categoría</h3>

            <AdminFormField label="Nombre de la categoría" value={data.items[editIndex].nombre} onChange={(v) => updateItem(editIndex, 'nombre', v)} />
            <AdminFormField label="Descripción" value={data.items[editIndex].descripcion} onChange={(v) => updateItem(editIndex, 'descripcion', v)} />
            <AdminFormField label="Imagen (URL)" value={data.items[editIndex].imagen} onChange={(v) => updateItem(editIndex, 'imagen', v)} />
            <div className="admin-modal-image-row">
              <button type="button" onClick={() => { moveItem(editIndex, -1); setEditIndex(editIndex - 1); }} disabled={editIndex === 0} className="btn-move-modal">
                <i className="fas fa-chevron-left"></i>
              </button>
              {data.items[editIndex].imagen && (
                <div className="admin-modal-image-preview">
                  <img src={data.items[editIndex].imagen} alt="Preview" />
                </div>
              )}
              <button type="button" onClick={() => { moveItem(editIndex, 1); setEditIndex(editIndex + 1); }} disabled={editIndex === data.items.length - 1} className="btn-move-modal">
                <i className="fas fa-chevron-right"></i>
              </button>
            </div>

            <div className="admin-modal-footer-center">
              <button type="button" className="btn-delete-item" onClick={() => removeItem(editIndex)}>
                <i className="fas fa-trash"></i> Eliminar
              </button>
              <button type="button" className="btn-modal-cancel" onClick={() => setEditIndex(null)}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de edición de producto */}
      {editProduct !== null && getEditingProduct() && (
        <div className="admin-modal-overlay" onClick={cancelProduct}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()} style={{ transform: `translate(${productModalPos.x}px, ${productModalPos.y}px)` }}>
            <button className="admin-modal-close" onClick={cancelProduct}>
              <i className="fas fa-times"></i>
            </button>
            <h3 className="admin-modal-title" onMouseDown={handleProductDragStart} style={{ cursor: 'grab', userSelect: 'none' }}>{isNewProduct ? 'Agregar producto' : 'Editar producto'}</h3>

            <AdminFormField label="Nombre del producto" value={getEditingProduct().nombre} onChange={(v) => updateProduct(editProduct, 'nombre', v)} />
            <AdminFormField label="Descripción" type="textarea" rows={1} value={getEditingProduct().descripcion} onChange={(v) => updateProduct(editProduct, 'descripcion', v)} />
            <ImageUploader label="Imagen" value={getEditingProduct().imagen} onChange={(v) => updateProduct(editProduct, 'imagen', v)} compact />
            <div className="admin-row">
              <AdminFormField label="Precio actual" type="number" value={getEditingProduct().precioActual} onChange={(v) => updateProduct(editProduct, 'precioActual', Number(v))} />
              <AdminFormField label="Precio anterior" type="number" value={getEditingProduct().precioAnterior} onChange={(v) => updateProduct(editProduct, 'precioAnterior', Number(v))} />
            </div>

            <div className="admin-modal-footer-center">
              <button type="button" className="btn-save-modal" onClick={saveProduct}>
                <i className="fas fa-check"></i> Guardar
              </button>
              <button type="button" className="btn-modal-cancel" onClick={cancelProduct}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {showLimitPopup && (
        <div className="admin-modal-overlay" onClick={() => setShowLimitPopup(false)}>
          <div className="limit-popup" onClick={(e) => e.stopPropagation()}>
            <div className="limit-popup-icon">
              <i className="fas fa-exclamation-circle"></i>
            </div>
            <h3>Portada ya seleccionada</h3>
            <p>Ya hay <strong>1 producto</strong> seleccionado como portada de esta categoría. Desactívalo antes de seleccionar otro.</p>
            <button className="btn-save-modal" onClick={() => setShowLimitPopup(false)}>Entendido</button>
          </div>
        </div>
      )}

      {showSelectPopup && (
        <div className="admin-modal-overlay" onClick={() => setShowSelectPopup(false)}>
          <div className="limit-popup" onClick={(e) => e.stopPropagation()}>
            <div className="limit-popup-icon">
              <i className="fas fa-image"></i>
            </div>
            <h3>Selecciona una portada</h3>
            <p>Debes activar <strong>1 producto</strong> como imagen de portada para la categoría <strong>"{data.items.find(c => c.slug === selectedCategory)?.nombre || selectedCategory}"</strong> antes de continuar.</p>
            <button className="btn-save-modal" onClick={() => setShowSelectPopup(false)}>Entendido</button>
          </div>
        </div>
      )}

      <button className={`btn-save ${saved ? 'saved' : ''}`} onClick={handleSave}>
        {saved ? <><i className="fas fa-check"></i> Guardado</> : <><i className="fas fa-save"></i> Guardar cambios</>}
      </button>
    </div>
  );
}

export default AdminCategories;

import { useState, useRef, useCallback } from 'react';
import { useContent } from '../../context/ContentContext';
import AdminFormField from '../../components/admin/AdminFormField';
import AdminCard from '../../components/admin/AdminCard';
import ImageUploader from '../../components/admin/ImageUploader';
import { uploadImage, deleteImage } from '../../services/api';

function AdminCategories() {
  const { content, updateSection } = useContent();
  const [data, setData] = useState(JSON.parse(JSON.stringify(content.categories)));
  const [editIndex, setEditIndex] = useState(null);
  const [isNewCategory, setIsNewCategory] = useState(false);
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
  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState('');
  const [tab, setTab] = useState('tipos');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [imgTab, setImgTab] = useState('m1');

  const [modalPos, setModalPos] = useState({ x: 0, y: 0 });
  const [productModalPos, setProductModalPos] = useState({ x: 0, y: 0 });
  const dragging = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const imgInputRef = useRef(null);
  const [imgUploading, setImgUploading] = useState(false);

  const openModal = (index) => {
    setModalPos({ x: 0, y: 0 });
    setModalError('');
    setEditIndex(index);
    setIsNewCategory(false);
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

  const formatearPrecio = (valor) => '$' + Math.round(valor).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');

  const filteredProducts = productsData.items.filter(p => p.categoria === selectedCategory);

  const handleChangeCategory = (slug) => {
    setSelectedCategory(slug);
  };

  const handleChangeTab = (newTab) => {
    setTab(newTab);
  };

  const imgFieldMap = { m1: 'imagen', m2: 'imagen2', m3: 'imagen3' };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !editProduct) return;
    setImgUploading(true);
    const field = imgFieldMap[imgTab];
    try {
      const { url } = await uploadImage(file);
      const updates = { [field]: url };
      if (field === 'imagen') {
        updates.imagePosX = 50;
        updates.imagePosY = 50;
        updates.imageZoom = 1;
      }
      setProductsData(prev => ({
        ...prev,
        items: prev.items.map(p => p.id === editProduct ? { ...p, ...updates } : p)
      }));
    } catch {
      // error silencioso
    } finally {
      setImgUploading(false);
      e.target.value = '';
    }
  };

  const handleDeleteImage = async () => {
    if (!editProduct) return;
    const field = imgFieldMap[imgTab];
    const prod = productsData.items.find(p => p.id === editProduct);
    const url = prod?.[field];
    if (!url) return;
    try {
      await deleteImage(url);
    } catch {
      // silencioso — igual limpiamos el campo
    }
    const updates = { [field]: '' };
    if (field === 'imagen') {
      updates.imagePosX = 50;
      updates.imagePosY = 50;
      updates.imageZoom = 1;
    }
    setProductsData(prev => ({
      ...prev,
      items: prev.items.map(p => p.id === editProduct ? { ...p, ...updates } : p)
    }));
  };

  const addProduct = () => {
    const maxId = productsData.items.reduce((max, p) => Math.max(max, p.id), 0);
    const newProduct = {
      id: maxId + 1,
      nombre: 'Nuevo Producto',
      categoria: selectedCategory,
      imagen: '',
      imagen2: '',
      imagen3: '',
      precioActual: '',
      precioAnterior: '',
      destacado: false,
      descripcion: '',
      imagePosX: 50,
      imagePosY: 50,
      imageZoom: 1
    };
    setProductsData({ ...productsData, items: [...productsData.items, newProduct] });
    setModalError('');
    setImgTab('m1');
    setEditProduct(newProduct.id);
    setIsNewProduct(true);
  };

  const updateProduct = (id, field, value) => {
    setProductsData(prev => ({
      ...prev,
      items: prev.items.map(p => p.id === id ? { ...p, [field]: value } : p)
    }));
  };

  const removeProduct = async (id) => {
    if (!window.confirm('¿Eliminar este producto?')) return;
    const newData = { ...productsData, items: productsData.items.filter(p => p.id !== id) };
    setProductsData(newData);
    setEditProduct(null);
    try { await updateSection('products', newData); } catch { /* silencioso */ }
  };

  const cancelProduct = () => {
    if (isNewProduct) {
      setProductsData({ ...productsData, items: productsData.items.filter(p => p.id !== editProduct) });
    }
    setEditProduct(null);
    setIsNewProduct(false);
  };

  const saveProduct = async () => {
    setSaving(true);
    setModalError('');
    try {
      await updateSection('products', productsData);
      setEditProduct(null);
      setIsNewProduct(false);
    } catch {
      setModalError('Error al guardar. Intenta de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  const toggleDestacado = async (id) => {
    const prod = productsData.items.find(p => p.id === id);
    const items = productsData.items.map(p => {
      if (p.id === id) return { ...p, destacado: !prod.destacado };
      if (!prod.destacado && p.categoria === prod.categoria && p.destacado) return { ...p, destacado: false };
      return p;
    });
    const newData = { ...productsData, items };
    setProductsData(newData);
    try { await updateSection('products', newData); } catch { /* silencioso */ }
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
    setIsNewCategory(true);
  };

  const requestDeleteCategory = (index, e) => {
    e.stopPropagation();
    setDeleteConfirm(index);
  };

  const confirmDeleteCategory = async () => {
    const cat = data.items[deleteConfirm];
    const newData = { ...data, items: data.items.filter((_, i) => i !== deleteConfirm) };
    const newProductsData = { ...productsData, items: productsData.items.filter(p => p.categoria !== cat.slug) };
    setData(newData);
    setProductsData(newProductsData);
    setEditIndex(null);
    setIsNewCategory(false);
    setDeleteConfirm(null);
    try {
      await updateSection('categories', newData);
      await updateSection('products', newProductsData);
    } catch { /* silencioso */ }
  };

  const saveCategory = async () => {
    setSaving(true);
    setModalError('');
    const nombres = {};
    data.items.forEach(cat => { nombres[cat.slug] = cat.nombre; });
    if (productsData.nombresCategorias['piezas-unicas']) {
      nombres['piezas-unicas'] = productsData.nombresCategorias['piezas-unicas'];
    }
    const updatedProducts = { ...productsData, nombresCategorias: nombres };
    try {
      await updateSection('categories', data);
      await updateSection('products', updatedProducts);
      setProductsData(updatedProducts);
      setEditIndex(null);
      setIsNewCategory(false);
    } catch {
      setModalError('Error al guardar. Intenta de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  const cancelCategory = () => {
    if (isNewCategory) {
      setData({ ...data, items: data.items.filter((_, i) => i !== editIndex) });
    }
    setEditIndex(null);
    setIsNewCategory(false);
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
                {data.items.map((item, i) => {
                  const portada = productsData.items.find(p => p.categoria === item.slug && p.destacado);
                  const productCount = productsData.items.filter(p => p.categoria === item.slug).length;
                  return (
                    <div key={i} className="admin-grid-card-wrapper">
                      <div className="producto-card" onClick={() => openModal(i)}>
                        <div className="producto-img">
                          <div className="producto-img-wrapper" style={{
                            '--img-zoom': portada?.imageZoom ?? 1,
                            '--img-tx': `${50 - (portada?.imagePosX ?? 50)}%`,
                            '--img-ty': `${50 - (portada?.imagePosY ?? 50)}%`,
                          }}>
                            {portada ? <img src={portada.imagen} alt={item.nombre} /> : null}
                          </div>
                        </div>
                        <div className="producto-info">
                          <h4>{item.nombre}</h4>
                          {item.descripcion && <p className="precio-anterior" style={{ textDecoration: 'none' }}>{item.descripcion}</p>}
                          <span className="precio-actual" style={{ fontSize: '0.8rem' }}>{productCount} producto{productCount !== 1 ? 's' : ''}</span>
                        </div>
                      </div>
                      <div className="admin-grid-card-actions">
                        <button className="btn-card-edit" onClick={() => openModal(i)}>
                          <i className="fas fa-edit btn-card-icon"></i><span className="btn-card-label">Editar</span>
                        </button>
                        <button className="btn-card-delete" onClick={(e) => requestDeleteCategory(i, e)}>
                          <i className="fas fa-trash btn-card-icon"></i><span className="btn-card-label">Eliminar</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
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
                    <div className="producto-card">
                      <div className="producto-img">
                        <div className="producto-img-wrapper" style={{
                          '--img-zoom': prod.imageZoom ?? 1,
                          '--img-tx': `${50 - (prod.imagePosX ?? 50)}%`,
                          '--img-ty': `${50 - (prod.imagePosY ?? 50)}%`,
                        }}>
                          {prod.imagen && <img src={prod.imagen} alt={prod.nombre} />}
                        </div>
                      </div>
                      <div className="producto-info">
                        <h4>{prod.nombre}</h4>
                        <div className="producto-precios">
                          <span className="precio-actual">{formatearPrecio(prod.precioActual)}</span>
                          {prod.precioAnterior > 0 && <span className="precio-anterior">{formatearPrecio(prod.precioAnterior)}</span>}
                        </div>
                      </div>
                    </div>
                    <div className="admin-grid-card-actions">
                      <button className="btn-card-edit" onClick={() => { setProductModalPos({ x: 0, y: 0 }); setModalError(''); setIsNewProduct(false); setImgTab('m1'); setEditProduct(prod.id); }}>
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
        <div className="admin-modal-overlay">
          <div className="admin-modal" style={{ transform: `translate(${modalPos.x}px, ${modalPos.y}px)` }}>
            <button className="admin-modal-close" onClick={cancelCategory}>
              <i className="fas fa-times"></i>
            </button>
            <h3 className="admin-modal-title" onMouseDown={handleDragStart} style={{ cursor: 'grab', userSelect: 'none' }}>{isNewCategory ? 'Agregar categoría' : 'Editar categoría'}</h3>

            <AdminFormField label="Nombre de la categoría" value={data.items[editIndex].nombre} onChange={(v) => updateItem(editIndex, 'nombre', v)} />
            <AdminFormField label="Descripción" value={data.items[editIndex].descripcion} onChange={(v) => updateItem(editIndex, 'descripcion', v)} />
            <div className="admin-modal-image-row">
              <button type="button" onClick={() => { moveItem(editIndex, -1); setEditIndex(editIndex - 1); }} disabled={editIndex === 0} className="btn-move-modal">
                <i className="fas fa-chevron-left"></i>
              </button>
              {(() => {
                const portada = productsData.items.find(p => p.categoria === data.items[editIndex].slug && p.destacado);
                return portada ? (
                  <div className="admin-modal-image-preview">
                    <img src={portada.imagen} alt="Portada" />
                    <span className="admin-modal-portada-label">Portada: {portada.nombre}</span>
                  </div>
                ) : (
                  <div className="admin-modal-image-preview admin-modal-no-portada">
                    <i className="fas fa-image"></i>
                    <span>Sin portada — activa un producto en "Subir productos"</span>
                  </div>
                );
              })()}
              <button type="button" onClick={() => { moveItem(editIndex, 1); setEditIndex(editIndex + 1); }} disabled={editIndex === data.items.length - 1} className="btn-move-modal">
                <i className="fas fa-chevron-right"></i>
              </button>
            </div>

            {modalError && <div className="save-error" style={{ marginBottom: '8px' }}><i className="fas fa-exclamation-circle"></i> {modalError}</div>}
            <div className="admin-modal-footer-center">
              <button type="button" className="btn-save-modal" onClick={saveCategory} disabled={saving}>
                {saving ? <><i className="fas fa-spinner fa-spin"></i> Guardando...</> : <><i className="fas fa-check"></i> Guardar</>}
              </button>
              <button type="button" className="btn-modal-cancel" onClick={cancelCategory} disabled={saving}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de edición de producto */}
      {editProduct !== null && getEditingProduct() && (
        <div className="admin-modal-overlay">
          <div className="admin-modal" style={{ transform: `translate(${productModalPos.x}px, ${productModalPos.y}px)` }}>
            <button className="admin-modal-close" onClick={cancelProduct}>
              <i className="fas fa-times"></i>
            </button>
            <h3 className="admin-modal-title" onMouseDown={handleProductDragStart} style={{ cursor: 'grab', userSelect: 'none' }}>{isNewProduct ? 'Agregar producto' : 'Editar producto'}</h3>

            <AdminFormField label="Nombre del producto" value={getEditingProduct().nombre} onChange={(v) => updateProduct(editProduct, 'nombre', v)} />
            <AdminFormField label="Descripción" type="textarea" rows={1} value={getEditingProduct().descripcion} onChange={(v) => updateProduct(editProduct, 'descripcion', v)} />
            <div className="admin-field">
              <label>Imágenes</label>
              <div className="img-tabs">
                {['m1', 'm2', 'm3'].map(t => (
                  <button
                    key={t}
                    type="button"
                    className={`img-tab ${imgTab === t ? 'active' : ''} ${getEditingProduct()[imgFieldMap[t]] ? 'has-img' : ''}`}
                    onClick={() => setImgTab(t)}
                  >
                    {t.toUpperCase()}
                  </button>
                ))}
              </div>
              {(() => {
                const field = imgFieldMap[imgTab];
                const currentImg = getEditingProduct()[field];
                if (currentImg) {
                  return (
                    <div className="img-editor">
                      {imgTab === 'm1' ? (
                        <>
                          <div className="img-editor-body">
                            <button type="button" className="img-editor-arrow" onClick={() => updateProduct(editProduct, 'imagePosY', Math.max(0, (getEditingProduct().imagePosY ?? 50) - 5))}>
                              <i className="fas fa-chevron-up"></i>
                            </button>
                            <div className="img-editor-middle">
                              <button type="button" className="img-editor-arrow" onClick={() => updateProduct(editProduct, 'imagePosX', Math.max(0, (getEditingProduct().imagePosX ?? 50) - 5))}>
                                <i className="fas fa-chevron-left"></i>
                              </button>
                              <div className="img-editor-preview">
                                {imgUploading && <div className="img-editor-loading"><i className="fas fa-spinner fa-spin"></i></div>}
                                <button type="button" className="img-delete-btn" onClick={handleDeleteImage} title="Eliminar imagen">
                                  <i className="fas fa-trash"></i>
                                </button>
                                <div className="img-editor-wrapper" style={{
                                  transform: `scale(${getEditingProduct().imageZoom ?? 1}) translate(${50 - (getEditingProduct().imagePosX ?? 50)}%, ${50 - (getEditingProduct().imagePosY ?? 50)}%)`,
                                }}>
                                  <img src={currentImg} alt="Preview" />
                                </div>
                              </div>
                              <button type="button" className="img-editor-arrow" onClick={() => updateProduct(editProduct, 'imagePosX', Math.min(100, (getEditingProduct().imagePosX ?? 50) + 5))}>
                                <i className="fas fa-chevron-right"></i>
                              </button>
                            </div>
                            <button type="button" className="img-editor-arrow" onClick={() => updateProduct(editProduct, 'imagePosY', Math.min(100, (getEditingProduct().imagePosY ?? 50) + 5))}>
                              <i className="fas fa-chevron-down"></i>
                            </button>
                          </div>
                          <div className="img-editor-zoom">
                            <i className="fas fa-search-minus"></i>
                            <input type="range" min="0.5" max="2" step="0.05" value={getEditingProduct().imageZoom ?? 1} onChange={(e) => updateProduct(editProduct, 'imageZoom', parseFloat(e.target.value))} />
                            <i className="fas fa-search-plus"></i>
                          </div>
                        </>
                      ) : (
                        <div className="img-editor-simple">
                          {imgUploading && <div className="img-editor-loading"><i className="fas fa-spinner fa-spin"></i></div>}
                          <button type="button" className="img-delete-btn" onClick={handleDeleteImage} title="Eliminar imagen">
                            <i className="fas fa-trash"></i>
                          </button>
                          <img src={currentImg} alt="Preview" />
                        </div>
                      )}
                      <button type="button" className="img-editor-change" onClick={() => imgInputRef.current.click()}>
                        <i className="fas fa-camera"></i> Cambiar imagen
                      </button>
                      <input ref={imgInputRef} type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
                    </div>
                  );
                }
                return (
                  <div className="image-upload-area" onClick={() => !imgUploading && imgInputRef.current.click()}>
                    {imgUploading ? (
                      <div className="image-upload-placeholder">
                        <i className="fas fa-spinner fa-spin" style={{ fontSize: '1.2rem', marginBottom: '4px' }}></i>
                        <span className="upload-text">Subiendo...</span>
                      </div>
                    ) : (
                      <div className="image-upload-placeholder">
                        <span className="upload-text">Apreta y elige una imagen</span>
                      </div>
                    )}
                    <input ref={imgInputRef} type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
                  </div>
                );
              })()}
            </div>
            <div className="admin-row">
              <AdminFormField label="Precio actual" type="number" value={getEditingProduct().precioActual} onChange={(v) => updateProduct(editProduct, 'precioActual', Number(v))} />
              <AdminFormField label="Precio anterior" type="number" value={getEditingProduct().precioAnterior} onChange={(v) => updateProduct(editProduct, 'precioAnterior', Number(v))} />
            </div>

            {modalError && <div className="save-error" style={{ marginBottom: '8px' }}><i className="fas fa-exclamation-circle"></i> {modalError}</div>}
            <div className="admin-modal-footer-center">
              <button type="button" className="btn-save-modal" onClick={saveProduct} disabled={saving}>
                {saving ? <><i className="fas fa-spinner fa-spin"></i> Guardando...</> : <><i className="fas fa-check"></i> Guardar</>}
              </button>
              <button type="button" className="btn-modal-cancel" onClick={cancelProduct} disabled={saving}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Popup de confirmación de eliminación */}
      {deleteConfirm !== null && data.items[deleteConfirm] && (() => {
        const cat = data.items[deleteConfirm];
        const count = productsData.items.filter(p => p.categoria === cat.slug).length;
        return (
          <div className="admin-modal-overlay" onClick={() => setDeleteConfirm(null)}>
            <div className="admin-delete-popup" onClick={(e) => e.stopPropagation()}>
              <div className="admin-delete-popup-icon">
                <i className="fas fa-exclamation-triangle"></i>
              </div>
              <h3 className="admin-delete-popup-title">Eliminar categoría</h3>
              <p className="admin-delete-popup-text">
                ¿Estás seguro de que deseas eliminar la categoría <strong>"{cat.nombre}"</strong>?
              </p>
              {count > 0 && (
                <div className="admin-delete-popup-warning">
                  <i className="fas fa-exclamation-circle"></i>
                  <span>Se eliminarán <strong>{count} producto{count !== 1 ? 's' : ''}</strong> dentro de esta categoría. Esta acción no se puede deshacer.</span>
                </div>
              )}
              <div className="admin-delete-popup-actions">
                <button className="btn-delete-cancel" onClick={() => setDeleteConfirm(null)}>
                  Cancelar
                </button>
                <button className="btn-delete-confirm" onClick={confirmDeleteCategory}>
                  <i className="fas fa-trash"></i> Eliminar
                </button>
              </div>
            </div>
          </div>
        );
      })()}

    </div>
  );
}

export default AdminCategories;

import { useState, useRef } from 'react';
import { useContent } from '../../context/ContentContext';
import AdminFormField from '../../components/admin/AdminFormField';
import AdminCard from '../../components/admin/AdminCard';
import ImageUploader from '../../components/admin/ImageUploader';
import { uploadImage, deleteImage } from '../../services/api';

function AdminUniquePieces() {
  const { content, updateSection } = useContent();
  const [data, setData] = useState(JSON.parse(JSON.stringify(content.uniquePieces)));
  const [productsData, setProductsData] = useState(() => {
    const products = JSON.parse(JSON.stringify(content.products));
    const existingPieces = content.uniquePieces.items || [];
    const existingSlugs = products.items.filter(p => p.categoria === 'piezas-unicas').map(p => p.imagen);
    let maxId = products.items.reduce((max, p) => Math.max(max, p.id), 0);
    existingPieces.forEach(piece => {
      if (!existingSlugs.includes(piece.imagen)) {
        maxId++;
        products.items.push({
          id: maxId,
          nombre: piece.nombre,
          categoria: 'piezas-unicas',
          imagen: piece.imagen,
          precioActual: '',
          precioAnterior: '',
          destacado: true,
          descripcion: ''
        });
      }
    });
    return products;
  });
  const [editProduct, setEditProduct] = useState(null);
  const [isNewProduct, setIsNewProduct] = useState(false);
  const [saved, setSaved] = useState(false);
  const [savedTexts, setSavedTexts] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [showLimitPopup, setShowLimitPopup] = useState(false);
  const [savingProduct, setSavingProduct] = useState(false);
  const [savingTexts, setSavingTexts] = useState(false);
  const imgInputRef = useRef(null);
  const [imgUploading, setImgUploading] = useState(false);
  const [imgTab, setImgTab] = useState('m1');

  const imgFieldMap = { m1: 'imagen', m2: 'imagen2', m3: 'imagen3' };
  const imgPosXMap = { m1: 'imagePosX', m2: 'image2PosX', m3: 'image3PosX' };
  const imgPosYMap = { m1: 'imagePosY', m2: 'image2PosY', m3: 'image3PosY' };
  const imgZoomMap = { m1: 'imageZoom', m2: 'image2Zoom', m3: 'image3Zoom' };

  const uniqueProducts = productsData.items.filter(p => p.categoria === 'piezas-unicas');
  const selectedCount = uniqueProducts.filter(p => p.destacado).length;

  const handleSaveTexts = async () => {
    setSaveError('');
    setSavingTexts(true);
    try {
      const selectedProducts = productsData.items.filter(p => p.categoria === 'piezas-unicas' && p.destacado);
      const newItems = selectedProducts.map(p => ({ nombre: p.nombre, imagen: p.imagen }));
      await updateSection('uniquePieces', { ...data, items: newItems });
      setSavedTexts(true);
      setTimeout(() => setSavedTexts(false), 2000);
    } catch {
      setSaveError('Error al guardar textos. Intenta de nuevo.');
    } finally {
      setSavingTexts(false);
    }
  };

  const handleSaveProduct = async () => {
    setSaveError('');
    setSavingProduct(true);
    const selectedProducts = productsData.items.filter(p => p.categoria === 'piezas-unicas' && p.destacado);
    const newItems = selectedProducts.map(p => ({ nombre: p.nombre, imagen: p.imagen }));
    try {
      await updateSection('products', productsData);
      await updateSection('uniquePieces', { ...data, items: newItems });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      setEditProduct(null);
      setIsNewProduct(false);
    } catch {
      setSaveError('Error al guardar. Intenta de nuevo.');
    } finally {
      setSavingProduct(false);
    }
  };

  const toggleDestacado = async (id) => {
    const prod = productsData.items.find(p => p.id === id);
    if (!prod.destacado && selectedCount >= 5) {
      setShowLimitPopup(true);
      return;
    }
    const prevProductsData = productsData;
    const items = productsData.items.map(p => p.id === id ? { ...p, destacado: !p.destacado } : p);
    const newProductsData = { ...productsData, items };
    setProductsData(newProductsData);
    try {
      const selectedProducts = items.filter(p => p.categoria === 'piezas-unicas' && p.destacado);
      const newItems = selectedProducts.map(p => ({ nombre: p.nombre, imagen: p.imagen }));
      await updateSection('products', newProductsData);
      await updateSection('uniquePieces', { ...data, items: newItems });
    } catch {
      setProductsData(prevProductsData);
      setSaveError('Error al actualizar. Intenta de nuevo.');
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !editProduct) return;
    setImgUploading(true);
    const field = imgFieldMap[imgTab];
    const posX = imgPosXMap[imgTab];
    const posY = imgPosYMap[imgTab];
    const zoom = imgZoomMap[imgTab];
    try {
      const { url } = await uploadImage(file);
      const updates = { [field]: url, [posX]: 50, [posY]: 50, [zoom]: 1 };
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
    const posX = imgPosXMap[imgTab];
    const posY = imgPosYMap[imgTab];
    const zoom = imgZoomMap[imgTab];
    const prod = productsData.items.find(p => p.id === editProduct);
    const url = prod?.[field];
    if (!url) return;
    try { await deleteImage(url); } catch {}
    const updates = { [field]: '', [posX]: 50, [posY]: 50, [zoom]: 1 };
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
      categoria: 'piezas-unicas',
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
    const prevProductsData = productsData;
    const newProductsData = { ...productsData, items: productsData.items.filter(p => p.id !== id) };
    setProductsData(newProductsData);
    setEditProduct(null);
    setIsNewProduct(false);
    try {
      const selectedProducts = newProductsData.items.filter(p => p.categoria === 'piezas-unicas' && p.destacado);
      const newItems = selectedProducts.map(p => ({ nombre: p.nombre, imagen: p.imagen }));
      await updateSection('products', newProductsData);
      await updateSection('uniquePieces', { ...data, items: newItems });
    } catch {
      setProductsData(prevProductsData);
      setSaveError('Error al eliminar. Intenta de nuevo.');
    }
  };

  const cancelProduct = () => {
    if (isNewProduct) {
      setProductsData({ ...productsData, items: productsData.items.filter(p => p.id !== editProduct) });
    }
    setEditProduct(null);
    setIsNewProduct(false);
  };

  const saveProduct = () => {
    handleSaveProduct();
  };

  const getEditingProduct = () => productsData.items.find(p => p.id === editProduct);

  return (
    <div className="admin-page">
      <h1 className="admin-page-title">Piezas Únicas</h1>
      <p className="admin-page-subtitle">Creaciones irrepetibles</p>

      <AdminCard title="Textos de la sección">
        <div className="admin-row">
          <AdminFormField label="Título" value={data.title} onChange={(v) => setData({ ...data, title: v })} />
          <AdminFormField label="Subtítulo" value={data.subtitle} onChange={(v) => setData({ ...data, subtitle: v })} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
          <button className={`btn-save ${savedTexts ? 'saved' : ''}`} onClick={handleSaveTexts} disabled={savingTexts} style={{ position: 'relative' }}>
            {savingTexts ? <><i className="fas fa-spinner fa-spin"></i> Guardando...</> : savedTexts ? <><i className="fas fa-check"></i> Guardado</> : <><i className="fas fa-save"></i> Guardar textos</>}
          </button>
        </div>
      </AdminCard>

      <AdminCard title={`Productos (${uniqueProducts.length}) — En página: ${selectedCount}/5`}>
        <div className="admin-grid-4">
          <div className="admin-grid-card admin-grid-card-add" onClick={addProduct}>
            <span className="upload-text">+ Agregar producto</span>
          </div>
          {uniqueProducts.map((prod) => (
            <div key={prod.id} className="admin-grid-card-wrapper">
              <div className="producto-card" style={{ position: 'relative' }}>
                <div
                  className={`card-page-toggle ${prod.destacado ? 'active' : ''}`}
                  onClick={(e) => { e.stopPropagation(); toggleDestacado(prod.id); }}
                  title={prod.destacado ? 'Visible en página principal' : 'No visible en página principal'}
                >
                  <div className="card-page-toggle-knob"></div>
                </div>
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
                </div>
              </div>
              <div className="admin-grid-card-actions">
                <button className="btn-card-edit" onClick={() => { setIsNewProduct(false); setImgTab('m1'); setEditProduct(prod.id); }}>
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

      {/* Modal de edición de producto */}
      {editProduct !== null && getEditingProduct() && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <button className="admin-modal-close" onClick={cancelProduct}>
              <i className="fas fa-times"></i>
            </button>
            <h3 className="admin-modal-title">{isNewProduct ? 'Agregar producto' : 'Editar producto'}</h3>

            <AdminFormField label="Nombre del producto" value={getEditingProduct().nombre} onChange={(v) => updateProduct(editProduct, 'nombre', v)} />
            <AdminFormField label="Descripción" type="textarea" rows={1} value={getEditingProduct().descripcion} onChange={(v) => updateProduct(editProduct, 'descripcion', v)} />
            <div className="admin-field">
              <label>Imágenes</label>
              <div className="img-tabs">
                {['m1', 'm2', 'm3'].map(t => (
                  <button
                    key={t}
                    type="button"
                    className={`img-tab ${imgTab === t ? 'active' : ''} ${getEditingProduct()[imgFieldMap[t]] ? 'has-img' : ''} ${t === 'm1' ? 'is-main' : ''}`}
                    onClick={() => setImgTab(t)}
                  >
                    {t.toUpperCase()}
                  </button>
                ))}
              </div>
              {(() => {
                const field = imgFieldMap[imgTab];
                const posX = imgPosXMap[imgTab];
                const posY = imgPosYMap[imgTab];
                const zoom = imgZoomMap[imgTab];
                const currentImg = getEditingProduct()[field];
                if (currentImg) {
                  return (
                    <div className="img-editor">
                      <div className="img-editor-body">
                        <button type="button" className="img-editor-arrow" onClick={() => updateProduct(editProduct, posY, Math.max(0, (getEditingProduct()[posY] ?? 50) - 5))}>
                          <i className="fas fa-chevron-up"></i>
                        </button>
                        <div className="img-editor-middle">
                          <button type="button" className="img-editor-arrow" onClick={() => updateProduct(editProduct, posX, Math.max(0, (getEditingProduct()[posX] ?? 50) - 5))}>
                            <i className="fas fa-chevron-left"></i>
                          </button>
                          <div className="img-editor-preview">
                            {imgUploading && <div className="img-editor-loading"><i className="fas fa-spinner fa-spin"></i></div>}
                            <button type="button" className="img-delete-btn" onClick={handleDeleteImage} title="Eliminar imagen">
                              <i className="fas fa-trash"></i>
                            </button>
                            <div className="img-editor-wrapper" style={{
                              transform: `scale(${getEditingProduct()[zoom] ?? 1}) translate(${50 - (getEditingProduct()[posX] ?? 50)}%, ${50 - (getEditingProduct()[posY] ?? 50)}%)`,
                            }}>
                              <img src={currentImg} alt="Preview" />
                            </div>
                          </div>
                          <button type="button" className="img-editor-arrow" onClick={() => updateProduct(editProduct, posX, Math.min(100, (getEditingProduct()[posX] ?? 50) + 5))}>
                            <i className="fas fa-chevron-right"></i>
                          </button>
                        </div>
                        <button type="button" className="img-editor-arrow" onClick={() => updateProduct(editProduct, posY, Math.min(100, (getEditingProduct()[posY] ?? 50) + 5))}>
                          <i className="fas fa-chevron-down"></i>
                        </button>
                      </div>
                      <div className="img-editor-zoom">
                        <i className="fas fa-search-minus"></i>
                        <input type="range" min="0.5" max="2" step="0.05" value={getEditingProduct()[zoom] ?? 1} onChange={(e) => updateProduct(editProduct, zoom, parseFloat(e.target.value))} />
                        <i className="fas fa-search-plus"></i>
                      </div>
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

            <div className="admin-modal-footer-center">
              <button type="button" className="btn-save-modal" onClick={saveProduct} disabled={savingProduct}>
                {savingProduct ? <><i className="fas fa-spinner fa-spin"></i> Guardando...</> : <><i className="fas fa-check"></i> Guardar</>}
              </button>
              <button type="button" className="btn-modal-cancel" onClick={cancelProduct} disabled={savingProduct}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Popup límite 5 */}
      {showLimitPopup && (
        <div className="admin-modal-overlay" onClick={() => setShowLimitPopup(false)}>
          <div className="limit-popup" onClick={(e) => e.stopPropagation()}>
            <div className="limit-popup-icon">
              <i className="fas fa-exclamation-circle"></i>
            </div>
            <h3>Límite alcanzado</h3>
            <p>Ya hay <strong>5 productos</strong> seleccionados para la página principal. Desmarca uno antes de seleccionar otro.</p>
            <button className="btn-save-modal" onClick={() => setShowLimitPopup(false)}>Entendido</button>
          </div>
        </div>
      )}

      {saveError && <div className="save-error"><i className="fas fa-exclamation-circle"></i> {saveError}</div>}
    </div>
  );
}

export default AdminUniquePieces;

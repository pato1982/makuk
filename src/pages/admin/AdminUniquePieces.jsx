import { useState, useRef } from 'react';
import { useContent } from '../../context/ContentContext';
import AdminFormField from '../../components/admin/AdminFormField';
import AdminCard from '../../components/admin/AdminCard';
import ImageUploader from '../../components/admin/ImageUploader';
import { uploadImage } from '../../services/api';

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
          precioActual: 0,
          precioAnterior: 0,
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
  const [saveError, setSaveError] = useState('');
  const [showLimitPopup, setShowLimitPopup] = useState(false);
  const imgInputRef = useRef(null);
  const [imgUploading, setImgUploading] = useState(false);

  const uniqueProducts = productsData.items.filter(p => p.categoria === 'piezas-unicas');
  const selectedCount = uniqueProducts.filter(p => p.destacado).length;

  const handleSave = async () => {
    setSaveError('');
    const selectedProducts = productsData.items.filter(p => p.categoria === 'piezas-unicas' && p.destacado);
    const newItems = selectedProducts.map(p => ({ nombre: p.nombre, imagen: p.imagen }));
    try {
      await Promise.all([
        updateSection('uniquePieces', { ...data, items: newItems }),
        updateSection('products', productsData),
      ]);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      setSaveError('Error al guardar. Intenta de nuevo.');
    }
  };

  const toggleDestacado = (id) => {
    const prod = productsData.items.find(p => p.id === id);
    if (!prod.destacado && selectedCount >= 5) {
      setShowLimitPopup(true);
      return;
    }
    const items = productsData.items.map(p => p.id === id ? { ...p, destacado: !p.destacado } : p);
    setProductsData({ ...productsData, items });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !editProduct) return;
    setImgUploading(true);
    try {
      const { url } = await uploadImage(file);
      setProductsData(prev => ({
        ...prev,
        items: prev.items.map(p => p.id === editProduct
          ? { ...p, imagen: url, imagePosX: 50, imagePosY: 50, imageZoom: 1 }
          : p)
      }));
    } catch {
      // error silencioso
    } finally {
      setImgUploading(false);
      e.target.value = '';
    }
  };

  const addProduct = () => {
    const maxId = productsData.items.reduce((max, p) => Math.max(max, p.id), 0);
    const newProduct = {
      id: maxId + 1,
      nombre: 'Nuevo Producto',
      categoria: 'piezas-unicas',
      imagen: '',
      precioActual: 0,
      precioAnterior: 0,
      destacado: false,
      descripcion: '',
      imagePosX: 50,
      imagePosY: 50,
      imageZoom: 1
    };
    setProductsData({ ...productsData, items: [...productsData.items, newProduct] });
    setEditProduct(newProduct.id);
    setIsNewProduct(true);
  };

  const updateProduct = (id, field, value) => {
    setProductsData(prev => ({
      ...prev,
      items: prev.items.map(p => p.id === id ? { ...p, [field]: value } : p)
    }));
  };

  const removeProduct = (id) => {
    if (!window.confirm('¿Eliminar este producto?')) return;
    setProductsData({ ...productsData, items: productsData.items.filter(p => p.id !== id) });
    setEditProduct(null);
    setIsNewProduct(false);
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
      </AdminCard>

      <AdminCard title={`Productos (${uniqueProducts.length}) — En página: ${selectedCount}/5`}>
        <div className="admin-grid-4">
          <div className="admin-grid-card admin-grid-card-add" onClick={addProduct}>
            <span className="upload-text">+ Agregar producto</span>
          </div>
          {uniqueProducts.map((prod) => (
            <div key={prod.id} className="admin-grid-card-wrapper">
              <div className="admin-grid-card" style={{ position: 'relative' }}>
                <div
                  className={`card-page-toggle ${prod.destacado ? 'active' : ''}`}
                  onClick={(e) => { e.stopPropagation(); toggleDestacado(prod.id); }}
                  title={prod.destacado ? 'Visible en página principal' : 'No visible en página principal'}
                >
                  <div className="card-page-toggle-knob"></div>
                </div>
                {prod.imagen && <img src={prod.imagen} alt={prod.nombre} className="admin-grid-card-img" style={{
                  objectPosition: `${prod.imagePosX ?? 50}% ${prod.imagePosY ?? 50}%`,
                  transform: `scale(${prod.imageZoom ?? 1})`,
                }} />}
                <div className="admin-grid-card-info">
                  <span className="admin-grid-card-name">{prod.nombre}</span>
                </div>
              </div>
              <div className="admin-grid-card-actions">
                <button className="btn-card-edit" onClick={() => { setIsNewProduct(false); setEditProduct(prod.id); }}>
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
              <label>Imagen</label>
              {getEditingProduct().imagen ? (
                <div className="img-editor">
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
                        <img
                          src={getEditingProduct().imagen}
                          alt="Preview"
                          style={{
                            objectPosition: `${getEditingProduct().imagePosX ?? 50}% ${getEditingProduct().imagePosY ?? 50}%`,
                            transform: `scale(${getEditingProduct().imageZoom ?? 1})`,
                          }}
                        />
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
                    <input
                      type="range"
                      min="0.5"
                      max="2"
                      step="0.05"
                      value={getEditingProduct().imageZoom ?? 1}
                      onChange={(e) => updateProduct(editProduct, 'imageZoom', parseFloat(e.target.value))}
                    />
                    <i className="fas fa-search-plus"></i>
                  </div>
                  <button type="button" className="img-editor-change" onClick={() => imgInputRef.current.click()}>
                    <i className="fas fa-camera"></i> Cambiar imagen
                  </button>
                  <input ref={imgInputRef} type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
                </div>
              ) : (
                <ImageUploader value="" onChange={(v) => {
                  updateProduct(editProduct, 'imagen', v);
                  updateProduct(editProduct, 'imagePosX', 50);
                  updateProduct(editProduct, 'imagePosY', 50);
                  updateProduct(editProduct, 'imageZoom', 1);
                }} compact />
              )}
            </div>
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
      <button className={`btn-save ${saved ? 'saved' : ''}`} onClick={handleSave}>
        {saved ? <><i className="fas fa-check"></i> Guardado</> : <><i className="fas fa-save"></i> Guardar cambios</>}
      </button>
    </div>
  );
}

export default AdminUniquePieces;

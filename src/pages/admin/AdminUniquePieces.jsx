import { useState } from 'react';
import { useContent } from '../../context/ContentContext';
import AdminFormField from '../../components/admin/AdminFormField';
import AdminCard from '../../components/admin/AdminCard';
import ImageUploader from '../../components/admin/ImageUploader';

function AdminUniquePieces() {
  const { content, updateSection } = useContent();
  const [data, setData] = useState(JSON.parse(JSON.stringify(content.uniquePieces)));
  const [editIndex, setEditIndex] = useState(null);
  const [productsData, setProductsData] = useState(JSON.parse(JSON.stringify(content.products)));
  const [editProduct, setEditProduct] = useState(null);
  const [isNewProduct, setIsNewProduct] = useState(false);
  const [saved, setSaved] = useState(false);
  const [tab, setTab] = useState('pagina');

  const handleSave = () => {
    updateSection('uniquePieces', data);
    updateSection('products', productsData);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const uniqueProducts = productsData.items.filter(p => p.categoria === 'piezas-unicas');

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

  const updateItem = (index, field, value) => {
    const items = [...data.items];
    items[index] = { ...items[index], [field]: value };
    setData({ ...data, items });
  };

  const addItem = () => {
    setData({
      ...data,
      items: [...data.items, { nombre: 'Nueva Pieza', imagen: '' }]
    });
    setEditIndex(data.items.length);
  };

  const removeItem = (index) => {
    if (!window.confirm('¿Eliminar esta pieza?')) return;
    setData({ ...data, items: data.items.filter((_, i) => i !== index) });
    setEditIndex(null);
  };

  return (
    <div className="admin-page">
      <h1 className="admin-page-title">Piezas Únicas</h1>
      <p className="admin-page-subtitle">Creaciones irrepetibles</p>

      <div className="admin-tabs">
        <button className={`admin-tab ${tab === 'pagina' ? 'active' : ''}`} onClick={() => setTab('pagina')}>
          <i className="fas fa-file-alt"></i> Productos de página
        </button>
        <button className={`admin-tab ${tab === 'piezas' ? 'active' : ''}`} onClick={() => setTab('piezas')}>
          <i className="fas fa-gem"></i> Piezas únicas
        </button>
      </div>

      <div className="admin-tab-content">
        {tab === 'pagina' && (
          <>
            <AdminCard title="Textos de la sección">
              <div className="admin-row">
                <AdminFormField label="Título" value={data.title} onChange={(v) => setData({ ...data, title: v })} />
                <AdminFormField label="Subtítulo" value={data.subtitle} onChange={(v) => setData({ ...data, subtitle: v })} />
              </div>
            </AdminCard>

            <AdminCard title={`Piezas (${data.items.length})`}>
              <div className="admin-grid-4">
                {data.items.map((item, i) => (
                  <div key={i} className="admin-grid-card" onClick={() => setEditIndex(i)}>
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

        {tab === 'piezas' && (
          <AdminCard title={`Productos piezas únicas (${uniqueProducts.length})`}>
            <div className="admin-grid-4">
              <div className="admin-grid-card admin-grid-card-add" onClick={addProduct}>
                <span className="upload-text">+ Agregar producto</span>
              </div>
              {uniqueProducts.map((prod) => (
                <div key={prod.id} className="admin-grid-card-wrapper">
                  <div className="admin-grid-card">
                    {prod.imagen && <img src={prod.imagen} alt={prod.nombre} className="admin-grid-card-img" />}
                    <div className="admin-grid-card-info">
                      <span className="admin-grid-card-name">{prod.nombre}</span>
                      <span className="admin-grid-card-slug">${prod.precioActual?.toLocaleString()}</span>
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
        )}
      </div>

      {/* Modal de edición */}
      {editIndex !== null && data.items[editIndex] && (
        <div className="admin-modal-overlay" onClick={() => setEditIndex(null)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <button className="admin-modal-close" onClick={() => setEditIndex(null)}>
              <i className="fas fa-times"></i>
            </button>
            <h3 className="admin-modal-title">Editar pieza</h3>

            <AdminFormField label="Nombre" value={data.items[editIndex].nombre} onChange={(v) => updateItem(editIndex, 'nombre', v)} />
            <AdminFormField label="Imagen (URL)" value={data.items[editIndex].imagen} onChange={(v) => updateItem(editIndex, 'imagen', v)} />

            {data.items[editIndex].imagen && (
              <div className="admin-modal-image-preview">
                <img src={data.items[editIndex].imagen} alt="Preview" />
              </div>
            )}

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
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <button className="admin-modal-close" onClick={cancelProduct}>
              <i className="fas fa-times"></i>
            </button>
            <h3 className="admin-modal-title">{isNewProduct ? 'Agregar producto' : 'Editar producto'}</h3>

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

      <button className={`btn-save ${saved ? 'saved' : ''}`} onClick={handleSave}>
        {saved ? <><i className="fas fa-check"></i> Guardado</> : <><i className="fas fa-save"></i> Guardar cambios</>}
      </button>
    </div>
  );
}

export default AdminUniquePieces;

import { useState } from 'react';
import { useContent } from '../../context/ContentContext';
import AdminFormField from '../../components/admin/AdminFormField';
import AdminCard from '../../components/admin/AdminCard';
import ImageUploader from '../../components/admin/ImageUploader';

function AdminProducts() {
  const { content, updateSection } = useContent();
  const [data, setData] = useState(JSON.parse(JSON.stringify(content.products)));
  const [editIndex, setEditIndex] = useState(null);
  const [filterCat, setFilterCat] = useState('todos');
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState('');

  const handleSave = async () => {
    setSaveError('');
    try {
      await updateSection('products', data);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      setSaveError('Error al guardar. Intenta de nuevo.');
    }
  };

  const updateItem = (index, field, value) => {
    const items = [...data.items];
    items[index] = { ...items[index], [field]: value };
    setData({ ...data, items });
  };

  const addItem = () => {
    const maxId = data.items.reduce((max, p) => Math.max(max, p.id), 0);
    setData({
      ...data,
      items: [...data.items, {
        id: maxId + 1,
        nombre: 'Nuevo Producto',
        categoria: 'pulseras',
        imagen: '',
        precioActual: '',
        precioAnterior: '',
        destacado: false,
        descripcion: 'Descripción del producto'
      }]
    });
    setEditIndex(data.items.length);
  };

  const removeItem = (index) => {
    if (!window.confirm('¿Eliminar este producto?')) return;
    setData({ ...data, items: data.items.filter((_, i) => i !== index) });
    setEditIndex(null);
  };

  const categoryOptions = Object.entries(data.nombresCategorias).map(([value, label]) => ({ value, label }));

  const filteredItems = filterCat === 'todos'
    ? data.items
    : data.items.filter(p => p.categoria === filterCat);

  const getOriginalIndex = (product) => data.items.findIndex(p => p.id === product.id);

  return (
    <div className="admin-page">
      <h1 className="admin-page-title">Productos</h1>
      <p className="admin-page-subtitle">Gestión del catálogo</p>

      <AdminCard title="Filtrar">
        <div className="admin-filter-bar">
          <select value={filterCat} onChange={(e) => { setFilterCat(e.target.value); setEditIndex(null); }}>
            <option value="todos">Todas las categorías</option>
            {categoryOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <span className="filter-count">{filteredItems.length} producto(s)</span>
        </div>
      </AdminCard>

      <AdminCard title={`Productos (${data.items.length} total)`}>
        <div className="admin-items-list">
          {filteredItems.map((item) => {
            const origIdx = getOriginalIndex(item);
            return (
              <div key={item.id} className={`admin-list-item ${editIndex === origIdx ? 'editing' : ''}`}>
                <div className="admin-list-item-header" onClick={() => setEditIndex(editIndex === origIdx ? null : origIdx)}>
                  {item.imagen && <img src={item.imagen} alt="" className="item-thumb" />}
                  <span className="item-name">{item.nombre}</span>
                  <span className="item-slug">${item.precioActual.toLocaleString()}</span>
                  {item.destacado && <span className="item-badge">Destacado</span>}
                  <i className={`fas fa-chevron-${editIndex === origIdx ? 'up' : 'down'} item-toggle`}></i>
                </div>
                {editIndex === origIdx && (
                  <div className="admin-list-item-body">
                    <AdminFormField label="Nombre" value={item.nombre} onChange={(v) => updateItem(origIdx, 'nombre', v)} />
                    <AdminFormField label="Categoría" type="select" value={item.categoria} onChange={(v) => updateItem(origIdx, 'categoria', v)} options={categoryOptions} />
                    <ImageUploader label="Imagen" value={item.imagen} onChange={(v) => updateItem(origIdx, 'imagen', v)} />
                    <div className="admin-row">
                      <AdminFormField label="Precio actual" type="number" value={item.precioActual} onChange={(v) => updateItem(origIdx, 'precioActual', v)} />
                      <AdminFormField label="Precio anterior" type="number" value={item.precioAnterior} onChange={(v) => updateItem(origIdx, 'precioAnterior', v)} />
                    </div>
                    <AdminFormField label="Destacado" type="toggle" value={item.destacado} onChange={(v) => updateItem(origIdx, 'destacado', v)} />
                    <AdminFormField label="Descripción" type="textarea" value={item.descripcion} onChange={(v) => updateItem(origIdx, 'descripcion', v)} />
                    <button type="button" className="btn-delete-item" onClick={() => removeItem(origIdx)}>
                      <i className="fas fa-trash"></i> Eliminar producto
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <button type="button" className="btn-add-item" onClick={addItem}>
          <i className="fas fa-plus"></i> Agregar producto
        </button>
      </AdminCard>

      {saveError && <div className="save-error"><i className="fas fa-exclamation-circle"></i> {saveError}</div>}
      <button className={`btn-save ${saved ? 'saved' : ''}`} onClick={handleSave}>
        {saved ? <><i className="fas fa-check"></i> Guardado</> : <><i className="fas fa-save"></i> Guardar cambios</>}
      </button>
    </div>
  );
}

export default AdminProducts;

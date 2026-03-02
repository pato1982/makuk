import { useState } from 'react';
import { useContent } from '../../context/ContentContext';
import AdminFormField from '../../components/admin/AdminFormField';
import AdminCard from '../../components/admin/AdminCard';

function AdminTestimonials() {
  const { content, updateSection } = useContent();
  const [data, setData] = useState(JSON.parse(JSON.stringify(content.testimonials)));
  const [editIndex, setEditIndex] = useState(null);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    updateSection('testimonials', data);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const updateItem = (index, field, value) => {
    const items = [...data.items];
    items[index] = { ...items[index], [field]: value };
    setData({ ...data, items });
  };

  const addItem = () => {
    setData({
      ...data,
      items: [...data.items, { texto: 'Nuevo testimonio...', nombre: 'Nombre', ubicacion: 'Ciudad, País' }]
    });
    setEditIndex(data.items.length);
  };

  const removeItem = (index) => {
    if (!window.confirm('¿Eliminar este testimonio?')) return;
    setData({ ...data, items: data.items.filter((_, i) => i !== index) });
    setEditIndex(null);
  };

  return (
    <div className="admin-page">
      <h1 className="admin-page-title">Testimonios</h1>
      <p className="admin-page-subtitle">Lo que dicen los clientes</p>

      <AdminCard title="General">
        <AdminFormField label="Título de la sección" value={data.title} onChange={(v) => setData({ ...data, title: v })} />
      </AdminCard>

      <AdminCard title={`Testimonios (${data.items.length})`}>
        <div className="admin-items-list">
          {data.items.map((item, i) => (
            <div key={i} className={`admin-list-item ${editIndex === i ? 'editing' : ''}`}>
              <div className="admin-list-item-header" onClick={() => setEditIndex(editIndex === i ? null : i)}>
                <span className="item-name">{item.nombre}</span>
                <span className="item-slug">— {item.ubicacion}</span>
                <i className={`fas fa-chevron-${editIndex === i ? 'up' : 'down'} item-toggle`}></i>
              </div>
              {editIndex === i && (
                <div className="admin-list-item-body">
                  <AdminFormField label="Texto" type="textarea" rows={3} value={item.texto} onChange={(v) => updateItem(i, 'texto', v)} />
                  <AdminFormField label="Nombre" value={item.nombre} onChange={(v) => updateItem(i, 'nombre', v)} />
                  <AdminFormField label="Ubicación" value={item.ubicacion} onChange={(v) => updateItem(i, 'ubicacion', v)} />
                  <button type="button" className="btn-delete-item" onClick={() => removeItem(i)}>
                    <i className="fas fa-trash"></i> Eliminar testimonio
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
        <button type="button" className="btn-add-item" onClick={addItem}>
          <i className="fas fa-plus"></i> Agregar testimonio
        </button>
      </AdminCard>

      <button className={`btn-save ${saved ? 'saved' : ''}`} onClick={handleSave}>
        {saved ? <><i className="fas fa-check"></i> Guardado</> : <><i className="fas fa-save"></i> Guardar cambios</>}
      </button>
    </div>
  );
}

export default AdminTestimonials;

import { useState } from 'react';
import { useContent } from '../../context/ContentContext';
import AdminFormField from '../../components/admin/AdminFormField';
import AdminCard from '../../components/admin/AdminCard';

function AdminTestimonials() {
  const { content, updateSection } = useContent();
  const [data, setData] = useState(JSON.parse(JSON.stringify(content.testimonials)));
  const [editIndex, setEditIndex] = useState(null);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState('');

  const handleSave = async () => {
    setSaveError('');
    try {
      await updateSection('testimonials', data);
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
        <div className="admin-testimonials-grid">
          {data.items.map((item, i) => (
            <div
              key={i}
              className={`admin-testimonial-card ${editIndex === i ? 'active' : ''}`}
              onClick={() => setEditIndex(editIndex === i ? null : i)}
            >
              <span className="admin-testimonial-card-name">{item.nombre}</span>
              <span className="admin-testimonial-card-location">{item.ubicacion}</span>
            </div>
          ))}
          <div className="admin-testimonial-card admin-testimonial-card-add" onClick={addItem}>
            <i className="fas fa-plus"></i> Agregar
          </div>
        </div>
        {editIndex !== null && data.items[editIndex] && (
          <div className="step-edit-panel">
            <AdminFormField label="Texto" type="textarea" rows={3} value={data.items[editIndex].texto} onChange={(v) => updateItem(editIndex, 'texto', v)} />
            <div className="admin-row">
              <AdminFormField label="Nombre" value={data.items[editIndex].nombre} onChange={(v) => updateItem(editIndex, 'nombre', v)} />
              <AdminFormField label="Ubicación" value={data.items[editIndex].ubicacion} onChange={(v) => updateItem(editIndex, 'ubicacion', v)} />
            </div>
            <button type="button" className="btn-delete-item" onClick={() => removeItem(editIndex)}>
              <i className="fas fa-trash"></i> Eliminar testimonio
            </button>
          </div>
        )}
      </AdminCard>

      {saveError && <div className="save-error"><i className="fas fa-exclamation-circle"></i> {saveError}</div>}
      <button className={`btn-save ${saved ? 'saved' : ''}`} onClick={handleSave}>
        {saved ? <><i className="fas fa-check"></i> Guardado</> : <><i className="fas fa-save"></i> Guardar cambios</>}
      </button>
    </div>
  );
}

export default AdminTestimonials;

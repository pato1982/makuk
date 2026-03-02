import { useState } from 'react';
import { useContent } from '../../context/ContentContext';
import AdminFormField from '../../components/admin/AdminFormField';
import AdminCard from '../../components/admin/AdminCard';
import ImageUploader from '../../components/admin/ImageUploader';

function AdminWorldwide() {
  const { content, updateSection } = useContent();
  const [data, setData] = useState(JSON.parse(JSON.stringify(content.worldwide)));
  const [editCountry, setEditCountry] = useState(null);
  const [editStat, setEditStat] = useState(null);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    updateSection('worldwide', data);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  // Stats
  const updateStat = (index, field, value) => {
    const stats = [...data.stats];
    stats[index] = { ...stats[index], [field]: value };
    setData({ ...data, stats });
  };

  const addStat = () => {
    setData({ ...data, stats: [...data.stats, { numero: '0', label: 'Nuevo', labelCorta: 'Nuevo' }] });
  };

  const removeStat = (index) => {
    setData({ ...data, stats: data.stats.filter((_, i) => i !== index) });
  };

  // Countries
  const updateCountry = (index, field, value) => {
    const countries = [...data.countries];
    countries[index] = { ...countries[index], [field]: value };
    setData({ ...data, countries });
  };

  const addCountry = () => {
    setData({
      ...data,
      countries: [...data.countries, { nombre: 'Nuevo País', descripcion: 'Descripción', imagen: '' }]
    });
    setEditCountry(data.countries.length);
  };

  const removeCountry = (index) => {
    if (!window.confirm('¿Eliminar este país?')) return;
    setData({ ...data, countries: data.countries.filter((_, i) => i !== index) });
    setEditCountry(null);
  };

  return (
    <div className="admin-page">
      <h1 className="admin-page-title">Presencia Global</h1>
      <p className="admin-page-subtitle">Sección de alcance mundial</p>

      <AdminCard title="Textos">
        <AdminFormField label="Título" value={data.title} onChange={(v) => setData({ ...data, title: v })} />
        <AdminFormField label="Subtítulo" value={data.subtitle} onChange={(v) => setData({ ...data, subtitle: v })} />
        <AdminFormField label="Párrafo descriptivo" type="textarea" rows={4} value={data.paragraph} onChange={(v) => setData({ ...data, paragraph: v })} />
      </AdminCard>

      <AdminCard title={`Estadísticas (${data.stats.length})`}>
        {data.stats.map((stat, i) => (
          <div key={i} className="admin-inline-group">
            <AdminFormField label="Número" value={stat.numero} onChange={(v) => updateStat(i, 'numero', v)} />
            <AdminFormField label="Label" value={stat.label} onChange={(v) => updateStat(i, 'label', v)} />
            <AdminFormField label="Label corto" value={stat.labelCorta} onChange={(v) => updateStat(i, 'labelCorta', v)} />
            <button type="button" className="btn-delete-inline" onClick={() => removeStat(i)}>
              <i className="fas fa-trash"></i>
            </button>
          </div>
        ))}
        <button type="button" className="btn-add-item" onClick={addStat}>
          <i className="fas fa-plus"></i> Agregar estadística
        </button>
      </AdminCard>

      <AdminCard title={`Países (${data.countries.length})`}>
        <div className="admin-items-list">
          {data.countries.map((country, i) => (
            <div key={i} className={`admin-list-item ${editCountry === i ? 'editing' : ''}`}>
              <div className="admin-list-item-header" onClick={() => setEditCountry(editCountry === i ? null : i)}>
                {country.imagen && <img src={country.imagen} alt="" className="item-thumb" />}
                <span className="item-name">{country.nombre}</span>
                <i className={`fas fa-chevron-${editCountry === i ? 'up' : 'down'} item-toggle`}></i>
              </div>
              {editCountry === i && (
                <div className="admin-list-item-body">
                  <AdminFormField label="Nombre" value={country.nombre} onChange={(v) => updateCountry(i, 'nombre', v)} />
                  <AdminFormField label="Descripción" value={country.descripcion} onChange={(v) => updateCountry(i, 'descripcion', v)} />
                  <ImageUploader label="Imagen" value={country.imagen} onChange={(v) => updateCountry(i, 'imagen', v)} />
                  <button type="button" className="btn-delete-item" onClick={() => removeCountry(i)}>
                    <i className="fas fa-trash"></i> Eliminar país
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
        <button type="button" className="btn-add-item" onClick={addCountry}>
          <i className="fas fa-plus"></i> Agregar país
        </button>
      </AdminCard>

      <button className={`btn-save ${saved ? 'saved' : ''}`} onClick={handleSave}>
        {saved ? <><i className="fas fa-check"></i> Guardado</> : <><i className="fas fa-save"></i> Guardar cambios</>}
      </button>
    </div>
  );
}

export default AdminWorldwide;

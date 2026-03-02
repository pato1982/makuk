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
  const [tab, setTab] = useState('textos');

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

      <div className="admin-tabs">
        <button className={`admin-tab ${tab === 'textos' ? 'active' : ''}`} onClick={() => setTab('textos')}>
          <i className="fas fa-align-left"></i> Textos
        </button>
        <button className={`admin-tab ${tab === 'stats' ? 'active' : ''}`} onClick={() => setTab('stats')}>
          <i className="fas fa-chart-bar"></i> Estadísticas
        </button>
        <button className={`admin-tab ${tab === 'paises' ? 'active' : ''}`} onClick={() => setTab('paises')}>
          <i className="fas fa-globe-americas"></i> Países
        </button>
      </div>

      <div className="admin-tab-content">
        {tab === 'textos' && (
          <AdminCard title="Textos">
            <div className="admin-row">
              <AdminFormField label="Título" value={data.title} onChange={(v) => setData({ ...data, title: v })} />
              <AdminFormField label="Subtítulo" value={data.subtitle} onChange={(v) => setData({ ...data, subtitle: v })} />
            </div>
            <AdminFormField label="Párrafo descriptivo" type="textarea" rows={4} value={data.paragraph} onChange={(v) => setData({ ...data, paragraph: v })} />
          </AdminCard>
        )}

        {tab === 'stats' && (
          <AdminCard title={`Estadísticas (${data.stats.length})`}>
            <div className="stats-columns">
              {data.stats.map((stat, i) => (
                <div key={i} className="stat-column">
                  <AdminFormField label="Número" value={stat.numero} onChange={(v) => updateStat(i, 'numero', v)} />
                  <AdminFormField label="Texto" value={stat.label} onChange={(v) => updateStat(i, 'label', v)} />
                  <AdminFormField label="Texto corto (móvil)" value={stat.labelCorta} onChange={(v) => updateStat(i, 'labelCorta', v)} />
                  <button type="button" className="btn-delete-inline" onClick={() => removeStat(i)} style={{ alignSelf: 'flex-end' }}>
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
              ))}
            </div>
            <button type="button" className="btn-add-item" onClick={addStat}>
              <i className="fas fa-plus"></i> Agregar estadística
            </button>
          </AdminCard>
        )}

        {tab === 'paises' && (
          <AdminCard title={`Países (${data.countries.length})`}>
            <div className="steps-horizontal">
              {data.countries.map((country, i) => (
                <div
                  key={i}
                  className={`step-card ${editCountry === i ? 'active' : ''}`}
                  onClick={() => setEditCountry(editCountry === i ? null : i)}
                >
                  {country.imagen && <img src={country.imagen} alt="" style={{ width: '100%', height: 80, objectFit: 'contain', borderRadius: 6 }} />}
                  <span className="step-card-title">{country.nombre}</span>
                  <i className={`fas fa-chevron-${editCountry === i ? 'up' : 'down'} step-card-toggle`}></i>
                </div>
              ))}
              <div className="step-card step-card-add" onClick={addCountry}>
                <i className="fas fa-plus"></i>
              </div>
            </div>
            {editCountry !== null && data.countries[editCountry] && (
              <div className="step-edit-panel">
                <div className="admin-row">
                  <AdminFormField label="Nombre" value={data.countries[editCountry].nombre} onChange={(v) => updateCountry(editCountry, 'nombre', v)} />
                  <AdminFormField label="Descripción" value={data.countries[editCountry].descripcion} onChange={(v) => updateCountry(editCountry, 'descripcion', v)} />
                </div>
                <ImageUploader label="Imagen" value={data.countries[editCountry].imagen} onChange={(v) => updateCountry(editCountry, 'imagen', v)} />
                <button type="button" className="btn-delete-item" onClick={() => removeCountry(editCountry)}>
                  <i className="fas fa-trash"></i> Eliminar país
                </button>
              </div>
            )}
          </AdminCard>
        )}
      </div>

      <button className={`btn-save ${saved ? 'saved' : ''}`} onClick={handleSave}>
        {saved ? <><i className="fas fa-check"></i> Guardado</> : <><i className="fas fa-save"></i> Guardar cambios</>}
      </button>
    </div>
  );
}

export default AdminWorldwide;

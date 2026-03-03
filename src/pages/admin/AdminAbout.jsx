import { useState } from 'react';
import { useContent } from '../../context/ContentContext';
import AdminFormField from '../../components/admin/AdminFormField';
import AdminCard from '../../components/admin/AdminCard';
import ImageUploader from '../../components/admin/ImageUploader';
import IconPicker from '../../components/admin/IconPicker';

function AdminAbout() {
  const { content, updateSection } = useContent();
  const [data, setData] = useState(JSON.parse(JSON.stringify(content.about)));
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [editingFeature, setEditingFeature] = useState(null);
  const [tab, setTab] = useState('general');

  const handleSave = async () => {
    setSaveError('');
    try {
      await updateSection('about', data);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      setSaveError('Error al guardar. Intenta de nuevo.');
    }
  };

  const fullText = data.paragraphs.join('\n\n');

  const updateText = (value) => {
    const paragraphs = value.split(/\n\s*\n/).filter(p => p.trim());
    setData({ ...data, paragraphs });
  };

  const updateFeature = (index, field, value) => {
    const features = [...data.features];
    features[index] = { ...features[index], [field]: value };
    setData({ ...data, features });
  };

  const addFeature = () => {
    setData({ ...data, features: [...data.features, { icon: 'fa-star', text: 'Nuevo' }] });
  };

  const removeFeature = (index) => {
    setData({ ...data, features: data.features.filter((_, i) => i !== index) });
  };

  return (
    <div className="admin-page">
      <h1 className="admin-page-title">Nosotros</h1>
      <p className="admin-page-subtitle">Sección "Nuestra Historia"</p>

      <div className="admin-tabs">
        <button className={`admin-tab ${tab === 'general' ? 'active' : ''}`} onClick={() => setTab('general')}>
          <i className="fas fa-cog"></i> General
        </button>
        <button className={`admin-tab ${tab === 'texto' ? 'active' : ''}`} onClick={() => setTab('texto')}>
          <i className="fas fa-align-left"></i> Texto y Features
        </button>
      </div>

      <div className="admin-tab-content">
        {tab === 'general' && (
          <AdminCard title="General">
            <div className="admin-row">
              <AdminFormField label="Título" value={data.title} onChange={(v) => setData({ ...data, title: v })} />
              <ImageUploader label="Imagen principal" value={data.image} onChange={(v) => setData({ ...data, image: v })} noPreview />
            </div>
            {data.image && (
              <div className="about-image-preview">
                <img src={data.image} alt="Preview" />
              </div>
            )}
          </AdminCard>
        )}

        {tab === 'texto' && (
          <>
            <AdminCard title="Texto">
              <div className="admin-field">
                <label>Contenido</label>
                <textarea
                  rows={4}
                  value={fullText}
                  onChange={(e) => updateText(e.target.value)}
                  style={{ resize: 'none', overflowY: 'auto' }}
                />
              </div>
            </AdminCard>

            <AdminCard title="Features">
              <div className="features-editor">
                <div className="features-icons-panel">
                  <label>Iconos disponibles</label>
                  <div className="features-icons-grid">
                    {['fa-gem', 'fa-heart', 'fa-star', 'fa-fire', 'fa-hands', 'fa-crown',
                      'fa-ring', 'fa-palette', 'fa-cut', 'fa-magic', 'fa-globe',
                      'fa-award', 'fa-certificate', 'fa-gift', 'fa-bolt', 'fa-feather',
                      'fa-leaf', 'fa-sun', 'fa-moon', 'fa-mountain', 'fa-water',
                      'fa-eye', 'fa-check', 'fa-tools', 'fa-hammer', 'fa-paint-brush',
                    ].map((icon) => (
                      <button
                        key={icon}
                        type="button"
                        className={`icon-option ${editingFeature !== null && data.features[editingFeature]?.icon === icon ? 'active' : ''}`}
                        onClick={() => { if (editingFeature !== null) updateFeature(editingFeature, 'icon', icon); }}
                        title={icon}
                      >
                        <i className={`fas ${icon}`}></i>
                      </button>
                    ))}
                  </div>
                  {editingFeature === null && <span className="features-hint">Selecciona una feature para asignar icono</span>}
                </div>
                <div className="features-list-panel">
                  {data.features.map((f, i) => (
                    <div
                      key={i}
                      className={`feature-item ${editingFeature === i ? 'editing' : ''}`}
                      onClick={() => setEditingFeature(i)}
                    >
                      <i className={`fas ${f.icon} feature-item-icon`}></i>
                      <input
                        type="text"
                        value={f.text}
                        onChange={(e) => updateFeature(i, 'text', e.target.value)}
                        className="feature-item-input"
                      />
                      <button type="button" className="btn-delete-inline" onClick={(e) => { e.stopPropagation(); removeFeature(i); }}>
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  ))}
                  <button type="button" className="btn-add-item" onClick={addFeature}>
                    <i className="fas fa-plus"></i> Agregar feature
                  </button>
                </div>
              </div>
            </AdminCard>
          </>
        )}
      </div>

      {saveError && <div className="save-error"><i className="fas fa-exclamation-circle"></i> {saveError}</div>}
      <button className={`btn-save ${saved ? 'saved' : ''}`} onClick={handleSave}>
        {saved ? <><i className="fas fa-check"></i> Guardado</> : <><i className="fas fa-save"></i> Guardar cambios</>}
      </button>
    </div>
  );
}

export default AdminAbout;

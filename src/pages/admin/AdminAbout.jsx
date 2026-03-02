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

  const handleSave = () => {
    updateSection('about', data);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const updateParagraph = (index, value) => {
    const paragraphs = [...data.paragraphs];
    paragraphs[index] = value;
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

      <AdminCard title="General">
        <AdminFormField label="Título" value={data.title} onChange={(v) => setData({ ...data, title: v })} />
        <ImageUploader label="Imagen principal" value={data.image} onChange={(v) => setData({ ...data, image: v })} />
      </AdminCard>

      <AdminCard title="Párrafos">
        {data.paragraphs.map((p, i) => (
          <AdminFormField key={i} label={`Párrafo ${i + 1}`} type="textarea" rows={4} value={p} onChange={(v) => updateParagraph(i, v)} />
        ))}
      </AdminCard>

      <AdminCard title="Features">
        {data.features.map((f, i) => (
          <div key={i} className="admin-inline-group">
            <IconPicker label={`Icono ${i + 1}`} value={f.icon} onChange={(v) => updateFeature(i, 'icon', v)} />
            <AdminFormField label="Texto" value={f.text} onChange={(v) => updateFeature(i, 'text', v)} />
            <button type="button" className="btn-delete-inline" onClick={() => removeFeature(i)}>
              <i className="fas fa-trash"></i>
            </button>
          </div>
        ))}
        <button type="button" className="btn-add-item" onClick={addFeature}>
          <i className="fas fa-plus"></i> Agregar feature
        </button>
      </AdminCard>

      <button className={`btn-save ${saved ? 'saved' : ''}`} onClick={handleSave}>
        {saved ? <><i className="fas fa-check"></i> Guardado</> : <><i className="fas fa-save"></i> Guardar cambios</>}
      </button>
    </div>
  );
}

export default AdminAbout;

import { useState } from 'react';
import { useContent } from '../../context/ContentContext';
import AdminFormField from '../../components/admin/AdminFormField';
import ImageUploader from '../../components/admin/ImageUploader';

function AdminHeader() {
  const { content, updateSection } = useContent();
  const [data, setData] = useState({ ...content.header });
  const [heroData, setHeroData] = useState({ ...content.hero });
  const [introData, setIntroData] = useState({ ...content.intro });
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [tab, setTab] = useState('identidad');

  const handleSave = async () => {
    setSaveError('');
    try {
      await Promise.all([
        updateSection('header', data),
        updateSection('hero', heroData),
        updateSection('intro', introData),
      ]);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      setSaveError('Error al guardar. Intenta de nuevo.');
    }
  };

  return (
    <div className="admin-page">
      <h1 className="admin-page-title">Header</h1>
      <p className="admin-page-subtitle">Logo, tagline, banner e intro</p>

      <div className="admin-tabs">
        <button className={`admin-tab ${tab === 'identidad' ? 'active' : ''}`} onClick={() => setTab('identidad')}>
          <i className="fas fa-tag"></i> Identidad
        </button>
        <button className={`admin-tab ${tab === 'intro' ? 'active' : ''}`} onClick={() => setTab('intro')}>
          <i className="fas fa-align-left"></i> Intro
        </button>
      </div>

      <div className="admin-tab-content">
        {tab === 'identidad' && (
          <div className="admin-card">
            <div className="admin-row">
              <AdminFormField label="Logo (texto)" value={data.logo} onChange={(v) => setData({ ...data, logo: v })} />
              <AdminFormField label="Tagline" value={data.tagline} onChange={(v) => setData({ ...data, tagline: v })} />
            </div>

            <h3 className="admin-card-title" style={{ marginTop: '24px' }}>Banner principal</h3>
            <div className="admin-row">
              <AdminFormField label="Título principal" value={heroData.title} onChange={(v) => setHeroData({ ...heroData, title: v })} />
              <AdminFormField label="Texto del botón CTA" value={heroData.ctaText} onChange={(v) => setHeroData({ ...heroData, ctaText: v })} />
            </div>
            <div className="admin-row">
              <AdminFormField label="Subtítulo" type="textarea" rows={5} value={heroData.subtitle} onChange={(v) => setHeroData({ ...heroData, subtitle: v })} />
              <ImageUploader label="Imagen de fondo Header" value={heroData.backgroundImage} onChange={(v) => setHeroData({ ...heroData, backgroundImage: v })} compact />
            </div>
          </div>
        )}

        {tab === 'intro' && (
          <div className="admin-card">
            <AdminFormField label="Título" value={introData.title} onChange={(v) => setIntroData({ ...introData, title: v })} />
            <AdminFormField label="Párrafo" type="textarea" rows={5} value={introData.paragraph} onChange={(v) => setIntroData({ ...introData, paragraph: v })} />
          </div>
        )}

      </div>

      {saveError && <div className="save-error"><i className="fas fa-exclamation-circle"></i> {saveError}</div>}
      <button className={`btn-save ${saved ? 'saved' : ''}`} onClick={handleSave}>
        {saved ? <><i className="fas fa-check"></i> Guardado</> : <><i className="fas fa-save"></i> Guardar cambios</>}
      </button>
    </div>
  );
}

export default AdminHeader;

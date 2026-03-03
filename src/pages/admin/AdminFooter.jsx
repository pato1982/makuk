import { useState } from 'react';
import { useContent } from '../../context/ContentContext';
import AdminFormField from '../../components/admin/AdminFormField';
import AdminCard from '../../components/admin/AdminCard';

function AdminFooter() {
  const { content, updateSection } = useContent();
  const [data, setData] = useState({ ...content.footer });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    updateSection('footer', data);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="admin-page">
      <h1 className="admin-page-title">Footer</h1>
      <p className="admin-page-subtitle">Pie de página y contacto</p>

      <AdminCard title="Identidad">
        <AdminFormField label="Logo" value={data.logo} onChange={(v) => setData({ ...data, logo: v })} />
        <AdminFormField label="Descripción" type="textarea" value={data.description} onChange={(v) => setData({ ...data, description: v })} />
      </AdminCard>

      <AdminCard title="Redes Sociales">
        <div className="admin-row">
          <AdminFormField label="URL Facebook" value={data.facebookUrl} onChange={(v) => setData({ ...data, facebookUrl: v })} />
          <AdminFormField label="URL Instagram" value={data.instagramUrl} onChange={(v) => setData({ ...data, instagramUrl: v })} />
        </div>
      </AdminCard>

      <AdminCard title="Contacto">
        <AdminFormField label="Email" type="email" value={data.email} onChange={(v) => setData({ ...data, email: v })} />
        <div className="admin-row admin-row-phone">
          <AdminFormField label={<>WhatsApp <span className="label-hint">(número)</span></>} value={data.whatsappNumber} onChange={(v) => setData({ ...data, whatsappNumber: v })} />
          <AdminFormField label="Teléfono" value={data.whatsappDisplay} onChange={(v) => setData({ ...data, whatsappDisplay: v })} />
        </div>
        <AdminFormField label="Dirección" value={data.address} onChange={(v) => setData({ ...data, address: v })} />
      </AdminCard>

      <AdminCard title="Legal">
        <AdminFormField label="Copyright" value={data.copyright} onChange={(v) => setData({ ...data, copyright: v })} />
        <div className="admin-field">
          <label>Créditos</label>
          <input type="text" value={data.credits} disabled style={{ opacity: 0.6, cursor: 'not-allowed' }} />
        </div>
      </AdminCard>

      <button className={`btn-save ${saved ? 'saved' : ''}`} onClick={handleSave}>
        {saved ? <><i className="fas fa-check"></i> Guardado</> : <><i className="fas fa-save"></i> Guardar cambios</>}
      </button>
    </div>
  );
}

export default AdminFooter;

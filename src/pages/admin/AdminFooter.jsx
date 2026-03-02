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
        <AdminFormField label="URL Facebook" value={data.facebookUrl} onChange={(v) => setData({ ...data, facebookUrl: v })} />
        <AdminFormField label="URL Instagram" value={data.instagramUrl} onChange={(v) => setData({ ...data, instagramUrl: v })} />
      </AdminCard>

      <AdminCard title="Contacto">
        <AdminFormField label="Email" type="email" value={data.email} onChange={(v) => setData({ ...data, email: v })} />
        <AdminFormField label="WhatsApp (número sin +)" value={data.whatsappNumber} onChange={(v) => setData({ ...data, whatsappNumber: v })} helpText="Solo números, ej: 34612345678" />
        <AdminFormField label="WhatsApp (display)" value={data.whatsappDisplay} onChange={(v) => setData({ ...data, whatsappDisplay: v })} helpText="Lo que ve el usuario, ej: +34 612 345 678" />
        <AdminFormField label="Dirección" value={data.address} onChange={(v) => setData({ ...data, address: v })} />
      </AdminCard>

      <AdminCard title="Legal">
        <AdminFormField label="Copyright" value={data.copyright} onChange={(v) => setData({ ...data, copyright: v })} />
        <AdminFormField label="Créditos" value={data.credits} onChange={(v) => setData({ ...data, credits: v })} />
      </AdminCard>

      <button className={`btn-save ${saved ? 'saved' : ''}`} onClick={handleSave}>
        {saved ? <><i className="fas fa-check"></i> Guardado</> : <><i className="fas fa-save"></i> Guardar cambios</>}
      </button>
    </div>
  );
}

export default AdminFooter;

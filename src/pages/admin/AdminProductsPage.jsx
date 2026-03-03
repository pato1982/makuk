import { useState } from 'react';
import { useContent } from '../../context/ContentContext';
import AdminFormField from '../../components/admin/AdminFormField';
import AdminCard from '../../components/admin/AdminCard';

function AdminProductsPage() {
  const { content, updateSection } = useContent();
  const [data, setData] = useState(JSON.parse(JSON.stringify(content.productsPage)));
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState('');

  const handleSave = async () => {
    setSaveError('');
    try {
      await updateSection('productsPage', data);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      setSaveError('Error al guardar. Intenta de nuevo.');
    }
  };

  const updateSortLabel = (key, value) => {
    setData({ ...data, sortLabels: { ...data.sortLabels, [key]: value } });
  };

  return (
    <div className="admin-page">
      <h1 className="admin-page-title">Página de Productos</h1>
      <p className="admin-page-subtitle">Configuración de la vista de productos</p>

      <AdminCard title="Textos principales">
        <AdminFormField label="Título de la página" value={data.title} onChange={(v) => setData({ ...data, title: v })} />
        <AdminFormField label="Subtítulo" value={data.subtitle} onChange={(v) => setData({ ...data, subtitle: v })} />
        <AdminFormField label="Texto filtro 'Todos'" value={data.filterAllText} onChange={(v) => setData({ ...data, filterAllText: v })} />
      </AdminCard>

      <AdminCard title="Labels de ordenamiento">
        {Object.entries(data.sortLabels).map(([key, value]) => (
          <AdminFormField key={key} label={key} value={value} onChange={(v) => updateSortLabel(key, v)} />
        ))}
      </AdminCard>

      {saveError && <div className="save-error"><i className="fas fa-exclamation-circle"></i> {saveError}</div>}
      <button className={`btn-save ${saved ? 'saved' : ''}`} onClick={handleSave}>
        {saved ? <><i className="fas fa-check"></i> Guardado</> : <><i className="fas fa-save"></i> Guardar cambios</>}
      </button>
    </div>
  );
}

export default AdminProductsPage;

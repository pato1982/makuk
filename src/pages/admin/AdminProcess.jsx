import { useState } from 'react';
import { useContent } from '../../context/ContentContext';
import AdminFormField from '../../components/admin/AdminFormField';
import AdminCard from '../../components/admin/AdminCard';
import IconPicker from '../../components/admin/IconPicker';

function AdminProcess() {
  const { content, updateSection } = useContent();
  const [data, setData] = useState(JSON.parse(JSON.stringify(content.process)));
  const [editIndex, setEditIndex] = useState(null);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    updateSection('process', data);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const updateStep = (index, field, value) => {
    const steps = [...data.steps];
    steps[index] = { ...steps[index], [field]: value };
    setData({ ...data, steps });
  };

  const addStep = () => {
    setData({
      ...data,
      steps: [...data.steps, { icon: 'fa-star', title: 'Nuevo Paso', description: 'Descripción del paso' }]
    });
    setEditIndex(data.steps.length);
  };

  const removeStep = (index) => {
    if (!window.confirm('¿Eliminar este paso?')) return;
    setData({ ...data, steps: data.steps.filter((_, i) => i !== index) });
    setEditIndex(null);
  };

  const moveStep = (index, direction) => {
    const steps = [...data.steps];
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= steps.length) return;
    [steps[index], steps[newIndex]] = [steps[newIndex], steps[index]];
    setData({ ...data, steps });
  };

  return (
    <div className="admin-page">
      <h1 className="admin-page-title">Proceso</h1>
      <p className="admin-page-subtitle">Sección "Nuestro Arte"</p>

      <AdminCard title="General">
        <AdminFormField label="Título de la sección" value={data.title} onChange={(v) => setData({ ...data, title: v })} />
      </AdminCard>

      <AdminCard title={`Pasos (${data.steps.length})`}>
        <div className="admin-items-list">
          {data.steps.map((step, i) => (
            <div key={i} className={`admin-list-item ${editIndex === i ? 'editing' : ''}`}>
              <div className="admin-list-item-header" onClick={() => setEditIndex(editIndex === i ? null : i)}>
                <div className="item-sort-btns">
                  <button type="button" onClick={(e) => { e.stopPropagation(); moveStep(i, -1); }} disabled={i === 0}><i className="fas fa-chevron-up"></i></button>
                  <button type="button" onClick={(e) => { e.stopPropagation(); moveStep(i, 1); }} disabled={i === data.steps.length - 1}><i className="fas fa-chevron-down"></i></button>
                </div>
                <i className={`fas ${step.icon} item-icon`}></i>
                <span className="item-name">{step.title}</span>
                <i className={`fas fa-chevron-${editIndex === i ? 'up' : 'down'} item-toggle`}></i>
              </div>
              {editIndex === i && (
                <div className="admin-list-item-body">
                  <IconPicker label="Icono" value={step.icon} onChange={(v) => updateStep(i, 'icon', v)} />
                  <AdminFormField label="Título" value={step.title} onChange={(v) => updateStep(i, 'title', v)} />
                  <AdminFormField label="Descripción" type="textarea" value={step.description} onChange={(v) => updateStep(i, 'description', v)} />
                  <button type="button" className="btn-delete-item" onClick={() => removeStep(i)}>
                    <i className="fas fa-trash"></i> Eliminar paso
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
        <button type="button" className="btn-add-item" onClick={addStep}>
          <i className="fas fa-plus"></i> Agregar paso
        </button>
      </AdminCard>

      <button className={`btn-save ${saved ? 'saved' : ''}`} onClick={handleSave}>
        {saved ? <><i className="fas fa-check"></i> Guardado</> : <><i className="fas fa-save"></i> Guardar cambios</>}
      </button>
    </div>
  );
}

export default AdminProcess;

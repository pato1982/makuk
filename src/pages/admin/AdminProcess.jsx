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
  const [saveError, setSaveError] = useState('');

  const handleSave = async () => {
    setSaveError('');
    try {
      await updateSection('process', data);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      setSaveError('Error al guardar. Intenta de nuevo.');
    }
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
        <div className="steps-horizontal">
          {data.steps.map((step, i) => (
            <div
              key={i}
              className={`step-card ${editIndex === i ? 'active' : ''}`}
              onClick={() => setEditIndex(editIndex === i ? null : i)}
            >
              <i className={`fas ${step.icon} step-card-icon`}></i>
              <span className="step-card-title">{step.title}</span>
              <i className={`fas fa-chevron-${editIndex === i ? 'up' : 'down'} step-card-toggle`}></i>
            </div>
          ))}
          <div className="step-card step-card-add" onClick={addStep}>
            <i className="fas fa-plus"></i>
          </div>
        </div>
        {editIndex !== null && data.steps[editIndex] && (
          <div className="step-edit-panel">
            <div className="step-edit-sort">
              <button type="button" onClick={() => { moveStep(editIndex, -1); setEditIndex(editIndex - 1); }} disabled={editIndex === 0}><i className="fas fa-chevron-left"></i></button>
              <button type="button" onClick={() => { moveStep(editIndex, 1); setEditIndex(editIndex + 1); }} disabled={editIndex === data.steps.length - 1}><i className="fas fa-chevron-right"></i></button>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ flex: '0 0 25%' }}>
                <AdminFormField label="Título" value={data.steps[editIndex].title} onChange={(v) => updateStep(editIndex, 'title', v)} />
              </div>
              <div style={{ flex: '1 1 35%' }}>
                <AdminFormField label="Descripción" type="textarea" value={data.steps[editIndex].description} onChange={(v) => updateStep(editIndex, 'description', v)} />
              </div>
              <div className="admin-field" style={{ flex: '0 0 220px' }}>
                <label>Icono</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px' }}>
                  {['fa-gem', 'fa-ring', 'fa-fire', 'fa-cut', 'fa-hammer', 'fa-paint-brush', 'fa-hands', 'fa-eye', 'fa-check', 'fa-gift'].map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      className={`icon-option ${data.steps[editIndex].icon === icon ? 'active' : ''}`}
                      onClick={() => updateStep(editIndex, 'icon', icon)}
                      title={icon}
                    >
                      <i className={`fas ${icon}`}></i>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <button type="button" className="btn-delete-item" onClick={() => removeStep(editIndex)}>
              <i className="fas fa-trash"></i> Eliminar paso
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

export default AdminProcess;

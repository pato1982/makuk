function SortableList({ items, onReorder, onDelete, onEdit, renderItem, addLabel = 'Agregar', onAdd }) {
  const moveUp = (index) => {
    if (index === 0) return;
    const newItems = [...items];
    [newItems[index - 1], newItems[index]] = [newItems[index], newItems[index - 1]];
    onReorder(newItems);
  };

  const moveDown = (index) => {
    if (index === items.length - 1) return;
    const newItems = [...items];
    [newItems[index], newItems[index + 1]] = [newItems[index + 1], newItems[index]];
    onReorder(newItems);
  };

  return (
    <div className="sortable-list">
      {items.map((item, index) => (
        <div key={index} className="sortable-item">
          <div className="sortable-controls">
            <button
              type="button"
              onClick={() => moveUp(index)}
              disabled={index === 0}
              className="btn-move"
              title="Mover arriba"
            >
              <i className="fas fa-chevron-up"></i>
            </button>
            <button
              type="button"
              onClick={() => moveDown(index)}
              disabled={index === items.length - 1}
              className="btn-move"
              title="Mover abajo"
            >
              <i className="fas fa-chevron-down"></i>
            </button>
          </div>
          <div className="sortable-content">
            {renderItem(item, index)}
          </div>
          <div className="sortable-actions">
            {onEdit && (
              <button type="button" onClick={() => onEdit(index)} className="btn-edit-item" title="Editar">
                <i className="fas fa-pencil-alt"></i>
              </button>
            )}
            {onDelete && (
              <button type="button" onClick={() => onDelete(index)} className="btn-delete-item" title="Eliminar">
                <i className="fas fa-trash"></i>
              </button>
            )}
          </div>
        </div>
      ))}
      {onAdd && (
        <button type="button" onClick={onAdd} className="btn-add-item">
          <i className="fas fa-plus"></i> {addLabel}
        </button>
      )}
    </div>
  );
}

export default SortableList;

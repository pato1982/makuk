function AdminCard({ title, children, collapsible = false, defaultOpen = true }) {
  const [open, setOpen] = typeof collapsible === 'boolean' && collapsible
    ? [defaultOpen, null]
    : [true, null];

  // Simple non-collapsible card
  return (
    <div className="admin-card">
      {title && <h3 className="admin-card-title">{title}</h3>}
      <div className="admin-card-body">
        {children}
      </div>
    </div>
  );
}

export default AdminCard;

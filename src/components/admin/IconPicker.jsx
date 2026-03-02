const commonIcons = [
  'fa-gem', 'fa-heart', 'fa-star', 'fa-fire', 'fa-hands', 'fa-crown',
  'fa-ring', 'fa-palette', 'fa-cut', 'fa-magic', 'fa-globe',
  'fa-award', 'fa-certificate', 'fa-gift', 'fa-bolt', 'fa-feather',
  'fa-leaf', 'fa-sun', 'fa-moon', 'fa-mountain', 'fa-water',
  'fa-eye', 'fa-check', 'fa-tools', 'fa-hammer', 'fa-paint-brush',
];

function IconPicker({ label, value, onChange }) {
  return (
    <div className="admin-field">
      <label>{label}</label>
      <div className="icon-picker">
        <div className="icon-current">
          <i className={`fas ${value}`}></i>
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="fa-gem"
          />
        </div>
        <div className="icon-grid">
          {commonIcons.map((icon) => (
            <button
              key={icon}
              type="button"
              className={`icon-option ${value === icon ? 'active' : ''}`}
              onClick={() => onChange(icon)}
              title={icon}
            >
              <i className={`fas ${icon}`}></i>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default IconPicker;

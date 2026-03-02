import { useRef, useState } from 'react';

function ImageUploader({ label, value, onChange, compact = false, noPreview = false }) {
  const fileRef = useRef(null);
  const [imgError, setImgError] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setImgError(false);
      onChange(ev.target.result);
    };
    reader.readAsDataURL(file);
  };

  const showPlaceholder = !value || imgError;

  if (compact) {
    return (
      <div className="admin-field">
        {label && <label>{label}</label>}
        <div
          className="image-upload-area"
          onClick={() => fileRef.current.click()}
        >
          {!showPlaceholder ? (
            <img src={value} alt="Preview" onError={() => setImgError(true)} />
          ) : (
            <div className="image-upload-placeholder">
              <span className="upload-text">Apreta y elige una imagen</span>
            </div>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="admin-field">
      <label>{label}</label>
      <div className="image-upload-row">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="URL de la imagen"
        />
        <button type="button" className="btn-upload" onClick={() => fileRef.current.click()}>
          <i className="fas fa-upload"></i>
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
      </div>
      {value && !noPreview && (
        <div className="image-preview">
          <img src={value} alt="Preview" onError={(e) => { e.target.style.display = 'none'; }} />
        </div>
      )}
    </div>
  );
}

export default ImageUploader;

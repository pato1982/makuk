import { useRef, useState } from 'react';
import { uploadImage } from '../../services/api';

function ImageUploader({ label, value, onChange, compact = false, noPreview = false }) {
  const fileRef = useRef(null);
  const [imgError, setImgError] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadError('');
    setUploading(true);
    try {
      const { url } = await uploadImage(file);
      setImgError(false);
      onChange(url);
    } catch (err) {
      setUploadError(err.message || 'Error al subir imagen');
    } finally {
      setUploading(false);
      // Limpiar input para permitir subir el mismo archivo otra vez
      e.target.value = '';
    }
  };

  const showPlaceholder = !value || imgError;

  if (compact) {
    return (
      <div className="admin-field">
        {label && <label>{label}</label>}
        <div
          className={`image-upload-area ${uploading ? 'uploading' : ''}`}
          onClick={() => !uploading && fileRef.current.click()}
        >
          {uploading ? (
            <div className="image-upload-placeholder">
              <i className="fas fa-spinner fa-spin" style={{ fontSize: '1.2rem', marginBottom: '4px' }}></i>
              <span className="upload-text">Subiendo...</span>
            </div>
          ) : !showPlaceholder ? (
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
        {uploadError && <span className="upload-error">{uploadError}</span>}
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
          disabled={uploading}
        />
        <button
          type="button"
          className="btn-upload"
          onClick={() => fileRef.current.click()}
          disabled={uploading}
        >
          {uploading
            ? <i className="fas fa-spinner fa-spin"></i>
            : <i className="fas fa-upload"></i>
          }
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
      </div>
      {uploadError && <span className="upload-error">{uploadError}</span>}
      {value && !noPreview && (
        <div className="image-preview">
          <img src={value} alt="Preview" onError={(e) => { e.target.style.display = 'none'; }} />
        </div>
      )}
    </div>
  );
}

export default ImageUploader;

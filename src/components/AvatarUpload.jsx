import React, { useRef, useState } from 'react';

const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_MB  = 2;

function AvatarUpload({ currentUrl, onUpload }) {
  const inputRef              = useRef();
  const [preview, setPreview] = useState(currentUrl || null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const handleClick = () => {
    if (!loading) inputRef.current.click();
  };

  const handleChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');

    if (!ALLOWED.includes(file.type)) {
      setError('Only JPG, PNG, WEBP, or GIF images are supported.');
      return;
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      setError(`Image must be under ${MAX_MB} MB.`);
      return;
    }

    // Optimistic local preview
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    setLoading(true);

    const { url, error: uploadErr } = await onUpload(file);

    setLoading(false);

    if (uploadErr) {
      setPreview(currentUrl || null);   // revert preview
      setError(uploadErr);
    } else if (url) {
      setPreview(url);
      URL.revokeObjectURL(objectUrl);
    }

    // Reset input so the same file can be re-selected after an error
    e.target.value = '';
  };

  return (
    <div className="avatar-upload-wrapper">
      <button
        type="button"
        className={`avatar-upload-btn ${loading ? 'uploading' : ''}`}
        onClick={handleClick}
        title="Click to change profile photo"
        aria-label="Upload profile photo"
      >
        {preview ? (
          <img
            src={preview}
            alt="Avatar"
            className="avatar-img"
            onError={() => setPreview(null)}
          />
        ) : (
          <span className="avatar-emoji">🎵</span>
        )}

        {loading ? (
          <div className="avatar-loading-overlay">
            <div className="avatar-spinner" />
          </div>
        ) : (
          <div className="avatar-edit-overlay">
            <span>📷</span>
          </div>
        )}
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        style={{ display: 'none' }}
        onChange={handleChange}
      />

      {error && <p className="avatar-error">{error}</p>}
    </div>
  );
}

export default AvatarUpload;

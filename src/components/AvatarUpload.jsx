import React, { useRef, useState, useEffect } from 'react';

const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_MB  = 5;

function AvatarUpload({ currentUrl, onUpload }) {
  const inputRef              = useRef();
  const [preview, setPreview] = useState(currentUrl || null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  // Sync preview when parent passes a new currentUrl (e.g. user data loads after sign-in)
  useEffect(() => {
    if (currentUrl && !loading) setPreview(currentUrl);
  }, [currentUrl, loading]);

  const handleClick = () => {
    if (!loading) inputRef.current.click();
  };

  const handleChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = ''; // reset immediately so same file can be re-picked after error

    setError('');

    if (!ALLOWED.includes(file.type)) {
      setError('Only JPG, PNG, WEBP, or GIF images are supported.');
      return;
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      setError(`Image must be under ${MAX_MB} MB.`);
      return;
    }

    // Optimistic local preview while uploading
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    setLoading(true);

    const { url, error: uploadErr } = await onUpload(file);

    setLoading(false);
    URL.revokeObjectURL(objectUrl);

    if (uploadErr) {
      setPreview(currentUrl || null); // revert to last saved avatar
      setError(uploadErr);
    } else if (url) {
      setPreview(url);
    }
  };

  return (
    <div className="avatar-upload-wrapper">
      <button
        type="button"
        className={`avatar-upload-btn ${loading ? 'uploading' : ''}`}
        onClick={handleClick}
        title="Click to change profile photo"
        aria-label="Upload profile photo"
        disabled={loading}
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
        disabled={loading}
      />

      {error && <p className="avatar-error">{error}</p>}
      {!error && !loading && (
        <p className="avatar-hint">Click to upload · JPG PNG WEBP · max {MAX_MB} MB</p>
      )}
    </div>
  );
}

export default AvatarUpload;

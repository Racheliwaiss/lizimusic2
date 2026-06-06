import React, { useState, useRef } from 'react';
import { useLanguage } from '../LanguageContext';

function UploadTrack({ onUpload, onClose }) {
  const { t } = useLanguage();
  const [title, setTitle] = useState('');
  const [genre, setGenre] = useState('');
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef();

  const handleFile = (f) => {
    if (!f) return;
    if (!f.type.startsWith('audio/')) {
      setError(t('upload.errorNotAudio'));
      return;
    }
    setError('');
    setFile(f);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) { setError(t('upload.errorNoTitle')); return; }
    if (!file)         { setError(t('upload.errorNoFile'));  return; }

    const url = URL.createObjectURL(file);
    onUpload({ id: Date.now(), title: title.trim(), genre: genre.trim(), url, fileName: file.name });
    onClose();
  };

  return (
    <div className="upload-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="upload-modal">
        <button className="upload-close-btn" onClick={onClose} aria-label="Close">✕</button>
        <h2>🎵 {t('upload.title')}</h2>

        <form onSubmit={handleSubmit} className="upload-form">
          <label>
            {t('upload.trackTitle')}
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t('upload.trackTitlePlaceholder')}
            />
          </label>

          <label>
            {t('upload.genre')}
            <input
              type="text"
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              placeholder={t('upload.genrePlaceholder')}
            />
          </label>

          <div
            className={`upload-dropzone ${dragging ? 'dragging' : ''} ${file ? 'has-file' : ''}`}
            onClick={() => fileRef.current.click()}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
          >
            <input
              ref={fileRef}
              type="file"
              accept="audio/*"
              style={{ display: 'none' }}
              onChange={(e) => handleFile(e.target.files[0])}
            />
            {file ? (
              <>
                <div className="upload-file-icon">🎵</div>
                <p className="upload-file-name">{file.name}</p>
                <p className="upload-file-size">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </>
            ) : (
              <>
                <div className="upload-drop-icon">🎧</div>
                <p>{t('upload.dropzone')}</p>
                <span className="upload-browse">{t('upload.browse')}</span>
              </>
            )}
          </div>

          {error && <p className="upload-error">{error}</p>}

          <div className="upload-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>{t('upload.cancel')}</button>
            <button type="submit" className="save-btn">{t('upload.submit')}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default UploadTrack;

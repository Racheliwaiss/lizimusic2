import React, { useState, useRef } from 'react';
import { useLanguage } from '../LanguageContext';

// Pass `initialData` to open in edit mode (no file required, title/genre pre-filled).
function UploadTrack({ onUpload, onClose, initialData }) {
  const { t } = useLanguage();
  const isEdit = Boolean(initialData);

  const [title, setTitle]     = useState(initialData?.title || '');
  const [genre, setGenre]     = useState(initialData?.genre || '');
  const [file, setFile]       = useState(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError]     = useState('');
  const fileRef = useRef();

  const handleFile = (f) => {
    if (!f) return;
    if (!f.type.startsWith('audio/')) { setError(t('upload.errorNotAudio')); return; }
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
    // In edit mode a new file is optional; in upload mode it's required.
    if (!isEdit && !file) { setError(t('upload.errorNoFile')); return; }

    if (isEdit) {
      // Pass back only updated metadata; file stays unchanged unless a new one was picked.
      onUpload({
        id:       initialData.id,
        title:    title.trim(),
        genre:    genre.trim(),
        url:      file ? URL.createObjectURL(file) : initialData.url,
        fileName: file ? file.name : initialData.fileName,
        _isEdit:  true,
      });
    } else {
      const url = URL.createObjectURL(file);
      onUpload({ id: Date.now(), title: title.trim(), genre: genre.trim(), url, fileName: file.name });
    }
    onClose();
  };

  return (
    <div className="upload-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="upload-modal">
        <button className="upload-close-btn" onClick={onClose} aria-label="Close">✕</button>
        <h2>🎵 {isEdit ? t('upload.editTitle') : t('upload.title')}</h2>

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
            ) : isEdit ? (
              <>
                <div className="upload-drop-icon">🎧</div>
                <p className="upload-file-name">{initialData.fileName || t('upload.currentFile')}</p>
                <span className="upload-browse">{t('upload.replaceFile')}</span>
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
            <button type="submit" className="save-btn">
              {isEdit ? t('upload.saveChanges') : t('upload.submit')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default UploadTrack;

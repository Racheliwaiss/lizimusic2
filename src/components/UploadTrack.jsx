import React, { useState, useRef } from 'react';
import { useLanguage } from '../LanguageContext';

const MAX_MB = 50;

// Props:
//   initialData  – pass to open in edit mode (title/genre pre-filled, file optional)
//   uploadFn     – async (file: File) => { url: string, error: string }
//                  Handles the actual Supabase Storage upload.
//   onUpload     – called with the final track object once everything succeeds
//   onClose      – close the modal
function UploadTrack({ onUpload, onClose, initialData, uploadFn }) {
  const { t } = useLanguage();
  const isEdit = Boolean(initialData);

  const [title, setTitle]     = useState(initialData?.title || '');
  const [genre, setGenre]     = useState(initialData?.genre || '');
  const [file, setFile]       = useState(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError]     = useState('');
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef();

  const handleFile = (f) => {
    if (!f) return;
    if (!f.type.startsWith('audio/')) { setError(t('upload.errorNotAudio')); return; }
    if (f.size > MAX_MB * 1024 * 1024) { setError(`File must be under ${MAX_MB} MB.`); return; }
    setError('');
    setFile(f);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) { setError(t('upload.errorNoTitle')); return; }
    if (!isEdit && !file) { setError(t('upload.errorNoFile')); return; }

    let fileUrl  = isEdit ? (initialData.url || '')  : '';
    let fileName = isEdit ? (initialData.fileName || '') : '';

    // Upload new file to Supabase Storage if one was selected
    if (file) {
      if (!uploadFn) {
        // No storage function provided — fall back to local object URL
        fileUrl  = URL.createObjectURL(file);
        fileName = file.name;
      } else {
        setUploading(true);
        setError('');
        const { url, error: uploadErr } = await uploadFn(file);
        setUploading(false);

        if (uploadErr) {
          setError(uploadErr);
          return;           // stay open so user can retry
        }
        fileUrl  = url;
        fileName = file.name;
      }
    }

    onUpload({
      id:       isEdit ? initialData.id : Date.now(),
      title:    title.trim(),
      genre:    genre.trim(),
      url:      fileUrl,
      fileName,
      _isEdit:  isEdit,
    });
    onClose();
  };

  return (
    <div className="upload-overlay" onClick={(e) => e.target === e.currentTarget && !uploading && onClose()}>
      <div className="upload-modal">
        <button className="upload-close-btn" onClick={onClose} disabled={uploading} aria-label="Close">✕</button>
        <h2>🎵 {isEdit ? t('upload.editTitle') : t('upload.title')}</h2>

        <form onSubmit={handleSubmit} className="upload-form">
          <label>
            {t('upload.trackTitle')}
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t('upload.trackTitlePlaceholder')}
              disabled={uploading}
            />
          </label>

          <label>
            {t('upload.genre')}
            <input
              type="text"
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              placeholder={t('upload.genrePlaceholder')}
              disabled={uploading}
            />
          </label>

          <div
            className={`upload-dropzone ${dragging ? 'dragging' : ''} ${file ? 'has-file' : ''} ${uploading ? 'uploading' : ''}`}
            onClick={() => !uploading && fileRef.current.click()}
            onDragOver={(e) => { e.preventDefault(); if (!uploading) setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={!uploading ? handleDrop : undefined}
          >
            <input
              ref={fileRef}
              type="file"
              accept="audio/*"
              style={{ display: 'none' }}
              onChange={(e) => handleFile(e.target.files[0])}
              disabled={uploading}
            />

            {uploading ? (
              <>
                <div className="upload-spinner" />
                <p className="upload-progress-text">Uploading to cloud…</p>
                {file && <p className="upload-file-size">{(file.size / 1024 / 1024).toFixed(2)} MB</p>}
              </>
            ) : file ? (
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
            <button type="button" className="cancel-btn" onClick={onClose} disabled={uploading}>
              {t('upload.cancel')}
            </button>
            <button type="submit" className="save-btn" disabled={uploading}>
              {uploading
                ? 'Uploading…'
                : isEdit
                  ? t('upload.saveChanges')
                  : t('upload.submit')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default UploadTrack;

import { useState, useRef } from 'react';

/**
 * AdminPhotoUpload — drag-drop photo management for a listing.
 *
 * Props:
 *   listingId     — ID of the listing to manage photos for
 *   initialPhotos — existing photos array from the listing (optional)
 *   token         — JWT auth token
 *   apiBase       — API base URL (optional, defaults to "")
 *   onPhotosChange — called with the updated photos array after any change
 */
export default function AdminPhotoUpload({ listingId, initialPhotos = [], token, apiBase = '', onPhotosChange }) {
  const [pendingFiles, setPendingFiles] = useState([]);
  const [photos, setPhotos] = useState(initialPhotos);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  function updatePending(id, patch) {
    setPendingFiles(prev => prev.map(f => f.id === id ? { ...f, ...patch } : f));
  }

  function addFiles(fileList) {
    const imageFiles = Array.from(fileList).filter(f => f.type.startsWith('image/'));
    if (!imageFiles.length) return;
    const newItems = imageFiles.map(file => ({
      id: crypto.randomUUID(),
      file,
      previewUrl: URL.createObjectURL(file),
      progress: 0,
      error: '',
    }));
    setPendingFiles(prev => [...prev, ...newItems]);
  }

  function handleDrop(e) {
    e.preventDefault();
    setIsDragOver(false);
    addFiles(e.dataTransfer.files);
  }

  function handleFileChange(e) {
    addFiles(e.target.files);
    e.target.value = '';
  }

  function removePending(id) {
    setPendingFiles(prev => {
      const item = prev.find(f => f.id === id);
      if (item) URL.revokeObjectURL(item.previewUrl);
      return prev.filter(f => f.id !== id);
    });
  }

  function clearPending() {
    pendingFiles.forEach(f => URL.revokeObjectURL(f.previewUrl));
    setPendingFiles([]);
  }

  function uploadFile(item, isFirst) {
    return new Promise((resolve, reject) => {
      const formData = new FormData();
      formData.append('photo', item.file);
      formData.append('isPrimary', (isFirst && photos.length === 0) ? 'true' : 'false');

      const xhr = new XMLHttpRequest();
      xhr.open('POST', `${apiBase}/api/admin/listings/${listingId}/photos`);
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          updatePending(item.id, { progress: Math.round((e.loaded / e.total) * 100) });
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try { resolve(JSON.parse(xhr.responseText)); }
          catch { reject(new Error('Invalid server response')); }
        } else {
          try {
            const data = JSON.parse(xhr.responseText);
            reject(new Error(data.error || `Upload failed (${xhr.status})`));
          } catch {
            reject(new Error(`Upload failed (${xhr.status})`));
          }
        }
      };

      xhr.onerror = () => reject(new Error('Network error'));
      xhr.send(formData);
    });
  }

  async function handleUpload() {
    if (!pendingFiles.length || uploading) return;
    setUploading(true);
    setError('');

    const successIds = new Set();
    const newPhotos = [];

    for (let i = 0; i < pendingFiles.length; i++) {
      const item = pendingFiles[i];
      updatePending(item.id, { progress: 0, error: '' });
      try {
        const photo = await uploadFile(item, i === 0);
        URL.revokeObjectURL(item.previewUrl);
        successIds.add(item.id);
        newPhotos.push(photo);
      } catch (err) {
        updatePending(item.id, { error: err.message });
      }
    }

    setPendingFiles(prev => prev.filter(f => !successIds.has(f.id)));

    const updated = [...photos, ...newPhotos];
    setPhotos(updated);
    onPhotosChange?.(updated);
    setUploading(false);
  }

  async function handleDelete(photoId) {
    setError('');
    try {
      const res = await fetch(`${apiBase}/api/admin/listings/${listingId}/photos/${photoId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Delete failed (${res.status})`);
      }
      const updated = photos.filter(p => p.id !== photoId);
      setPhotos(updated);
      onPhotosChange?.(updated);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleSetPrimary(photoId) {
    setError('');
    try {
      const res = await fetch(`${apiBase}/api/admin/listings/${listingId}/photos/${photoId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isPrimary: true }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Failed to set primary (${res.status})`);
      }
      const updated = photos.map(p => ({ ...p, isPrimary: p.id === photoId }));
      setPhotos(updated);
      onPhotosChange?.(updated);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">Photos</h2>

      {error && (
        <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700 border border-red-200">
          {error}
        </div>
      )}

      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={() => setIsDragOver(false)}
        onClick={() => fileInputRef.current?.click()}
        className={[
          'flex flex-col items-center justify-center rounded-lg border-2 border-dashed px-6 py-10 cursor-pointer transition-colors',
          isDragOver
            ? 'border-indigo-500 bg-indigo-50'
            : 'border-gray-300 bg-white hover:border-indigo-400 hover:bg-gray-50',
        ].join(' ')}
      >
        <svg className="mx-auto h-10 w-10 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
          <path
            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <p className="mt-2 text-sm text-gray-600">
          <span className="font-medium text-indigo-600">Click to upload</span> or drag and drop
        </p>
        <p className="mt-1 text-xs text-gray-400">PNG, JPG, WebP — multiple files supported</p>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {/* Pending files preview */}
      {pendingFiles.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-700">
            Ready to upload ({pendingFiles.length})
          </h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {pendingFiles.map(item => (
              <div
                key={item.id}
                className="relative overflow-hidden rounded-lg border border-gray-200 bg-gray-50"
              >
                <img
                  src={item.previewUrl}
                  alt="Preview"
                  className="h-28 w-full object-cover"
                />
                {item.progress > 0 && item.progress < 100 && (
                  <div className="absolute inset-x-0 bottom-0 bg-black/60 px-2 py-1.5">
                    <div className="h-1.5 overflow-hidden rounded-full bg-gray-500">
                      <div
                        className="h-full rounded-full bg-indigo-400 transition-all duration-150"
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>
                    <p className="mt-0.5 text-center text-xs text-white">{item.progress}%</p>
                  </div>
                )}
                {item.error && (
                  <div className="absolute inset-x-0 bottom-0 bg-red-600/90 px-2 py-1">
                    <p className="truncate text-center text-xs text-white" title={item.error}>
                      {item.error}
                    </p>
                  </div>
                )}
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); removePending(item.id); }}
                  disabled={uploading}
                  className="absolute right-1 top-1 rounded-full bg-black/50 p-0.5 text-white hover:bg-black/70 disabled:opacity-50"
                  aria-label="Remove"
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={clearPending}
              disabled={uploading}
              className="rounded-md px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50"
            >
              Clear all
            </button>
            <button
              type="button"
              onClick={handleUpload}
              disabled={uploading}
              className="rounded-md bg-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50"
            >
              {uploading
                ? 'Uploading…'
                : `Upload ${pendingFiles.length} photo${pendingFiles.length !== 1 ? 's' : ''}`}
            </button>
          </div>
        </div>
      )}

      {/* Uploaded photos */}
      {photos.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-700">Photos ({photos.length})</h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {photos.map(photo => (
              <div
                key={photo.id}
                className={[
                  'relative overflow-hidden rounded-lg border-2 transition-colors',
                  photo.isPrimary ? 'border-indigo-500' : 'border-gray-200',
                ].join(' ')}
              >
                <img
                  src={photo.url}
                  alt="Listing photo"
                  className="h-28 w-full object-cover"
                />
                {photo.isPrimary && (
                  <div className="absolute left-1 top-1 rounded bg-indigo-600 px-1.5 py-0.5 text-xs font-semibold text-white shadow">
                    Primary
                  </div>
                )}
                <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-black/60 px-2 py-1.5">
                  <label className="flex cursor-pointer items-center gap-1 text-xs text-white select-none">
                    <input
                      type="radio"
                      name={`primary-photo-${listingId}`}
                      checked={!!photo.isPrimary}
                      onChange={() => handleSetPrimary(photo.id)}
                      className="h-3 w-3 accent-indigo-400"
                    />
                    Primary
                  </label>
                  <button
                    type="button"
                    onClick={() => handleDelete(photo.id)}
                    className="rounded p-0.5 text-white transition-colors hover:text-red-400"
                    aria-label="Delete photo"
                  >
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {photos.length === 0 && pendingFiles.length === 0 && (
        <p className="text-center text-sm text-gray-400">No photos yet — add some above.</p>
      )}
    </div>
  );
}

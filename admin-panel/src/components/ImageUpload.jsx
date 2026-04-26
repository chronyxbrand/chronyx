import React, { useState } from 'react';
import { UploadSimple, X, Spinner } from '@phosphor-icons/react';

const ImageUpload = ({ images = [], onImagesChange }) => {
  const [isUploading, setIsUploading] = useState(false);

  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  const handleUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', uploadPreset);

        const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) throw new Error('Failed to upload image');
        const data = await response.json();
        return data.secure_url;
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      onImagesChange([...images, ...uploadedUrls]);
    } catch (error) {
      console.error('Upload Error:', error);
      alert('Failed to upload image. Please check your Cloudinary settings.');
    } finally {
      setIsUploading(false);
      // Reset input so the same file can be selected again if needed
      e.target.value = '';
    }
  };

  const removeImage = (indexToRemove) => {
    onImagesChange(images.filter((_, index) => index !== indexToRemove));
  };

  return (
    <div style={{ marginBottom: '24px' }}>
      <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Product Images</label>
      
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginBottom: '16px' }}>
        {images.map((url, index) => (
          <div key={index} style={{ position: 'relative', width: '120px', height: '120px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
            <img src={url} alt={`Product ${index}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <button 
              type="button"
              onClick={() => removeImage(index)}
              style={{ position: 'absolute', top: '4px', right: '4px', background: 'rgba(0,0,0,0.7)', color: 'white', border: 'none', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <X size={14} />
            </button>
            {index === 0 && (
              <span style={{ position: 'absolute', bottom: '0', left: '0', right: '0', background: 'var(--accent-color)', color: 'var(--accent-text)', fontSize: '0.7rem', textAlign: 'center', padding: '2px 0', fontWeight: 'bold' }}>HERO</span>
            )}
          </div>
        ))}

        <label style={{ width: '120px', height: '120px', borderRadius: '8px', border: '2px dashed var(--border-color)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: 'var(--bg-surface)', transition: 'border-color 0.2s' }}>
          {isUploading ? (
            <Spinner size={24} className="spin" />
          ) : (
            <>
              <UploadSimple size={24} color="var(--text-secondary)" style={{ marginBottom: '8px' }} />
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Upload</span>
            </>
          )}
          <input 
            type="file" 
            multiple 
            accept="image/*" 
            onChange={handleUpload} 
            disabled={isUploading}
            style={{ display: 'none' }} 
          />
        </label>
      </div>
      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>The first image will be used as the primary hero image. Drag and drop to reorder (coming soon).</p>
      
      <style dangerouslySetInnerHTML={{__html: `
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}} />
    </div>
  );
};

export default ImageUpload;

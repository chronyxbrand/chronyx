import { useState } from 'react';
import { ArrowLeft, ArrowRight, CrownSimple, Spinner, UploadSimple, X } from '@phosphor-icons/react';

const ImageUpload = ({ images = [], onImagesChange }) => {
  const [isUploading, setIsUploading] = useState(false);

  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  const handleUpload = async (event) => {
    const files = event.target.files;
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
      event.target.value = '';
    }
  };

  const removeImage = (indexToRemove) => {
    onImagesChange(images.filter((_, index) => index !== indexToRemove));
  };

  const moveImage = (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= images.length) return;

    const nextImages = [...images];
    [nextImages[index], nextImages[targetIndex]] = [nextImages[targetIndex], nextImages[index]];
    onImagesChange(nextImages);
  };

  const setHeroImage = (index) => {
    if (index === 0) return;
    const nextImages = [...images];
    const [heroImage] = nextImages.splice(index, 1);
    nextImages.unshift(heroImage);
    onImagesChange(nextImages);
  };

  return (
    <div className="image-uploader">
      <div className="image-uploader-stage">
        {images[0] ? (
          <img src={images[0]} alt="Hero preview" className="image-uploader-hero" />
        ) : (
          <div className="image-uploader-empty">
            <UploadSimple size={24} />
            <strong>No hero image yet</strong>
            <p>Upload product images to preview the gallery and choose the storefront hero frame.</p>
          </div>
        )}
      </div>

      <div className="image-uploader-toolbar">
        <div>
          <strong>{images.length} image{images.length === 1 ? '' : 's'}</strong>
          <p>The first image becomes the product hero on the storefront.</p>
        </div>
        <label className="image-upload-trigger">
          {isUploading ? (
            <>
              <Spinner size={18} className="spin" />
              Uploading...
            </>
          ) : (
            <>
              <UploadSimple size={18} />
              Upload Images
            </>
          )}
          <input type="file" multiple accept="image/*" onChange={handleUpload} disabled={isUploading} />
        </label>
      </div>

      {images.length > 0 ? (
        <div className="image-thumb-grid">
          {images.map((url, index) => (
            <div key={`${url}-${index}`} className={`image-thumb-card ${index === 0 ? 'is-hero' : ''}`}>
              <div className="image-thumb-media">
                <img src={url} alt={`Product ${index + 1}`} />
                {index === 0 ? (
                  <span className="image-thumb-badge">
                    <CrownSimple size={12} weight="fill" />
                    Hero
                  </span>
                ) : null}
              </div>

              <div className="image-thumb-actions">
                <button type="button" className="btn-secondary" onClick={() => moveImage(index, -1)} disabled={index === 0}>
                  <ArrowLeft size={14} />
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => moveImage(index, 1)}
                  disabled={index === images.length - 1}
                >
                  <ArrowRight size={14} />
                </button>
                <button type="button" className="btn-secondary" onClick={() => setHeroImage(index)} disabled={index === 0}>
                  Make Hero
                </button>
                <button type="button" className="btn-secondary image-remove-btn" onClick={() => removeImage(index)}>
                  <X size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : null}

      <style
        dangerouslySetInnerHTML={{
          __html: `
            .spin { animation: spin 1s linear infinite; }
            @keyframes spin { 100% { transform: rotate(360deg); } }
          `,
        }}
      />
    </div>
  );
};

export default ImageUpload;

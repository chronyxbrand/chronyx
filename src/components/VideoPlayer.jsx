import { useEffect, useMemo, useRef, useState } from 'react';

function trackVideoEvent(action, detail = {}) {
  if (typeof window === 'undefined') return;

  const payload = {
    event_category: 'video',
    event_label: detail.title || detail.productId || 'chronyx-video',
    value: detail.durationSeconds || 0,
    ...detail,
  };

  if (typeof window.gtag === 'function') {
    window.gtag('event', action, payload);
  }
}

export default function VideoPlayer({ productId, video }) {
  const frameRef = useRef(null);
  const videoRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [hasTrackedImpression, setHasTrackedImpression] = useState(false);

  useEffect(() => {
    if (!frameRef.current || isVisible) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px 0px' },
    );

    observer.observe(frameRef.current);
    return () => observer.disconnect();
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible || hasTrackedImpression || !video) return;

    trackVideoEvent('video_impression', {
      productId,
      title: video.title,
      durationSeconds: video.durationSeconds || 0,
    });
    setHasTrackedImpression(true);
  }, [hasTrackedImpression, isVisible, productId, video]);

  const sourceType = useMemo(() => {
    if (video?.contentUrl) {
      if (video.contentUrl.endsWith('.webm')) return 'video/webm';
      if (video.contentUrl.endsWith('.ogg')) return 'video/ogg';
      return 'video/mp4';
    }
    return null;
  }, [video]);

  const captionTrackUrl = useMemo(() => {
    if (!video?.captionUrl) return null;
    return video.captionUrl.toLowerCase().endsWith('.vtt') ? video.captionUrl : null;
  }, [video]);

  if (!video) return null;

  return (
    <div className="video-player-shell">
      <div className="video-frame" ref={frameRef}>
        {!isVisible ? (
          <button
            type="button"
            className="video-placeholder"
            onClick={() => setIsVisible(true)}
            aria-label={`Load video for ${video.title}`}
          >
            <img src={video.thumbnailUrl} alt={video.title} loading="lazy" />
            <span className="video-placeholder-badge">Play video</span>
          </button>
        ) : video.contentUrl ? (
          <video
            ref={videoRef}
            className="product-video-player"
            controls
            playsInline
            preload="metadata"
            poster={video.thumbnailUrl}
            onPlay={() =>
              trackVideoEvent('video_play', {
                productId,
                title: video.title,
                durationSeconds: video.durationSeconds || 0,
              })
            }
            onPause={() =>
              trackVideoEvent('video_pause', {
                productId,
                title: video.title,
                currentTime: Math.round(videoRef.current?.currentTime || 0),
              })
            }
            onEnded={() =>
              trackVideoEvent('video_complete', {
                productId,
                title: video.title,
                durationSeconds: video.durationSeconds || 0,
              })
            }
          >
            <source src={video.contentUrl} type={sourceType || undefined} />
            {captionTrackUrl ? (
              <track kind="captions" srcLang="en" label="English" src={captionTrackUrl} default />
            ) : null}
          </video>
        ) : (
          <iframe
            src={video.embedUrl}
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
            loading="lazy"
            title={video.title}
            onLoad={() =>
              trackVideoEvent('video_embed_loaded', {
                productId,
                title: video.title,
              })
            }
          />
        )}
      </div>

      {video.captionUrl || video.transcript ? (
        <div className="video-supporting-copy">
          {video.captionUrl ? (
            <a href={video.captionUrl} target="_blank" rel="noopener noreferrer" className="video-caption-link">
              Download subtitles
            </a>
          ) : null}
          {video.transcript ? <p>{video.transcript}</p> : null}
        </div>
      ) : null}
    </div>
  );
}

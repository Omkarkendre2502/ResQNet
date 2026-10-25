import React, { useState } from 'react';

/**
 * SafeImage Component
 * - Renders modern picture element with .webp preferred and .jpg fallback
 * - Handles image loading errors gracefully by showing a neutral placeholder block
 * - Uses aspect-ratio reservation to eliminate Cumulative Layout Shift (CLS)
 * - Supports loading="lazy" (or "eager" for above-the-fold hero image)
 */
export const SafeImage = ({
  srcWebp,
  srcJpg,
  alt,
  width,
  height,
  aspectRatio = '4 / 3',
  className = '',
  loading = 'lazy',
  priority = false
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div
      className={`resq-img-wrap ${className}`}
      style={{ aspectRatio }}
    >
      {!hasError ? (
        <picture>
          {srcWebp && <source srcSet={srcWebp} type="image/webp" />}
          <img
            src={srcJpg || srcWebp}
            alt={alt}
            width={width}
            height={height}
            loading={priority ? 'eager' : loading}
            decoding={priority ? 'sync' : 'async'}
            onError={() => setHasError(true)}
            onLoad={() => setIsLoaded(true)}
            style={{
              opacity: isLoaded || priority ? 1 : 0.8,
              transition: 'opacity 0.25s ease'
            }}
          />
        </picture>
      ) : (
        <div className="resq-img-placeholder" role="img" aria-label={alt}>
          <span className="text-muted small fw-medium">{alt || 'Emergency Service Asset'}</span>
        </div>
      )}
    </div>
  );
};

export default SafeImage;

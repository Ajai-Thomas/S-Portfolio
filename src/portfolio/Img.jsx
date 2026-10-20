import { placeholder } from './util';

// Lazy, layout-stable image. Falls back to a labelled placeholder when src is null.
export default function Img({ photo, seed = 1, w = 1200, h = 800, sizes, className = '', eager = false }) {
  const isPh = !photo?.src;
  const width = photo?.w || w;
  const height = photo?.h || h;
  return (
    <img
      className={className}
      src={isPh ? placeholder(seed, 'PLACEHOLDER', width, height) : photo.src}
      srcSet={isPh ? undefined : photo.srcset}
      sizes={isPh ? undefined : photo.sizes || sizes}
      alt={photo?.alt || ''}
      width={width}
      height={height}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      draggable="false"
      data-cursor="view"
    />
  );
}

// Helpers for the single-image field (see ImagePicker.jsx).
import { imageSrc, prepareImage, uploadImage } from './api';

export const emptyPic = { kind: 'none', src: '' };

export function picFromDoc(imageUrlUploaded, imageLink) {
  if (imageUrlUploaded) return { kind: 'existing', src: imageSrc(imageUrlUploaded, 800) };
  if (imageLink) return { kind: 'url', src: imageSrc(imageLink, 800), url: imageLink };
  return emptyPic;
}

/** Uploads if needed and returns the fields to set/unset on the document. */
export async function resolvePic(pic, imageField, urlField, onStatus) {
  if (pic.kind === 'existing') return { set: {}, unset: [] };
  if (pic.kind === 'none') return { set: {}, unset: [imageField, urlField] };
  if (pic.kind === 'url') return { set: { [urlField]: pic.url }, unset: [imageField] };
  onStatus?.('Uploading image…');
  const blob = await prepareImage(pic.file);
  const asset = await uploadImage(blob, pic.file.name.replace(/\.\w+$/, '') + (blob.type === 'image/jpeg' ? '.jpg' : ''));
  return { set: { [imageField]: { _type: 'image', asset: { _type: 'reference', _ref: asset._id } } }, unset: [urlField] };
}

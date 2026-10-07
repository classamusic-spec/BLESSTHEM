import { del, get, set } from 'idb-keyval';
import { newId } from '@/lib/id';

/**
 * Journal photos live only on this device, in IndexedDB, resized to keep storage light.
 * They are never uploaded or shared automatically.
 */

const MAX_EDGE = 1600;

async function resize(file: Blob): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();
  return new Promise((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('encode'))), 'image/jpeg', 0.84));
}

export async function savePhoto(file: Blob): Promise<string> {
  const id = newId('img');
  const blob = await resize(file).catch(() => file);
  await set(`photo:${id}`, blob);
  return id;
}

const urls = new Map<string, string>();

export async function photoURL(id: string): Promise<string | null> {
  if (urls.has(id)) return urls.get(id)!;
  const blob = (await get(`photo:${id}`)) as Blob | undefined;
  if (!blob) return null;
  const url = URL.createObjectURL(blob);
  urls.set(id, url);
  return url;
}

export async function deletePhoto(id: string): Promise<void> {
  await del(`photo:${id}`);
  const url = urls.get(id);
  if (url) URL.revokeObjectURL(url);
  urls.delete(id);
}

export async function photoBlob(id: string): Promise<Blob | null> {
  return ((await get(`photo:${id}`)) as Blob | undefined) ?? null;
}

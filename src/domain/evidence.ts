import type { Evidence } from './types';

export const MAX_EVIDENCE_BYTES = 5 * 1024 * 1024;

function uid(): string { return globalThis.crypto?.randomUUID?.() ?? `ev-${Date.now()}-${Math.random().toString(16).slice(2)}`; }

export async function hashBytes(bytes: Uint8Array): Promise<string> {
  const digest = await globalThis.crypto.subtle.digest('SHA-256', bytes as BufferSource);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

function readFile(file: File): Promise<ArrayBuffer> {
  if (typeof file.arrayBuffer === 'function') return file.arrayBuffer();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('The evidence file could not be read.'));
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.readAsArrayBuffer(file);
  });
}

function toDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('The evidence file could not be embedded.'));
    reader.onload = () => resolve(String(reader.result));
    reader.readAsDataURL(file);
  });
}

export async function fileToEvidence(file: File): Promise<Evidence> {
  if (file.size > MAX_EVIDENCE_BYTES) throw new Error('Evidence files must be 5 MB or smaller.');
  const buffer = await readFile(file);
  return { id: uid(), name: file.name, type: file.type || 'application/octet-stream', size: file.size, sha256: await hashBytes(new Uint8Array(buffer)), dataUrl: await toDataUrl(file), attachedAt: new Date().toISOString(), integrity: 'computed' };
}

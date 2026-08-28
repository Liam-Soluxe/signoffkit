import { describe, expect, it } from 'vitest';
import { fileToEvidence, hashBytes } from './evidence';

describe('local evidence', () => {
  it('calculates a browser SHA-256 digest from exact bytes', async () => {
    const bytes = new TextEncoder().encode('hello');
    expect(await hashBytes(bytes)).toBe('2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824');
  });

  it('embeds a file with its metadata and digest', async () => {
    const file = new File(['hello'], 'proof.txt', { type: 'text/plain', lastModified: 0 });
    const evidence = await fileToEvidence(file);
    expect(evidence).toMatchObject({ name: 'proof.txt', type: 'text/plain', size: 5, sha256: '2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824' });
    expect(evidence.dataUrl).toBe('data:text/plain;base64,aGVsbG8=');
  });

  it('rejects evidence larger than the browser-safe limit', async () => {
    const file = new File([new Uint8Array(5 * 1024 * 1024 + 1)], 'too-large.bin');
    await expect(fileToEvidence(file)).rejects.toThrow('5 MB');
  });
});

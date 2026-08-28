import { describe, expect, it } from 'vitest';
import { createPack } from './pack';
import { canRoundTrip, exportPack, importPack, validatePack } from './serialise';

describe('validation and versioned JSON', () => {
  it('reports required metadata and invalid checks', () => {
    const pack = createPack('website');
    pack.checks[0].title = '';
    expect(validatePack(pack)).toEqual(expect.arrayContaining(['Project name is required.', 'Client label is required.', 'Reviewer is required.', 'Check 1 needs a title.']));
  });

  it('round-trips a valid versioned pack', () => {
    const pack = { ...createPack('campaign'), projectName: 'Autumn campaign', clientLabel: 'Example Co', reviewer: 'A Reviewer' };
    expect(importPack(exportPack(pack))).toEqual(pack);
  });

  it('rejects malformed, unknown and future-version files', () => {
    expect(() => importPack('not json')).toThrow('not valid JSON');
    expect(() => importPack('{"format":"other"}')).toThrow('not a SignoffKit pack');
    expect(() => importPack('{"format":"signoffkit-pack","schemaVersion":99}')).toThrow('newer version');
  });

  it('rejects oversized packs and malformed evidence objects', () => {
    expect(() => importPack(' '.repeat(10 * 1024 * 1024 + 1))).toThrow('too large');
    const pack = createPack('website');
    pack.checks[0].evidence = [{} as never];
    expect(() => importPack(JSON.stringify(pack))).toThrow('incomplete or invalid');
  });

  it('rejects values outside the committed schema', () => {
    const extra = { ...createPack('website'), unexpected: true };
    expect(() => importPack(JSON.stringify(extra))).toThrow('incomplete or invalid');

    const empty = { ...createPack('website'), checks: [] };
    expect(() => importPack(JSON.stringify(empty))).toThrow('incomplete or invalid');

    const badDate = { ...createPack('website'), createdAt: 'yesterday' };
    expect(() => importPack(JSON.stringify(badDate))).toThrow('incomplete or invalid');

    const oversized = createPack('website');
    oversized.checks[0].evidence = [{
      id: 'e1', name: 'proof.txt', type: 'text/plain', size: 5 * 1024 * 1024 + 1,
      sha256: 'a'.repeat(64), dataUrl: 'data:text/plain;base64,aA==',
      attachedAt: '2026-08-29T00:00:00.000Z', integrity: 'computed',
    }];
    expect(() => importPack(JSON.stringify(oversized))).toThrow('incomplete or invalid');
  });

  it('marks imported evidence digests as unverified instead of trusting JSON claims', () => {
    const pack = createPack('website');
    pack.checks[0].evidence = [{
      id: 'e1', name: 'proof.txt', type: 'text/plain', size: 5,
      sha256: 'a'.repeat(64), dataUrl: 'data:text/plain;base64,aGVsbG8=',
      attachedAt: '2026-08-29T00:00:00.000Z', integrity: 'computed',
    }];
    expect(importPack(JSON.stringify(pack)).checks[0].evidence[0].integrity).toBe('unverified');
  });

  it('detects packs whose embedded evidence would exceed the import limit', () => {
    const pack = createPack('website');
    pack.checks[0].evidence = [{
      id: 'e1', name: 'proof.bin', type: 'application/octet-stream', size: 4 * 1024 * 1024,
      sha256: 'a'.repeat(64), dataUrl: `data:application/octet-stream;base64,${'a'.repeat(11 * 1024 * 1024)}`,
      attachedAt: '2026-08-29T00:00:00.000Z', integrity: 'computed',
    }];
    expect(canRoundTrip(pack)).toBe(false);
  });

  it('measures the UTF-8 bytes used by the imported file', () => {
    const pack = { ...createPack('website'), projectName: '😀'.repeat(3 * 1024 * 1024) };
    expect(canRoundTrip(pack)).toBe(false);
    expect(() => importPack(exportPack(pack))).toThrow('too large');
  });
});

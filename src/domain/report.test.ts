import { describe, expect, it } from 'vitest';
import { createPack, updateCheck } from './pack';
import { generateHtmlReport } from './report';

describe('self-contained HTML report', () => {
  it('escapes all user text and embeds evidence without active scripts', () => {
    let pack = { ...createPack('website'), projectName: '<script>alert(1)</script>', clientLabel: 'A & B', reviewer: 'Sam "Review"' };
    pack = updateCheck(pack, pack.checks[0].id, { title: '<img src=x onerror=alert(1)>', notes: '</style><script>bad()</script>', status: 'flag', evidence: [{ id: 'e1', name: 'shot<img>.png', type: 'image/png', size: 4, sha256: 'abcd', dataUrl: 'data:image/png;base64,iVBORw0KGgo=', attachedAt: '2026-08-28T00:00:00.000Z', integrity: 'computed' }] });
    const html = generateHtmlReport(pack);
    expect(html).toContain('&lt;script&gt;alert(1)&lt;/script&gt;');
    expect(html).toContain('data:image/png;base64,iVBORw0KGgo=');
    expect(html).toContain('SHA-256');
    expect(html).toContain('computed locally');
    expect(html).toContain('Content-Security-Policy');
    expect(html).not.toContain('<script');
    expect(html).not.toContain('onerror=');
  });
});

import { scorePack } from './pack';
import type { Evidence, SignoffPack } from './types';

export function escapeHtml(value: string): string {
  return value.replace(/[&<>"'=]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;', '=': '&#61;' })[character]!);
}

const safeDataUrl = (evidence: Evidence) => /^data:(image\/(png|jpeg|gif|webp)|application\/pdf|text\/plain);base64,[a-zA-Z0-9+/=]+$/.test(evidence.dataUrl) ? evidence.dataUrl : '';

export function generateHtmlReport(pack: SignoffPack): string {
  const score = scorePack(pack);
  const checks = pack.checks.map((check, index) => {
    const evidence = check.evidence.map((item) => {
      const url = safeDataUrl(item);
      const preview = url.startsWith('data:image/') ? `<img src="${url}" alt="Evidence preview: ${escapeHtml(item.name)}">` : '';
      const download = url ? `<a href="${url}" download="${escapeHtml(item.name)}">Open embedded file</a>` : '<span>Preview unavailable</span>';
      const integrity = item.integrity === 'computed' ? 'computed locally' : 'declared value, not verified after import';
      return `<div class="evidence">${preview}<div><strong>${escapeHtml(item.name)}</strong> · ${item.size.toLocaleString('en-GB')} bytes<br><code>SHA-256 ${escapeHtml(item.sha256)} · ${integrity}</code><br>${download}</div></div>`;
    }).join('');
    return `<article class="check ${check.status}"><header><span>${index + 1}</span><h2>${escapeHtml(check.title)}</h2><b>${escapeHtml(check.status === 'na' ? 'Not applicable' : check.status)}</b></header><p>${escapeHtml(check.description)}</p>${check.notes ? `<blockquote>${escapeHtml(check.notes)}</blockquote>` : ''}${evidence}</article>`;
  }).join('');
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src data:; style-src 'unsafe-inline'"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(pack.projectName)} · SignoffKit evidence pack</title><style>
:root{color-scheme:light;--ink:#17201d;--muted:#5b6661;--line:#d8dedb;--accent:#19755b}*{box-sizing:border-box}body{font:15px/1.55 system-ui,sans-serif;color:var(--ink);max-width:980px;margin:0 auto;padding:48px 28px;background:#f7f9f8}main>header{border-bottom:2px solid var(--ink);padding-bottom:24px}h1{font-size:34px;margin:6px 0}.eyebrow{text-transform:uppercase;letter-spacing:.12em;color:var(--accent);font-size:12px;font-weight:700}.meta,.summary{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:12px;margin:24px 0}.tile,.check{background:white;border:1px solid var(--line);padding:16px}.tile strong{display:block;font-size:24px}.check{margin:12px 0;break-inside:avoid}.check header{display:grid;grid-template-columns:28px 1fr auto;align-items:center;gap:10px}.check h2{font-size:17px;margin:0}.check header>b{text-transform:uppercase;font-size:11px;letter-spacing:.08em}.flag{border-left:4px solid #b84a3a}.pass{border-left:4px solid var(--accent)}.na{opacity:.7}blockquote{margin:12px 0;padding:10px 14px;border-left:2px solid var(--line);white-space:pre-wrap}.evidence{display:flex;gap:16px;padding-top:12px;margin-top:12px;border-top:1px solid var(--line);overflow-wrap:anywhere}.evidence img{width:160px;height:110px;object-fit:contain;background:#eee}code{font-size:11px}footer{margin-top:32px;color:var(--muted);font-size:12px}@media print{body{padding:0;background:#fff}.check,.tile{box-shadow:none}a{color:inherit;text-decoration:none}}@media(max-width:600px){body{padding:24px 14px}.check header{grid-template-columns:24px 1fr}.check header>b{grid-column:2}.evidence{display:block}.evidence img{width:100%;height:auto;max-height:260px}}
</style></head><body><main><header><div class="eyebrow">SignoffKit evidence pack</div><h1>${escapeHtml(pack.projectName)}</h1><p>${escapeHtml(pack.clientLabel)} · Version ${escapeHtml(pack.version)}</p><div class="meta"><div><small>Reviewer</small><br><strong>${escapeHtml(pack.reviewer)}</strong></div><div><small>Review date</small><br><strong>${escapeHtml(pack.reviewDate)}</strong></div><div><small>Pack ID</small><br><code>${escapeHtml(pack.id)}</code></div></div></header><section class="summary"><div class="tile"><strong>${score.readiness}%</strong>readiness</div><div class="tile"><strong>${score.completed}/${score.total}</strong>completed</div><div class="tile"><strong>${score.blockers}</strong>flagged blocker${score.blockers === 1 ? '' : 's'}</div></section><section>${checks}</section><footer>Generated locally with SignoffKit. Locally computed SHA-256 values help compare file bytes. Imported values are labelled unverified. This report is not an electronic signature, legal approval or cryptographic timestamp.</footer></main></body></html>`;
}

import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { fileToEvidence } from './domain/evidence';
import { addCheck, createPack, moveCheck, removeCheck, scorePack, templates, updateCheck } from './domain/pack';
import { generateHtmlReport } from './domain/report';
import { canRoundTrip, exportPack, importPack, validatePack } from './domain/serialise';
import { createDemoPack, loadDraft, saveDraft } from './domain/storage';
import type { Check, SignoffPack, TemplateId } from './domain/types';

type View = 'workspace' | 'privacy' | 'terms';
const SOURCE_URL = 'https://github.com/Liam-Soluxe/signoffkit';
const ISSUES_URL = `${SOURCE_URL}/issues`;

function download(name: string, contents: string, type: string) {
  const url = URL.createObjectURL(new Blob([contents], { type }));
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

const slug = (value: string) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'signoff-pack';

function LegalView({ view, onClose }: { view: Exclude<View, 'workspace'>; onClose: () => void }) {
  return <main className="legal-shell">
    <button className="back" onClick={onClose}>← Back to workspace</button>
    {view === 'privacy' ? <article className="legal-card"><p className="kicker">Plain-language policy</p><h1>Privacy</h1><p>SignoffKit processes pack content and evidence entirely in your browser. It has no accounts, backend, analytics, telemetry, advertising, cookies or external APIs.</p><h2>What stays on this device</h2><p>Your current draft is saved in browser localStorage. Evidence files are converted to embedded data and hashed locally. Nothing is uploaded by SignoffKit.</p><h2>Your control</h2><p>JSON and HTML exports are files you choose to save and share. Clearing site data removes the locally saved draft. Do not add secrets, credentials or regulated personal data.</p><h2>Hosting logs</h2><p>The static host may retain standard request logs under its own policy. SignoffKit does not read or combine those logs.</p></article> : <article className="legal-card"><p className="kicker">Beta terms</p><h1>Terms of use</h1><p>SignoffKit is a free local-first utility provided as-is, without warranties. You remain responsible for reviewing the pack and deciding whether it is suitable for your work.</p><h2>No legal approval</h2><p>A generated report is not an electronic signature, legal approval, compliance certificate or cryptographic timestamp. SHA-256 values demonstrate file-byte consistency only.</p><h2>Your data</h2><p>You are responsible for content you add, files you export and people you share them with. Do not process material you are not authorised to use.</p><h2>Acceptable use</h2><p>Do not use the tool to distribute unlawful, malicious or rights-infringing content. The beta may change or be withdrawn without notice.</p></article>}
  </main>;
}

function CheckCard({ check, index, total, onChange, onMove, onRemove }: { check: Check; index: number; total: number; onChange: (changes: Partial<Check>) => void; onMove: (to: number) => void; onRemove: () => void }) {
  const [busy, setBusy] = useState(false);
  const attach = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (!files.length) return;
    setBusy(true);
    try { onChange({ evidence: [...check.evidence, ...(await Promise.all(files.map(fileToEvidence)))] }); }
    catch { window.alert('One or more evidence files could not be read.'); }
    finally { setBusy(false); event.target.value = ''; }
  };
  return <article className={`check-card status-${check.status}`} data-testid="check-card">
    <div className="check-top"><span className="check-number">{String(index + 1).padStart(2, '0')}</span><input className="check-title" aria-label={`Check ${index + 1} title`} value={check.title} onChange={(event) => onChange({ title: event.target.value })} /><div className="move-actions"><button aria-label={`Move ${check.title} up`} disabled={index === 0} onClick={() => onMove(index - 1)}>↑</button><button aria-label={`Move ${check.title} down`} disabled={index === total - 1} onClick={() => onMove(index + 1)}>↓</button><button className="danger" aria-label={`Remove ${check.title}`} disabled={total === 1} onClick={onRemove}>×</button></div></div>
    <textarea className="description" aria-label={`${check.title} description`} value={check.description} onChange={(event) => onChange({ description: event.target.value })} />
    <div className="status-row" role="group" aria-label={`${check.title} status`}>{(['pending', 'pass', 'flag', 'na'] as const).map((status) => <button key={status} className={check.status === status ? 'selected' : ''} onClick={() => onChange({ status })}>{status === 'na' ? 'N/A' : status}</button>)}</div>
    <textarea aria-label={`${check.title} notes`} placeholder="Reviewer notes" value={check.notes} onChange={(event) => onChange({ notes: event.target.value })} />
    <div className="evidence-list">{check.evidence.map((item) => <div className="evidence-chip" key={item.id}><span><strong>{item.name}</strong><small>{item.sha256.slice(0, 12)}… · {(item.size / 1024).toFixed(1)} KB · {item.integrity === 'computed' ? 'computed locally' : 'unverified after import'}</small></span><button aria-label={`Remove evidence ${item.name}`} onClick={() => onChange({ evidence: check.evidence.filter((entry) => entry.id !== item.id) })}>×</button></div>)}</div>
    <label className="attach">{busy ? 'Hashing locally…' : '+ Attach evidence'}<input type="file" multiple accept="image/*,.pdf,.txt" disabled={busy} onChange={attach} /></label>
  </article>;
}

export default function App() {
  const [pack, setPack] = useState<SignoffPack>(() => loadDraft() ?? createPack('website'));
  const [view, setView] = useState<View>('workspace');
  const [notice, setNotice] = useState('Drafts save automatically on this device.');
  const importRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    let active = true;
    if (!saveDraft(pack)) queueMicrotask(() => {
      if (active) setNotice('This draft is too large for browser storage. Remove evidence or export the pack now.');
    });
    return () => { active = false; };
  }, [pack]);
  const score = scorePack(pack);
  const errors = validatePack(pack);
  const acceptPack = (next: SignoffPack): boolean => {
    if (!canRoundTrip(next)) { setNotice('This change would make the pack too large to import again. Remove evidence or shorten the content.'); return false; }
    setPack(next); return true;
  };
  const metadata = (field: keyof SignoffPack, value: string) => { acceptPack({ ...pack, [field]: value, updatedAt: new Date().toISOString() }); };
  const fresh = (template: TemplateId) => { setPack(createPack(template)); setNotice(`${templates[template].name} template loaded.`); };
  const importJson = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]; if (!file) return;
    try {
      if (file.size > 10 * 1024 * 1024) throw new Error('This SignoffKit pack is too large to import safely.');
      setPack(importPack(await file.text())); setNotice('Pack imported and saved locally.');
    }
    catch (error) { setNotice(error instanceof Error ? error.message : 'Import failed.'); }
    event.target.value = '';
  };
  const exportJson = () => { if (!canRoundTrip(pack)) { setNotice('This pack is too large to export safely. Remove evidence or shorten the content.'); return; } download(`${slug(pack.projectName)}.signoffkit.json`, exportPack(pack), 'application/json'); setNotice('JSON export created.'); };
  const exportHtml = () => { if (!canRoundTrip(pack)) { setNotice('This pack is too large to export safely. Remove evidence or shorten the content.'); return; } if (errors.length) { setNotice(`Complete ${errors.length} required item${errors.length === 1 ? '' : 's'} before exporting HTML.`); return; } download(`${slug(pack.projectName)}-evidence.html`, generateHtmlReport(pack), 'text/html'); setNotice('Self-contained HTML report created.'); };
  const changeCheck = (id: string, changes: Partial<Check>) => {
    const next = updateCheck(pack, id, changes);
    acceptPack(next);
  };
  if (view !== 'workspace') return <LegalView view={view} onClose={() => setView('workspace')} />;
  return <div className="app-shell">
    <header className="site-header"><a href="#main" className="skip-link">Skip to workspace</a><div className="brand"><img src={`${import.meta.env.BASE_URL}favicon.svg`} alt="" /><span>SignoffKit</span><b>Local beta</b></div><nav aria-label="Site"><a href={SOURCE_URL} target="_blank" rel="noreferrer">Source ↗</a><a href={ISSUES_URL} target="_blank" rel="noreferrer">Feedback ↗</a><button onClick={() => setView('privacy')}>Privacy</button><button onClick={() => setView('terms')}>Terms</button></nav></header>
    <main id="main"><section className="hero"><div><p className="kicker">Browser-local launch QA</p><h1>Leave a clear record,<br />not another loose end.</h1><p className="lede">Structure launch checks, hash supporting evidence and export a portable review pack. No account. No uploads. No tracking.</p></div><div className="hero-actions"><button className="primary" onClick={() => setPack(createDemoPack())}>Load synthetic demo</button><p>Uses fictional data only.</p></div></section>
      <section className="privacy-strip"><span className="pulse" /> <strong>Everything stays in this browser.</strong><span>Files are hashed and embedded locally. Avoid secrets and regulated personal data.</span></section>
      <div className="workspace-grid"><aside className="sidebar"><section><p className="section-label">Start from a template</p>{(Object.keys(templates) as TemplateId[]).map((id) => <button key={id} className={`template ${pack.template === id ? 'active' : ''}`} onClick={() => fresh(id)}><strong>{templates[id].name}</strong><span>{templates[id].description}</span></button>)}</section><section><p className="section-label">Pack actions</p><button className="wide" onClick={exportJson}>Export JSON</button><button className="wide" onClick={exportHtml}>Export HTML report</button><button className="wide subtle" onClick={() => importRef.current?.click()}>Import JSON</button><input ref={importRef} className="visually-hidden" aria-label="Import JSON file" type="file" accept="application/json,.json" onChange={importJson} /><p className="notice" role="status">{notice}</p></section><section className="caution"><strong>Scope note</strong><p>Hashes show file-byte consistency only. They are not legal signatures or timestamps.</p></section></aside>
        <section className="work-area"><div className="pack-heading"><div><p className="kicker">{templates[pack.template].name}</p><h2>Review pack</h2></div><div className="updated">Saved locally<br /><span>{new Date(pack.updatedAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</span></div></div>
          <div className="metadata-grid"><label>Project name<input value={pack.projectName} onChange={(e) => metadata('projectName', e.target.value)} placeholder="e.g. Spring website launch" /></label><label>Client label<input value={pack.clientLabel} onChange={(e) => metadata('clientLabel', e.target.value)} placeholder="Client or internal team" /></label><label>Version<input value={pack.version} onChange={(e) => metadata('version', e.target.value)} /></label><label>Reviewer<input value={pack.reviewer} onChange={(e) => metadata('reviewer', e.target.value)} placeholder="Named reviewer" /></label><label>Review date<input type="date" value={pack.reviewDate} onChange={(e) => metadata('reviewDate', e.target.value)} /></label></div>
          <section className="score-panel" aria-label="Readiness summary"><div className="score-ring" style={{ '--score': `${score.readiness * 3.6}deg` } as React.CSSProperties}><span>{score.readiness}%</span></div><div><p className="section-label">Readiness</p><h3>{score.blockers ? `${score.blockers} flagged blocker${score.blockers === 1 ? '' : 's'}` : score.pending ? 'Review in progress' : 'Ready to package'}</h3><p>{score.completed} of {score.total} checks completed · {score.pending} pending · {score.notApplicable} not applicable</p></div>{errors.length > 0 && <details><summary>{errors.length} required item{errors.length === 1 ? '' : 's'}</summary><ul>{errors.map((error) => <li key={error}>{error}</li>)}</ul></details>}</section>
          <div className="checks-header"><h2>Checks <span>{pack.checks.length}</span></h2><button onClick={() => acceptPack(addCheck(pack))}>+ Add check</button></div>
          <div className="checks">{pack.checks.map((check, index) => <CheckCard key={check.id} check={check} index={index} total={pack.checks.length} onChange={(changes) => changeCheck(check.id, changes)} onMove={(to) => setPack((current) => moveCheck(current, index, to))} onRemove={() => setPack((current) => removeCheck(current, check.id))} />)}</div>
        </section></div>
    </main><footer><div><strong>SignoffKit</strong><span>Open-source, browser-local launch QA.</span></div><div><button onClick={() => setView('privacy')}>Privacy</button><button onClick={() => setView('terms')}>Terms</button><a href={ISSUES_URL}>Report an issue</a></div></footer>
  </div>;
}

import { PACK_FORMAT, PACK_VERSION, type Check, type PackScore, type SignoffPack, type TemplateId } from './types';

interface PackTemplate { name: string; description: string; checks: Array<[string, string]> }

export const templates: Record<TemplateId, PackTemplate> = {
  website: { name: 'Website Launch', description: 'Content, journeys, tracking and release checks.', checks: [
    ['Critical journeys', 'Test primary navigation, forms and conversion paths.'], ['Responsive review', 'Review key pages at mobile, tablet and desktop widths.'], ['Content and links', 'Proofread launch content and verify internal and external links.'], ['Analytics and consent', 'Verify agreed analytics events and consent behaviour.'], ['Search readiness', 'Check titles, descriptions, indexing controls and sitemap.'], ['Performance', 'Review image sizing, loading behaviour and key performance risks.'], ['Accessibility', 'Check keyboard navigation, labels, contrast and alternatives.'], ['Release controls', 'Confirm backups, redirects, DNS and rollback owner.'],
  ]},
  campaign: { name: 'Campaign Launch', description: 'Audience, creative, destinations and measurement checks.', checks: [
    ['Brief alignment', 'Confirm objective, offer, audience and approved message.'], ['Creative variants', 'Check formats, copy, branding and platform requirements.'], ['Destinations', 'Verify landing pages, forms and tracking parameters.'], ['Audience setup', 'Review inclusions, exclusions, geography and frequency controls.'], ['Budget and schedule', 'Confirm limits, dates, pacing and owner.'], ['Measurement', 'Verify conversion events, naming and reporting access.'], ['Legal review', 'Record required approvals and market restrictions.'],
  ]},
  creative: { name: 'Creative Delivery', description: 'Files, copy, usage and handoff checks.', checks: [
    ['Approved direction', 'Confirm the selected route matches the signed-off brief.'], ['Copy accuracy', 'Proofread names, prices, dates, claims and calls to action.'], ['Brand consistency', 'Review logo, type, colour and required attribution.'], ['Output specifications', 'Verify dimensions, formats, colour profiles and file sizes.'], ['Usage rights', 'Record agreed licences, credits and expiry constraints.'], ['Source handoff', 'Include agreed source files, fonts and linked assets.'], ['Delivery manifest', 'Confirm filenames, destinations and handoff owner.'],
  ]},
  scope: { name: 'Scope Change', description: 'Record a requested change, its impact and an explicit review.', checks: [
    ['Original scope', 'Quote the relevant agreed deliverable or boundary and attach supporting evidence.'], ['Requested change', 'Describe what has been requested, by whom and when.'], ['Added fee', 'Record the additional fee, currency, tax treatment and payment terms, or state that no fee applies.'], ['Revised delivery date', 'Record the revised milestone or delivery date and any dependencies.'], ['Delivery impact', 'Describe what moves, pauses or leaves scope as a result of this change.'], ['Explicit review and approval', 'Name the reviewer and record whether the stated change, fee and date have been approved.'], ['Evidence pack limitation', 'Acknowledge that this pack records evidence and is not an e-signature or legal contract.'],
  ]},
};

const uid = () => globalThis.crypto?.randomUUID?.() ?? `sk-${Date.now()}-${Math.random().toString(16).slice(2)}`;
const isoNow = () => new Date().toISOString();

export function createPack(template: TemplateId): SignoffPack {
  const now = isoNow();
  return { format: PACK_FORMAT, schemaVersion: PACK_VERSION, id: uid(), template, projectName: '', clientLabel: '', version: '1.0', reviewer: '', reviewDate: now.slice(0, 10), createdAt: now, updatedAt: now, checks: templates[template].checks.map(([title, description]) => ({ id: uid(), title, description, status: 'pending', notes: '', evidence: [] })) };
}

export function updateCheck(pack: SignoffPack, id: string, changes: Partial<Check>): SignoffPack {
  return { ...pack, updatedAt: isoNow(), checks: pack.checks.map((check) => check.id === id ? { ...check, ...changes, id: check.id } : check) };
}

export function moveCheck(pack: SignoffPack, from: number, to: number): SignoffPack {
  if (from < 0 || to < 0 || from >= pack.checks.length || to >= pack.checks.length || from === to) return pack;
  const checks = [...pack.checks];
  const [item] = checks.splice(from, 1);
  checks.splice(to, 0, item);
  return { ...pack, updatedAt: isoNow(), checks };
}

export function scorePack(pack: SignoffPack): PackScore {
  const counts = { passed: 0, flagged: 0, notApplicable: 0, pending: 0 };
  for (const check of pack.checks) {
    if (check.status === 'pass') counts.passed++;
    else if (check.status === 'flag') counts.flagged++;
    else if (check.status === 'na') counts.notApplicable++;
    else counts.pending++;
  }
  const applicable = counts.passed + counts.flagged + counts.pending;
  return { readiness: applicable === 0 ? 100 : Math.round((counts.passed / applicable) * 100), completed: pack.checks.length - counts.pending, total: pack.checks.length, blockers: counts.flagged, ...counts };
}

export function addCheck(pack: SignoffPack): SignoffPack {
  const check: Check = { id: uid(), title: 'New check', description: '', status: 'pending', notes: '', evidence: [] };
  return { ...pack, updatedAt: isoNow(), checks: [...pack.checks, check] };
}

export function removeCheck(pack: SignoffPack, id: string): SignoffPack {
  if (pack.checks.length <= 1) return pack;
  return { ...pack, updatedAt: isoNow(), checks: pack.checks.filter((check) => check.id !== id) };
}

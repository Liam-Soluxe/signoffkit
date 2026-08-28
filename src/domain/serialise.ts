import { PACK_FORMAT, PACK_VERSION, type CheckStatus, type SignoffPack } from './types';

const statuses: CheckStatus[] = ['pending', 'pass', 'flag', 'na'];
const MAX_PACK_JSON_BYTES = 10 * 1024 * 1024;
const MAX_EVIDENCE_BYTES = 5 * 1024 * 1024;
const packKeys = ['format', 'schemaVersion', 'id', 'template', 'projectName', 'clientLabel', 'version', 'reviewer', 'reviewDate', 'createdAt', 'updatedAt', 'checks'];
const checkKeys = ['id', 'title', 'description', 'status', 'notes', 'evidence'];
const evidenceKeys = ['id', 'name', 'type', 'size', 'sha256', 'dataUrl', 'attachedAt', 'integrity'];

function hasOnlyKeys(value: Record<string, unknown>, allowed: string[]): boolean {
  return Object.keys(value).every((key) => allowed.includes(key));
}

function isDateTime(value: unknown): value is string {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/.test(value) && Number.isFinite(Date.parse(value));
}

function isEvidenceShape(value: unknown): boolean {
  if (!value || typeof value !== 'object') return false;
  const item = value as Record<string, unknown>;
  return hasOnlyKeys(item, evidenceKeys)
    && typeof item.id === 'string' && item.id.length > 0
    && typeof item.name === 'string'
    && typeof item.type === 'string'
    && typeof item.size === 'number' && Number.isInteger(item.size) && item.size >= 0 && item.size <= MAX_EVIDENCE_BYTES
    && typeof item.sha256 === 'string' && /^[a-f0-9]{64}$/i.test(item.sha256)
    && typeof item.dataUrl === 'string'
    && isDateTime(item.attachedAt)
    && (item.integrity === undefined || item.integrity === 'computed' || item.integrity === 'unverified');
}

export function validatePack(pack: SignoffPack): string[] {
  const errors: string[] = [];
  if (!pack.projectName.trim()) errors.push('Project name is required.');
  if (!pack.clientLabel.trim()) errors.push('Client label is required.');
  if (!pack.version.trim()) errors.push('Version is required.');
  if (!pack.reviewer.trim()) errors.push('Reviewer is required.');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(pack.reviewDate)) errors.push('Review date must use YYYY-MM-DD.');
  if (pack.checks.length === 0) errors.push('At least one check is required.');
  pack.checks.forEach((check, index) => {
    if (!check.title.trim()) errors.push(`Check ${index + 1} needs a title.`);
    if (!statuses.includes(check.status)) errors.push(`Check ${index + 1} has an invalid status.`);
  });
  return errors;
}

export function exportPack(pack: SignoffPack): string {
  return JSON.stringify(pack, null, 2);
}

export function canRoundTrip(pack: SignoffPack): boolean {
  return new TextEncoder().encode(exportPack(pack)).byteLength <= MAX_PACK_JSON_BYTES;
}

function isPackShape(value: unknown): value is SignoffPack {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Record<string, unknown>;
  if (!hasOnlyKeys(candidate, packKeys)
    || candidate.format !== PACK_FORMAT
    || typeof candidate.id !== 'string' || candidate.id.length === 0
    || typeof candidate.projectName !== 'string'
    || typeof candidate.clientLabel !== 'string'
    || typeof candidate.version !== 'string'
    || typeof candidate.reviewer !== 'string'
    || typeof candidate.reviewDate !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(candidate.reviewDate)
    || !isDateTime(candidate.createdAt) || !isDateTime(candidate.updatedAt)
    || !['website', 'campaign', 'creative', 'scope'].includes(String(candidate.template))
    || !Array.isArray(candidate.checks) || candidate.checks.length === 0) return false;

  const valid = candidate.checks.every((check) => {
    if (!check || typeof check !== 'object') return false;
    const item = check as Record<string, unknown>;
    return hasOnlyKeys(item, checkKeys)
      && typeof item.id === 'string' && item.id.length > 0
      && typeof item.title === 'string'
      && typeof item.description === 'string'
      && statuses.includes(item.status as CheckStatus)
      && typeof item.notes === 'string'
      && Array.isArray(item.evidence)
      && item.evidence.every(isEvidenceShape);
  });
  if (!valid) return false;

  const checks = candidate.checks as Array<Record<string, unknown>>;
  const checkIds = checks.map((check) => check.id);
  const evidence = checks.flatMap((check) => check.evidence as Array<Record<string, unknown>>);
  const evidenceIds = evidence.map((item) => item.id);
  return new Set(checkIds).size === checkIds.length
    && new Set(evidenceIds).size === evidenceIds.length
    && evidence.reduce((total, item) => total + Number(item.size), 0) <= MAX_PACK_JSON_BYTES;
}

export function importPack(json: string): SignoffPack {
  if (new TextEncoder().encode(json).byteLength > MAX_PACK_JSON_BYTES) throw new Error('This SignoffKit pack is too large to import safely.');
  let value: unknown;
  try { value = JSON.parse(json); } catch { throw new Error('This file is not valid JSON.'); }
  if (!value || typeof value !== 'object' || (value as Record<string, unknown>).format !== PACK_FORMAT) throw new Error('This is not a SignoffKit pack.');
  const version = (value as Record<string, unknown>).schemaVersion;
  if (typeof version === 'number' && version > PACK_VERSION) throw new Error('This pack uses a newer version of SignoffKit.');
  if (version !== PACK_VERSION || !isPackShape(value)) throw new Error('This SignoffKit pack is incomplete or invalid.');
  return {
    ...value,
    checks: value.checks.map((check) => ({
      ...check,
      evidence: check.evidence.map((evidence) => ({ ...evidence, integrity: 'unverified' as const })),
    })),
  };
}

import { createPack, updateCheck } from './pack';
import { exportPack, importPack } from './serialise';
import type { SignoffPack } from './types';

export const STORAGE_KEY = 'signoffkit:draft:v1';

export function saveDraft(pack: SignoffPack): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, exportPack(pack));
    return true;
  } catch {
    return false;
  }
}

export function loadDraft(): SignoffPack | null {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try { return importPack(raw); } catch { return null; }
}

export function createDemoPack(): SignoffPack {
  let pack: SignoffPack = { ...createPack('website'), projectName: 'Demo: Northstar Studio website', clientLabel: 'Fictional client: Northstar Studio', version: '0.9', reviewer: 'Alex Morgan (demo)' };
  pack = updateCheck(pack, pack.checks[0].id, { status: 'pass', notes: 'Primary enquiry and newsletter journeys tested using synthetic entries.' });
  pack = updateCheck(pack, pack.checks[1].id, { status: 'pass', notes: 'Reviewed at 390 px, 768 px and 1440 px.' });
  pack = updateCheck(pack, pack.checks[2].id, { status: 'flag', notes: 'Demo blocker: replace the placeholder privacy link before release.' });
  pack = updateCheck(pack, pack.checks[3].id, { status: 'na', notes: 'Analytics intentionally excluded from this fictional demo.' });
  return pack;
}

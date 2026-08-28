import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createDemoPack, loadDraft, saveDraft } from './storage';

describe('draft persistence and demo', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => vi.restoreAllMocks());

  it('saves and restores a draft locally', () => {
    const demo = createDemoPack();
    expect(saveDraft(demo)).toBe(true);
    expect(loadDraft()).toEqual(demo);
  });

  it('fails safely when browser storage is full', () => {
    vi.spyOn(localStorage, 'setItem').mockImplementation(() => { throw new DOMException('Quota exceeded', 'QuotaExceededError'); });
    expect(saveDraft(createDemoPack())).toBe(false);
  });

  it('ignores corrupted local data', () => {
    localStorage.setItem('signoffkit:draft:v1', 'bad');
    expect(loadDraft()).toBeNull();
  });

  it('creates a clearly synthetic, partially completed demo with a blocker', () => {
    const demo = createDemoPack();
    expect(demo.projectName).toContain('Demo');
    expect(demo.clientLabel).toContain('Fictional');
    expect(demo.checks.some((check) => check.status === 'pass')).toBe(true);
    expect(demo.checks.some((check) => check.status === 'flag')).toBe(true);
  });
});

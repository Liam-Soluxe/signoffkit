import { describe, expect, it } from 'vitest';
import { createPack, moveCheck, removeCheck, scorePack, templates, updateCheck } from './pack';

describe('pack state and readiness', () => {
  it('keeps at least one check in every pack', () => {
    const pack = createPack('website');
    const only = { ...pack, checks: [pack.checks[0]] };
    expect(removeCheck(only, only.checks[0].id).checks).toHaveLength(1);
  });
  it('provides four distinct templates and creates independent checks', () => {
    expect(Object.keys(templates)).toEqual(['website', 'campaign', 'creative', 'scope']);
    const first = createPack('website');
    const second = createPack('website');
    expect(first.checks.length).toBeGreaterThan(4);
    first.checks[0].title = 'Changed';
    expect(second.checks[0].title).not.toBe('Changed');
  });

  it('updates and reorders checks without mutating the original pack', () => {
    const pack = createPack('campaign');
    const changed = updateCheck(pack, pack.checks[0].id, { status: 'flag', notes: 'Fix tracking' });
    const moved = moveCheck(changed, 0, 1);
    expect(pack.checks[0].status).toBe('pending');
    expect(moved.checks[1].status).toBe('flag');
  });

  it('provides a scope-change evidence template with the commercial decision points', () => {
    const pack = createPack('scope');
    const titles = pack.checks.map((check) => check.title.toLowerCase()).join(' ');
    expect(titles).toContain('original scope');
    expect(titles).toContain('requested change');
    expect(titles).toContain('added fee');
    expect(titles).toContain('revised delivery date');
    expect(titles).toContain('explicit review');
  });

  it('scores applicable completed checks and reports flags as blockers', () => {
    let pack = createPack('creative');
    pack = { ...pack, checks: pack.checks.slice(0, 3) };
    pack = updateCheck(pack, pack.checks[0].id, { status: 'pass' });
    pack = updateCheck(pack, pack.checks[1].id, { status: 'flag' });
    pack = updateCheck(pack, pack.checks[2].id, { status: 'na' });
    expect(scorePack(pack)).toEqual({ readiness: 50, completed: 3, total: 3, blockers: 1, passed: 1, flagged: 1, notApplicable: 1, pending: 0 });
  });
});

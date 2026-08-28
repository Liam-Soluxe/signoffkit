export const PACK_FORMAT = 'signoffkit-pack' as const;
export const PACK_VERSION = 1 as const;

export type TemplateId = 'website' | 'campaign' | 'creative' | 'scope';
export type CheckStatus = 'pending' | 'pass' | 'flag' | 'na';

export interface Evidence {
  id: string;
  name: string;
  type: string;
  size: number;
  sha256: string;
  dataUrl: string;
  attachedAt: string;
  integrity: 'computed' | 'unverified';
}

export interface Check {
  id: string;
  title: string;
  description: string;
  status: CheckStatus;
  notes: string;
  evidence: Evidence[];
}

export interface SignoffPack {
  format: typeof PACK_FORMAT;
  schemaVersion: typeof PACK_VERSION;
  id: string;
  template: TemplateId;
  projectName: string;
  clientLabel: string;
  version: string;
  reviewer: string;
  reviewDate: string;
  createdAt: string;
  updatedAt: string;
  checks: Check[];
}

export interface PackScore {
  readiness: number;
  completed: number;
  total: number;
  blockers: number;
  passed: number;
  flagged: number;
  notApplicable: number;
  pending: number;
}

import { CertificationCandidate } from '../../../../../../src/certification/session-management/domain/models/CertificationCandidate.js';

export const buildCertificationCandidate = function ({ userId = 456, reconciledAt = new Date('2024-09-26') } = {}) {
  return new CertificationCandidate({
    userId,
    reconciledAt,
  });
};

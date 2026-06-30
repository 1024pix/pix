import { CertificationCandidate } from '../../../../../../src/certification/session-management/domain/models/CertificationCandidate.js';

export const buildCertificationCandidate = function ({
  id = 123,
  userId = 456,
  reconciledAt = new Date('2024-09-26'),
  resultRecipientEmail = 'somerecipientmail@example.net',
} = {}) {
  return new CertificationCandidate({
    id,
    userId,
    reconciledAt,
    resultRecipientEmail,
  });
};

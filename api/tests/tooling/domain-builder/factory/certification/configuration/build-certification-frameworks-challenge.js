import { CertificationFrameworksChallenge } from '../../../../../../src/certification/configuration/domain/models/CertificationFrameworksChallenge.js';

export const buildCertificationFrameworksChallenge = function ({
  createdAt = new Date(),
  challengeId,
  complementaryCertificationKey,
  alpha,
  delta,
} = {}) {
  return new CertificationFrameworksChallenge({ createdAt, challengeId, complementaryCertificationKey, alpha, delta });
};

import { CertificationChallengeCapacity } from '../../../../../../src/certification/scoring/domain/models/CertificationChallengeCapacity.js';

export const buildCertificationChallengeCapacity = ({ certificationChallengeId, capacity, createdAt }) => {
  return new CertificationChallengeCapacity({
    certificationChallengeId,
    capacity,
    createdAt,
  });
};

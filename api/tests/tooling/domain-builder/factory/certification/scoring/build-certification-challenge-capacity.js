import { CertificationChallengeCapacity } from '../../../../../../src/certification/scoring/domain/models/CertificationChallengeCapacity.js';

export const buildCertificationChallengeCapacity = ({ answerId, certificationChallengeId, capacity, createdAt }) => {
  return new CertificationChallengeCapacity({
    answerId,
    certificationChallengeId,
    capacity,
    createdAt,
  });
};

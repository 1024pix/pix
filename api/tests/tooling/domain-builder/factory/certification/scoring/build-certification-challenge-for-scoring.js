import { CertificationChallengeForScoring } from '../../../../../../src/certification/scoring/domain/models/CertificationChallengeForScoring.js';

const buildCertificationChallengeForScoring = function ({ id = 123, discriminant = 0.5, difficulty = 2.1 } = {}) {
  return new CertificationChallengeForScoring({
    id,
    discriminant,
    difficulty,
  });
};

export { buildCertificationChallengeForScoring };

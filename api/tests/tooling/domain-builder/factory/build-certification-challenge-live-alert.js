import { CertificationChallengeLiveAlert } from '../../../../lib/domain/models/CertificationChallengeLiveAlert.js';

const buildCertificationChallengeLiveAlert = function ({ assessmentId = 123, challengeId = 'recCHAL' } = {}) {
  return new CertificationChallengeLiveAlert({
    assessmentId,
    challengeId,
  });
};

export { buildCertificationChallengeLiveAlert };

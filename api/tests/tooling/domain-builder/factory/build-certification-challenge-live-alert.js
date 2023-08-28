import {
  CertificationChallengeLiveAlert,
  CertificationChallengeLiveAlertStatus,
} from '../../../../lib/domain/models/CertificationChallengeLiveAlert.js';

const buildCertificationChallengeLiveAlert = function ({
  assessmentId = 123,
  challengeId = 'recCHAL',
  status = CertificationChallengeLiveAlertStatus.ONGOING,
} = {}) {
  return new CertificationChallengeLiveAlert({
    assessmentId,
    challengeId,
    status,
  });
};

export { buildCertificationChallengeLiveAlert };

import { CertificationChallengeLiveAlert } from '../../../src/certification/session/domain/models/CertificationChallengeLiveAlert.js';

const createCertificationChallengeLiveAlert = async function ({
  assessmentId,
  challengeId,
  certificationChallengeLiveAlertRepository,
}) {
  const certificationChallengeLiveAlert = new CertificationChallengeLiveAlert({ assessmentId, challengeId });
  return certificationChallengeLiveAlertRepository.save({ certificationChallengeLiveAlert });
};

export { createCertificationChallengeLiveAlert };

import {
  CertificationChallengeLiveAlert,
  CertificationChallengeLiveAlertStatus,
} from '../../../../src/certification/session/domain/models/CertificationChallengeLiveAlert.js';

const buildCertificationChallengeLiveAlert = function ({
  id = 456,
  assessmentId = 123,
  challengeId = 'recCHAL',
  status = CertificationChallengeLiveAlertStatus.ONGOING,
  questionNumber = 1,
  createdAt = new Date('2020-01-01'),
  updatedAt = new Date('2020-01-01'),
  hasEmbed = false,
  isFocus = false,
  hasImage = false,
  hasAttachment = false,
} = {}) {
  return new CertificationChallengeLiveAlert({
    id,
    assessmentId,
    challengeId,
    questionNumber,
    status,
    createdAt,
    updatedAt,
    hasEmbed,
    isFocus,
    hasImage,
    hasAttachment,
  });
};

export { buildCertificationChallengeLiveAlert };

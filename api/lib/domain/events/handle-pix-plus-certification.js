const { checkEventType } = require('./check-event-type');
const CertificationScoringCompleted = require('./CertificationScoringCompleted');
const PixPlusCertification = require('../models/PixPlusCertification');
const { ReproducibilityRate } = require('../models/ReproducibilityRate');

const eventType = CertificationScoringCompleted;

async function handlePixPlusCertifications({
  event,
  domainTransaction,
  certificationAssessmentRepository,
  partnerCertificationRepository,
}) {
  checkEventType(event, eventType);
  const certificationCourseId = event.certificationCourseId;
  const certificationAssessment = await certificationAssessmentRepository.getByCertificationCourseId({ certificationCourseId, domainTransaction });
  const certifiableBadgeKeys = certificationAssessment.listCertifiableBadgeKeysTaken();
  for (const certifiableBadgeKey of certifiableBadgeKeys) {
    const pixPlusAnswers = certificationAssessment.findAnswersForCertifiableBadgeKey(certifiableBadgeKey);
    const pixPlusCertification = _buildPixPlusCertification(event, pixPlusAnswers, certifiableBadgeKey);
    await partnerCertificationRepository.save({ partnerCertification: pixPlusCertification, domainTransaction });
  }
}

function _buildPixPlusCertification(event, answers, certifiableBadgeKey) {
  const reproducibilityRate = ReproducibilityRate.from({ answers });
  return new PixPlusCertification({
    certificationCourseId: event.certificationCourseId,
    reproducibilityRate,
    certifiableBadgeKey,
    hasAcquiredPixCertification: event.isValidated,
  });
}

handlePixPlusCertifications.eventType = eventType;
module.exports = handlePixPlusCertifications;

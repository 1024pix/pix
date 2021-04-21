const { checkEventType } = require('./check-event-type');
const CertificationScoringCompleted = require('./CertificationScoringCompleted');
const PixPlusCertificationScoring = require('../models/PixPlusCertificationScoring');
const { ReproducibilityRate } = require('../models/ReproducibilityRate');

const eventType = CertificationScoringCompleted;

async function handlePixPlusCertificationsScoring({
  event,
  domainTransaction,
  certificationAssessmentRepository,
  partnerCertificationScoringRepository,
}) {
  checkEventType(event, eventType);
  const certificationCourseId = event.certificationCourseId;
  const certificationAssessment = await certificationAssessmentRepository.getByCertificationCourseId({ certificationCourseId, domainTransaction });
  const certifiableBadgeKeys = certificationAssessment.listCertifiableBadgeKeysTaken();
  for (const certifiableBadgeKey of certifiableBadgeKeys) {
    const pixPlusAnswers = certificationAssessment.findAnswersForCertifiableBadgeKey(certifiableBadgeKey);
    const pixPlusCertificationScoring = _buildPixPlusCertificationScoring(event, pixPlusAnswers, certifiableBadgeKey);
    await partnerCertificationScoringRepository.save({ partnerCertificationScoring: pixPlusCertificationScoring, domainTransaction });
  }
}

function _buildPixPlusCertificationScoring(event, answers, certifiableBadgeKey) {
  const reproducibilityRate = ReproducibilityRate.from({ answers });
  return new PixPlusCertificationScoring({
    certificationCourseId: event.certificationCourseId,
    reproducibilityRate,
    certifiableBadgeKey,
    hasAcquiredPixCertification: event.isValidated,
  });
}

handlePixPlusCertificationsScoring.eventType = eventType;
module.exports = handlePixPlusCertificationsScoring;

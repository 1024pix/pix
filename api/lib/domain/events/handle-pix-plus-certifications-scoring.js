const { checkEventTypes } = require('./check-event-types');
const CertificationScoringCompleted = require('./CertificationScoringCompleted');
const PixPlusCertificationScoring = require('../models/PixPlusCertificationScoring');
const { ReproducibilityRate } = require('../models/ReproducibilityRate');

const eventTypes = [ CertificationScoringCompleted ];

async function handlePixPlusCertificationsScoring({
  event,
  domainTransaction,
  certificationAssessmentRepository,
  partnerCertificationScoringRepository,
}) {
  checkEventTypes(event, eventTypes);
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
  const reproducibilityRate = ReproducibilityRate.fromAnswers({ answers });
  return new PixPlusCertificationScoring({
    certificationCourseId: event.certificationCourseId,
    reproducibilityRate,
    certifiableBadgeKey,
    hasAcquiredPixCertification: event.isValidated,
  });
}

handlePixPlusCertificationsScoring.eventTypes = eventTypes;
module.exports = handlePixPlusCertificationsScoring;

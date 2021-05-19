const { checkEventTypes } = require('./check-event-types');
const CertificationScoringCompleted = require('./CertificationScoringCompleted');
const PixPlusCertificationScoring = require('../models/PixPlusCertificationScoring');
const { ReproducibilityRate } = require('../models/ReproducibilityRate');
const AnswerCollectionForScoring = require('../models/AnswerCollectionForScoring');

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
    const {
      certificationChallenges: pixPlusChallenges,
      certificationAnswers: pixPlusAnswers,
    } = certificationAssessment.findAnswersAndChallengesForCertifiableBadgeKey(certifiableBadgeKey);
    const pixPlusCertificationScoring = _buildPixPlusCertificationScoring(event, pixPlusChallenges, pixPlusAnswers, certifiableBadgeKey);
    await partnerCertificationScoringRepository.save({ partnerCertificationScoring: pixPlusCertificationScoring, domainTransaction });
  }
}

function _buildPixPlusCertificationScoring(event, challenges, answers, certifiableBadgeKey) {
  const answerCollection = AnswerCollectionForScoring.from({ answers, challenges });
  const reproducibilityRate = ReproducibilityRate.from({
    numberOfNonNeutralizedChallenges: answerCollection.numberOfNonNeutralizedChallenges(),
    numberOfCorrectAnswers: answerCollection.numberOfCorrectAnswers(),
  });
  return new PixPlusCertificationScoring({
    certificationCourseId: event.certificationCourseId,
    reproducibilityRate,
    certifiableBadgeKey,
    hasAcquiredPixCertification: event.isValidated,
  });
}

handlePixPlusCertificationsScoring.eventTypes = eventTypes;
module.exports = handlePixPlusCertificationsScoring;

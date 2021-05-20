const { checkEventTypes } = require('./check-event-types');
const CertificationScoringCompleted = require('./CertificationScoringCompleted');
const PixPlusCertificationScoring = require('../models/PixPlusCertificationScoring');
const { ReproducibilityRate } = require('../models/ReproducibilityRate');
const AnswerCollectionForScoring = require('../models/AnswerCollectionForScoring');

const eventTypes = [ CertificationScoringCompleted ];

async function handlePixPlusCertificationsScoring({
  event,
  assessmentResultRepository,
  certificationAssessmentRepository,
  partnerCertificationScoringRepository,
}) {
  checkEventTypes(event, eventTypes);
  const certificationCourseId = event.certificationCourseId;
  const certificationAssessment = await certificationAssessmentRepository.getByCertificationCourseId({ certificationCourseId });
  const certifiableBadgeKeys = certificationAssessment.listCertifiableBadgeKeysTaken();
  for (const certifiableBadgeKey of certifiableBadgeKeys) {
    const {
      certificationChallenges: pixPlusChallenges,
      certificationAnswers: pixPlusAnswers,
    } = certificationAssessment.findAnswersAndChallengesForCertifiableBadgeKey(certifiableBadgeKey);
    const assessmentResult = await assessmentResultRepository.getByCertificationCourseId({ certificationCourseId });
    const pixPlusCertificationScoring = _buildPixPlusCertificationScoring(certificationCourseId, pixPlusChallenges, pixPlusAnswers, certifiableBadgeKey, assessmentResult);
    await partnerCertificationScoringRepository.save({ partnerCertificationScoring: pixPlusCertificationScoring });
  }
}

function _buildPixPlusCertificationScoring(certificationCourseId, challenges, answers, certifiableBadgeKey, assessmentResult) {
  const answerCollection = AnswerCollectionForScoring.from({ answers, challenges });
  const reproducibilityRate = ReproducibilityRate.from({
    numberOfNonNeutralizedChallenges: answerCollection.numberOfNonNeutralizedChallenges(),
    numberOfCorrectAnswers: answerCollection.numberOfCorrectAnswers(),
  });
  return new PixPlusCertificationScoring({
    certificationCourseId,
    reproducibilityRate,
    certifiableBadgeKey,
    hasAcquiredPixCertification: assessmentResult.isValidated(),
  });
}

handlePixPlusCertificationsScoring.eventTypes = eventTypes;
module.exports = handlePixPlusCertificationsScoring;

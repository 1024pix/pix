const { checkEventTypes } = require('./check-event-types');
const CertificationScoringCompleted = require('./CertificationScoringCompleted');
const CertificationRescoringCompleted = require('./CertificationRescoringCompleted');
const PixPlusCertificationScoring = require('../models/PixPlusCertificationScoring');
const { ReproducibilityRate } = require('../models/ReproducibilityRate');
const AnswerCollectionForScoring = require('../models/AnswerCollectionForScoring');
const { PIX_PLUS_DROIT } = require('../models/ComplementaryCertification');
const { featureToggles } = require('../../config');

const eventTypes = [CertificationScoringCompleted, CertificationRescoringCompleted];

async function handlePixPlusCertificationsScoring({
  event,
  assessmentResultRepository,
  certificationAssessmentRepository,
  partnerCertificationScoringRepository,
  complementaryCertificationCourseRepository,
}) {
  checkEventTypes(event, eventTypes);
  const certificationCourseId = event.certificationCourseId;
  if (featureToggles.isComplementaryCertificationSubscriptionEnabled) {
    const hasRunPixPlus = await complementaryCertificationCourseRepository.hasComplementaryCertification({
      certificationCourseId,
      complementaryCertificationName: PIX_PLUS_DROIT,
    });
    if (!hasRunPixPlus) {
      return;
    }
  }

  const certificationAssessment = await certificationAssessmentRepository.getByCertificationCourseId({
    certificationCourseId,
  });
  const certifiableBadgeKeys = certificationAssessment.listCertifiableBadgePixPlusKeysTaken();
  for (const certifiableBadgeKey of certifiableBadgeKeys) {
    const { certificationChallenges: pixPlusChallenges, certificationAnswers: pixPlusAnswers } =
      certificationAssessment.findAnswersAndChallengesForCertifiableBadgeKey(certifiableBadgeKey);
    const assessmentResult = await assessmentResultRepository.getByCertificationCourseId({ certificationCourseId });
    const pixPlusCertificationScoring = _buildPixPlusCertificationScoring(
      certificationCourseId,
      pixPlusChallenges,
      pixPlusAnswers,
      certifiableBadgeKey,
      assessmentResult
    );
    await partnerCertificationScoringRepository.save({ partnerCertificationScoring: pixPlusCertificationScoring });
  }
}

function _buildPixPlusCertificationScoring(
  certificationCourseId,
  challenges,
  answers,
  certifiableBadgeKey,
  assessmentResult
) {
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

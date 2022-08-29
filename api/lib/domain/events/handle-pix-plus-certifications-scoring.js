const { checkEventTypes } = require('./check-event-types');
const CertificationScoringCompleted = require('./CertificationScoringCompleted');
const CertificationRescoringCompleted = require('./CertificationRescoringCompleted');
const { ReproducibilityRate } = require('../models/ReproducibilityRate');
const AnswerCollectionForScoring = require('../models/AnswerCollectionForScoring');
const PixPlusCertificationScoring = require('../models/PixPlusCertificationScoring');

const eventTypes = [CertificationScoringCompleted, CertificationRescoringCompleted];

async function handlePixPlusCertificationsScoring({
  event,
  assessmentResultRepository,
  certificationAssessmentRepository,
  partnerCertificationScoringRepository,
  complementaryCertificationScoringCriteriaRepository,
}) {
  checkEventTypes(event, eventTypes);
  const certificationCourseId = event.certificationCourseId;

  const complementaryCertificationScoringCriteria =
    await complementaryCertificationScoringCriteriaRepository.findByCertificationCourseId({ certificationCourseId });

  if (!complementaryCertificationScoringCriteria.length) {
    return;
  }

  const certificationAssessment = await certificationAssessmentRepository.getByCertificationCourseId({
    certificationCourseId,
  });

  const certifiableBadgeKeys = certificationAssessment.listCertifiableBadgePixPlusKeysTaken();

  for (const certifiableBadgeKey of certifiableBadgeKeys) {
    const { minimumReproducibilityRate, complementaryCertificationCourseId } =
      complementaryCertificationScoringCriteria.find(({ complementaryCertificationBadgeKeys }) =>
        complementaryCertificationBadgeKeys.includes(certifiableBadgeKey)
      );

    const { certificationChallenges: pixPlusChallenges, certificationAnswers: pixPlusAnswers } =
      certificationAssessment.findAnswersAndChallengesForCertifiableBadgeKey(certifiableBadgeKey);
    const assessmentResult = await assessmentResultRepository.getByCertificationCourseId({ certificationCourseId });

    const pixPlusCertificationScoring = _buildPixPlusCertificationScoring(
      minimumReproducibilityRate,
      complementaryCertificationCourseId,
      pixPlusChallenges,
      pixPlusAnswers,
      certifiableBadgeKey,
      assessmentResult
    );
    await partnerCertificationScoringRepository.save({ partnerCertificationScoring: pixPlusCertificationScoring });
  }
}

function _buildPixPlusCertificationScoring(
  minimumReproducibilityRate,
  complementaryCertificationCourseId,
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
    minimumReproducibilityRate,
    complementaryCertificationCourseId,
    reproducibilityRate,
    certifiableBadgeKey,
    hasAcquiredPixCertification: assessmentResult.isValidated(),
  });
}

handlePixPlusCertificationsScoring.eventTypes = eventTypes;
module.exports = handlePixPlusCertificationsScoring;

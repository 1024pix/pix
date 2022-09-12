const { checkEventTypes } = require('./check-event-types');
const CertificationScoringCompleted = require('./CertificationScoringCompleted');
const CertificationRescoringCompleted = require('./CertificationRescoringCompleted');
const { ReproducibilityRate } = require('../models/ReproducibilityRate');
const AnswerCollectionForScoring = require('../models/AnswerCollectionForScoring');
const ComplementaryCertificationScoringWithComplementaryReferential = require('../models/ComplementaryCertificationScoringWithComplementaryReferential');
const ComplementaryCertificationScoringWithoutComplementaryReferential = require('../models/ComplementaryCertificationScoringWithoutComplementaryReferential');

const eventTypes = [CertificationScoringCompleted, CertificationRescoringCompleted];

async function handleComplementaryCertificationsScoring({
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

  for (const complementaryCertificationScoringCriterion of complementaryCertificationScoringCriteria) {
    const {
      minimumReproducibilityRate,
      complementaryCertificationCourseId,
      complementaryCertificationBadgeKey,
      hasComplementaryReferential,
      minimumEarnedPix,
    } = complementaryCertificationScoringCriterion;

    const assessmentResult = await assessmentResultRepository.getByCertificationCourseId({ certificationCourseId });

    let complementaryCertificationScoringWithComplementaryReferential;

    if (hasComplementaryReferential) {
      const { certificationChallenges: pixPlusChallenges, certificationAnswers: pixPlusAnswers } =
        certificationAssessment.findAnswersAndChallengesForCertifiableBadgeKey(complementaryCertificationBadgeKey);
      complementaryCertificationScoringWithComplementaryReferential =
        _buildComplementaryCertificationScoringWithReferential(
          minimumReproducibilityRate,
          complementaryCertificationCourseId,
          pixPlusChallenges,
          pixPlusAnswers,
          complementaryCertificationBadgeKey,
          assessmentResult
        );
    } else {
      complementaryCertificationScoringWithComplementaryReferential =
        new ComplementaryCertificationScoringWithoutComplementaryReferential({
          complementaryCertificationCourseId,
          complementaryCertificationBadgeKey,
          reproducibilityRate: assessmentResult.reproducibilityRate,
          pixScore: assessmentResult.pixScore,
          minimumEarnedPix,
          minimumReproducibilityRate,
        });
    }

    await partnerCertificationScoringRepository.save({
      partnerCertificationScoring: complementaryCertificationScoringWithComplementaryReferential,
    });
  }
}

function _buildComplementaryCertificationScoringWithReferential(
  minimumReproducibilityRate,
  complementaryCertificationCourseId,
  challenges,
  answers,
  complementaryCertificationBadgeKey,
  assessmentResult
) {
  const answerCollection = AnswerCollectionForScoring.from({ answers, challenges });
  const reproducibilityRate = ReproducibilityRate.from({
    numberOfNonNeutralizedChallenges: answerCollection.numberOfNonNeutralizedChallenges(),
    numberOfCorrectAnswers: answerCollection.numberOfCorrectAnswers(),
  });

  return new ComplementaryCertificationScoringWithComplementaryReferential({
    minimumReproducibilityRate,
    complementaryCertificationCourseId,
    reproducibilityRate,
    complementaryCertificationBadgeKey,
    hasAcquiredPixCertification: assessmentResult.isValidated(),
  });
}

handleComplementaryCertificationsScoring.eventTypes = eventTypes;
module.exports = handleComplementaryCertificationsScoring;

import { checkEventTypes } from './check-event-types.js';
import { CertificationScoringCompleted } from './CertificationScoringCompleted.js';
import { CertificationRescoringCompleted } from './CertificationRescoringCompleted.js';
import { ReproducibilityRate } from '../models/ReproducibilityRate.js';
import { AnswerCollectionForScoring } from '../models/AnswerCollectionForScoring.js';
import { ComplementaryCertificationScoringWithComplementaryReferential } from '../models/ComplementaryCertificationScoringWithComplementaryReferential.js';
import { ComplementaryCertificationScoringWithoutComplementaryReferential } from '../models/ComplementaryCertificationScoringWithoutComplementaryReferential.js';
import { ComplementaryCertificationCourseResult } from '../models/ComplementaryCertificationCourseResult.js';

const eventTypes = [CertificationScoringCompleted, CertificationRescoringCompleted];

async function handleComplementaryCertificationsScoring({
  event,
  assessmentResultRepository,
  certificationAssessmentRepository,
  complementaryCertificationCourseResultRepository,
  complementaryCertificationScoringCriteriaRepository,
  certificationCourseRepository,
}) {
  checkEventTypes(event, eventTypes);
  const certificationCourseId = event.certificationCourseId;

  const complementaryCertificationScoringCriteria =
    await complementaryCertificationScoringCriteriaRepository.findByCertificationCourseId({ certificationCourseId });

  if (!complementaryCertificationScoringCriteria.length) {
    return;
  }

  const certificationCourse = await certificationCourseRepository.get(certificationCourseId);
  const assessmentResult = await assessmentResultRepository.getByCertificationCourseId({ certificationCourseId });

  for (const complementaryCertificationScoringCriterion of complementaryCertificationScoringCriteria) {
    const {
      minimumReproducibilityRate,
      complementaryCertificationCourseId,
      complementaryCertificationBadgeId,
      complementaryCertificationBadgeKey,
      hasComplementaryReferential,
      minimumEarnedPix,
    } = complementaryCertificationScoringCriterion;
    let complementaryCertificationScoringWithComplementaryReferential;

    if (hasComplementaryReferential) {
      const certificationAssessment = await certificationAssessmentRepository.getByCertificationCourseId({
        certificationCourseId,
      });
      const { certificationChallenges: pixPlusChallenges, certificationAnswers: pixPlusAnswers } =
        certificationAssessment.findAnswersAndChallengesForCertifiableBadgeKey(complementaryCertificationBadgeKey);
      complementaryCertificationScoringWithComplementaryReferential =
        _buildComplementaryCertificationScoringWithReferential(
          minimumReproducibilityRate,
          complementaryCertificationCourseId,
          complementaryCertificationBadgeId,
          pixPlusChallenges,
          pixPlusAnswers,
          complementaryCertificationBadgeKey,
          assessmentResult,
          certificationCourse,
        );
    } else {
      complementaryCertificationScoringWithComplementaryReferential =
        new ComplementaryCertificationScoringWithoutComplementaryReferential({
          complementaryCertificationCourseId,
          complementaryCertificationBadgeId,
          complementaryCertificationBadgeKey,
          reproducibilityRate: assessmentResult.reproducibilityRate,
          pixScore: assessmentResult.pixScore,
          hasAcquiredPixCertification: assessmentResult.isValidated(),
          minimumEarnedPix,
          minimumReproducibilityRate,
          isRejectedForFraud: certificationCourse.isRejectedForFraud(),
        });
    }

    await complementaryCertificationCourseResultRepository.save(
      ComplementaryCertificationCourseResult.from({
        ...complementaryCertificationScoringWithComplementaryReferential,
        source: ComplementaryCertificationCourseResult.sources.PIX,
        acquired: complementaryCertificationScoringWithComplementaryReferential.isAcquired(),
      }),
    );
  }
}

function _buildComplementaryCertificationScoringWithReferential(
  minimumReproducibilityRate,
  complementaryCertificationCourseId,
  complementaryCertificationBadgeId,
  challenges,
  answers,
  complementaryCertificationBadgeKey,
  assessmentResult,
  certificationCourse,
) {
  const answerCollection = AnswerCollectionForScoring.from({ answers, challenges });
  const reproducibilityRate = ReproducibilityRate.from({
    numberOfNonNeutralizedChallenges: answerCollection.numberOfNonNeutralizedChallenges(),
    numberOfCorrectAnswers: answerCollection.numberOfCorrectAnswers(),
  });

  return new ComplementaryCertificationScoringWithComplementaryReferential({
    minimumReproducibilityRate,
    complementaryCertificationCourseId,
    complementaryCertificationBadgeId,
    reproducibilityRate,
    complementaryCertificationBadgeKey,
    hasAcquiredPixCertification: assessmentResult.isValidated(),
    isRejectedForFraud: certificationCourse.isRejectedForFraud(),
  });
}

handleComplementaryCertificationsScoring.eventTypes = eventTypes;
export { handleComplementaryCertificationsScoring };

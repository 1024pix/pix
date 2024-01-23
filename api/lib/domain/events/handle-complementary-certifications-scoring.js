import { checkEventTypes } from './check-event-types.js';
import { CertificationScoringCompleted } from './CertificationScoringCompleted.js';
import { CertificationRescoringCompleted } from './CertificationRescoringCompleted.js';
import { ReproducibilityRate } from '../models/ReproducibilityRate.js';
import { AnswerCollectionForScoring } from '../models/AnswerCollectionForScoring.js';
import { ComplementaryCertificationScoringWithComplementaryReferential } from '../models/ComplementaryCertificationScoringWithComplementaryReferential.js';
import { ComplementaryCertificationScoringWithoutComplementaryReferential } from '../models/ComplementaryCertificationScoringWithoutComplementaryReferential.js';
import { ComplementaryCertificationCourseResult } from '../models/ComplementaryCertificationCourseResult.js';
import { config } from '../../config.js';
import { status } from '../../../src/shared/domain/models/AssessmentResult.js';

const eventTypes = [CertificationScoringCompleted, CertificationRescoringCompleted];

async function handleComplementaryCertificationsScoring({
  event,
  assessmentResultRepository,
  certificationAssessmentRepository,
  complementaryCertificationCourseResultRepository,
  complementaryCertificationScoringCriteriaRepository,
  certificationCourseRepository,
  complementaryCertificationBadgesRepository,
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

  // FIXME: this loop is irrelevant, there can only be one complementary certification taken on one certificationCourse
  for (const complementaryCertificationScoringCriterion of complementaryCertificationScoringCriteria) {
    const {
      minimumReproducibilityRate,
      minimumReproducibilityRateLowerLevel,
      complementaryCertificationCourseId,
      complementaryCertificationBadgeId,
      complementaryCertificationBadgeKey,
      hasComplementaryReferential,
      minimumEarnedPix,
    } = complementaryCertificationScoringCriterion;
    let complementaryCertificationScoring;

    if (hasComplementaryReferential) {
      const certificationAssessment = await certificationAssessmentRepository.getByCertificationCourseId({
        certificationCourseId,
      });
      const { certificationChallenges: pixPlusChallenges, certificationAnswers: pixPlusAnswers } =
        certificationAssessment.findAnswersAndChallengesForCertifiableBadgeKey(complementaryCertificationBadgeKey);
      complementaryCertificationScoring = _buildComplementaryCertificationScoringWithReferential({
        minimumReproducibilityRate,
        complementaryCertificationCourseId,
        complementaryCertificationBadgeId,
        challenges: pixPlusChallenges,
        answers: pixPlusAnswers,
        complementaryCertificationBadgeKey,
        assessmentResult,
        certificationCourse,
        minimumEarnedPix,
        pixScore: assessmentResult.pixScore,
      });
    } else {
      complementaryCertificationScoring = new ComplementaryCertificationScoringWithoutComplementaryReferential({
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

    if (config.featureToggles.isPixPlusLowerLeverEnabled && hasComplementaryReferential) {
      const complementaryCertificationBadges =
        await complementaryCertificationBadgesRepository.getAllWithSameTargetProfile(complementaryCertificationBadgeId);
      const { level: currentBadgeLevel } = complementaryCertificationBadges.find(
        ({ id }) => complementaryCertificationBadgeId === id,
      );
      const badgeNextLowerLevel = complementaryCertificationBadges.find(_isNextLowerLevel(currentBadgeLevel));

      if (
        assessmentResult.status === status.VALIDATED &&
        !!badgeNextLowerLevel &&
        _hasAcquiredLowerLevel({
          pixScore: assessmentResult.pixScore,
          reproducibilityRate: complementaryCertificationScoring.reproducibilityRate.value,
          minimumEarnedPixForCurrentLevel: minimumEarnedPix,
          minimumEarnedPixForLowerLevel: badgeNextLowerLevel.minimumEarnedPix,
          complementaryCertificationScoring,
          minimumReproducibilityRateLowerLevel,
        })
      ) {
        return await _saveLowerLevel({ complementaryCertificationScoring, badgeNextLowerLevel });
      }
      return await _saveCurrentLevel(
        complementaryCertificationCourseResultRepository,
        complementaryCertificationScoring,
      );
    } else {
      return await _saveCurrentLevel(
        complementaryCertificationCourseResultRepository,
        complementaryCertificationScoring,
      );
    }
  }

  async function _saveLowerLevel({ complementaryCertificationScoring, badgeNextLowerLevel }) {
    await complementaryCertificationCourseResultRepository.save(
      ComplementaryCertificationCourseResult.from({
        ...complementaryCertificationScoring,
        complementaryCertificationBadgeId: badgeNextLowerLevel.id,
        source: ComplementaryCertificationCourseResult.sources.PIX,
        acquired: true,
      }),
    );
  }
}

async function _saveCurrentLevel(complementaryCertificationCourseResultRepository, complementaryCertificationScoring) {
  await complementaryCertificationCourseResultRepository.save(
    ComplementaryCertificationCourseResult.from({
      ...complementaryCertificationScoring,
      source: ComplementaryCertificationCourseResult.sources.PIX,
      acquired: complementaryCertificationScoring.isAcquired(),
    }),
  );
}

function _hasAcquiredLowerLevel({
  pixScore,
  reproducibilityRate,
  minimumEarnedPixForCurrentLevel,
  minimumEarnedPixForLowerLevel,
  complementaryCertificationScoring,
  minimumReproducibilityRateLowerLevel,
}) {
  if (pixScore < minimumEarnedPixForLowerLevel) {
    return false;
  }
  if (reproducibilityRate < minimumReproducibilityRateLowerLevel) {
    return false;
  }
  return (
    (_isBelowMinimumEarnedPixForCurrentLevel({ pixScore, minimumEarnedPixForCurrentLevel }) &&
      _isAboveMinimumEarnedPixForLowerLevel({ pixScore, minimumEarnedPixForLowerLevel })) ||
    (_isBelowMinimumCurrentLevelRequiredReproducibilityRate(complementaryCertificationScoring) &&
      _isAboveMinimumLowerLevelRequiredReproducibilityRate(
        complementaryCertificationScoring,
        minimumReproducibilityRateLowerLevel,
      ))
  );
}

function _isBelowMinimumCurrentLevelRequiredReproducibilityRate(complementaryCertificationScoring) {
  return (
    complementaryCertificationScoring.reproducibilityRate.value <
    complementaryCertificationScoring.minimumReproducibilityRate
  );
}

function _isAboveMinimumLowerLevelRequiredReproducibilityRate(
  complementaryCertificationScoring,
  minimumReproducibilityRateLowerLevel,
) {
  return complementaryCertificationScoring.reproducibilityRate.value >= minimumReproducibilityRateLowerLevel;
}

function _isBelowMinimumEarnedPixForCurrentLevel({ pixScore, minimumEarnedPixForCurrentLevel }) {
  return pixScore < minimumEarnedPixForCurrentLevel;
}

function _isAboveMinimumEarnedPixForLowerLevel({ pixScore, minimumEarnedPixForLowerLevel }) {
  return pixScore >= minimumEarnedPixForLowerLevel;
}

function _buildComplementaryCertificationScoringWithReferential({
  minimumReproducibilityRate,
  complementaryCertificationCourseId,
  complementaryCertificationBadgeId,
  challenges,
  answers,
  complementaryCertificationBadgeKey,
  assessmentResult,
  certificationCourse,
  pixScore,
  minimumEarnedPix,
}) {
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
    pixScore,
    minimumEarnedPix,
  });
}

function _isNextLowerLevel(badgeLevel) {
  return ({ level }) => badgeLevel - level === 1;
}

handleComplementaryCertificationsScoring.eventTypes = eventTypes;
export { handleComplementaryCertificationsScoring };

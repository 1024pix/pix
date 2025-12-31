/**
 * @typedef {import('../index.js').AssessmentResultRepository} AssessmentResultRepository
 * @typedef {import('../index.js').CertificationAssessmentRepository} CertificationAssessmentRepository
 * @typedef {import('../index.js').CertificationAssessmentHistoryRepository} ComplementaryCertificationCourseResultRepository
 * @typedef {import('../index.js').CertificationCourseRepository} CertificationCourseRepository
 * @typedef {import('../index.js').ComplementaryCertificationBadgesRepository} ComplementaryCertificationBadgesRepository
 */

import { AnswerCollectionForScoring } from '../../../../shared/domain/models/AnswerCollectionForScoring.js';
import { ComplementaryCertificationCourseResult } from '../../../../shared/domain/models/ComplementaryCertificationCourseResult.js';
import { ComplementaryCertificationKeys } from '../../../../shared/domain/models/ComplementaryCertificationKeys.js';
import { ReproducibilityRate } from '../../../../shared/domain/models/ReproducibilityRate.js';
import { SCOPES } from '../../../../shared/domain/models/Scopes.js';
import { ComplementaryCertificationScoringWithComplementaryReferential } from '../../models/ComplementaryCertificationScoringWithComplementaryReferential.js';
import { ComplementaryCertificationScoringWithoutComplementaryReferential } from '../../models/ComplementaryCertificationScoringWithoutComplementaryReferential.js';

/**
 * @param {object} params
 * @param {AssessmentResultRepository} params.assessmentResultRepository
 * @param {CertificationAssessmentRepository} params.certificationAssessmentRepository
 * @param {ComplementaryCertificationCourseResultRepository} params.complementaryCertificationCourseResultRepository
 * @param {CertificationCourseRepository} params.certificationCourseRepository
 * @param {ComplementaryCertificationBadgesRepository} params.complementaryCertificationBadgesRepository
 */
export async function scoreComplementaryCertificationV2({
  certificationCourseId,
  complementaryCertificationScoringCriteria,
  assessmentResultRepository,
  certificationAssessmentRepository,
  complementaryCertificationCourseResultRepository,
  certificationCourseRepository,
  certificationCandidateRepository,
  complementaryCertificationBadgesRepository,
}) {
  const certificationCourse = await certificationCourseRepository.get({ id: certificationCourseId });
  const assessmentResult = await assessmentResultRepository.getByCertificationCourseId({ certificationCourseId });

  const {
    minimumReproducibilityRate,
    minimumReproducibilityRateLowerLevel,
    complementaryCertificationCourseId,
    complementaryCertificationBadgeId,
    complementaryCertificationBadgeKey,
    minimumEarnedPix,
  } = complementaryCertificationScoringCriteria;

  const candidate = await certificationCandidateRepository.findByAssessmentId({
    assessmentId: assessmentResult.assessmentId,
  });

  const complementaryCertificationKey =
    candidate.subscriptionScope !== SCOPES.CORE ? candidate.subscriptionScope : undefined;

  const complementaryCertificationScoring = await _buildComplementaryCertificationScoring({
    certificationAssessmentRepository,
    certificationCourseId,
    complementaryCertificationBadgeKey,
    complementaryCertificationKey,
    minimumReproducibilityRate,
    complementaryCertificationCourseId,
    complementaryCertificationBadgeId,
    assessmentResult,
    certificationCourse,
    minimumEarnedPix,
  });

  const { computedComplementaryCertificationBadgeId, isAcquired, isLowerLevelComplementaryCertificationAcquired } =
    await _getComplementaryCertificationResultInformation({
      complementaryCertificationScoring,
      complementaryCertificationKey,
      complementaryCertificationBadgesRepository,
      assessmentResult,
      minimumReproducibilityRateLowerLevel,
    });

  return _saveResult({
    complementaryCertificationCourseResultRepository,
    assessmentResultRepository,
    complementaryCertificationScoring,
    complementaryCertificationBadgeId: computedComplementaryCertificationBadgeId,
    acquired: isAcquired,
    isLowerLevelComplementaryCertificationAcquired,
    assessmentResultId: assessmentResult.id,
  });
}

async function _getComplementaryCertificationResultInformation({
  complementaryCertificationScoring,
  complementaryCertificationKey,
  complementaryCertificationBadgesRepository,
  assessmentResult,
  minimumReproducibilityRateLowerLevel,
}) {
  if (
    complementaryCertificationKey &&
    complementaryCertificationKey !== ComplementaryCertificationKeys.CLEA &&
    assessmentResult.isValidated()
  ) {
    const lowerLevelComplementaryCertificationBadge = await _getNextLowerLevelBadge(
      complementaryCertificationBadgesRepository,
      complementaryCertificationScoring.complementaryCertificationBadgeId,
    );

    if (
      !!lowerLevelComplementaryCertificationBadge &&
      _hasAcquiredLowerLevelBadge({
        pixScore: assessmentResult.pixScore,
        reproducibilityRate: complementaryCertificationScoring.reproducibilityRate.value,
        minimumEarnedPixForCurrentLevel: complementaryCertificationScoring.minimumEarnedPix,
        minimumEarnedPixForLowerLevel: lowerLevelComplementaryCertificationBadge.minimumEarnedPix,
        complementaryCertificationScoring,
        minimumReproducibilityRateLowerLevel,
      })
    ) {
      return {
        isAcquired: true,
        computedComplementaryCertificationBadgeId: lowerLevelComplementaryCertificationBadge.id,
        isLowerLevelComplementaryCertificationAcquired: true,
      };
    }
  }
  return {
    isAcquired: complementaryCertificationScoring.isAcquired(),
    computedComplementaryCertificationBadgeId: complementaryCertificationScoring.complementaryCertificationBadgeId,
  };
}

async function _saveResult({
  complementaryCertificationCourseResultRepository,
  assessmentResultRepository,
  complementaryCertificationScoring,
  acquired,
  complementaryCertificationBadgeId,
  isLowerLevelComplementaryCertificationAcquired,
  assessmentResultId,
}) {
  await complementaryCertificationCourseResultRepository.save(
    ComplementaryCertificationCourseResult.from({
      complementaryCertificationCourseId: complementaryCertificationScoring.complementaryCertificationCourseId,
      label: complementaryCertificationScoring.label,
      complementaryCertificationBadgeId,
      source: ComplementaryCertificationCourseResult.sources.PIX,
      acquired,
    }),
  );

  if (isLowerLevelComplementaryCertificationAcquired) {
    await assessmentResultRepository.updateToAcquiredLowerLevelComplementaryCertification({ id: assessmentResultId });
  }
}

async function _getNextLowerLevelBadge(complementaryCertificationBadgesRepository, complementaryCertificationBadgeId) {
  const complementaryCertificationBadges = await complementaryCertificationBadgesRepository.getAllWithSameTargetProfile(
    complementaryCertificationBadgeId,
  );
  const { level: currentBadgeLevel } = complementaryCertificationBadges.find(
    ({ id }) => complementaryCertificationBadgeId === id,
  );
  const badgeNextLowerLevel = complementaryCertificationBadges.find(_isNextLowerLevel(currentBadgeLevel));
  return badgeNextLowerLevel;
}

async function _buildComplementaryCertificationScoring({
  complementaryCertificationKey,
  certificationAssessmentRepository,
  certificationCourseId,
  complementaryCertificationBadgeKey,
  minimumReproducibilityRate,
  complementaryCertificationCourseId,
  complementaryCertificationBadgeId,
  assessmentResult,
  certificationCourse,
  minimumEarnedPix,
}) {
  if (complementaryCertificationKey && complementaryCertificationKey !== ComplementaryCertificationKeys.CLEA) {
    const certificationAssessment = await certificationAssessmentRepository.getByCertificationCourseId({
      certificationCourseId,
    });
    const { certificationChallenges: pixPlusChallenges, certificationAnswers: pixPlusAnswers } =
      certificationAssessment.findAnswersAndChallengesForCertifiableBadgeKey(complementaryCertificationBadgeKey);
    return _buildComplementaryCertificationScoringWithReferential({
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
  }
  return new ComplementaryCertificationScoringWithoutComplementaryReferential({
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

function _hasAcquiredLowerLevelBadge({
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
    pixScore: assessmentResult.pixScore,
    minimumEarnedPix,
  });
}

function _isNextLowerLevel(badgeLevel) {
  return ({ level }) => badgeLevel - level === 1;
}

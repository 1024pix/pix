/**
 * @typedef {import('../../models/Candidate.js')} Candidate
 * @typedef {import('../../models/FlashAssessmentAlgorithm.js')} FlashAssessmentAlgorithm
 * @typedef {import('../../models/V3CertificationScoring.js')} V3CertificationScoring
 * @typedef {import('../../models/CalibratedChallenge.js').CalibratedChallenge} CalibratedChallenge
 * @typedef {import('../../../../../shared/domain/models/AssessmentResult.js')} AssessmentResult
 * @typedef {import('../../models/AssessmentSheet.js')} AssessmentSheet
 * @typedef {import('../../models/ComplementaryCertificationScoringCriteria.js')} ComplementaryCertificationScoringCriteria
 * @typedef {import('../index.js').services.scoringDegradationService} ScoringDegradationService
 * @typedef {import('../../../../../shared/domain/events/CertificationCourseUnrejected.js').CertificationCourseUnrejected} CertificationCourseUnrejected
 * @typedef {import('../../../../../shared/domain/events/CertificationUncancelled.js').default} CertificationUncancelled
 * @typedef {import('../../../../session-management/domain/events/CertificationCourseRejected.js').CertificationCourseRejected} CertificationCourseRejected
 * @typedef {import('../../../../session-management/domain/events/CertificationJuryDone.js').CertificationJuryDone} CertificationJuryDone
 * @typedef {import('../../events/CertificationRescored.js').default} CertificationRescored
 * @typedef {import('../../events/CertificationCompleted.js').default} CertificationCompleted
 * @typedef {CertificationJuryDone | CertificationCourseRejected | CertificationCourseUnrejected | CertificationCancelled | CertificationRescored | CertificationUncancelled | CertificationCompleted} CertificationScoringEvent
 */

import CertificationCancelled from '../../../../../shared/domain/events/CertificationCancelled.js';
import { status as CertificationStatus } from '../../../../../shared/domain/models/AssessmentResult.js';
import { ABORT_REASONS } from '../../../../shared/domain/constants/abort-reasons.js';
import { Frameworks, hasCoreScope } from '../../../../shared/domain/models/Frameworks.js';
import { DoubleCertificationScoring } from '../../models/DoubleCertificationScoring.js';
import { ScoringV3Algorithm } from '../../models/ScoringV3Algorithm.js';
import { createV3AssessmentResult } from './create-v3-assessment-result.js';

/**
 * @param {object} params
 * @param {CertificationScoringEvent} [params.event]
 * @param {AssessmentSheet} params.assessmentSheet
 * @param {FlashAssessmentAlgorithm} params.algorithm
 * @param {V3CertificationScoring} params.v3CertificationScoring
 * @param {Array<CalibratedChallenge>} params.allChallenges
 * @param {Array<CalibratedChallenge>} params.askedChallengesWithoutLiveAlerts
 * @param {ComplementaryCertificationScoringCriteria} params.cleaScoringCriteria
 * @param {ScoringDegradationService} params.scoringDegradationService
 *
 * @return {Object<AssessmentResult, DoubleCertificationScoring>}
 */
export function handleV3CertificationScoring({
  event,
  assessmentSheet,
  allChallenges,
  askedChallengesWithoutLiveAlerts,
  algorithm,
  v3CertificationScoring,
  cleaScoringCriteria,
  scoringDegradationService,
}) {
  const scoringV3Algorithm = new ScoringV3Algorithm({
    algorithm,
    allAnswers: [...assessmentSheet.answers],
    allChallenges,
    askedChallenges: askedChallengesWithoutLiveAlerts,
    v3CertificationScoring,
    downgradeCapacityFunction: scoringDegradationService.downgradeCapacity,
  });
  const maximumAssessmentLength = algorithm.getConfiguration().maximumAssessmentLength;

  const assessmentResult = scoreCertification({
    event,
    scoringV3Algorithm,
    assessmentSheet,
    maximumAssessmentLength,
    minimumAnswersRequiredToValidateACertification:
      v3CertificationScoring.minimumAnswersRequiredToValidateACertification,
    versionId: v3CertificationScoring.versionId,
    certificationFramework: assessmentSheet.certificationFramework,
  });

  let doubleCertificationScoring = null;
  if (assessmentSheet.certificationFramework === Frameworks.CLEA) {
    doubleCertificationScoring = _scoreDoubleCertification({
      assessmentSheet,
      assessmentResult,
      cleaScoringCriteria,
    });
  }
  return {
    coreAssessmentResult: assessmentResult,
    doubleCertificationScoring,
  };
}

/**
 * @param {object} params
 * @param {CertificationScoringEvent} params.event
 * @param {ScoringV3Algorithm} params.scoringV3Algorithm
 * @param {AssessmentSheet} params.assessmentSheet
 * @param {number} params.maximumAssessmentLength
 * @param {number} params.minimumAnswersRequiredToValidateACertification
 * @param {number} params.versionId
 * @param {SCOPES} params.certificationScope
 *
 * @returns {AssessmentResult}
 */
function scoreCertification({
  event,
  scoringV3Algorithm,
  assessmentSheet,
  maximumAssessmentLength,
  minimumAnswersRequiredToValidateACertification,
  versionId,
}) {
  const downgradeCapacity = shouldDowngradeCapacity({
    maximumAssessmentLength,
    answers: assessmentSheet.answers,
    abortReason: assessmentSheet.abortReason,
    minimumAnswersRequiredToValidateACertification,
  });

  const capacity = scoringV3Algorithm.computeCapacity({ shouldDowngradeCapacity: downgradeCapacity });
  const pixScore = hasCoreScope(assessmentSheet.certificationFramework)
    ? scoringV3Algorithm.computePixScoreFromCapacity({ capacity })
    : null;
  const reachedMeshIndex = scoringV3Algorithm.computeReachedMeshIndex({ capacity });
  const competenceMarks = scoringV3Algorithm.computeCompetenceMarks({ capacity });

  const status =
    hasNotEnoughAnswers({
      answers: assessmentSheet.answers,
      abortReason: assessmentSheet.abortReason,
      minimumAnswersRequiredToValidateACertification,
    }) || reachedMeshIndex === null
      ? CertificationStatus.REJECTED
      : CertificationStatus.VALIDATED;

  const toBeCancelled = event instanceof CertificationCancelled;
  const assessmentResult = createV3AssessmentResult({
    toBeCancelled,
    allAnswers: assessmentSheet.answers,
    assessmentId: assessmentSheet.assessmentId,
    pixScore,
    capacity,
    reachedMeshIndex,
    versionId,
    status,
    competenceMarks,
    isRejectedForFraud: assessmentSheet.isRejectedForFraud,
    isAbortReasonTechnical: assessmentSheet.isAbortReasonTechnical,
    juryId: event?.juryId,
    minimumAnswersRequiredToValidateACertification,
    certificationFramework: assessmentSheet.certificationFramework,
  });
  return assessmentResult;
}

/**
 * @param {object} params
 * @param {AssessmentSheet} params.assessmentSheet
 * @param {AssessmentResult} params.assessmentResult
 * @param {ComplementaryCertificationScoringCriteria} params.cleaScoringCriteria
 *
 * @returns {DoubleCertificationScoring}
 */
function _scoreDoubleCertification({ assessmentSheet, assessmentResult, cleaScoringCriteria }) {
  return new DoubleCertificationScoring({
    complementaryCertificationCourseId: cleaScoringCriteria.complementaryCertificationCourseId,
    complementaryCertificationBadgeId: cleaScoringCriteria.complementaryCertificationBadgeId,
    pixScore: assessmentResult.pixScore,
    minimumEarnedPix: cleaScoringCriteria.minimumEarnedPix,
    hasAcquiredPixCertification: assessmentResult.isValidated(),
    isRejectedForFraud: assessmentSheet.isRejectedForFraud,
  });
}

function shouldDowngradeCapacity({
  maximumAssessmentLength,
  answers,
  abortReason,
  minimumAnswersRequiredToValidateACertification,
}) {
  return (
    answers.length >= minimumAnswersRequiredToValidateACertification &&
    answers.length < maximumAssessmentLength &&
    abortReason === ABORT_REASONS.CANDIDATE
  );
}

function hasNotEnoughAnswers({ answers, abortReason, minimumAnswersRequiredToValidateACertification }) {
  // Dans la vraie vie, en cas de nombre de réponses insuffisant, la certif est rejetée seulement si l'abortReason est "candidate"
  // ici on ne regarde pas la valeur de abortReason ce qui n'est pas très clair. Le coup est rattrapé plus tard dans createV3AssessmentResult ( et c'est moche )
  return answers.length < minimumAnswersRequiredToValidateACertification && abortReason;
}

/**
 * @typedef {import('../../../models/Candidate.js')} Candidate
 * @typedef {import('../../../models/AssessmentSheet.js')} AssessmentSheet
 * @typedef {import('../index.js').SharedVersionRepository} SharedVersionRepository
 * @typedef {import('../index.js').ScoringConfigurationRepository} ScoringConfigurationRepository
 * @typedef {import('../index.js').AssessmentResultRepository} AssessmentResultRepository
 * @typedef {import('../index.js').CompetenceMarkRepository} CompetenceMarkRepository
 * @typedef {import('../index.js').FlashAlgorithmService} FlashAlgorithmService
 * @typedef {import('../index.js').ScoringDegradationService} ScoringDegradationService
 * @typedef {import('../index.js').CertificationAssessmentHistoryRepository} CertificationAssessmentHistoryRepository
 */
/**
 * @typedef {object} ScoringV3Dependencies
 * @property {FindByCertificationCourseAndVersion} findByCertificationCourseAndVersion
 */

import CertificationCancelled from '../../../../../../src/shared/domain/events/CertificationCancelled.js';
import { config } from '../../../../../shared/config.js';
import { withTransaction } from '../../../../../shared/domain/DomainTransaction.js';
import { FlashAssessmentAlgorithm } from '../../../../evaluation/domain/models/FlashAssessmentAlgorithm.js';
import { CertificationAssessmentHistory } from '../../../../scoring/domain/models/CertificationAssessmentHistory.js';
import { CertificationAssessmentScoreV3 } from '../../../../scoring/domain/models/CertificationAssessmentScoreV3.js';
import { AssessmentResultFactory } from '../../../../scoring/domain/models/factories/AssessmentResultFactory.js';
import { CompetenceMark } from '../../../../shared/domain/models/CompetenceMark.js';

export const handleV3CertificationScoring = withTransaction(
  /**
   * @param {object} params
   * @param {object} params.event
   * @param {string} params.locale
   * @param {Candidate} params.candidate
   * @param {AssessmentSheet} params.assessmentSheet
   * @param {FlashAlgorithmService} params.flashAlgorithmService
   * @param {ScoringDegradationService} params.scoringDegradationService
   * @param {CertificationAssessmentHistoryRepository} params.certificationAssessmentHistoryRepository
   * @param {AssessmentResultRepository} params.assessmentResultRepository
   * @param {CompetenceMarkRepository} params.competenceMarkRepository
   * @param {ScoringConfigurationRepository} params.scoringConfigurationRepository
   * @param {SharedVersionRepository} params.sharedVersionRepository
   * @param {ScoringV3Dependencies} params.scoringV3Deps
   *
   * @return {boolean}
   */
  async ({
    event,
    locale,
    candidate,
    assessmentSheet,
    flashAlgorithmService,
    scoringDegradationService,
    sharedVersionRepository,
    certificationAssessmentHistoryRepository,
    scoringConfigurationRepository,
    assessmentResultRepository,
    competenceMarkRepository,
    scoringV3Deps,
  }) => {
    if (candidate.hasPixPlusSubscription) {
      return false;
    }

    if (candidate.hasOnlyCoreSubscription) {
      const version = await sharedVersionRepository.getByScopeAndReconciliationDate({
        scope: candidate.subscriptionScope,
        reconciliationDate: candidate.reconciledAt,
      });
      // todo refacto calibrated-challenge-service to take assessmentSheet
      const certificationCourse = {
        getId: () => assessmentSheet.certificationCourseId,
        getAssessment: () => ({ id: assessmentSheet.assessmentId }),
      };
      const { allChallenges, askedChallengesWithoutLiveAlerts, challengeCalibrationsWithoutLiveAlerts } =
        await scoringV3Deps.findByCertificationCourseAndVersion({ certificationCourse, version });

      const algorithm = new FlashAssessmentAlgorithm({
        flashAlgorithmImplementation: flashAlgorithmService,
        configuration: version.challengesConfiguration,
      });

      const v3CertificationScoring = await scoringConfigurationRepository.getLatestByVersionAndLocale({
        locale,
        version,
      });

      const certificationAssessmentScore = CertificationAssessmentScoreV3.fromChallengesAndAnswers({
        abortReason: assessmentSheet.abortReason,
        algorithm,
        // The following spread operation prevents the original array to be mutated during the simulation
        // so that in can be used during the assessment result creation
        allAnswers: [...assessmentSheet.answers],
        allChallenges,
        challenges: askedChallengesWithoutLiveAlerts,
        maxReachableLevelOnCertificationDate: assessmentSheet.maxReachableLevelOnCertificationDate,
        v3CertificationScoring,
        scoringDegradationService,
      });

      const toBeCancelled = event instanceof CertificationCancelled;
      const assessmentResult = _createV3AssessmentResult({
        toBeCancelled,
        allAnswers: assessmentSheet.answers,
        assessmentId: assessmentSheet.assessmentId,
        certificationAssessmentScore,
        isRejectedForFraud: assessmentSheet.isRejectedForFraud,
        isAbortReasonTechnical: assessmentSheet.isAbortReasonTechnical,
        juryId: event?.juryId,
      });

      const certificationAssessmentHistory = CertificationAssessmentHistory.fromChallengesAndAnswers({
        algorithm,
        challenges: challengeCalibrationsWithoutLiveAlerts,
        allAnswers: assessmentSheet.answers,
      });

      await certificationAssessmentHistoryRepository.save(certificationAssessmentHistory);

      await _saveV3Result({
        assessmentResult,
        certificationCourseId: assessmentSheet.certificationCourseId,
        certificationAssessmentScore,
        assessmentResultRepository,
        competenceMarkRepository,
      });

      return true;
    }

    if (candidate.hasCleaSubscription) {
      return true;
    }
  },
);

function _createV3AssessmentResult({
  toBeCancelled,
  allAnswers,
  assessmentId,
  certificationAssessmentScore,
  isRejectedForFraud,
  isAbortReasonTechnical,
  juryId,
}) {
  if (toBeCancelled) {
    return AssessmentResultFactory.buildCancelledAssessmentResult({
      juryId,
      pixScore: certificationAssessmentScore.nbPix,
      reproducibilityRate: certificationAssessmentScore.getPercentageCorrectAnswers(),
      assessmentId,
    });
  }

  if (isRejectedForFraud) {
    return AssessmentResultFactory.buildFraud({
      pixScore: certificationAssessmentScore.nbPix,
      reproducibilityRate: certificationAssessmentScore.getPercentageCorrectAnswers(),
      assessmentId,
      juryId,
    });
  }

  if (_shouldRejectWhenV3CertificationCandidateDidNotAnswerToEnoughQuestions({ allAnswers, isAbortReasonTechnical })) {
    return AssessmentResultFactory.buildLackOfAnswers({
      pixScore: certificationAssessmentScore.nbPix,
      reproducibilityRate: certificationAssessmentScore.getPercentageCorrectAnswers(),
      status: certificationAssessmentScore.status,
      assessmentId,
      juryId,
    });
  }

  if (_hasV3CertificationLacksOfAnswersForTechnicalReason({ allAnswers, isAbortReasonTechnical })) {
    return AssessmentResultFactory.buildLackOfAnswersForTechnicalReason({
      pixScore: certificationAssessmentScore.nbPix,
      reproducibilityRate: certificationAssessmentScore.getPercentageCorrectAnswers(),
      assessmentId,
      juryId,
    });
  }

  if (certificationAssessmentScore.nbPix === 0) {
    return AssessmentResultFactory.buildRejectedDueToZeroPixScore({
      pixScore: certificationAssessmentScore.nbPix,
      reproducibilityRate: certificationAssessmentScore.getPercentageCorrectAnswers(),
      assessmentId,
      juryId,
      competenceMarks: certificationAssessmentScore.competenceMarks,
    });
  }

  return AssessmentResultFactory.buildStandardAssessmentResult({
    pixScore: certificationAssessmentScore.nbPix,
    reproducibilityRate: certificationAssessmentScore.getPercentageCorrectAnswers(),
    status: certificationAssessmentScore.status,
    assessmentId,
    juryId,
  });
}

function _shouldRejectWhenV3CertificationCandidateDidNotAnswerToEnoughQuestions({
  allAnswers,
  isAbortReasonTechnical,
}) {
  if (isAbortReasonTechnical) {
    return false;
  }
  return _candidateDidNotAnswerEnoughV3CertificationQuestions({ allAnswers });
}

function _candidateDidNotAnswerEnoughV3CertificationQuestions({ allAnswers }) {
  return allAnswers.length < config.v3Certification.scoring.minimumAnswersRequiredToValidateACertification;
}

function _hasV3CertificationLacksOfAnswersForTechnicalReason({ allAnswers, isAbortReasonTechnical }) {
  return isAbortReasonTechnical && _candidateDidNotAnswerEnoughV3CertificationQuestions({ allAnswers });
}

/**
 * @param {object} params
 * @param {AssessmentResult} params.assessmentResult
 * @param {number} params.certificationCourseId
 * @param {CertificationAssessmentScoreV3} params.certificationAssessmentScore
 * @param {AssessmentResultRepository} params.assessmentResultRepository
 * @param {CompetenceMarkRepository} params.competenceMarkRepository
 */
async function _saveV3Result({
  assessmentResult,
  certificationCourseId,
  certificationAssessmentScore,
  assessmentResultRepository,
  competenceMarkRepository,
}) {
  const newAssessmentResult = await assessmentResultRepository.save({
    certificationCourseId,
    assessmentResult,
  });

  for (const competenceMark of certificationAssessmentScore.competenceMarks) {
    const competenceMarkDomain = new CompetenceMark({
      ...competenceMark,
      assessmentResultId: newAssessmentResult.id,
    });
    await competenceMarkRepository.save(competenceMarkDomain);
  }
}

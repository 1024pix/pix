/**
 * @typedef {import('./index.js').Services} Services
 * @typedef {import('./index.js').AssessmentSheetRepository} AssessmentSheetRepository
 * @typedef {import('./index.js').SharedVersionRepository} SharedVersionRepository
 * @typedef {import('./index.js').CertificationCandidateRepository} CertificationCandidateRepository
 */

import { withTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { FlashAssessmentAlgorithm } from '../../../evaluation/domain/models/FlashAssessmentAlgorithm.js';
import { CertificationAssessmentHistory } from '../../../scoring/domain/models/CertificationAssessmentHistory.js';
import { SessionAlreadyPublishedError } from '../../../session-management/domain/errors.js';
import { CompetenceMark } from '../../../shared/domain/models/CompetenceMark.js';
import { ComplementaryCertificationCourseResult } from '../../../shared/domain/models/ComplementaryCertificationCourseResult.js';

export const scoreV3Certification = withTransaction(
  /**
   * @param {object} params
   * @param {number} param.certificationCourseId
   * @param {string} params.locale
   * @param {Services} params.services
   * @param {AssessmentSheetRepository} params.assessmentSheetRepository
   * @param {CertificationCandidateRepository} params.certificationCandidateRepository
   * @param {SharedVersionRepository} params.sharedVersionRepository
   * @param {AssessmentResultRepository} params.assessmentResultRepository
   * @param {CompetenceMarkRepository} params.competenceMarkRepository
   * @param {CertificationAssessmentHistoryRepository} params.certificationAssessmentHistoryRepository
   * @param {CertificationCourseRepository} params.certificationCourseRepository
   * @param {ComplementaryCertificationCourseResultRepository} params.complementaryCertificationCourseResultRepository
   * @param {ScoringConfigurationRepository} params.scoringConfigurationRepository
   */
  async (
    certificationCourseId,
    locale,
    services,
    assessmentSheetRepository,
    certificationCandidateRepository,
    sharedVersionRepository,
    assessmentResultRepository,
    competenceMarkRepository,
    certificationAssessmentHistoryRepository,
    certificationCourseRepository,
    complementaryCertificationCourseResultRepository,
    scoringConfigurationRepository,
  ) => {
    const assessmentSheet = await assessmentSheetRepository.findByCertificationCourseId(certificationCourseId);

    const candidate = await certificationCandidateRepository.findByAssessmentId({
      assessmentId: assessmentSheet.assessmentId,
    });

    // version, allChallenges, askedChallengesWithoutLiveAlerts, algorithm and v3CertificationScoring could be its own "exam conditions" model
    const version = await sharedVersionRepository.getByScopeAndReconciliationDate({
      scope: candidate.subscriptionScope,
      reconciliationDate: candidate.reconciledAt,
    });

    const { allChallenges, askedChallengesWithoutLiveAlerts, challengeCalibrationsWithoutLiveAlerts } =
      await services.findByCertificationCourseAndVersion({
        certificationCourseId: assessmentSheet.certificationCourseId,
        assessmentId: assessmentSheet.assessmentId,
        version,
      });

    const algorithm = new FlashAssessmentAlgorithm({
      flashAlgorithmImplementation: services.flashAlgorithmService,
      configuration: version.challengesConfiguration,
    });

    const v3CertificationScoring = await scoringConfigurationRepository.getLatestByVersionAndLocale({
      locale,
      version,
    });

    //add condition on calling scoring : the certification cannot be in a published session, it must be either in a finalized session or completed (candidate answered all the questions and saw the end screen)

    //coreScoring could be a model like doubleCertificationScoring
    const { coreScoring, doubleCertificationScoring } = services.handleV3CertificationScoring({
      locale,
      candidate,
      assessmentSheet,
      allChallenges,
      askedChallengesWithoutLiveAlerts,
      algorithm,
      v3CertificationScoring,
    });

    const certificationAssessmentHistory = CertificationAssessmentHistory.fromChallengesAndAnswers({
      algorithm,
      challenges: challengeCalibrationsWithoutLiveAlerts,
      allAnswers: assessmentSheet.answers,
    });
    await certificationAssessmentHistoryRepository.save(certificationAssessmentHistory);

    await _saveV3Result({
      assessmentResult: coreScoring.assessmentResult,
      certificationCourseId: assessmentSheet.certificationCourseId,
      certificationAssessmentScore: coreScoring.certificationAssessmentScore,
      assessmentResultRepository,
      competenceMarkRepository,
      certificationCourseRepository,
    });

    if (doubleCertificationScoring) {
      await complementaryCertificationCourseResultRepository.save(
        ComplementaryCertificationCourseResult.from({
          complementaryCertificationCourseId: doubleCertificationScoring.complementaryCertificationCourseId,
          complementaryCertificationBadgeId: doubleCertificationScoring.complementaryCertificationBadgeId,
          source: doubleCertificationScoring.source,
          acquired: doubleCertificationScoring.isAcquired(),
        }),
      );
    }
  },
);

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
  certificationCourseRepository,
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

  //Getting the certificationCourse just to add a completedAt date (that is possibly already set)
  const certificationCourse = await certificationCourseRepository.get({ id: certificationCourseId });
  //Only if certificationCourse.completedAt (private) is null
  certificationCourse.complete({ now: new Date() });
  await certificationCourseRepository.update({ certificationCourse });
}

/**
 * @param {object} params
 * @param {number} params.certificationCourseId
 * @param {EvaluationSessionRepository} params.evaluationSessionRepository
 *
 * @returns {Promise<void>}
 * @throws {NotFinalizedSessionError}
 * @throws {SessionAlreadyPublishedError}
 */
const _verifyCertificationIsScorable = async ({ certificationCourseId, evaluationSessionRepository }) => {
  const session = await evaluationSessionRepository.getByCertificationCourseId({ certificationCourseId });

  if (session.isPublished) {
    throw new SessionAlreadyPublishedError();
  }

  //add chack on if the certification have been finished or not
  if (!session.isFinalized) {
    throw new NotFinalizedSessionError();
  }
};

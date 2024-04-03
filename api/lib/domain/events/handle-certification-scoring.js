import bluebird from 'bluebird';

import { FlashAssessmentAlgorithm } from '../../../src/certification/flash-certification/domain/models/FlashAssessmentAlgorithm.js';
import { CertificationAssessmentHistory } from '../../../src/certification/scoring/domain/models/CertificationAssessmentHistory.js';
import { CertificationAssessmentScoreV3 } from '../../../src/certification/scoring/domain/models/CertificationAssessmentScoreV3.js';
import { AssessmentResultFactory } from '../../../src/certification/scoring/domain/models/factories/AssessmentResultFactory.js';
import { ABORT_REASONS } from '../../../src/certification/shared/domain/models/CertificationCourse.js';
import { CertificationVersion } from '../../../src/certification/shared/domain/models/CertificationVersion.js';
import { config } from '../../../src/shared/config.js';
import { CertificationComputeError } from '../errors.js';
import { CompetenceMark } from '../models/CompetenceMark.js';
import { AssessmentResult } from '../models/index.js';
import { AssessmentCompleted } from './AssessmentCompleted.js';
import { CertificationScoringCompleted } from './CertificationScoringCompleted.js';
import { checkEventTypes } from './check-event-types.js';

const eventTypes = [AssessmentCompleted];

async function handleCertificationScoring({
  event,
  assessmentResultRepository,
  badgeAcquisitionRepository,
  certificationAssessmentHistoryRepository,
  certificationAssessmentRepository,
  certificationCourseRepository,
  certificationChallengeForScoringRepository,
  competenceMarkRepository,
  scoringConfigurationRepository,
  scoringCertificationService,
  answerRepository,
  flashAlgorithmConfigurationRepository,
  flashAlgorithmService,
}) {
  checkEventTypes(event, eventTypes);

  if (event.isCertificationType) {
    const certificationAssessment = await certificationAssessmentRepository.get(event.assessmentId);

    if (certificationAssessment.version === CertificationVersion.V3) {
      return _handleV3CertificationScoring({
        answerRepository,
        assessmentId: event.assessmentId,
        certificationAssessment,
        certificationAssessmentHistoryRepository,
        assessmentResultRepository,
        certificationCourseRepository,
        certificationChallengeForScoringRepository,
        scoringConfigurationRepository,
        competenceMarkRepository,
        flashAlgorithmConfigurationRepository,
        flashAlgorithmService,
        locale: event.locale,
      });
    }

    return _handleV2CertificationScoring({
      certificationAssessment,
      assessmentResultRepository,
      certificationCourseRepository,
      competenceMarkRepository,
      scoringCertificationService,
      badgeAcquisitionRepository,
    });
  }

  return null;
}

async function _handleV2CertificationScoring({
  certificationAssessment,
  assessmentResultRepository,
  certificationCourseRepository,
  competenceMarkRepository,
  scoringCertificationService,
}) {
  try {
    const certificationAssessmentScore = await scoringCertificationService.calculateCertificationAssessmentScore({
      certificationAssessment,
      continueOnError: false,
    });
    const certificationCourse = await certificationCourseRepository.get({
      id: certificationAssessment.certificationCourseId,
    });

    certificationCourse.complete({ now: new Date() });

    const assessmentResult = await _createV2AssessmentResult({
      certificationAssessment,
      certificationAssessmentScore,
      certificationCourse,
    });

    await _saveV2Result({
      assessmentResult,
      certificationAssessmentScore,
      certificationAssessment,
      certificationCourse,
      assessmentResultRepository,
      certificationCourseRepository,
      competenceMarkRepository,
    });
    return new CertificationScoringCompleted({
      userId: certificationAssessment.userId,
      certificationCourseId: certificationAssessment.certificationCourseId,
      reproducibilityRate: certificationAssessmentScore.percentageCorrectAnswers,
    });
  } catch (error) {
    if (!(error instanceof CertificationComputeError)) {
      throw error;
    }
    await _saveResultAfterCertificationComputeError({
      certificationAssessment,
      assessmentResultRepository,
      certificationCourseRepository,
      certificationComputeError: error,
    });
  }
}

async function _handleV3CertificationScoring({
  certificationAssessmentHistoryRepository,
  certificationChallengeForScoringRepository,
  answerRepository,
  assessmentId,
  certificationAssessment,
  assessmentResultRepository,
  certificationCourseRepository,
  competenceMarkRepository,
  scoringConfigurationRepository,
  flashAlgorithmConfigurationRepository,
  flashAlgorithmService,
  locale,
}) {
  const { certificationCourseId } = certificationAssessment;
  const allAnswers = await answerRepository.findByAssessment(assessmentId);
  const challenges = await certificationChallengeForScoringRepository.getByCertificationCourseId({
    certificationCourseId,
  });

  const certificationCourse = await certificationCourseRepository.get({ id: certificationCourseId });

  const abortReason = certificationCourse.isAbortReasonCandidateRelated()
    ? ABORT_REASONS.CANDIDATE
    : ABORT_REASONS.TECHNICAL;

  const configuration = await flashAlgorithmConfigurationRepository.getMostRecentBeforeDate(
    certificationCourse.getStartDate(),
  );

  const algorithm = new FlashAssessmentAlgorithm({
    flashAlgorithmImplementation: flashAlgorithmService,
    configuration,
  });

  const v3CertificationScoring = await scoringConfigurationRepository.getLatestByDateAndLocale({
    locale,
    date: certificationCourse.getStartDate(),
  });

  const certificationAssessmentScore = CertificationAssessmentScoreV3.fromChallengesAndAnswers({
    algorithm,
    challenges,
    allAnswers,
    abortReason,
    maxReachableLevelOnCertificationDate: certificationCourse.getMaxReachableLevelOnCertificationDate(),
    v3CertificationScoring,
  });

  if (_shouldCancelWhenV3CertificationLacksOfAnswersForTechnicalReason({ allAnswers, certificationCourse })) {
    certificationCourse.cancel();
  } else {
    certificationCourse.complete({ now: new Date() });
  }

  const certificationAssessmentHistory = CertificationAssessmentHistory.fromChallengesAndAnswers({
    algorithm,
    challenges,
    allAnswers,
  });

  await certificationAssessmentHistoryRepository.save(certificationAssessmentHistory);

  const assessmentResult = await _createV3AssessmentResult({
    certificationAssessment,
    certificationAssessmentScore,
    allAnswers,
    certificationCourse,
  });

  await _saveV3Result({
    assessmentResult,
    certificationAssessment,
    certificationAssessmentScore,
    assessmentResultRepository,
    certificationCourse,
    certificationCourseRepository,
    competenceMarkRepository,
  });

  return new CertificationScoringCompleted({
    userId: certificationAssessment.userId,
    certificationCourseId: certificationAssessment.certificationCourseId,
    reproducibilityRate: certificationAssessmentScore.getPercentageCorrectAnswers(),
  });
}

function _shouldCancelWhenV3CertificationLacksOfAnswersForTechnicalReason({ allAnswers, certificationCourse }) {
  return (
    certificationCourse.isAbortReasonTechnical() && _candidateDidNotAnswerEnoughV3CertificationQuestions({ allAnswers })
  );
}

function _shouldRejectWhenV3CertificationCandidateDidNotAnswerToEnoughQuestions({ allAnswers, certificationCourse }) {
  if (certificationCourse.isAbortReasonTechnical()) {
    return false;
  }
  return _candidateDidNotAnswerEnoughV3CertificationQuestions({ allAnswers });
}

function _candidateDidNotAnswerEnoughV3CertificationQuestions({ allAnswers }) {
  return allAnswers.length < config.v3Certification.scoring.minimumAnswersRequiredToValidateACertification;
}

async function _saveV2Result({
  assessmentResult,
  certificationAssessmentScore,
  certificationAssessment,
  certificationCourse,
  assessmentResultRepository,
  certificationCourseRepository,
  competenceMarkRepository,
}) {
  const newAssessmentResult = await assessmentResultRepository.save({
    certificationCourseId: certificationAssessment.certificationCourseId,
    assessmentResult,
  });

  await _saveCompetenceMarks({ certificationAssessmentScore, newAssessmentResult, competenceMarkRepository });
  return certificationCourseRepository.update({ certificationCourse });
}

async function _saveV3Result({
  assessmentResult,
  certificationAssessment,
  certificationAssessmentScore,
  assessmentResultRepository,
  certificationCourse,
  certificationCourseRepository,
  competenceMarkRepository,
}) {
  const newAssessmentResult = await assessmentResultRepository.save({
    certificationCourseId: certificationAssessment.certificationCourseId,
    assessmentResult,
  });

  await bluebird.mapSeries(certificationAssessmentScore.competenceMarks, (competenceMark) => {
    const competenceMarkDomain = new CompetenceMark({
      ...competenceMark,
      assessmentResultId: newAssessmentResult.id,
    });
    return competenceMarkRepository.save(competenceMarkDomain);
  });
  return certificationCourseRepository.update({ certificationCourse });
}

function _createV2AssessmentResult({ certificationAssessment, certificationAssessmentScore, certificationCourse }) {
  if (certificationAssessmentScore.hasInsufficientCorrectAnswers()) {
    if (certificationCourse.isAbortReasonTechnical()) {
      certificationCourse.cancel();
      return AssessmentResultFactory.buildLackOfAnswersForTechnicalReason({
        emitter: AssessmentResult.emitters.PIX_ALGO,
        pixScore: certificationAssessmentScore.nbPix,
        reproducibilityRate: certificationAssessmentScore.getPercentageCorrectAnswers(),
        assessmentId: certificationAssessment.id,
        status: AssessmentResult.status.REJECTED,
      });
    }
    return AssessmentResultFactory.buildInsufficientCorrectAnswers({
      emitter: AssessmentResult.emitters.PIX_ALGO,
      pixScore: certificationAssessmentScore.nbPix,
      reproducibilityRate: certificationAssessmentScore.getPercentageCorrectAnswers(),
      assessmentId: certificationAssessment.id,
    });
  }

  return AssessmentResultFactory.buildStandardAssessmentResult({
    pixScore: certificationAssessmentScore.nbPix,
    reproducibilityRate: certificationAssessmentScore.getPercentageCorrectAnswers(),
    status: certificationAssessmentScore.status,
    assessmentId: certificationAssessment.id,
    emitter: AssessmentResult.emitters.PIX_ALGO,
  });
}

async function _saveCompetenceMarks({ certificationAssessmentScore, newAssessmentResult, competenceMarkRepository }) {
  await bluebird.mapSeries(certificationAssessmentScore.competenceMarks, (competenceMark) => {
    const competenceMarkDomain = new CompetenceMark({
      ...competenceMark,
      assessmentResultId: newAssessmentResult.id,
    });
    return competenceMarkRepository.save(competenceMarkDomain);
  });
}

function _createV3AssessmentResult({
  certificationAssessment,
  certificationAssessmentScore,
  allAnswers,
  certificationCourse,
}) {
  if (_shouldRejectWhenV3CertificationCandidateDidNotAnswerToEnoughQuestions({ allAnswers, certificationCourse })) {
    return AssessmentResultFactory.buildLackOfAnswers({
      pixScore: certificationAssessmentScore.nbPix,
      reproducibilityRate: certificationAssessmentScore.getPercentageCorrectAnswers(),
      status: certificationAssessmentScore.status,
      assessmentId: certificationAssessment.id,
      emitter: AssessmentResult.emitters.PIX_ALGO,
    });
  }

  if (_shouldCancelWhenV3CertificationLacksOfAnswersForTechnicalReason({ allAnswers, certificationCourse })) {
    return AssessmentResultFactory.buildLackOfAnswersForTechnicalReason({
      pixScore: certificationAssessmentScore.nbPix,
      reproducibilityRate: certificationAssessmentScore.getPercentageCorrectAnswers(),
      status: certificationAssessmentScore.status,
      assessmentId: certificationAssessment.id,
      emitter: AssessmentResult.emitters.PIX_ALGO,
    });
  }

  return AssessmentResultFactory.buildStandardAssessmentResult({
    pixScore: certificationAssessmentScore.nbPix,
    reproducibilityRate: certificationAssessmentScore.getPercentageCorrectAnswers(),
    status: certificationAssessmentScore.status,
    assessmentId: certificationAssessment.id,
    emitter: AssessmentResult.emitters.PIX_ALGO,
  });
}

async function _saveResultAfterCertificationComputeError({
  certificationAssessment,
  assessmentResultRepository,
  certificationCourseRepository,
  certificationComputeError,
}) {
  const certificationCourse = await certificationCourseRepository.get({
    id: certificationAssessment.certificationCourseId,
  });
  const assessmentResult = AssessmentResultFactory.buildAlgoErrorResult({
    error: certificationComputeError,
    assessmentId: certificationAssessment.id,
    emitter: AssessmentResult.emitters.PIX_ALGO,
  });
  await assessmentResultRepository.save({
    certificationCourseId: certificationAssessment.certificationCourseId,
    assessmentResult,
  });
  certificationCourse.complete({ now: new Date() });
  return certificationCourseRepository.update({ certificationCourse });
}

handleCertificationScoring.eventTypes = eventTypes;
export { handleCertificationScoring };

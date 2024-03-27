import bluebird from 'bluebird';

import { FlashAssessmentAlgorithm } from '../../../src/certification/flash-certification/domain/models/FlashAssessmentAlgorithm.js';
import { CertificationAssessmentHistory } from '../../../src/certification/scoring/domain/models/CertificationAssessmentHistory.js';
import { CertificationAssessmentScoreV3 } from '../../../src/certification/scoring/domain/models/CertificationAssessmentScoreV3.js';
import { AssessmentResultFactory } from '../../../src/certification/scoring/domain/models/factories/AssessmentResultFactory.js';
import { ABORT_REASONS } from '../../../src/certification/shared/domain/models/CertificationCourse.js';
import { CertificationVersion } from '../../../src/certification/shared/domain/models/CertificationVersion.js';
import { config } from '../../../src/shared/config.js';
import { CertificationComputeError } from '../errors.js';
import { CertificationResult } from '../models/CertificationResult.js';
import { CompetenceMark } from '../models/CompetenceMark.js';
import { AssessmentResult } from '../models/index.js';
import { CertificationCourseRejected } from './CertificationCourseRejected.js';
import { CertificationCourseUnrejected } from './CertificationCourseUnrejected.js';
import { CertificationJuryDone } from './CertificationJuryDone.js';
import { CertificationRescoringCompleted } from './CertificationRescoringCompleted.js';
import { ChallengeDeneutralized } from './ChallengeDeneutralized.js';
import { ChallengeNeutralized } from './ChallengeNeutralized.js';
import { checkEventTypes } from './check-event-types.js';

const eventTypes = [
  ChallengeNeutralized,
  ChallengeDeneutralized,
  CertificationJuryDone,
  CertificationCourseRejected,
  CertificationCourseUnrejected,
];

async function handleCertificationRescoring({
  event,
  assessmentResultRepository,
  certificationAssessmentRepository,
  competenceMarkRepository,
  scoringCertificationService,
  certificationCourseRepository,
  certificationChallengeForScoringRepository,
  answerRepository,
  flashAlgorithmConfigurationRepository,
  flashAlgorithmService,
  certificationAssessmentHistoryRepository,
  scoringConfigurationRepository,
}) {
  checkEventTypes(event, eventTypes);

  const certificationAssessment = await certificationAssessmentRepository.getByCertificationCourseId({
    certificationCourseId: event.certificationCourseId,
  });

  try {
    if (certificationAssessment.version === CertificationVersion.V3) {
      return _handleV3Certification({
        answerRepository,
        event,
        certificationAssessment,
        assessmentResultRepository,
        certificationCourseRepository,
        certificationChallengeForScoringRepository,
        flashAlgorithmConfigurationRepository,
        flashAlgorithmService,
        certificationAssessmentHistoryRepository,
        scoringConfigurationRepository,
        competenceMarkRepository,
        locale: event.locale,
      });
    }

    return await _handleV2Certification({
      scoringCertificationService,
      certificationAssessment,
      event,
      assessmentResultRepository,
      competenceMarkRepository,
      certificationCourseRepository,
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
      juryId: event.juryId,
      event,
    });
  }
}

async function _handleV3Certification({
  answerRepository,
  certificationAssessment,
  event,
  assessmentResultRepository,
  certificationCourseRepository,
  certificationChallengeForScoringRepository,
  flashAlgorithmConfigurationRepository,
  flashAlgorithmService,
  certificationAssessmentHistoryRepository,
  scoringConfigurationRepository,
  competenceMarkRepository,
  locale,
}) {
  const allAnswers = await answerRepository.findByAssessment(certificationAssessment.id);
  const certificationChallengesForScoring = await certificationChallengeForScoringRepository.getByCertificationCourseId(
    { certificationCourseId: certificationAssessment.certificationCourseId },
  );

  const certificationCourse = await certificationCourseRepository.get({
    id: certificationAssessment.certificationCourseId,
  });

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
    challenges: certificationChallengesForScoring,
    allAnswers,
    abortReason,
    maxReachableLevelOnCertificationDate: certificationCourse.getMaxReachableLevelOnCertificationDate(),
    v3CertificationScoring,
  });

  const assessmentResult = _createV3AssessmentResult({
    event,
    allAnswers,
    certificationCourse,
    certificationAssessmentScore,
    certificationAssessment,
  });

  await _cancelCertificationCourseIfV3CertificationLackOfAnswersForTechnicalReason({
    allAnswers,
    certificationCourse,
    certificationCourseRepository,
  });

  const certificationAssessmentHistory = CertificationAssessmentHistory.fromChallengesAndAnswers({
    algorithm,
    challenges: certificationChallengesForScoring,
    allAnswers,
  });

  await certificationAssessmentHistoryRepository.save(certificationAssessmentHistory);

  await _saveResult({
    certificationAssessment,
    assessmentResult,
    certificationAssessmentScore,
    assessmentResultRepository,
    competenceMarkRepository,
  });

  return new CertificationRescoringCompleted({
    userId: certificationAssessment.userId,
    certificationCourseId: certificationAssessment.certificationCourseId,
    reproducibilityRate: certificationAssessmentScore.percentageCorrectAnswers,
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

async function _saveResult({
  assessmentResult,
  certificationAssessment,
  certificationAssessmentScore,
  assessmentResultRepository,
  competenceMarkRepository,
}) {
  const savedAssessmentResult = await assessmentResultRepository.save({
    certificationCourseId: certificationAssessment.certificationCourseId,
    assessmentResult,
  });

  await bluebird.mapSeries(certificationAssessmentScore.competenceMarks, (competenceMark) => {
    const competenceMarkDomain = new CompetenceMark({
      ...competenceMark,
      assessmentResultId: savedAssessmentResult.id,
    });
    return competenceMarkRepository.save(competenceMarkDomain);
  });
}

async function _handleV2Certification({
  scoringCertificationService,
  certificationAssessment,
  event,
  assessmentResultRepository,
  competenceMarkRepository,
  certificationCourseRepository,
}) {
  const certificationAssessmentScore = await scoringCertificationService.calculateCertificationAssessmentScore({
    certificationAssessment,
    continueOnError: false,
  });
  const emitter = _getEmitterFromEvent(event);
  const certificationCourse = await certificationCourseRepository.get({
    id: certificationAssessment.certificationCourseId,
  });
  const assessmentResult = _createV2AssessmentResult({
    event,
    emitter,
    certificationCourse,
    certificationAssessmentScore,
    certificationAssessment,
  });

  const assessmentResultId = await _saveV2AssessmentResult({
    assessmentResult,
    certificationAssessment,
    assessmentResultRepository,
  });
  await _saveCompetenceMarks(certificationAssessmentScore, assessmentResultId, competenceMarkRepository);

  await _cancelCertificationCourseIfHasNotEnoughNonNeutralizedChallengesToBeTrusted({
    certificationCourseId: certificationAssessment.certificationCourseId,
    hasEnoughNonNeutralizedChallengesToBeTrusted:
      certificationAssessmentScore.hasEnoughNonNeutralizedChallengesToBeTrusted,
    certificationCourseRepository,
  });

  return new CertificationRescoringCompleted({
    userId: certificationAssessment.userId,
    certificationCourseId: certificationAssessment.certificationCourseId,
    reproducibilityRate: certificationAssessmentScore.percentageCorrectAnswers,
  });
}

async function _cancelCertificationCourseIfHasNotEnoughNonNeutralizedChallengesToBeTrusted({
  certificationCourseId,
  hasEnoughNonNeutralizedChallengesToBeTrusted,
  certificationCourseRepository,
}) {
  const certificationCourse = await certificationCourseRepository.get({ id: certificationCourseId });
  if (hasEnoughNonNeutralizedChallengesToBeTrusted) {
    certificationCourse.uncancel();
  } else {
    certificationCourse.cancel();
  }

  return certificationCourseRepository.update({ certificationCourse });
}

async function _saveResultAfterCertificationComputeError({
  certificationAssessment,
  assessmentResultRepository,
  certificationComputeError,
  juryId,
  event,
}) {
  const emitter = _getEmitterFromEvent(event);
  const assessmentResult = AssessmentResultFactory.buildAlgoErrorResult({
    error: certificationComputeError,
    assessmentId: certificationAssessment.id,
    juryId,
    emitter,
  });
  await assessmentResultRepository.save({
    certificationCourseId: certificationAssessment.certificationCourseId,
    assessmentResult,
  });
}

async function _saveV2AssessmentResult({ assessmentResult, certificationAssessment, assessmentResultRepository }) {
  const { id: assessmentResultId } = await assessmentResultRepository.save({
    certificationCourseId: certificationAssessment.certificationCourseId,
    assessmentResult,
  });
  return assessmentResultId;
}

async function _saveCompetenceMarks(certificationAssessmentScore, assessmentResultId, competenceMarkRepository) {
  await bluebird.mapSeries(certificationAssessmentScore.competenceMarks, (competenceMark) => {
    const competenceMarkDomain = new CompetenceMark({ ...competenceMark, assessmentResultId });
    return competenceMarkRepository.save(competenceMarkDomain);
  });
}

function _getEmitterFromEvent(event) {
  let emitter;

  if (event instanceof ChallengeNeutralized || event instanceof ChallengeDeneutralized) {
    emitter = CertificationResult.emitters.PIX_ALGO_NEUTRALIZATION;
  }

  if (event instanceof CertificationJuryDone) {
    emitter = CertificationResult.emitters.PIX_ALGO_AUTO_JURY;
  }

  if (event instanceof CertificationCourseRejected || event instanceof CertificationCourseUnrejected) {
    emitter = CertificationResult.emitters.PIX_ALGO_FRAUD_REJECTION;
  }

  return emitter;
}

function _createV2AssessmentResult({
  event,
  emitter,
  certificationCourse,
  certificationAssessmentScore,
  certificationAssessment,
}) {
  if (certificationCourse.isRejectedForFraud()) {
    return AssessmentResultFactory.buildFraud({
      pixScore: certificationAssessmentScore.nbPix,
      reproducibilityRate: certificationAssessmentScore.getPercentageCorrectAnswers(),
      assessmentId: certificationAssessment.id,
      juryId: event.juryId,
    });
  } else if (!certificationAssessmentScore.hasEnoughNonNeutralizedChallengesToBeTrusted) {
    return AssessmentResultFactory.buildNotTrustableAssessmentResult({
      pixScore: certificationAssessmentScore.nbPix,
      reproducibilityRate: certificationAssessmentScore.getPercentageCorrectAnswers(),
      status: certificationAssessmentScore.status,
      assessmentId: certificationAssessment.id,
      emitter,
      juryId: event.juryId,
    });
  } else if (certificationAssessmentScore.hasInsufficientCorrectAnswers()) {
    return AssessmentResultFactory.buildInsufficientCorrectAnswers({
      emitter,
      pixScore: certificationAssessmentScore.nbPix,
      reproducibilityRate: certificationAssessmentScore.getPercentageCorrectAnswers(),
      assessmentId: certificationAssessment.id,
      juryId: event.juryId,
    });
  } else {
    return AssessmentResultFactory.buildStandardAssessmentResult({
      pixScore: certificationAssessmentScore.nbPix,
      reproducibilityRate: certificationAssessmentScore.getPercentageCorrectAnswers(),
      status: certificationAssessmentScore.status,
      assessmentId: certificationAssessment.id,
      emitter,
      juryId: event.juryId,
    });
  }
}

function _createV3AssessmentResult({
  event,
  allAnswers,
  certificationCourse,
  certificationAssessmentScore,
  certificationAssessment,
}) {
  if (certificationCourse.isRejectedForFraud()) {
    return AssessmentResultFactory.buildFraud({
      pixScore: certificationAssessmentScore.nbPix,
      reproducibilityRate: certificationAssessmentScore.getPercentageCorrectAnswers(),
      assessmentId: certificationAssessment.id,
      juryId: event.juryId,
    });
  }

  if (_shouldRejectWhenV3CertificationCandidateDidNotAnswerToEnoughQuestions({ allAnswers, certificationCourse })) {
    return AssessmentResultFactory.buildLackOfAnswers({
      pixScore: certificationAssessmentScore.nbPix,
      reproducibilityRate: certificationAssessmentScore.getPercentageCorrectAnswers(),
      status: certificationAssessmentScore.status,
      assessmentId: certificationAssessment.id,
      emitter: AssessmentResult.emitters.PIX_ALGO,
      juryId: event.juryId,
    });
  }

  if (_shouldCancelWhenV3CertificationLacksOfAnswersForTechnicalReason({ allAnswers, certificationCourse })) {
    return AssessmentResultFactory.buildLackOfAnswersForTechnicalReason({
      pixScore: certificationAssessmentScore.nbPix,
      reproducibilityRate: certificationAssessmentScore.getPercentageCorrectAnswers(),
      status: certificationAssessmentScore.status,
      assessmentId: certificationAssessment.id,
      emitter: AssessmentResult.emitters.PIX_ALGO,
      juryId: event.juryId,
    });
  }

  return AssessmentResultFactory.buildStandardAssessmentResult({
    pixScore: certificationAssessmentScore.nbPix,
    reproducibilityRate: certificationAssessmentScore.getPercentageCorrectAnswers(),
    status: certificationAssessmentScore.status,
    assessmentId: certificationAssessment.id,
    emitter: AssessmentResult.emitters.PIX_ALGO,
    juryId: event.juryId,
  });
}

async function _cancelCertificationCourseIfV3CertificationLackOfAnswersForTechnicalReason({
  allAnswers,
  certificationCourse,
  certificationCourseRepository,
}) {
  if (_shouldCancelWhenV3CertificationLacksOfAnswersForTechnicalReason({ allAnswers, certificationCourse })) {
    certificationCourse.cancel();
    await certificationCourseRepository.update({ certificationCourse });
  }
}

handleCertificationRescoring.eventTypes = eventTypes;
export { handleCertificationRescoring };

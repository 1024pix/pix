import bluebird from 'bluebird';

import { FlashAssessmentAlgorithm } from '../../../src/certification/flash-certification/domain/models/FlashAssessmentAlgorithm.js';
import { CertificationAssessmentHistory } from '../../../src/certification/scoring/domain/models/CertificationAssessmentHistory.js';
import { CertificationAssessmentScoreV3 } from '../../../src/certification/scoring/domain/models/CertificationAssessmentScoreV3.js';
import { AssessmentResultFactory } from '../../../src/certification/scoring/domain/models/factories/AssessmentResultFactory.js';
import { JuryComment, JuryCommentContexts } from '../../../src/certification/shared/domain/models/JuryComment.js';
import { config } from '../../../src/shared/config.js';
import { CertificationVersion } from '../../../src/shared/domain/models/CertificationVersion.js';
import { CertificationComputeError } from '../errors.js';
import { ABORT_REASONS } from '../models/CertificationCourse.js';
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
}) {
  const allAnswers = await answerRepository.findByAssessment(certificationAssessment.id);
  const certificationChallengesForScoring = await certificationChallengeForScoringRepository.getByCertificationCourseId(
    { certificationCourseId: certificationAssessment.certificationCourseId },
  );

  const certificationCourse = await certificationCourseRepository.get(certificationAssessment.certificationCourseId);

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

  const certificationAssessmentScore = CertificationAssessmentScoreV3.fromChallengesAndAnswers({
    algorithm,
    challenges: certificationChallengesForScoring,
    allAnswers,
    abortReason,
    maxReachableLevelOnCertificationDate: certificationCourse.getMaxReachableLevelOnCertificationDate(),
  });

  let assessmentResult;
  if (certificationCourse.isRejectedForFraud()) {
    assessmentResult = AssessmentResultFactory.buildFraud({
      pixScore: certificationAssessmentScore.nbPix,
      reproducibilityRate: certificationAssessmentScore.getPercentageCorrectAnswers(),
      assessmentId: certificationAssessment.id,
      juryId: event.juryId,
    });
  } else if (
    _shouldRejectWhenV3CertificationCandidateDidNotAnswerToEnoughQuestions({ allAnswers, certificationCourse })
  ) {
    assessmentResult = AssessmentResultFactory.buildLackOfAnswers({
      pixScore: certificationAssessmentScore.nbPix,
      reproducibilityRate: certificationAssessmentScore.getPercentageCorrectAnswers(),
      status: certificationAssessmentScore.status,
      assessmentId: certificationAssessment.id,
      emitter: AssessmentResult.emitters.PIX_ALGO,
      juryId: event.juryId,
    });
  } else {
    assessmentResult = AssessmentResultFactory.buildStandardAssessmentResult({
      pixScore: certificationAssessmentScore.nbPix,
      reproducibilityRate: certificationAssessmentScore.getPercentageCorrectAnswers(),
      status: certificationAssessmentScore.status,
      assessmentId: certificationAssessment.id,
      emitter: AssessmentResult.emitters.PIX_ALGO,
      juryId: event.juryId,
    });
  }

  if (_shouldCancelWhenV3CertificationLacksOfAnswersForTechnicalReason({ allAnswers, certificationCourse })) {
    assessmentResult.commentForCandidate = new JuryComment({
      context: JuryCommentContexts.CANDIDATE,
      fallbackComment:
        "Un ou plusieurs problème(s) technique(s), signalé(s) à votre surveillant pendant la session de certification, a/ont affecté la qualité du test de certification. En raison du trop grand nombre de questions auxquelles vous n'avez pas pu répondre dans de bonnes conditions, nous ne sommes malheureusement pas en mesure de calculer un score fiable et de fournir un certificat. La certification est annulée, le prescripteur de votre certification (le cas échéant), en est informé.",
    });
    assessmentResult.commentForOrganization = new JuryComment({
      context: JuryCommentContexts.ORGANIZATION,
      fallbackComment:
        "Un ou plusieurs problème(s) technique(s), signalés par ce(cette) candidat(e) au surveillant de la session de certification, a/ont affecté le bon déroulement du test de certification. Nous sommes dans l'incapacité de le/la certifier, sa certification est donc annulée. Cette information est à prendre en compte et peut vous conduire à proposer une nouvelle session de certification pour ce(cette) candidat(e).",
    });
    certificationCourse.cancel();
    certificationCourseRepository.update(certificationCourse);
  }

  const certificationAssessmentHistory = CertificationAssessmentHistory.fromChallengesAndAnswers({
    algorithm,
    challenges: certificationChallengesForScoring,
    allAnswers,
  });

  await certificationAssessmentHistoryRepository.save(certificationAssessmentHistory);

  await assessmentResultRepository.save({
    certificationCourseId: certificationAssessment.certificationCourseId,
    assessmentResult,
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
  const certificationCourse = await certificationCourseRepository.get(certificationAssessment.certificationCourseId);
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
  const certificationCourse = await certificationCourseRepository.get(certificationCourseId);
  if (hasEnoughNonNeutralizedChallengesToBeTrusted) {
    certificationCourse.uncancel();
  } else {
    certificationCourse.cancel();
  }

  return certificationCourseRepository.update(certificationCourse);
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
  } else if (certificationAssessmentScore.hasInsufficientCorrectAnswers()) {
    return AssessmentResultFactory.buildInsufficientCorrectAnswers({
      emitter,
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

handleCertificationRescoring.eventTypes = eventTypes;
export { handleCertificationRescoring };

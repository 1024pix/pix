import AssessmentResult from '../models/AssessmentResult';
import CertificationResult from '../models/CertificationResult';
import CompetenceMark from '../models/CompetenceMark';
import CertificationRescoringCompleted from './CertificationRescoringCompleted.js';
import bluebird from 'bluebird';
import { CertificationComputeError } from '../errors';
import ChallengeNeutralized from './ChallengeNeutralized';
import ChallengeDeneutralized from './ChallengeDeneutralized';
import CertificationJuryDone from './CertificationJuryDone';
import { checkEventTypes } from './check-event-types';

const eventTypes = [ChallengeNeutralized, ChallengeDeneutralized, CertificationJuryDone];

async function handleCertificationRescoring({
  event,
  assessmentResultRepository,
  certificationAssessmentRepository,
  competenceMarkRepository,
  scoringCertificationService,
  certificationCourseRepository,
}) {
  checkEventTypes(event, eventTypes);

  const certificationAssessment = await certificationAssessmentRepository.getByCertificationCourseId({
    certificationCourseId: event.certificationCourseId,
  });

  try {
    const certificationAssessmentScore = await scoringCertificationService.calculateCertificationAssessmentScore({
      certificationAssessment,
      continueOnError: false,
    });

    const assessmentResultId = await _saveAssessmentResult(
      certificationAssessmentScore,
      certificationAssessment,
      event,
      assessmentResultRepository
    );
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
  const assessmentResult = AssessmentResult.buildAlgoErrorResult({
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

async function _saveAssessmentResult(
  certificationAssessmentScore,
  certificationAssessment,
  event,
  assessmentResultRepository
) {
  let assessmentResult;
  const emitter = _getEmitterFromEvent(event);
  if (!certificationAssessmentScore.hasEnoughNonNeutralizedChallengesToBeTrusted) {
    assessmentResult = AssessmentResult.buildNotTrustableAssessmentResult({
      pixScore: certificationAssessmentScore.nbPix,
      reproducibilityRate: certificationAssessmentScore.getPercentageCorrectAnswers(),
      status: certificationAssessmentScore.status,
      assessmentId: certificationAssessment.id,
      emitter,
      juryId: event.juryId,
    });
  } else {
    assessmentResult = AssessmentResult.buildStandardAssessmentResult({
      pixScore: certificationAssessmentScore.nbPix,
      reproducibilityRate: certificationAssessmentScore.getPercentageCorrectAnswers(),
      status: certificationAssessmentScore.status,
      assessmentId: certificationAssessment.id,
      emitter,
      juryId: event.juryId,
    });
  }
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

  return emitter;
}

handleCertificationRescoring.eventTypes = eventTypes;
export default handleCertificationRescoring;

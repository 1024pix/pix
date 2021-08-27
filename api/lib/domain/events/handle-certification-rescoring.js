const AssessmentResult = require('../models/AssessmentResult');
const CompetenceMark = require('../models/CompetenceMark');
const CertificationRescoringCompleted = require('./CertificationRescoringCompleted.js');
const bluebird = require('bluebird');
const {
  CertificationComputeError,
} = require('../errors');
const ChallengeNeutralized = require('./ChallengeNeutralized');
const ChallengeDeneutralized = require('./ChallengeDeneutralized');
const CertificationJuryDone = require('./CertificationJuryDone');
const { checkEventTypes } = require('./check-event-types');

const eventTypes = [ChallengeNeutralized, ChallengeDeneutralized, CertificationJuryDone];
const EMITTER = 'PIX-ALGO-NEUTRALIZATION';

async function handleCertificationRescoring({
  event,
  assessmentResultRepository,
  certificationAssessmentRepository,
  competenceMarkRepository,
  scoringCertificationService,
  certificationCourseRepository,
}) {
  checkEventTypes(event, eventTypes);

  const certificationAssessment = await certificationAssessmentRepository.getByCertificationCourseId({ certificationCourseId: event.certificationCourseId });
  return await _calculateCertificationScore({
    certificationAssessment,
    assessmentResultRepository,
    competenceMarkRepository,
    scoringCertificationService,
    certificationCourseRepository,
    juryId: event.juryId,
  });
}

async function _calculateCertificationScore({
  certificationAssessment,
  assessmentResultRepository,
  competenceMarkRepository,
  scoringCertificationService,
  certificationCourseRepository,
  juryId,
}) {

  try {
    const certificationAssessmentScore = await scoringCertificationService.calculateCertificationAssessmentScore({
      certificationAssessment,
      continueOnError: false,
    });
    await _saveResult({
      certificationAssessmentScore,
      certificationAssessment,
      assessmentResultRepository,
      competenceMarkRepository,
      juryId,
    });

    await _handleCancellation({
      certificationCourseId: certificationAssessment.certificationCourseId,
      certificationAssessmentScore,
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
      certificationComputeError: error,
      juryId,
    });
  }
}

async function _handleCancellation({
  certificationCourseId,
  certificationAssessmentScore,
  certificationCourseRepository,
}) {
  const certificationCourse = await certificationCourseRepository.get(certificationCourseId);
  if (certificationAssessmentScore.hasEnoughNonNeutralizedChallengesToBeTrusted) {
    certificationCourse.uncancel();
  } else {
    certificationCourse.cancel();
  }

  return certificationCourseRepository.update(certificationCourse);
}

async function _saveResult({
  certificationAssessment,
  certificationAssessmentScore,
  assessmentResultRepository,
  competenceMarkRepository,
  juryId,
}) {

  const assessmentResult = AssessmentResult.buildStandardAssessmentResult({
    pixScore: certificationAssessmentScore.nbPix,
    status: certificationAssessmentScore.status,
    assessmentId: certificationAssessment.id,
    emitter: EMITTER,
    juryId,
  });

  const { id: assessmentResultId } = await assessmentResultRepository.save(assessmentResult);
  await bluebird.mapSeries(certificationAssessmentScore.competenceMarks, (competenceMark) => {
    const competenceMarkDomain = new CompetenceMark({ ...competenceMark, assessmentResultId });
    return competenceMarkRepository.save(competenceMarkDomain);
  });
}

async function _saveResultAfterCertificationComputeError({
  certificationAssessment,
  assessmentResultRepository,
  certificationComputeError,
  juryId,
}) {
  const assessmentResult = AssessmentResult.buildAlgoErrorResult({
    error: certificationComputeError,
    assessmentId: certificationAssessment.id,
    juryId,
    emitter: EMITTER,
  });
  await assessmentResultRepository.save(assessmentResult);
}

handleCertificationRescoring.eventTypes = eventTypes;
module.exports = handleCertificationRescoring;

const AssessmentResult = require('../models/AssessmentResult');
const CompetenceMark = require('../models/CompetenceMark');
const bluebird = require('bluebird');
const {
  CertificationComputeError,
} = require('../errors');
const ChallengeNeutralized = require('./ChallengeNeutralized');
const ChallengeDeneutralized = require('./ChallengeDeneutralized');
const { checkEventTypes } = require('./check-event-types');

const eventTypes = [ChallengeNeutralized, ChallengeDeneutralized];
const EMITTER = 'PIX-ALGO-NEUTRALIZATION'; // to be refined according to rescoring reason

async function handleCertificationRescoring({
  event,
  assessmentResultRepository,
  certificationAssessmentRepository,
  competenceMarkRepository,
  scoringCertificationService,
}) {
  checkEventTypes(event, [eventTypes]);

  const certificationAssessment = await certificationAssessmentRepository.getByCertificationCourseId({ certificationCourseId: event.certificationCourseId });
  await _calculateCertificationScore({
    certificationAssessment,
    assessmentResultRepository,
    competenceMarkRepository,
    scoringCertificationService,
    juryId: event.juryId,
  });
  return null;
}

async function _calculateCertificationScore({
  certificationAssessment,
  assessmentResultRepository,
  competenceMarkRepository,
  scoringCertificationService,
  juryId,
}) {
  try {
    const certificationAssessmentScore = await scoringCertificationService.calculateCertificationAssessmentScore(certificationAssessment);
    await _saveResult({
      certificationAssessmentScore,
      certificationAssessment,
      assessmentResultRepository,
      competenceMarkRepository,
      juryId,
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

async function _saveResult({
  certificationAssessment,
  certificationAssessmentScore,
  assessmentResultRepository,
  competenceMarkRepository,
  juryId,
}) {
  const assessmentResult = await _createAssessmentResult({
    certificationAssessment,
    certificationAssessmentScore,
    assessmentResultRepository,
    juryId,
  });

  await bluebird.mapSeries(certificationAssessmentScore.competenceMarks, (competenceMark) => {
    const competenceMarkDomain = new CompetenceMark({ ...competenceMark, assessmentResultId: assessmentResult.id });
    return competenceMarkRepository.save(competenceMarkDomain);
  });
}

function _createAssessmentResult({ certificationAssessment, certificationAssessmentScore, assessmentResultRepository, juryId }) {
  const assessmentResult = AssessmentResult.buildStandardAssessmentResult({
    pixScore: certificationAssessmentScore.nbPix,
    status: certificationAssessmentScore.status,
    assessmentId: certificationAssessment.id,
    emitter: EMITTER,
    juryId,
  });
  return assessmentResultRepository.save(assessmentResult);
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

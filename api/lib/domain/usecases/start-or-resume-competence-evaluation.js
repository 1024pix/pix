const Assessment = require('../models/Assessment');
const CompetenceEvaluation = require('../models/CompetenceEvaluation');
const { NotFoundError } = require('../../domain/errors');

module.exports = async function startOrResumeCompetenceEvaluation({ competenceId, userId, competenceEvaluationRepository, assessmentRepository, competenceRepository }) {
  await _checkCompetenceExists(competenceId, competenceRepository);

  try {
    return await _resumeCompetenceEvaluation({ userId, competenceId, competenceEvaluationRepository });
  } catch (err) {
    if (err instanceof NotFoundError) {
      return await _startCompetenceEvaluation({ userId, competenceId, assessmentRepository, competenceEvaluationRepository });
    } else {
      throw err;
    }
  }
};

async function _resumeCompetenceEvaluation({ userId, competenceId, competenceEvaluationRepository }) {
  const competenceEvaluation = await competenceEvaluationRepository.getLastByCompetenceIdAndUserId(competenceId, userId);

  if (competenceEvaluation.status === CompetenceEvaluation.statuses.RESET) {
    await competenceEvaluationRepository.updateStatusByCompetenceId(competenceId, CompetenceEvaluation.statuses.STARTED);
  }
  return {
    created: false,
    competenceEvaluation,
  };
}

async function _startCompetenceEvaluation({ userId, competenceId, assessmentRepository, competenceEvaluationRepository }) {
  const assessment = await _createAssessment(userId, assessmentRepository);
  const competenceEvaluation = await _createCompetenceEvaluation(competenceId, assessment.id, userId, competenceEvaluationRepository);
  return {
    created: true,
    competenceEvaluation,
  };
}

function _checkCompetenceExists(competenceId, competenceRepository) {
  return competenceRepository.get(competenceId)
    .catch(() => {
      throw new NotFoundError('La compétence demandée n\'existe pas');
    });
}

function _createAssessment(userId, assessmentRepository) {
  const assessment = new Assessment({
    userId,
    state: Assessment.states.STARTED,
    type: Assessment.types.COMPETENCE_EVALUATION,
    courseId: Assessment.courseIdMessage.COMPETENCE_EVALUATION
  });
  return assessmentRepository.save(assessment);
}

function _createCompetenceEvaluation(competenceId, assessmentId, userId, competenceEvaluationRepository) {
  const competenceEvaluation = new CompetenceEvaluation({
    userId,
    assessmentId,
    competenceId,
    status: CompetenceEvaluation.statuses.STARTED,
  });
  return competenceEvaluationRepository.save(competenceEvaluation);
}

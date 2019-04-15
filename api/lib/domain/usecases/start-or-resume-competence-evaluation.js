const Assessment = require('../models/Assessment');
const CompetenceEvaluation = require('../models/CompetenceEvaluation');
const { NotFoundError } = require('../../domain/errors');

module.exports = async function startOrResumeCompetenceEvaluation({ competenceId, userId, competenceEvaluationRepository, assessmentRepository, competenceRepository }) {
  await _checkCompetenceExists(competenceId, competenceRepository);

  try {
    const competenceEvaluation = await competenceEvaluationRepository.getLastByCompetenceId(competenceId);
    return { created: false, competenceEvaluation };
  } catch (error) {
    if (error instanceof NotFoundError) {
      const assessment = await _createAssessmentForCompetenceEvaluation(userId, assessmentRepository);
      const freshCompetenceEvaluation = await _saveCompetenceEvaluation(competenceId, assessment, userId, competenceEvaluationRepository);
      return { created: true, competenceEvaluation: freshCompetenceEvaluation };
    } else {
      throw error;
    }
  }
};

function _checkCompetenceExists(competenceId, competenceRepository) {
  return competenceRepository.get(competenceId)
    .catch(() => {
      throw new NotFoundError('La compétence demandée n\'existe pas');
    });
}

function _createAssessmentForCompetenceEvaluation(userId, assessmentRepository) {
  const assessment = new Assessment({
    userId,
    state: Assessment.states.STARTED,
    type: Assessment.types.COMPETENCE_EVALUATION,
    courseId: Assessment.courseIdMessage.COMPETENCE_EVALUATION
  });
  return assessmentRepository.save(assessment);
}

function _saveCompetenceEvaluation(competenceId, assessment, userId, competenceEvaluationRepository) {
  const competenceEvaluation = new  CompetenceEvaluation({
    userId,
    assessmentId: assessment.id,
    competenceId,
  });
  return competenceEvaluationRepository.save(competenceEvaluation);
}

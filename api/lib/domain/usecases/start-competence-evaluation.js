const Assessment = require('../models/Assessment');
const CompetenceEvaluation = require('../models/CompetenceEvaluation');
const { NotFoundError } = require('../../domain/errors');

module.exports = function startCompetenceEvaluation({ competenceId, userId, competenceEvaluationRepository, assessmentRepository, competenceRepository }) {
  return _checkCompetenceExists(competenceId, competenceRepository)
    .then(() => _createAssessmentForCompetenceEvaluation(userId, assessmentRepository))
    .then((assessment) => _saveCompetenceEvaluation(competenceId, assessment, userId, competenceEvaluationRepository));
};

function _checkCompetenceExists(competenceId, competenceRepository) {
  return competenceRepository.get(competenceId)
    .then((competence) => {
      if (competence === null) {
        throw new NotFoundError('La compétence demandée n\'existe pas');
      }
      return Promise.resolve();
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

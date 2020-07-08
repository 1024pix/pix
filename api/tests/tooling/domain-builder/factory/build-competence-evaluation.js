const CompetenceEvaluation = require('../../../../lib/domain/models/CompetenceEvaluation');
const buildAssessment = require('./build-assessment');
const buildUser = require('./build-user');

const faker = require('faker');

module.exports = function buildCompetenceEvaluation(
  {
    id = 1,
    assessmentId,
    assessment,
    status = 'started',
    userId = buildUser().id,
    competenceId = 'recsvLz0W2ShyfD63',
    createdAt = faker.date.recent(),
    updatedAt = faker.date.recent(),
  } = {}) {

  if (assessment && !assessmentId) {
    assessmentId = assessment.id;
  }
  if (assessmentId && !assessment) {
    assessment = buildAssessment({ id: assessmentId });
  }
  if (!assessmentId && !assessment) {
    assessment = buildAssessment();
    assessmentId = assessment.id;
  }

  return new CompetenceEvaluation({
    id,
    assessmentId,
    userId,
    competenceId,
    createdAt,
    updatedAt,
    assessment,
    status,
  });
};

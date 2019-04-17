const CompetenceEvaluation = require('../../../../lib/domain/models/CompetenceEvaluation');
const buildAssessment = require('./build-assessment');
const buildUser = require('./build-user');

const faker = require('faker');

module.exports = function buildCompetenceEvaluation(
  {
    id = 1,
    assessmentId = buildAssessment().id,
    assessment = buildAssessment(),
    userId = buildUser().id,
    competenceId = 'recsvLz0W2ShyfD63',
    createdAt = faker.date.recent(),
    updatedAt = faker.date.recent(),
  } = {}) {
  return new CompetenceEvaluation({ id, assessmentId: assessmentId || assessment.id , userId, competenceId, createdAt, updatedAt, assessment });
};

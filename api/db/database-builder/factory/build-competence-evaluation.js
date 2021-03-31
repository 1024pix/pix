const buildAssessment = require('./build-assessment');
const buildUser = require('./build-user');
const databaseBuffer = require('../database-buffer');
const CompetenceEvaluation = require('../../../lib/domain/models/CompetenceEvaluation');
const _ = require('lodash');

module.exports = function buildCompetenceEvaluation({
  id = databaseBuffer.getNextId(),
  assessmentId,
  competenceId = 'recABC123',
  status = CompetenceEvaluation.statuses.STARTED,
  createdAt = new Date('2020-01-01'),
  updatedAt = new Date('2020-01-02'),
  userId,
} = {}) {

  userId = _.isUndefined(userId) ? buildUser().id : userId;
  assessmentId = _.isUndefined(assessmentId) ? buildAssessment({ userId }).id : assessmentId;

  const values = {
    id,
    assessmentId,
    competenceId,
    userId,
    createdAt,
    updatedAt,
    status,
  };

  return databaseBuffer.pushInsertable({
    tableName: 'competence-evaluations',
    values,
  });
};

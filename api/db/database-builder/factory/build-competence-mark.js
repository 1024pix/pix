const buildAssessmentResult = require('./build-assessment-result');
const databaseBuffer = require('../database-buffer');
const _ = require('lodash');

module.exports = function buildCompetenceMark({
  id = databaseBuffer.getNextId(),
  level = 5,
  score = 42,
  area_code = '1',
  competence_code = '1.1',
  competenceId = 'recABC123',
  assessmentResultId,
  createdAt = new Date('2020-01-01'),
} = {}) {

  assessmentResultId = _.isUndefined(assessmentResultId) ? buildAssessmentResult().id : assessmentResultId;

  const values = {
    id,
    level,
    score,
    area_code,
    competence_code,
    competenceId,
    assessmentResultId,
    createdAt,
  };
  return databaseBuffer.pushInsertable({
    tableName: 'competence-marks',
    values,
  });
};

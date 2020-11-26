const faker = require('faker');
const buildAssessmentResult = require('./build-assessment-result');
const databaseBuffer = require('../database-buffer');
const _ = require('lodash');

module.exports = function buildCompetenceMark({
  id,
  level = faker.random.number() % 8,
  score = faker.random.number() % 64,
  area_code = faker.random.number().toString(),
  competence_code = `${faker.random.number()}_${faker.random.number()}`,
  competenceId = `rec${faker.random.uuid()}`,
  assessmentResultId,
  createdAt = faker.date.past(),
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

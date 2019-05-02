const faker = require('faker');
const buildAssessmentResult = require('./build-assessment-result');
const databaseBuffer = require('../database-buffer');

module.exports = function buildCompetenceMark({
  id = faker.random.number(),
  level = faker.random.number(),
  score = faker.random.number(),
  area_code = faker.random.number(),
  competence_code = `${faker.random.number()}_${faker.random.number()}`,
  assessmentResultId,
} = {}) {

  assessmentResultId = assessmentResultId || buildAssessmentResult().id;

  const values = {
    id, level, score, area_code, competence_code, assessmentResultId
  };

  databaseBuffer.pushInsertable({
    tableName: 'competence-marks',
    values,
  });

  return values;
};

const faker = require('faker');
const buildCertificationCourse = require('./build-certification-course');
const databaseBuffer = require('../database-buffer');

module.exports = function buildCertificationChallenge({
  id = faker.random.number(),
  associatedSkill = '@twi8',
  associatedSkillId = `rec${faker.random.uuid()}`,
  challengeId = `rec${faker.random.uuid()}`,
  competenceId = `rec${faker.random.uuid()}`,
  courseId = buildCertificationCourse().id,
  createdAt = faker.date.past().toISOString(),
  updatedAt = faker.date.recent().toISOString(),
} = {}) {

  const values = {
    id,
    associatedSkill,
    associatedSkillId,
    challengeId,
    competenceId,
    courseId,
    createdAt,
    updatedAt,
  };

  databaseBuffer.pushInsertable({
    tableName: 'certification-challenges',
    values,
  });

  return values;
};

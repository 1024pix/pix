const faker = require('faker');
const buildCertificationCourse = require('./build-certification-course');
const databaseBuffer = require('../database-buffer');

module.exports = function buildCertificationChallenge({
  id = faker.random.number(),
  associatedSkill = '@twi8',
  associatedSkillId = `rec${faker.random.uuid()}`,
  challengeId = `rec${faker.random.uuid()}`,
  competenceId = `rec${faker.random.uuid()}`,
  courseId,
  createdAt = faker.date.past(),
  updatedAt = faker.date.recent(),
} = {}) {

  courseId = courseId || buildCertificationCourse().id;

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

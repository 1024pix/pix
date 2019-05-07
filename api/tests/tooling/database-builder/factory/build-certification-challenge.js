const faker = require('faker');
const buildCertificationCourse = require('./build-certification-course');
const databaseBuffer = require('../database-buffer');
const _ = require('lodash');

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

  courseId = _.isNil(courseId) ? buildCertificationCourse().id : courseId;

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

const faker = require('faker');
const buildCertificationCourse = require('./build-certification-course');
const databaseBuffer = require('../database-buffer');
const _ = require('lodash');

module.exports = function buildCertificationChallenge({
  id,
  associatedSkill = '@twi8',
  challengeId = `rec${faker.random.uuid()}`,
  competenceId = `rec${faker.random.uuid()}`,
  courseId,
  createdAt = faker.date.past(),
  updatedAt = faker.date.recent(),
} = {}) {

  courseId = _.isUndefined(courseId) ? buildCertificationCourse().id : courseId;

  const values = {
    id,
    associatedSkill,
    challengeId,
    competenceId,
    courseId,
    createdAt,
    updatedAt,
  };
  return databaseBuffer.pushInsertable({
    tableName: 'certification-challenges',
    values,
  });
};

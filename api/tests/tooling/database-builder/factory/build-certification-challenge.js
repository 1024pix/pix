const faker = require('faker');
const buildCertificationCourse = require('./build-certification-course');
const databaseBuffer = require('../database-buffer');
const _ = require('lodash');

module.exports = function buildCertificationChallenge({
  id,
  associatedSkill = '@twi8',
  challengeId = `rec${faker.random.uuid()}`,
  competenceId = `rec${faker.random.uuid()}`,
  certificationCourseId,
  createdAt = faker.date.past(),
  updatedAt = faker.date.recent(),
} = {}) {

  certificationCourseId = _.isUndefined(certificationCourseId) ? buildCertificationCourse().id : certificationCourseId;

  const values = {
    id,
    associatedSkill,
    challengeId,
    competenceId,
    certificationCourseId,
    createdAt,
    updatedAt,
  };
  return databaseBuffer.pushInsertable({
    tableName: 'certification-challenges',
    values,
  });
};

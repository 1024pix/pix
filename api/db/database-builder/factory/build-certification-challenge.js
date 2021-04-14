const buildCertificationCourse = require('./build-certification-course');
const databaseBuffer = require('../database-buffer');
const _ = require('lodash');

module.exports = function buildCertificationChallenge({
  id = databaseBuffer.getNextId(),
  associatedSkillName = '@twi8',
  associatedSkillId = 'recSKIL123',
  challengeId = 'recCHAL456',
  competenceId = 'recCOMP789',
  courseId,
  createdAt = new Date('2020-01-01'),
  updatedAt = new Date('2020-01-02'),
  isNeutralized = false,
} = {}) {

  courseId = _.isUndefined(courseId) ? buildCertificationCourse().id : courseId;

  const values = {
    id,
    associatedSkillName,
    associatedSkillId,
    challengeId,
    competenceId,
    courseId,
    createdAt,
    updatedAt,
    isNeutralized,
  };
  return databaseBuffer.pushInsertable({
    tableName: 'certification-challenges',
    values,
  });
};

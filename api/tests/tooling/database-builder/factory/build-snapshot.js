const faker = require('faker');
const buildUser = require('./build-user');
const buildOrganization = require('./build-organization');
const databaseBuffer = require('../database-buffer');
const _ = require('lodash');

module.exports = function buildSnapshot({
  id,
  profile = '{}',
  organizationId,
  userId,
  createdAt = faker.date.recent(),
  updatedAt = faker.date.recent(),
  score = faker.random.number().toString(),
  studentCode = faker.random.alphaNumeric(10),
  campaignCode = faker.random.alphaNumeric(10),
  testsFinished = faker.random.number(),
} = {}) {

  userId = _.isUndefined(userId) ? buildUser().id : userId;
  organizationId = _.isUndefined(organizationId) ? buildOrganization().id : organizationId;

  const values = {
    id,
    profile,
    organizationId,
    userId,
    createdAt,
    updatedAt,
    score,
    studentCode,
    campaignCode,
    testsFinished,
  };
  return databaseBuffer.pushInsertable({
    tableName: 'snapshots',
    values,
  });
};

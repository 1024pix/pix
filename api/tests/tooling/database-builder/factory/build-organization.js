const faker = require('faker');
const buildUser = require('./build-user');
const databaseBuffer = require('../database-buffer');
const _ = require('lodash');

const buildOrganization = function buildOrganization({
  id,
  type = 'PRO',
  name = faker.company.companyName(),
  code = 'ABCD12',
  logoUrl = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==',
  externalId = faker.lorem.word(),
  userId = null,
  createdAt = faker.date.recent()
} = {}) {

  const values = { id, type, name, code, logoUrl, externalId, createdAt, userId };
  return databaseBuffer.pushInsertable({
    tableName: 'organizations',
    values,
  });
};

buildOrganization.withUser = function buildOrganizationWithUser({
  id,
  type = 'PRO',
  name = faker.company.companyName(),
  code = 'ABCD12',
  logoUrl = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==',
  externalId = faker.lorem.word(),
  userId,
  createdAt = faker.date.recent()
} = {}) {

  userId = _.isNil(userId) ? buildUser().id : userId;

  const values = { id, type, name, code, logoUrl, externalId, createdAt, userId };
  return databaseBuffer.pushInsertable({
    tableName: 'organizations',
    values,
  });
};

module.exports = buildOrganization;

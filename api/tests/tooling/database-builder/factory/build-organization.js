const faker = require('faker');
const buildUser = require('./build-user');
const databaseBuffer = require('../database-buffer');
const _ = require('lodash');

const buildOrganization = function buildOrganization({
  id,
  type = 'PRO',
  name = faker.company.companyName(),
  code = faker.random.alphaNumeric(6),
  logoUrl = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==',
  externalId = faker.lorem.word(),
  provinceCode = faker.random.alphaNumeric(3),
  isManagingStudents = false,
  userId = null,
  createdAt = faker.date.recent(),
  updatedAt = faker.date.recent(),
} = {}) {

  const values = {
    id,
    type,
    name,
    code,
    logoUrl,
    createdAt,
    externalId,
    provinceCode,
    isManagingStudents,
    userId,
    updatedAt
  };

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
  provinceCode = faker.random.alphaNumeric(3),
  isManagingStudents = false,
  userId,
  createdAt = faker.date.recent()
} = {}) {

  userId = _.isNil(userId) ? buildUser().id : userId;

  const values = { id, type, name, code, logoUrl, externalId, provinceCode, isManagingStudents, createdAt, userId };
  return databaseBuffer.pushInsertable({
    tableName: 'organizations',
    values,
  });
};

module.exports = buildOrganization;

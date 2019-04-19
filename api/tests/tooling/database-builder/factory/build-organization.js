const faker = require('faker');
const buildUser = require('./build-user');
const databaseBuffer = require('../database-buffer');

const buildOrganization = function buildOrganization({
  id = faker.random.number(),
  type = 'PRO',
  name = faker.company.companyName(),
  code = 'ABCD12',
  logoUrl = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==',
  userId = null,
  createdAt = faker.date.recent()
} = {}) {

  const values = { id, type, name, code, logoUrl, createdAt, userId };

  databaseBuffer.pushInsertable({
    tableName: 'organizations',
    values,
  });

  return values;
};

buildOrganization.withUser = function buildOrganizationWithUser({
  id = faker.random.number(),
  type = 'PRO',
  name = faker.company.companyName(),
  code = 'ABCD12',
  logoUrl = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==',
  userId,
  createdAt = faker.date.recent()
} = {}) {

  userId = userId || buildUser().id;

  const values = { id, type, name, code, logoUrl, createdAt, userId };

  databaseBuffer.pushInsertable({
    tableName: 'organizations',
    values,
  });

  return values;
};

module.exports = buildOrganization;

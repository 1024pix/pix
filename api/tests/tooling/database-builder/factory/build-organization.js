const faker = require('faker');
const buildUser = require('./build-user');
const databaseBuffer = require('../database-buffer');

module.exports = function buildOrganization({
  id = faker.random.number(),
  type = 'PRO',
  name = faker.company.companyName(),
  code = 'ABCD12',
  logoUrl = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==',
  userId = buildUser().id,
  createdAt = faker.date.recent()
} = {}) {

  const values = {
    id, type, name, code, logoUrl, createdAt, userId,
  };

  databaseBuffer.pushInsertable({
    tableName: 'organizations',
    values,
  });

  return values;
};


const faker = require('faker');
const databaseBuffer = require('../database-buffer');

const buildOrganization = function buildOrganization({
  id,
  type = 'PRO',
  name = faker.company.companyName(),
  code = faker.random.alphaNumeric(6),
  logoUrl = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==',
  externalId = faker.lorem.word().toUpperCase(),
  provinceCode = faker.random.alphaNumeric(3),
  isManagingStudents = false,
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
    updatedAt
  };

  return databaseBuffer.pushInsertable({
    tableName: 'organizations',
    values,
  });
};

module.exports = buildOrganization;

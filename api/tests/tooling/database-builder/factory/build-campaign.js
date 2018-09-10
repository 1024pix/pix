const faker = require('faker');
const buildOrganization = require('./build-organization');
const buildTargetProfile = require('./build-target-profile');
const buildUser = require('./build-user');
const databaseBuffer = require('../database-buffer');

module.exports = function buildCampaign({
  id = faker.random.number(),
  name = faker.company.companyName(),
  idPixLabel = faker.random.word(),
  code = faker.random.alphaNumeric(9),
  createdAt = faker.date.recent(),
  organizationId = buildOrganization().id,
  creatorId = buildUser().id,
  targetProfileId = buildTargetProfile({ organizationId }).id,
} = {}) {

  const values = {
    id,
    name,
    code,
    createdAt,
    idPixLabel,
    organizationId,
    creatorId,
    targetProfileId,
  };

  databaseBuffer.pushInsertable({
    tableName: 'campaigns',
    values,
  });

  return values;
};

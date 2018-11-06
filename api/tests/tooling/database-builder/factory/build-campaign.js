const faker = require('faker');
const buildOrganization = require('./build-organization');
const buildTargetProfile = require('./build-target-profile');
const buildUser = require('./build-user');
const databaseBuffer = require('../database-buffer');

module.exports = function buildCampaign({
  id = faker.random.number(),
  name = faker.company.companyName(),
  code = faker.random.alphaNumeric(9),
  title = faker.random.word(),
  idPixLabel = faker.random.word(),
  customLandingPageText = faker.lorem.text(),
  createdAt = faker.date.recent(),
  organizationId = buildOrganization().id,
  creatorId = buildUser().id,
  targetProfileId = buildTargetProfile({ organizationId }).id,
} = {}) {

  const values = {
    id,
    name,
    code,
    title,
    createdAt,
    idPixLabel,
    customLandingPageText,
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

const Campaign = require('../../../../lib/domain/models/Campaign');
const faker = require('faker');
const buildTargetProfile = require('./build-target-profile');
const buildUser = require('./build-user');

module.exports = function buildCampaign(
  {
    id = 1,
    name = faker.company.companyName(),
    code = 'AZERTY123',
    title = faker.random.word(),
    idPixLabel = faker.random.word(),
    customLandingPageText = faker.lorem.text(),
    archivedAt,
    createdAt = faker.date.recent(),
    creatorId = faker.random.number(2),
    creator = buildUser({ id: creatorId }),
    organizationId = faker.random.number(2),
    targetProfileId = faker.random.number(2),
    targetProfile = buildTargetProfile({ id: targetProfileId }),
    isRestricted = false,
    organizationLogoUrl
  } = {}) {
  return new Campaign({
    id,
    name,
    code,
    title,
    idPixLabel,
    customLandingPageText,
    archivedAt,
    createdAt,
    creatorId,
    creator,
    organizationId,
    targetProfileId,
    targetProfile,
    isRestricted,
    organizationLogoUrl
  });
};

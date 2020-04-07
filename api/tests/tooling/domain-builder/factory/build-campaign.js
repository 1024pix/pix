const Campaign = require('../../../../lib/domain/models/Campaign');
const faker = require('faker');
const buildTargetProfile = require('./build-target-profile');
const buildUser = require('./build-user');

function buildCampaign({
  id = 1,
  name = faker.company.companyName(),
  code = 'AZERTY123',
  title = faker.random.word(),
  idPixLabel = faker.random.word(),
  customLandingPageText = faker.lorem.text(),
  archivedAt,
  type = Campaign.types.ASSESSMENT,
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
    type,
    createdAt,
    creatorId,
    creator,
    organizationId,
    targetProfileId,
    targetProfile,
    isRestricted,
    organizationLogoUrl
  });
}

buildCampaign.ofTypeAssessment = function({
  id = 1,
  name = faker.company.companyName(),
  code = 'AZERTY123',
  title = faker.random.word(),
  idPixLabel = faker.random.word(),
  customLandingPageText = faker.lorem.text(),
  archivedAt,
  type = Campaign.types.ASSESSMENT,
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
    type,
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

buildCampaign.ofTypeProfilesCollection = function({
  id = 1,
  name = faker.company.companyName(),
  code = 'AZERTY123',
  idPixLabel = faker.random.word(),
  customLandingPageText = faker.lorem.text(),
  archivedAt,
  type = Campaign.types.PROFILES_COLLECTION,
  createdAt = faker.date.recent(),
  creatorId = faker.random.number(2),
  creator = buildUser({ id: creatorId }),
  organizationId = faker.random.number(2),
  isRestricted = false,
  organizationLogoUrl
} = {}) {
  return new Campaign({
    id,
    name,
    code,
    idPixLabel,
    customLandingPageText,
    archivedAt,
    type,
    createdAt,
    creatorId,
    creator,
    organizationId,
    isRestricted,
    organizationLogoUrl
  });
};

module.exports = buildCampaign;

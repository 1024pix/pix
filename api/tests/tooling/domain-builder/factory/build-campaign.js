const Campaign = require('../../../../lib/domain/models/Campaign');
const faker = require('faker');
const buildOrganization = require('./build-organization');
const buildTargetProfile = require('./build-target-profile');
const buildUser = require('./build-user');

function buildCampaign({
  id = 1,
  name = faker.company.companyName(),
  code = 'AZERTY123',
  title = faker.random.word(),
  idPixLabel = faker.random.alphaNumeric(5),
  externalIdHelpImageUrl = null,
  alternativeTextToExternalIdHelpImage = null,
  customLandingPageText = faker.lorem.text(),
  archivedAt = null,
  type = Campaign.types.ASSESSMENT,
  isForAbsoluteNovice = false,
  createdAt = faker.date.recent(),
  creator = buildUser(),
  organization = buildOrganization(),
  targetProfile = buildTargetProfile(),
} = {}) {
  return new Campaign({
    id,
    name,
    code,
    title,
    idPixLabel,
    externalIdHelpImageUrl,
    alternativeTextToExternalIdHelpImage,
    customLandingPageText,
    archivedAt,
    type,
    isForAbsoluteNovice,
    createdAt,
    creator,
    organization,
    targetProfile,
  });
}

buildCampaign.ofTypeAssessment = function({
  id = 1,
  name = faker.company.companyName(),
  code = 'AZERTY123',
  title = faker.random.word(),
  idPixLabel = faker.random.alphaNumeric(5),
  externalIdHelpImageUrl = null,
  alternativeTextToExternalIdHelpImage = null,
  customLandingPageText = faker.lorem.text(),
  archivedAt = null,
  type = Campaign.types.ASSESSMENT,
  isForAbsoluteNovice = false,
  createdAt = faker.date.recent(),
  creator = buildUser(),
  organization = buildOrganization(),
  targetProfile = buildTargetProfile(),
} = {}) {
  return new Campaign({
    id,
    name,
    code,
    title,
    idPixLabel,
    externalIdHelpImageUrl,
    alternativeTextToExternalIdHelpImage,
    customLandingPageText,
    archivedAt,
    type,
    isForAbsoluteNovice,
    createdAt,
    creator,
    organization,
    targetProfile,
  });
};

buildCampaign.ofTypeProfilesCollection = function({
  id = 1,
  name = faker.company.companyName(),
  code = 'AZERTY123',
  idPixLabel = faker.random.alphaNumeric(5),
  externalIdHelpImageUrl = null,
  alternativeTextToExternalIdHelpImage = null,
  customLandingPageText = faker.lorem.text(),
  archivedAt = null,
  type = Campaign.types.PROFILES_COLLECTION,
  isForAbsoluteNovice = false,
  createdAt = faker.date.recent(),
  creator = buildUser(),
  organization = buildOrganization(),
} = {}) {
  return new Campaign({
    id,
    name,
    code,
    idPixLabel,
    externalIdHelpImageUrl,
    alternativeTextToExternalIdHelpImage,
    customLandingPageText,
    archivedAt,
    type,
    isForAbsoluteNovice,
    title: null,
    createdAt,
    creator,
    organization,
    targetProfile: null,
  });
};

module.exports = buildCampaign;

const faker = require('faker');
const buildOrganization = require('./build-organization');
const buildTargetProfile = require('./build-target-profile');
const buildUser = require('./build-user');
const Campaign = require('../../../lib/domain/models/Campaign');
const databaseBuffer = require('../database-buffer');
const _ = require('lodash');

module.exports = function buildCampaign({
  id,
  name = faker.company.companyName(),
  code = faker.random.alphaNumeric(9),
  title = faker.random.word(),
  idPixLabel = faker.random.word(),
  externalIdHelpImageUrl = null,
  alternativeTextToExternalIdHelpImage = null,
  customLandingPageText = faker.lorem.text(),
  archivedAt = null,
  type = 'ASSESSMENT',
  createdAt = faker.date.recent(),
  organizationId,
  creatorId,
  targetProfileId,
} = {}) {

  if (type === Campaign.types.ASSESSMENT) {
    targetProfileId = _.isUndefined(targetProfileId) ? buildTargetProfile({ organizationId }).id : targetProfileId;
  }

  organizationId = _.isNil(organizationId) ? buildOrganization().id : organizationId;
  creatorId = _.isUndefined(creatorId) ? buildUser().id : creatorId;

  const values = {
    id,
    name,
    code,
    title,
    createdAt,
    idPixLabel,
    externalIdHelpImageUrl,
    alternativeTextToExternalIdHelpImage,
    customLandingPageText,
    archivedAt,
    type,
    organizationId,
    creatorId,
    targetProfileId,
  };
  return databaseBuffer.pushInsertable({
    tableName: 'campaigns',
    values,
  });
};

const buildOrganization = require('./build-organization');
const buildTargetProfile = require('./build-target-profile');
const buildUser = require('./build-user');
const CampaignTypes = require('../../../lib/domain/models/CampaignTypes');
const Assessment = require('../../../lib/domain/models/Assessment');
const databaseBuffer = require('../database-buffer');
const _ = require('lodash');

module.exports = function buildCampaign({
  id = databaseBuffer.getNextId(),
  name = 'Name',
  code,
  title = 'Title',
  idPixLabel = 'IdPixLabel',
  externalIdHelpImageUrl = null,
  alternativeTextToExternalIdHelpImage = null,
  customLandingPageText = 'Some landing page text ',
  isForAbsoluteNovice = false,
  archivedAt = null,
  archivedBy = null,
  type = 'ASSESSMENT',
  createdAt = new Date('2020-01-01'),
  organizationId,
  creatorId,
  ownerId,
  targetProfileId,
  customResultPageText = null,
  customResultPageButtonText = null,
  customResultPageButtonUrl = null,
  multipleSendings = false,
  assessmentMethod,
} = {}) {
  if (type === CampaignTypes.ASSESSMENT && !assessmentMethod) {
    targetProfileId = _.isUndefined(targetProfileId)
      ? buildTargetProfile({ ownerOrganizationId: organizationId }).id
      : targetProfileId;
    assessmentMethod = Assessment.methods.SMART_RANDOM;
  }

  organizationId = _.isNil(organizationId) ? buildOrganization().id : organizationId;
  creatorId = _.isUndefined(creatorId) ? buildUser().id : creatorId;
  ownerId = _.isUndefined(ownerId) ? buildUser().id : ownerId;
  // Because of unicity constraint if no code is given we set the unique id as campaign code.
  code = _.isUndefined(code) ? id.toString() : code;

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
    archivedBy,
    type,
    isForAbsoluteNovice,
    organizationId,
    creatorId,
    ownerId,
    targetProfileId,
    customResultPageText,
    customResultPageButtonText,
    customResultPageButtonUrl,
    multipleSendings,
    assessmentMethod,
  };
  return databaseBuffer.pushInsertable({
    tableName: 'campaigns',
    values,
  });
};

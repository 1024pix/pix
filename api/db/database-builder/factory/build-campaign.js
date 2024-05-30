import _ from 'lodash';

import { Assessment, CampaignTypes } from '../../../lib/domain/models/index.js';
import { databaseBuffer } from '../database-buffer.js';
import { buildOrganization } from './build-organization.js';
import { buildTargetProfile } from './build-target-profile.js';
import { buildUser } from './build-user.js';

const buildCampaign = function ({
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
  deletedAt = null,
  deletedBy = null,
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
  creatorId = _.isUndefined(creatorId) ? buildUser({ firstName: 'campaignCreator' }).id : creatorId;
  ownerId = _.isUndefined(ownerId) ? buildUser({ firstName: 'campaignOwner' }).id : ownerId;
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
    deletedAt,
    deletedBy,
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

export { buildCampaign };

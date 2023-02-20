import buildOrganization from './build-organization';
import buildTargetProfile from './build-target-profile';
import buildUser from './build-user';
import CampaignTypes from '../../../lib/domain/models/CampaignTypes';
import Assessment from '../../../lib/domain/models/Assessment';
import databaseBuffer from '../database-buffer';
import _ from 'lodash';

export default function buildCampaign({
  id = databaseBuffer.getNextId(),
  name = 'Name',
  code = 'ABC456TTY',
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
}

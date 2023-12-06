import { buildCampaign } from './build-campaign.js';
import { buildUser } from './build-user.js';
import { buildOrganizationLearner } from './build-organization-learner.js';
import { databaseBuffer } from '../database-buffer.js';
import { CampaignParticipationStatuses } from '../../../src/prescription/shared/domain/constants.js';
import _ from 'lodash';

const { SHARED } = CampaignParticipationStatuses;

const buildCampaignParticipation = function ({
  id = databaseBuffer.getNextId(),
  campaignId,
  createdAt = new Date('2020-01-01'),
  sharedAt = new Date('2020-01-02'),
  userId,
  organizationLearnerId,
  participantExternalId = 'participantExternalId',
  validatedSkillsCount,
  masteryRate,
  pixScore,
  status = SHARED,
  isImproved = false,
  deletedAt = null,
  deletedBy = null,
  isCertifiable = null,
} = {}) {
  userId = _.isUndefined(userId) ? buildUser().id : userId;
  organizationLearnerId = _.isUndefined(organizationLearnerId) ? buildOrganizationLearner().id : organizationLearnerId;
  campaignId = _.isUndefined(campaignId) ? buildCampaign().id : campaignId;
  const isShared = status === SHARED;
  sharedAt = isShared ? sharedAt : null;

  const values = {
    id,
    campaignId,
    userId,
    organizationLearnerId,
    createdAt,
    sharedAt,
    participantExternalId,
    validatedSkillsCount,
    masteryRate,
    pixScore,
    status,
    isImproved,
    deletedAt,
    deletedBy,
    isCertifiable,
  };
  databaseBuffer.pushInsertable({
    tableName: 'campaign-participations',
    values,
  });

  return {
    id,
    campaignId,
    userId,
    organizationLearnerId,
    createdAt,
    sharedAt,
    participantExternalId,
    validatedSkillsCount,
    masteryRate,
    pixScore,
    status,
    isImproved,
    deletedAt,
    deletedBy,
    isCertifiable,
  };
};

export { buildCampaignParticipation };

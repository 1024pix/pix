import { CampaignParticipationStatuses } from '../../../src/prescription/shared/domain/constants.ts';
import { databaseBuffer } from '../database-buffer.js';
import { buildCampaign } from './build-campaign.js';
import { buildOrganizationLearner } from './build-organization-learner.js';
import { buildUser } from './build-user.js';

const { SHARED } = CampaignParticipationStatuses;

const buildCampaignParticipation = function ({
  id = databaseBuffer.getNextId(),
  campaignId,
  createdAt = new Date('2020-01-01'),
  sharedAt = new Date('2020-01-02'),
  userId,
  organizationLearnerId,
  participantExternalId,
  validatedSkillsCount,
  masteryRate,
  pixScore,
  status = SHARED,
  isImproved = false,
  deletedAt = null,
  deletedBy = null,
  isCertifiable = null,
} = {}) {
  userId = userId === undefined ? buildUser().id : userId;
  organizationLearnerId =
    organizationLearnerId === undefined ? buildOrganizationLearner({ userId }).id : organizationLearnerId;
  campaignId = campaignId === undefined ? buildCampaign().id : campaignId;
  participantExternalId = participantExternalId ?? `externalId-${id}`;
  const isShared = status === SHARED;
  sharedAt = isShared ? sharedAt : null;

  if (deletedAt && !deletedBy) deletedBy = buildUser().id;

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

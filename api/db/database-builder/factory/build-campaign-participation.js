import buildCampaign from './build-campaign';
import buildUser from './build-user';
import buildOrganizationLearner from './build-organization-learner';
import databaseBuffer from '../database-buffer';
import CampaignParticipationStatuses from '../../../lib/domain/models/CampaignParticipationStatuses';
import _ from 'lodash';

const { SHARED } = CampaignParticipationStatuses;

export default function buildCampaignParticipation({
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
}

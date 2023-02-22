import _ from 'lodash';
import { knex } from '../../../db/knex-database-connection';
import CampaignManagement from '../../domain/read-models/CampaignManagement';
import { fetchPage } from '../utils/knex-utils';
import CampaignParticipationStatuses from '../../../lib/domain/models/CampaignParticipationStatuses';
import CampaignTypes from '../../domain/models/CampaignTypes';

const { SHARED, TO_SHARE, STARTED } = CampaignParticipationStatuses;

export default {
  async get(campaignId) {
    let campaign = await knex('campaigns')
      .select({
        id: 'campaigns.id',
        code: 'campaigns.code',
        name: 'campaigns.name',
        idPixLabel: 'campaigns.idPixLabel',
        createdAt: 'campaigns.createdAt',
        archivedAt: 'campaigns.archivedAt',
        type: 'campaigns.type',
        creatorLastName: 'users.lastName',
        creatorFirstName: 'users.firstName',
        creatorId: 'users.id',
        organizationId: 'campaigns.organizationId',
        organizationName: 'organizations.name',
        targetProfileId: 'campaigns.targetProfileId',
        targetProfileName: 'target-profiles.name',
        title: 'campaigns.title',
        ownerId: 'ownerUser.id',
        ownerLastName: 'ownerUser.lastName',
        ownerFirstName: 'ownerUser.firstName',
        customLandingPageText: 'campaigns.customLandingPageText',
        customResultPageText: 'campaigns.customResultPageText',
        customResultPageButtonText: 'campaigns.customResultPageButtonText',
        customResultPageButtonUrl: 'campaigns.customResultPageButtonUrl',
        multipleSendings: 'campaigns.multipleSendings',
      })
      .join('users', 'users.id', 'campaigns.creatorId')
      .join('users AS ownerUser', 'ownerUser.id', 'campaigns.ownerId')
      .join('organizations', 'organizations.id', 'campaigns.organizationId')
      .leftJoin('target-profiles', 'target-profiles.id', 'campaigns.targetProfileId')
      .where('campaigns.id', campaignId)
      .first();

    const participationCountByStatus = await _countParticipationsByStatus(campaignId, campaign.type);
    campaign = { ...campaign, ...participationCountByStatus };
    const campaignManagement = new CampaignManagement(campaign);
    return campaignManagement;
  },

  async findPaginatedCampaignManagements({ organizationId, page }) {
    const query = knex('campaigns')
      .select({
        id: 'campaigns.id',
        code: 'campaigns.code',
        name: 'campaigns.name',
        idPixLabel: 'campaigns.idPixLabel',
        createdAt: 'campaigns.createdAt',
        archivedAt: 'campaigns.archivedAt',
        type: 'campaigns.type',
        creatorLastName: 'creatorUser.lastName',
        creatorFirstName: 'creatorUser.firstName',
        creatorId: 'creatorUser.id',
        ownerId: 'ownerUser.id',
        ownerLastName: 'ownerUser.lastName',
        ownerFirstName: 'ownerUser.firstName',
      })
      .join('users AS creatorUser', 'creatorUser.id', 'campaigns.creatorId')
      .join('users AS ownerUser', 'ownerUser.id', 'campaigns.ownerId')
      .where('organizationId', organizationId)
      .orderBy('campaigns.createdAt', 'DESC');

    const { results, pagination } = await fetchPage(query, page);

    const campaignManagement = results.map((attributes) => new CampaignManagement(attributes));
    return { models: campaignManagement, meta: { ...pagination } };
  },

  update({ campaignId, campaignAttributes }) {
    const editableAttributes = _.pick(campaignAttributes, [
      'name',
      'title',
      'customLandingPageText',
      'customResultPageText',
      'customResultPageButtonText',
      'customResultPageButtonUrl',
      'multipleSendings',
    ]);
    return knex('campaigns').where({ id: campaignId }).update(editableAttributes);
  },
};

async function _countParticipationsByStatus(campaignId, campaignType) {
  const row = await knex('campaign-participations')
    .select([
      knex.raw(`sum(case when status = ? then 1 else 0 end) as shared`, SHARED),
      knex.raw(`sum(case when status = ? then 1 else 0 end) as completed`, TO_SHARE),
      knex.raw(`sum(case when status = ? then 1 else 0 end) as started`, STARTED),
    ])
    .where({ campaignId, isImproved: false })
    .whereNull('campaign-participations.deletedAt')
    .groupBy('campaignId')
    .first();

  return _mapToParticipationByStatus(row, campaignType);
}

function _mapToParticipationByStatus(row = {}, campaignType) {
  const participationByStatus = {
    shared: row.shared || 0,
    completed: row.completed || 0,
  };
  if (campaignType === CampaignTypes.ASSESSMENT) {
    participationByStatus.started = row.started || 0;
  }
  return participationByStatus;
}

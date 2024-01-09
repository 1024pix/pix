import { knex } from '../../../../../db/knex-database-connection.js';
import { CampaignParticipantActivity } from '../../domain/read-models/CampaignParticipantActivity.js';
import { fetchPage } from '../../../../../lib/infrastructure/utils/knex-utils.js';
import { filterByFullName } from '../../../../../lib/infrastructure/utils/filter-utils.js';

const campaignParticipantActivityRepository = {
  async findPaginatedByCampaignId({ page = { size: 25 }, campaignId, filters = {} }) {
    const query = knex
      .with('campaign_participants_activities_ordered', (qb) =>
        _buildCampaignParticipationByParticipant(qb, campaignId, filters),
      )
      .from('campaign_participants_activities_ordered')
      .orderByRaw('LOWER(??) ASC, LOWER(??) ASC', ['lastName', 'firstName']);

    const { results, pagination } = await fetchPage(query, page);

    const campaignParticipantsActivities = results.map((result) => {
      return new CampaignParticipantActivity(result);
    });

    return {
      campaignParticipantsActivities,
      pagination,
    };
  },
};

function _buildCampaignParticipationByParticipant(queryBuilder, campaignId, filters) {
  queryBuilder
    .select(
      'campaign-participations.id AS campaignParticipationId',
      'campaign-participations.userId',
      'view-active-organization-learners.firstName',
      'view-active-organization-learners.lastName',
      'campaign-participations.participantExternalId',
      'campaign-participations.sharedAt',
      'campaign-participations.status',
      'campaigns.type AS campaignType',
    )
    .from('campaign-participations')
    .join('campaigns', 'campaigns.id', 'campaign-participations.campaignId')
    .join(
      'view-active-organization-learners',
      'view-active-organization-learners.id',
      'campaign-participations.organizationLearnerId',
    )
    .modify(_filterParticipations, filters, campaignId);
}

function _filterParticipations(queryBuilder, filters, campaignId) {
  queryBuilder
    .where('campaign-participations.campaignId', '=', campaignId)
    .where('campaign-participations.isImproved', '=', false)
    .whereNull('campaign-participations.deletedAt')
    .modify(_filterByDivisions, filters)
    .modify(_filterByStatus, filters)
    .modify(_filterByGroup, filters)
    .modify(_filterBySearch, filters);
}

function _filterBySearch(queryBuilder, filters) {
  if (filters.search) {
    filterByFullName(
      queryBuilder,
      filters.search,
      'view-active-organization-learners.firstName',
      'view-active-organization-learners.lastName',
    );
  }
}

function _filterByDivisions(queryBuilder, filters) {
  if (filters.divisions) {
    const divisionsLowerCase = filters.divisions.map((division) => division.toLowerCase());
    queryBuilder.whereRaw('LOWER("view-active-organization-learners"."division") = ANY(:divisionsLowerCase)', {
      divisionsLowerCase,
    });
  }
}

function _filterByStatus(queryBuilder, filters) {
  if (filters.status) {
    queryBuilder.where('campaign-participations.status', filters.status);
  }
}

function _filterByGroup(queryBuilder, filters) {
  if (filters.groups) {
    const groupsLowerCase = filters.groups.map((group) => group.toLowerCase());
    queryBuilder.whereIn(knex.raw('LOWER("view-active-organization-learners"."group")'), groupsLowerCase);
  }
}

export { campaignParticipantActivityRepository };

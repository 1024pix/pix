const { knex } = require('../../../db/knex-database-connection');
const CampaignParticipantActivity = require('../../domain/read-models/CampaignParticipantActivity');

const campaignParticipantActivityRepository = {
  async findPaginatedByCampaignId({ page = { size: 25 }, campaignId, filters = {} }) {
    const pagination = await getPagination(campaignId, filters, page);
    const results = await _buildParticipationsPage(knex, campaignId, filters, pagination);

    const campaignParticipantsActivities = results.map((result) => {
      return new CampaignParticipantActivity(result);
    });

    return {
      campaignParticipantsActivities,
      pagination,
    };
  },
};

function _buildCampaignParticipationByParticipant(qb, campaignId, filters) {
  qb.select(
    'campaign-participations.id AS campaignParticipationId',
    'campaign-participations.userId',
    'organization-learners.firstName',
    'organization-learners.lastName',
    'campaign-participations.participantExternalId',
    'campaign-participations.sharedAt',
    'campaign-participations.status',
    'campaigns.type AS campaignType'
  )
    .from('campaign-participations')
    .join('campaigns', 'campaigns.id', 'campaign-participations.campaignId')
    .join('organization-learners', 'organization-learners.id', 'campaign-participations.organizationLearnerId')
    .where('campaign-participations.campaignId', '=', campaignId)
    .where('campaign-participations.isImproved', '=', false)
    .modify(_filterByDivisions, filters)
    .modify(_filterByStatus, filters)
    .modify(_filterByGroup, filters);
}

function _buildPaginationQuery(queryBuilder, campaignId, filters) {
  return queryBuilder
    .select('campaign-participations.id')
    .from('campaign-participations')
    .join('campaigns', 'campaigns.id', 'campaign-participations.campaignId')
    .leftJoin('organization-learners', function () {
      this.on({ 'campaign-participations.userId': 'organization-learners.userId' }).andOn({
        'campaigns.organizationId': 'organization-learners.organizationId',
      });
    })
    .where('campaign-participations.campaignId', '=', campaignId)
    .where('campaign-participations.isImproved', '=', false)
    .modify(_filterByDivisions, filters)
    .modify(_filterByStatus, filters)
    .modify(_filterByGroup, filters);
}

function _filterByDivisions(qb, filters) {
  if (filters.divisions) {
    const divisionsLowerCase = filters.divisions.map((division) => division.toLowerCase());
    qb.whereRaw('LOWER("organization-learners"."division") = ANY(:divisionsLowerCase)', { divisionsLowerCase });
  }
}

function _filterByStatus(qb, filters) {
  if (filters.status) {
    qb.where('campaign-participations.status', filters.status);
  }
}
function _filterByGroup(qb, filters) {
  if (filters.groups) {
    const groupsLowerCase = filters.groups.map((group) => group.toLowerCase());
    qb.whereIn(knex.raw('LOWER("organization-learners"."group")'), groupsLowerCase);
  }
}

function _buildParticipationsPage(queryBuilder, campaignId, filters, { page, pageSize }) {
  const offset = (page - 1) * pageSize;

  return queryBuilder
    .with('campaign_participants_activities_ordered', (qb) =>
      _buildCampaignParticipationByParticipant(qb, campaignId, filters)
    )
    .from('campaign_participants_activities_ordered')
    .orderByRaw('LOWER(??) ASC, LOWER(??) ASC', ['lastName', 'firstName'])
    .limit(pageSize)
    .offset(offset);
}

async function getPagination(campaignId, filters, { number = 1, size = 10 } = {}) {
  const page = number < 1 ? 1 : number;

  const query = _buildPaginationQuery(knex, campaignId, filters);
  const { rowCount } = await knex.count('*', { as: 'rowCount' }).from(query.as('query_all_results')).first();

  return {
    page,
    pageSize: size,
    rowCount,
    pageCount: Math.ceil(rowCount / size),
  };
}

module.exports = campaignParticipantActivityRepository;

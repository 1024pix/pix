const { knex } = require('../../../db/knex-database-connection');
const CampaignParticipantActivity = require('../../domain/read-models/CampaignParticipantActivity');

const campaignParticipantActivityRepository = {

  async findPaginatedByCampaignId({ page = { size: 25 }, campaignId, filters = {} }) {

    const pagination = await getPagination(campaignId, filters, page);
    const results = await _fetchParticipationsWithAssessment(knex, campaignId, filters, pagination);

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
    'users.id AS userId',
    knex.raw('COALESCE ("schooling-registrations"."firstName", "users"."firstName") AS "firstName"'),
    knex.raw('COALESCE ("schooling-registrations"."lastName", "users"."lastName") AS "lastName"'),
    'campaign-participations.participantExternalId',
    'campaign-participations.sharedAt',
    'campaign-participations.status',
    'campaigns.type AS campaignType',
  )
    .from('campaign-participations')
    .join('users', 'users.id', 'campaign-participations.userId')
    .join('campaigns', 'campaigns.id', 'campaign-participations.campaignId')
    .leftJoin('schooling-registrations', function() {
      this.on({ 'campaign-participations.userId': 'schooling-registrations.userId' })
        .andOn({ 'campaigns.organizationId': 'schooling-registrations.organizationId' });
    })
    .where('campaign-participations.campaignId', '=', campaignId)
    .where('campaign-participations.isImproved', '=', false)
    .modify(_filterByDivisions, filters)
    .modify(_filterByStatus, filters);
}

function _filterByDivisions(qb, filters) {
  if (filters.divisions) {
    const divisionsLowerCase = filters.divisions.map((division) => division.toLowerCase());
    qb.whereRaw('LOWER("schooling-registrations"."division") = ANY(:divisionsLowerCase)', { divisionsLowerCase });
  }
}

function _filterByStatus(qb, filters) {
  if (filters.status) {
    qb.where('campaign-participations.status', filters.status);
  }
}

function _buildParticipationsPage(queryBuilder, campaignId, filters, { page, pageSize }) {
  const offset = (page - 1) * pageSize;

  return queryBuilder
    .with('campaign_participants_activities_ordered', (qb) => _buildCampaignParticipationByParticipant(qb, campaignId, filters))
    .from('campaign_participants_activities_ordered')
    .orderByRaw('LOWER(??) ASC, LOWER(??) ASC', ['lastName', 'firstName'])
    .limit(pageSize)
    .offset(offset);
}

function _fetchParticipationsWithAssessment(queryBuilder, campaignId, filters, pagination) {
  return queryBuilder
    .with('with_assessment', (qb) => _buildParticipationsPage(qb, campaignId, filters, pagination))
    .select('with_assessment.*', 'assessments.state AS assessmentState')
    .from('with_assessment')
    .orderByRaw('LOWER(??) ASC, LOWER(??) ASC', ['lastName', 'firstName'])
    .leftJoin('assessments', 'assessments.campaignParticipationId', 'with_assessment.campaignParticipationId')
    .whereNotExists(
      knex('assessments AS newerAssessments')
        .select('id')
        .where('newerAssessments.campaignParticipationId', '=', knex.raw('"assessments"."campaignParticipationId"'))
        .where('newerAssessments.createdAt', '>', knex.raw('"assessments"."createdAt"')),
    );
}

function _buildPaginationQuery(queryBuilder, campaignId, filters) {
  return queryBuilder
    .select('campaign-participations.id')
    .from('campaign-participations')
    .join('campaigns', 'campaigns.id', 'campaign-participations.campaignId')
    .leftJoin('schooling-registrations', function() {
      this.on({ 'campaign-participations.userId': 'schooling-registrations.userId' })
        .andOn({ 'campaigns.organizationId': 'schooling-registrations.organizationId' });
    })
    .where('campaign-participations.campaignId', '=', campaignId)
    .where('campaign-participations.isImproved', '=', false)
    .modify(_filterByDivisions, filters);
}

async function getPagination(campaignId, filters, { number = 1, size = 10 } = {}) {
  const page = number < 1 ? 1 : number;

  const query = _buildPaginationQuery(knex, campaignId, filters);
  const { rowCount } = await knex
    .count('*', { as: 'rowCount' })
    .from(query.as('query_all_results'))
    .first();

  return {
    page,
    pageSize: size,
    rowCount,
    pageCount: Math.ceil(rowCount / size),
  };
}

module.exports = campaignParticipantActivityRepository;


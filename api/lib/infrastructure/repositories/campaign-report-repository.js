const { knex } = require('../bookshelf');

const CampaignReport = require('../../domain/read-models/CampaignReport');
const { fetchPage } = require('../utils/knex-utils');
const { NotFoundError } = require('../../domain/errors');

function _setSearchFiltersForQueryBuilder(qb, { name, ongoing = true, creatorName }) {
  if (name) {
    qb.whereRaw('LOWER("name") LIKE ?', `%${name.toLowerCase()}%`);
  }
  if (ongoing) {
    qb.whereNull('campaigns.archivedAt');
  } else {
    qb.whereNotNull('campaigns.archivedAt');
  }
  if (creatorName) {
    qb.whereRaw('(LOWER("users"."firstName") LIKE ? OR LOWER("users"."lastName") LIKE ?)', [`%${creatorName.toLowerCase()}%`, `%${creatorName.toLowerCase()}%`]);
  }
}

module.exports = {

  async get(id) {
    const result = await knex('campaigns')
      .select('campaigns.*')
      .select({
        'creatorId': 'users.id',
        'creatorLastName': 'users.lastName',
        'creatorFirstName': 'users.firstName',
        'targetProfileId': 'target-profiles.id',
        'targetProfileName': 'target-profiles.name',
        'targetProfileImageUrl': 'target-profiles.imageUrl',
      })
      .select(
        knex.raw('COUNT(*) FILTER (WHERE "campaign-participations"."id" IS NOT NULL) OVER (partition by "campaigns"."id") AS "participationsCount"'),
        knex.raw('COUNT(*) FILTER (WHERE "campaign-participations"."id" IS NOT NULL AND "campaign-participations"."isShared" IS TRUE) OVER (partition by "campaigns"."id") AS "sharedParticipationsCount"'),
      )
      .join('users', 'users.id', 'campaigns.creatorId')
      .leftJoin('target-profiles', 'target-profiles.id', 'campaigns.targetProfileId')
      .leftJoin('campaign-participations', 'campaign-participations.campaignId', 'campaigns.id')
      .where('campaigns.id', id)
      .first();

    if (!result) {
      throw new NotFoundError(`La campagne d'id ${id} n'existe pas ou son accès est restreint`);
    }

    return new CampaignReport({ ...result, id });
  },

  async findPaginatedFilteredByOrganizationId({ organizationId, filter, page }) {
    const query = knex('campaigns')
      .distinct('campaigns.id')
      .select(
        'campaigns.*',
        'users.id AS "creatorId"',
        'users.firstName AS creatorFirstName',
        'users.lastName AS creatorLastName',
      )
      .join('users', 'users.id', 'campaigns.creatorId')
      .leftJoin('campaign-participations', 'campaign-participations.campaignId', 'campaigns.id')
      .where('campaigns.organizationId', organizationId)
      .modify(_setSearchFiltersForQueryBuilder, filter)
      .orderBy('campaigns.createdAt', 'DESC');

    const { results, pagination } = await fetchPage(query, page);
    const atLeastOneCampaign = await knex('campaigns').select('id').where({ organizationId }).first(1);
    const hasCampaigns = Boolean(atLeastOneCampaign);

    const campaignReports = results.map((result) => new CampaignReport(result));
    return { models: campaignReports, meta: { ...pagination, hasCampaigns } };
  },
};

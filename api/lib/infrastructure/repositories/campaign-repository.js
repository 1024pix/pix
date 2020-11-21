const _ = require('lodash');
const { knex } = require('../bookshelf');

const BookshelfCampaign = require('../data/campaign');
const Campaign = require('../../domain/models/Campaign');
const CampaignReport = require('../../domain/models/CampaignReport');
const queryBuilder = require('../utils/query-builder');
const { fetchPage } = require('../utils/knex-utils');

function _toDomain(bookshelfCampaign) {
  const dbCampaign = bookshelfCampaign.toJSON();
  return new Campaign(_.pick(dbCampaign, [
    'id',
    'name',
    'code',
    'type',
    'organizationId',
    'creatorId',
    'createdAt',
    'targetProfileId',
    'customLandingPageText',
    'idPixLabel',
    'externalIdHelpImageUrl',
    'alternativeTextToExternalIdHelpImage',
    'title',
    'type',
    'archivedAt',
  ]));
}

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

  isCodeAvailable(code) {
    return BookshelfCampaign
      .where({ code })
      .fetch()
      .then((campaign) => {
        if (campaign) {
          return false;
        }
        return true;
      });
  },

  getByCode(code) {
    return BookshelfCampaign
      .where({ code })
      .fetch()
      .then((campaign) => {
        if (campaign) {
          return _toDomain(campaign);
        }
        return Promise.resolve(null);
      });
  },

  get(id, options) {
    return queryBuilder.get(BookshelfCampaign, id, options);
  },

  async create(campaign) {
    const campaignAttributes = _.pick(campaign, [
      'name',
      'code',
      'title',
      'type',
      'idPixLabel',
      'customLandingPageText',
      'creatorId',
      'organizationId',
      'targetProfileId',
    ]);
    const createdCampaign = await (new BookshelfCampaign(campaignAttributes).save());
    return _toDomain(createdCampaign);
  },

  async update(campaign) {
    const editedAttributes = _.pick(campaign, [
      'name',
      'title',
      'customLandingPageText',
      'archivedAt',
    ]);
    const bookshelfCampaign = await BookshelfCampaign.where({ id: campaign.id }).fetch();
    await bookshelfCampaign.save(editedAttributes, { method: 'update', patch: true });
    return _toDomain(bookshelfCampaign);
  },

  async findPaginatedFilteredByOrganizationIdWithCampaignReports({ organizationId, filter, page }) {
    const query = knex('campaigns')
      .distinct('campaigns.id')
      .select(
        'campaigns.*',
        'users.id AS "creatorId"',
        'users.firstName',
        'users.lastName',
        knex.raw('COUNT(*) FILTER (WHERE "campaign-participations"."id" IS NOT NULL) OVER (partition by "campaigns"."id") AS "participationsCount"'),
        knex.raw('COUNT(*) FILTER (WHERE "campaign-participations"."id" IS NOT NULL AND "campaign-participations"."isShared" IS TRUE) OVER (partition by "campaigns"."id") AS "sharedParticipationsCount"'),
      )
      .join('users', 'users.id', 'campaigns.creatorId')
      .leftJoin('campaign-participations', 'campaign-participations.campaignId', 'campaigns.id')
      .where('campaigns.organizationId', organizationId)
      .modify(_setSearchFiltersForQueryBuilder, filter)
      .orderBy('campaigns.createdAt', 'DESC');

    const { results, pagination } = await fetchPage(query, page);
    const atLeastOneCampaign = await knex('campaigns').select('id').where({ organizationId }).first(1);
    const hasCampaigns = Boolean(atLeastOneCampaign);

    const campaignsWithReports = results.map((result) => {
      const campaignReport = new CampaignReport({
        id: result.id,
        participationsCount: result.participationsCount,
        sharedParticipationsCount: result.sharedParticipationsCount,
      });
      const creator = { id: result.creatorId, firstName: result.firstName, lastName: result.lastName };

      return new Campaign({ ...result, campaignReport, creator });
    });
    return { models: campaignsWithReports, meta: { ...pagination, hasCampaigns } };
  },

  async checkIfUserOrganizationHasAccessToCampaign(campaignId, userId) {
    try {
      await BookshelfCampaign
        .query((qb) => {
          qb.where({ 'campaigns.id': campaignId, 'memberships.userId': userId, 'memberships.disabledAt': null });
          qb.innerJoin('memberships', 'memberships.organizationId', 'campaigns.organizationId');
          qb.innerJoin('organizations', 'organizations.id', 'campaigns.organizationId');
        })
        .fetch({ require: true });
    } catch (e) {
      return false;
    }
    return true;
  },

  async checkIfCampaignIsArchived(campaignId) {
    const bookshelfCampaign = await BookshelfCampaign
      .where({ id: campaignId })
      .fetch({ require: true });

    return Boolean(_toDomain(bookshelfCampaign).archivedAt);
  },
};

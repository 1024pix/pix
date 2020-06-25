const _ = require('lodash');
const { knex } = require('../bookshelf');

const BookshelfCampaign = require('../data/campaign');
const Campaign = require('../../domain/models/Campaign');
const CampaignReport = require('../../domain/models/CampaignReport');
const queryBuilder = require('../utils/query-builder');

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
    'title',
    'type',
    'archivedAt',
  ]));
}

function _fromBookshelfCampaignWithReportDataToDomain(campaignWithReportData) {
  const jsonCampaignWithReportData = campaignWithReportData.toJSON();

  const campaignWithReport = _.pick(jsonCampaignWithReportData, [
    'id',
    'name',
    'code',
    'organizationId',
    'creator',
    'createdAt',
    'targetProfileId',
    'customLandingPageText',
    'idPixLabel',
    'title',
    'type',
    'archivedAt',
  ]);

  campaignWithReport.campaignReport = new CampaignReport({
    id: jsonCampaignWithReportData.id,
    participationsCount: jsonCampaignWithReportData.participationsCount || 0,
    sharedParticipationsCount: jsonCampaignWithReportData.sharedParticipationsCount || 0
  });

  return new Campaign(campaignWithReport);
}

function _countSharedCampaignParticipations(qb) {
  return qb.leftJoin(
    knex('campaign-participations')
      .select('campaignId')
      .count('* as sharedParticipationsCount')
      .groupBy('campaignId', 'isShared')
      .having('isShared', '=', true)
      .as('isShared'),
    'campaigns.id', 'isShared.campaignId'
  );
}

function _countCampaignParticipations(qb) {
  return qb.leftJoin(
    knex('campaign-participations')
      .select('campaignId')
      .count('* as participationsCount')
      .groupBy('campaignId')
      .as('participations'),
    'campaigns.id', 'participations.campaignId'
  );
}

function _setSearchFiltersForQueryBuilder(qb, { name, ongoing = true, creatorId }) {
  if (name) {
    qb.whereRaw('LOWER("name") LIKE ?', `%${name.toLowerCase()}%`);
  }
  if (ongoing) {
    qb.whereNull('campaigns.archivedAt');
  } else {
    qb.whereNotNull('campaigns.archivedAt');
  }
  if (creatorId) {
    qb.where('campaigns.creatorId', creatorId);
  }
}

async function _hasCampaignsInOrganization({ organizationId }) {
  const result = await BookshelfCampaign
    .query((qb) => {
      qb.select('id')
        .where('campaigns.organizationId', organizationId)
        .limit(1);
    }).fetch();

  return Boolean(result);
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
      'targetProfileId'
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
    const { models, pagination } = await BookshelfCampaign
      .query((qb) => {
        qb.select('campaigns.*', 'participations.participationsCount', 'isShared.sharedParticipationsCount')
          .where('campaigns.organizationId', organizationId)
          .modify(_setSearchFiltersForQueryBuilder, filter)
          .modify(_countCampaignParticipations)
          .modify(_countSharedCampaignParticipations)
          .orderByRaw('DATE(campaigns."createdAt") DESC');
      })
      .fetchPage({
        page: page.number,
        pageSize: page.size,
        withRelated: ['creator']
      });

    const hasCampaigns = await _hasCampaignsInOrganization({ organizationId });
    
    const campaignsWithReports = models.map(_fromBookshelfCampaignWithReportDataToDomain);
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

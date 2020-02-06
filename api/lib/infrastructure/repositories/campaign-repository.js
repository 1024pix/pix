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
    'organizationId',
    'creatorId',
    'createdAt',
    'targetProfileId',
    'customLandingPageText',
    'idPixLabel',
    'title'
  ]));
}

function _fromBookshelfCampaignWithReportDataToDomain(campaignWithReportData) {
  const jsonCampaignWithReportData = campaignWithReportData.toJSON();

  const campaignWithReport = _.pick(jsonCampaignWithReportData, [
    'id',
    'name',
    'code',
    'organizationId',
    'creatorId',
    'createdAt',
    'targetProfileId',
    'customLandingPageText',
    'idPixLabel',
    'title'
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

function _setSearchFiltersForQueryBuilder(qb, { name }) {
  if (name) {
    qb.whereRaw('LOWER("name") LIKE ?', `%${name.toLowerCase()}%`);
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

  save(domainCampaign) {
    const repositoryCampaign = _.omit(domainCampaign, ['createdAt', 'organizationLogoUrl', 'organizationName', 'targetProfile', 'campaignReport', 'campaignCollectiveResult', 'isRestricted']);
    return new BookshelfCampaign(repositoryCampaign)
      .save()
      .then(_toDomain);
  },

  update(campaign) {

    const campaignRawData = _.pick(campaign, ['title', 'customLandingPageText']);

    return new BookshelfCampaign({ id: campaign.id })
      .save(campaignRawData, { patch: true })
      .then((model) => model.refresh())
      .then(_toDomain);
  },

  findPaginatedFilteredByOrganizationIdWithCampaignReports({ organizationId, filter, page }) {
    return BookshelfCampaign
      .query((qb) => {
        qb.select('campaigns.*', 'participations.participationsCount', 'isShared.sharedParticipationsCount')
          .where('campaigns.organizationId', organizationId)
          .modify(_setSearchFiltersForQueryBuilder, filter)
          .modify(_countCampaignParticipations)
          .modify(_countSharedCampaignParticipations)
          .orderByRaw('LOWER(campaigns."name") ASC, campaigns."createdAt" DESC');
      })
      .fetchPage({
        page: page.number,
        pageSize: page.size
      })
      .then(({ models, pagination }) => {
        const campaignsWithReports = models.map(_fromBookshelfCampaignWithReportDataToDomain);
        return { models: campaignsWithReports, pagination };
      });
  },

  checkIfUserOrganizationHasAccessToCampaign(campaignId, userId) {
    return BookshelfCampaign
      .query((qb) => {
        qb.where({ 'campaigns.id': campaignId, 'memberships.userId': userId });
        qb.innerJoin('memberships', 'memberships.organizationId', 'campaigns.organizationId');
        qb.innerJoin('organizations', 'organizations.id', 'campaigns.organizationId');
      })
      .fetch({
        require: true,
      })
      .then(() => true)
      .catch(() => false);
  }
};

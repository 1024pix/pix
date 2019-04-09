const _ = require('lodash');
const { knex } = require('../../../db/knex-database-connection');

const BookshelfCampaign = require('../data/campaign');
const Campaign = require('../../domain/models/Campaign');
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

function _fromRawDataToDomain(rawQueryresponse) {
  rawQueryresponse.campaignReport = {
    id: rawQueryresponse.id,
    participationsCount: rawQueryresponse.participationsCount ? rawQueryresponse.participationsCount : 0,
    sharedParticipationsCount: rawQueryresponse.sharedParticipationsCount ? rawQueryresponse.sharedParticipationsCount : 0,
  };
  return new Campaign(_.pick(rawQueryresponse, [
    'id',
    'name',
    'code',
    'organizationId',
    'creatorId',
    'createdAt',
    'targetProfileId',
    'customLandingPageText',
    'idPixLabel',
    'title',
    'campaignReport'
  ]));
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
    const repositoryCampaign = _.omit(domainCampaign, ['createdAt', 'organizationLogoUrl', 'targetProfile', 'campaignReport']);
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

  findByOrganizationIdWithCampaignReports(organizationId) {
    return knex('campaigns')
      .select(
        'campaigns.*',
        'participations.participationsCount',
        'isShared.sharedParticipationsCount'
      )
      .leftJoin(
        knex('campaign-participations')
          .select(
            'campaignId',
            knex.raw('COUNT(*) AS participationsCount')
          )
          .groupBy('campaignId')
          .as('participations'),
        'campaigns.id', 'participations.campaignId'
      )
      .leftJoin(
        knex('campaign-participations')
          .select(
            'campaignId',
            knex.raw('COUNT(*) AS sharedParticipationsCount')
          )
          .groupBy('campaignId', 'isShared')
          .having('isShared', '=', true)
          .as('isShared'),
        'campaigns.id', 'isShared.campaignId'
      )
      .where('campaigns.organizationId', organizationId)
      .then((campaignsWithCampaignReports) => campaignsWithCampaignReports.map(_fromRawDataToDomain));
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

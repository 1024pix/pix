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
    participationsCount: rawQueryresponse.participationsCount,
    sharedParticipationsCount: rawQueryresponse.sharedParticipationsCount
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

  findByOrganizationId(organizationId) {
    return BookshelfCampaign
      .where({ organizationId })
      .fetchAll()
      .then((campaigns) => campaigns.models.map(_toDomain));
  },

  findByOrganizationIdWithCampaignReports(organizationId) {
    const queryToGetCampaignsWithCampaignReports = `
      SELECT *, participations.participationsCount,
             isShared.sharedParticipationsCount
      FROM campaigns
      
      INNER JOIN (
          SELECT "campaignId", COUNT(*) AS participationsCount
         FROM "campaign-participations"
         GROUP BY "campaignId"
      ) AS participations
      ON campaigns.id = participations."campaignId"
      
      INNER JOIN (
         SELECT "campaignId", COUNT(*) AS sharedParticipationsCount
          FROM "campaign-participations"
          GROUP BY "campaignId", "isShared"
          HAVING "isShared" = true
      ) AS isShared
      ON campaigns.id = isShared."campaignId"
      
      WHERE "organizationId" = ?
      `;

    return knex.raw(queryToGetCampaignsWithCampaignReports, organizationId)
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

const _ = require('lodash');
const bookshelfToDomainConverter = require('../utils/bookshelf-to-domain-converter');
const BookshelfCampaign = require('../data/campaign');
const queryBuilder = require('../utils/query-builder');
const { NotFoundError } = require('../../domain/errors');

module.exports = {

  getByCode(code) {
    return BookshelfCampaign
      .where({ code })
      .fetch()
      .then((campaign) => {
        if (campaign) {
          return bookshelfToDomainConverter.buildDomainObject(BookshelfCampaign, campaign);
        }
        throw new NotFoundError(`Campaign with code ${code} does not exist.`);
      });
  },

  get(id, options) {
    return queryBuilder.get(BookshelfCampaign, id, options);
  },

  save(domainCampaign) {
    const repositoryCampaign = _.omit(domainCampaign, ['createdAt', 'organizationLogoUrl', 'targetProfile', 'campaignReport']);
    return new BookshelfCampaign(repositoryCampaign)
      .save()
      .then((campaign) => bookshelfToDomainConverter.buildDomainObject(BookshelfCampaign, campaign));
  },

  update(campaign) {

    const campaignRawData = _.pick(campaign, ['title', 'customLandingPageText']);

    return new BookshelfCampaign({ id: campaign.id })
      .save(campaignRawData, { patch: true })
      .then((model) => model.refresh())
      .then((campaign) => bookshelfToDomainConverter.buildDomainObject(BookshelfCampaign, campaign));
  },

  findByOrganizationId(organizationId) {
    return BookshelfCampaign
      .where({ organizationId })
      .fetchAll()
      .then((campaigns) => bookshelfToDomainConverter.buildDomainObjects(BookshelfCampaign, campaigns.models));
  },

  checkIfUserOrganizationHasAccessToCampaign(campaignId, userId) {
    return BookshelfCampaign
      .where({ 'campaigns.id': campaignId, userId })
      .query((qb) => {
        qb.innerJoin('memberships', 'campaigns.organizationId', 'memberships.organizationId');
      })
      .fetch({
        require: true,
      })
      .then(() => true)
      .catch(() => false);
  }
};

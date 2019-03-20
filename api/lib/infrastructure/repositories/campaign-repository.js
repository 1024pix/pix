const _ = require('lodash');

const BookshelfCampaign = require('../data/campaign');
const Campaign = require('../../domain/models/Campaign');
const queryBuilder = require('../utils/query-builder');
const { NotFoundError } = require('../../domain/errors');

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

module.exports = {

  getByCode(code) {
    return BookshelfCampaign
      .where({ code })
      .fetch()
      .then((campaign) => {
        if (campaign) {
          return _toDomain(campaign);
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

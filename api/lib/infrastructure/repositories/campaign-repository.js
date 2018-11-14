const _ = require('lodash');

const BookshelfCampaign = require('../data/campaign');
const Campaign = require('../../domain/models/Campaign');

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

  get(id) {
    return BookshelfCampaign
      .where({ id })
      .fetch()
      .then((campaign) => {
        if (campaign) {
          return _toDomain(campaign);
        }
        return Promise.resolve(null);
      });
  },

  save(campaignToSave) {
    const cleanedCampaignToSave = _.omit(campaignToSave, ['createdAt', 'organizationLogoUrl']);
    return new BookshelfCampaign(cleanedCampaignToSave)
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
  }
};

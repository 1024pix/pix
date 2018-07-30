const BookshelfCampaign = require('../data/campaign');
const Campaign = require('../../domain/models/Campaign');

function _toDomain(bookshelfCampaign) {
  return new Campaign(bookshelfCampaign.toJSON());
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

  save(campaignToSave) {
    return new BookshelfCampaign(campaignToSave)
      .save()
      .then(_toDomain);
  },

  findByOrganization(organizationId) {
    return BookshelfCampaign
      .where({ organizationId })
      .fetchAll()
      .then((campaigns) => campaigns.models.map(_toDomain));
  }
};

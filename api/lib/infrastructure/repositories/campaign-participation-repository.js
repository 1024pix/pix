const BookshelfCampaignParticipation = require('../data/campaign-participation');
const CampaignParticipation = require('../../domain/models/CampaignParticipation');

function _toDomain(bookshelfCampaignParticipation) {
  return new CampaignParticipation(bookshelfCampaignParticipation.toJSON());
}

module.exports = {

  save(campaignParticipation) {
    return new BookshelfCampaignParticipation(campaignParticipation)
      .save()
      .then(_toDomain);
  }

};

const BookshelfCampaignParticipation = require('../data/campaign-participation');
const CampaignParticipation = require('../../domain/models/CampaignParticipation');
const Campaign = require('../../domain/models/Campaign');
const fp = require('lodash/fp');

function _toDomain(bookshelfCampaignParticipation) {
  return new CampaignParticipation({
    id: bookshelfCampaignParticipation.get('id'),
    assessmentId: bookshelfCampaignParticipation.get('assessmentId'),
    campaign: new Campaign(bookshelfCampaignParticipation.related('campaign').toJSON()),
  });
}

module.exports = {

  save(campaignParticipation) {
    return new BookshelfCampaignParticipation(campaignParticipation.adaptModelToDb())
      .save()
      .then(_toDomain);
  },

  findByCampaignId(campaignId) {
    return BookshelfCampaignParticipation
      .query((qb) => {
        qb.where({ campaignId });
      })
      .fetchAll({ withRelated: ['campaign'] })
      .then((bookshelfCampaignParticipation) => bookshelfCampaignParticipation.models)
      .then(fp.map(_toDomain));  }
};

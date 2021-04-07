const bookshelfToDomainConverter = require('../utils/bookshelf-to-domain-converter');
const BookshelfBadge = require('../../infrastructure/data/badge');

module.exports = {

  findByTargetProfileId(targetProfileId) {
    return BookshelfBadge
      .where({ targetProfileId })
      .fetchAll({
        require: false,
        withRelated: ['badgeCriteria', 'badgePartnerCompetences'],
      })
      .then((results) => bookshelfToDomainConverter.buildDomainObjects(BookshelfBadge, results));
  },

  findByCampaignId(campaignId) {
    return BookshelfBadge
      .query((qb) => {
        qb.join('target-profiles', 'target-profiles.id', 'badges.targetProfileId');
        qb.join('campaigns', 'campaigns.targetProfileId', 'target-profiles.id');
      })
      .where('campaigns.id', campaignId)
      .fetchAll({
        require: false,
        withRelated: ['badgeCriteria', 'badgePartnerCompetences'],
      })
      .then((results) => bookshelfToDomainConverter.buildDomainObjects(BookshelfBadge, results));
  },

  findByCampaignParticipationId(campaignParticipationId) {
    return BookshelfBadge
      .query((qb) => {
        qb.join('target-profiles', 'target-profiles.id', 'badges.targetProfileId');
        qb.join('campaigns', 'campaigns.targetProfileId', 'target-profiles.id');
        qb.join('campaign-participations', 'campaign-participations.campaignId', 'campaigns.id');
      })
      .where('campaign-participations.id', campaignParticipationId)
      .fetchAll({
        require: false,
        withRelated: ['badgeCriteria', 'badgePartnerCompetences'],
      })
      .then((results) => bookshelfToDomainConverter.buildDomainObjects(BookshelfBadge, results));
  },

  async get(id) {
    const bookshelfBadge = await BookshelfBadge
      .where('id', id)
      .fetch();
    return bookshelfToDomainConverter.buildDomainObject(BookshelfBadge, bookshelfBadge);
  },
};

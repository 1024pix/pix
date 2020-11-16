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
      .then((results) =>
        results.map((result) => bookshelfToDomainConverter.buildDomainObject(BookshelfBadge, result)),
      );
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
      .then((results) =>
        results.map((result) => bookshelfToDomainConverter.buildDomainObject(BookshelfBadge, result)),
      );
  },

};

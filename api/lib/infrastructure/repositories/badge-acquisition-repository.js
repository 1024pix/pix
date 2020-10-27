const Bookshelf = require('../bookshelf');
const bookshelfToDomainConverter = require('../utils/bookshelf-to-domain-converter');
const BookshelfBadgeAcquisition = require('../../infrastructure/data/badge-acquisition');
const DomainTransaction = require('../DomainTransaction');

module.exports = {

  async create(badgeAcquisitionsToCreate = [], domainTransaction = DomainTransaction.emptyTransaction()) {
    const results = await Bookshelf.knex('badge-acquisitions')
      .insert(badgeAcquisitionsToCreate, 'id')
      .transacting(domainTransaction.knexTransaction);
    return results;
  },

  async getAcquiredBadgeIds({ badgeIds, userId }) {
    const collectionResult = await BookshelfBadgeAcquisition
      .where({ userId })
      .where('badgeId', 'in', badgeIds)
      .fetchAll({ columns: ['badge-acquisitions.badgeId'], require: false });
    return collectionResult.map((obj) => obj.attributes.badgeId);
  },

  async getCampaignAcquiredBadgesByUsers({ campaignId, userIds }) {
    const results = await BookshelfBadgeAcquisition
      .query((qb) => {
        qb.join('badges', 'badges.id', 'badge-acquisitions.badgeId');
        qb.join('campaigns', 'campaigns.targetProfileId', 'badges.targetProfileId');
        qb.where('campaigns.id', '=', campaignId);
        qb.where('badge-acquisitions.userId', 'IN', userIds);
      })
      .fetchAll({
        withRelated: ['badge'],
        require: false,
      });

    const badgeAcquisitions = results.map((result) => bookshelfToDomainConverter.buildDomainObject(BookshelfBadgeAcquisition, result));

    const acquiredBadgesByUsers = {};
    for (const badgeAcquisition of badgeAcquisitions) {
      const { userId, badge } = badgeAcquisition;
      if (acquiredBadgesByUsers[userId]) {
        acquiredBadgesByUsers[userId].push(badge);
      } else {
        acquiredBadgesByUsers[userId] = [badge];
      }
    }
    return acquiredBadgesByUsers;
  },
};

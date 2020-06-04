const Bookshelf = require('../bookshelf');
const BookshelfBadgeAcquisition = require('../../infrastructure/data/badge-acquisition');
const DomainTransaction = require('../DomainTransaction');

module.exports = {

  async create(badgeAcquisitionsToCreate = [], domainTransaction = DomainTransaction.emptyTransaction()) {
    const results = await Bookshelf.knex('badge-acquisitions')
      .insert(badgeAcquisitionsToCreate, 'id')
      .transacting(domainTransaction.knexTransaction);
    return results;
  },

  async hasAcquiredBadgeWithKey({ badgeKey, userId }) {
    const badgeAcquisition = await BookshelfBadgeAcquisition
      .query((qb) => qb.innerJoin('badges', 'badges.id', 'badgeId'))
      .where({ userId, key: badgeKey }).fetch({ columns: ['badge-acquisitions.id'], require: false });
    return Boolean(badgeAcquisition);
  },

  async getAcquiredBadgeIds({ badgeIds, userId }) {
    const collectionResult = await BookshelfBadgeAcquisition
      .where({ userId })
      .where('badgeId', 'in', badgeIds)
      .fetchAll({ columns: ['badge-acquisitions.badgeId'], require: false });
    return collectionResult.map((obj) => obj.attributes.badgeId);
  }
};

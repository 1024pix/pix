const bookshelfToDomainConverter = require('../utils/bookshelf-to-domain-converter');
const BookshelfBadgeAcquisition = require('../../infrastructure/data/badge-acquisition');

module.exports = {

  async create(domainTransaction, { badgeId, userId }) {
    const result = await new BookshelfBadgeAcquisition({
      badgeId,
      userId
    }).save(null, { transacting: domainTransaction.knexTransaction });
    return bookshelfToDomainConverter.buildDomainObject(BookshelfBadgeAcquisition, result);
  },

  async hasAcquiredBadgeWithKey({ badgeKey, userId }) {
    const badgeAcquisition = await BookshelfBadgeAcquisition
      .query((qb) => qb.innerJoin('badges', 'badges.id', 'badgeId'))
      .where({ userId, key: badgeKey }).fetch({ columns: ['badge-acquisitions.id'], require: false });
    return Boolean(badgeAcquisition);
  },

  async hasAcquiredBadgeWithId({ badgeId, userId }) {
    const badgeAcquisition = await BookshelfBadgeAcquisition
      .where({ userId, badgeId }).fetch({ columns: ['badge-acquisitions.id'], require: false });
    return Boolean(badgeAcquisition);
  }
};

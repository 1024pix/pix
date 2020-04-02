const bookshelfToDomainConverter = require('../utils/bookshelf-to-domain-converter');
const BookshelfBadge = require('../data/badge');
const BookshelfBadgeAcquisition = require('../../infrastructure/data/badge-acquisition');

module.exports = {
  findOneByTargetProfileId(targetProfileId) {
    return BookshelfBadge
      .where({ targetProfileId })
      .fetch({
        require: false
      })
      .then((results) => bookshelfToDomainConverter.buildDomainObject(BookshelfBadge, results));
  },

  async persist(domainTransaction, badge) {
    if (badge.isAcquired()) {
      await new BookshelfBadgeAcquisition({
        badgeId: badge.id,
        userId: badge.userId
      }).save(null, { transacting: domainTransaction.knexTransaction });
    }
  }
};

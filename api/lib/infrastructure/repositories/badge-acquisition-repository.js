const bookshelfToDomainConverter = require('../utils/bookshelf-to-domain-converter');
const BookshelfBadgeAcquisition = require('../../infrastructure/data/badge-acquisition');

module.exports = {

  async create(domainTransaction, { badgeId, userId }) {
    const result = await new BookshelfBadgeAcquisition({ badgeId, userId }).save(null, { transacting: domainTransaction.knexTransaction });
    return bookshelfToDomainConverter.buildDomainObject(BookshelfBadgeAcquisition, result);
  },

};

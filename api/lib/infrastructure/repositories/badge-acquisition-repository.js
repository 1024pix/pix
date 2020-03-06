const bookshelfToDomainConverter = require('../utils/bookshelf-to-domain-converter');
const BookshelfBadgeAcquisition = require('../../infrastructure/data/badge-acquisition');

module.exports = {

  async create({ badgeId, userId }) {
    const result = await new BookshelfBadgeAcquisition({ badgeId, userId }).save();
    return bookshelfToDomainConverter.buildDomainObject(BookshelfBadgeAcquisition, result);
  },

};

const bookshelfToDomainConverter = require('../utils/bookshelf-to-domain-converter');
const BookshelfBadge = require('../../infrastructure/data/badge');

module.exports = {

  getByTargetProfileId(targetProfileId) {
    return BookshelfBadge
      .where({ targetProfileId })
      .fetch()
      .then((results) => bookshelfToDomainConverter.buildDomainObject(BookshelfBadge, results));
  },

};

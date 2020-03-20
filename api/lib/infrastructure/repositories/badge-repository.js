const bookshelfToDomainConverter = require('../utils/bookshelf-to-domain-converter');
const BookshelfBadge = require('../../infrastructure/data/badge');

module.exports = {

  findOneByTargetProfileId(targetProfileId) {
    return BookshelfBadge
      .where({ targetProfileId })
      .fetch({
        require: false,
        withRelated: ['badgePartnerCompetences']
      })
      .then((results) => bookshelfToDomainConverter.buildDomainObject(BookshelfBadge, results));
  },

};

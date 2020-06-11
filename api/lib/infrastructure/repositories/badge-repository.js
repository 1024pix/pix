const bookshelfToDomainConverter = require('../utils/bookshelf-to-domain-converter');
const BookshelfBadge = require('../../infrastructure/data/badge');

module.exports = {

  findByTargetProfileId(targetProfileId) {
    return BookshelfBadge
      .where({ targetProfileId })
      .fetchAll({
        require: false,
        withRelated: ['badgeCriteria','badgePartnerCompetences']
      })
      .then((results) =>
        results.map((result) => bookshelfToDomainConverter.buildDomainObject(BookshelfBadge, result))
      );
  },

  findOneByKey(key) {
    return new BookshelfBadge({ key })
      .fetch({
        require: false,
        withRelated: ['badgeCriteria', 'badgePartnerCompetences']
      })
      .then((results) => bookshelfToDomainConverter.buildDomainObject(BookshelfBadge, results));
  },

};

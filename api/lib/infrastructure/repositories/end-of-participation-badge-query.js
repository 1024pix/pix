const bookshelfToDomainConverter = require('../utils/bookshelf-to-domain-converter');
const BookshelfEndOfParticipationBadgeViewModel = require('../data/end-of-participation-badge-view-model');

// TODO Move out of repositories directory
module.exports = {

  findOneByTargetProfileId(targetProfileId) {
    return BookshelfEndOfParticipationBadgeViewModel
      .where({ targetProfileId })
      .fetch({
        require: false,
        withRelated: ['badgePartnerCompetences']
      })
      .then((results) => bookshelfToDomainConverter.buildDomainObject(BookshelfEndOfParticipationBadgeViewModel, results));
  },

};

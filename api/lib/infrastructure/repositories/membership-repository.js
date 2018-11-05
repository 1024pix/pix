const BookshelfMembership = require('../data/membership');

module.exports = {

  hasMembershipForOrganizationAndUser(organizationId, userId) {
    return new BookshelfMembership()
      .where({
        'organizationId': organizationId,
        'userId': userId
      })
      .count()
      .then((nbMemberships) => nbMemberships > 0);
  },

  hasMembershipForUser(userId) {
    return new BookshelfMembership()
      .where({
        'userId': userId
      })
      .count()
      .then((nbMemberships) => nbMemberships > 0);
  }

};


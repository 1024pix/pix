const BookshelfMembership = require('../data/membership');

module.exports = {

  hasAccessToOrganization(organizationId, userId) {
    return new BookshelfMembership()
      .where({
        'organizationId': organizationId,
        'userId': userId
      })
      .fetch()
      .then((bookshelfMembership) => !!bookshelfMembership);
  },

};


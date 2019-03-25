const BookshelfMembership = require('../data/membership');
const { MembershipCreationError } = require('../../domain/errors');
const bookshelfUtils = require('../utils/bookshelf-utils');
const bookshelfToDomainConverter = require('../utils/bookshelf-to-domain-converter');

module.exports = {

  create(userId, organizationId, organizationRoleId) {
    return new BookshelfMembership({ userId, organizationId, organizationRoleId })
      .save()
      .then((bookshelfMembership) => bookshelfMembership.load(['organizationRole', 'user']))
      .then((bookshelfMembership) => bookshelfToDomainConverter.buildDomainObject(BookshelfMembership, bookshelfMembership))
      .catch((err) => {
        if (bookshelfUtils.isUniqConstraintViolated(err)) {
          throw new MembershipCreationError();
        }
        throw err;
      });
  },

  findByOrganizationId(organizationId) {
    return BookshelfMembership
      .where({ organizationId })
      .fetchAll({ withRelated: ['organizationRole', 'user'] })
      .then((bookshelfMemberships) => bookshelfToDomainConverter.buildDomainObjects(
        BookshelfMembership, bookshelfMemberships.models
      ));
  }
};

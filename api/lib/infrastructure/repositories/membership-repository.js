const BookshelfMembership = require('../data/membership');
const { MembershipCreationError } = require('../../domain/errors');
const { InfrastructureError } = require('../../infrastructure/errors');
const Membership = require('../../domain/models/Membership');
const Organization = require('../../domain/models/Organization');
const OrganizationRole = require('../../domain/models/OrganizationRole');
const bookshelfUtils = require('../utils/bookshelf-utils');

function _toDomain(membershipBookshelf) {

  const organization = new Organization({
    id: membershipBookshelf.get('organizationId'),
  });

  const organizationRole = new OrganizationRole({
    id: membershipBookshelf.get('organizationRoleId'),
  });

  return new Membership({
    id: membershipBookshelf.get('id'),
    organization,
    organizationRole,
  });
}

module.exports = {

  create(userId, organizationId, organizationRoleId) {
    return new BookshelfMembership({ userId, organizationId, organizationRoleId })
      .save()
      .then(_toDomain)
      .catch((err) => {
        if (bookshelfUtils.isUniqConstraintViolated(err)) {
          throw new MembershipCreationError();
        }
        throw new InfrastructureError(err);
      });
  },

};

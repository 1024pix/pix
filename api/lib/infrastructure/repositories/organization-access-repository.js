const BookshelfOrganizationAccess = require('../data/organization-access');
const OrganizationAccess = require('../../domain/models/OrganizationAccess');
const Organization = require('../../domain/models/Organization');
const OrganizationRole = require('../../domain/models/OrganizationRole');
const User = require('../../domain/models/User');

function _toDomain(bookshelfOrganizationAccess) {
  const bookshelfUser = bookshelfOrganizationAccess.related('user');
  const user = new User({
    id: bookshelfUser.get('id'),
    firstName: bookshelfUser.get('firstName'),
    lastName: bookshelfUser.get('lastName'),
    email: bookshelfUser.get('email'),
  });

  const bookshelfOrganization = bookshelfOrganizationAccess.related('organization');
  const organization = new Organization({
    id: bookshelfOrganization.get('id'),
    name: bookshelfOrganization.get('name'),
    type: bookshelfOrganization.get('type'),
    code: bookshelfOrganization.get('code'),
  });

  const bookshelfOrganizationRole = bookshelfOrganizationAccess.related('organizationRole');
  const organizationRole = new OrganizationRole({
    id: bookshelfOrganizationRole.get('id'),
    name: bookshelfOrganizationRole.get('name'),
  });

  return new OrganizationAccess({ id: bookshelfOrganizationAccess.id, user, organization, organizationRole });
}

module.exports = {

  create(domainOrganizationAccess) {
    return new BookshelfOrganizationAccess()
      .save({
        userId: domainOrganizationAccess.user.id,
        organizationId: domainOrganizationAccess.organization.id,
        organizationRoleId: domainOrganizationAccess.organizationRole.id,
      })
      .then((bookshelfOrganizationAccess) => {
        return bookshelfOrganizationAccess.load(['user', 'organization', 'organizationRole']);
      })
      .then(_toDomain);
  }
};


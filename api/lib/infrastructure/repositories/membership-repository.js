const BookshelfMembership = require('../data/membership');
const Membership = require('../../domain/models/Membership');
const Organization = require('../../domain/models/Organization');
const OrganizationRole = require('../../domain/models/OrganizationRole');
const User = require('../../domain/models/User');

function _toDomain(bookshelfMembership) {

  const bookshelfOrganization = bookshelfMembership.related('organization');
  const organization = new Organization({
    id: bookshelfOrganization.get('id'),
    code: bookshelfOrganization.get('code'),
    logoUrl: bookshelfOrganization.get('logoUrl'),
    name: bookshelfOrganization.get('name'),
    type: bookshelfOrganization.get('type'),
    user: null,
  });

  const bookshelfOrganizationRole = bookshelfMembership.related('organizationRole');
  const role = new OrganizationRole({
    id: bookshelfOrganizationRole.get('id'),
    name: bookshelfOrganizationRole.get('name'),
  });

  const bookshelfUser = bookshelfMembership.related('user');
  const user = new User({
    id: bookshelfUser.get('id'),
    firstName: bookshelfUser.get('firstName'),
    lastName: bookshelfUser.get('lastName'),
    email: bookshelfUser.get('email'),
    cgu: !!bookshelfUser.get('cgu'),
    pixOrgaTermsOfServiceAccepted: !!bookshelfUser.get('pixOrgaTermsOfServiceAccepted'),
    // undesirable fields
    memberships: [],
    password: null,
    pixRoles: [],
  });

  return new Membership({
    id: bookshelfMembership.get('id'),
    organization,
    role,
    user
  });
}

module.exports = {

  hasMembershipForOrganizationAndUser(organizationId, userId) {
    return BookshelfMembership
      .where({ organizationId, userId })
      .count()
      .then((nbMemberships) => nbMemberships > 0);
  },

  hasMembershipForUser(userId) {
    return BookshelfMembership
      .where({ userId })
      .count()
      .then((nbMemberships) => nbMemberships > 0);
  },

  findByUserId(userId) {
    return BookshelfMembership
      .where({ userId })
      .orderBy('organizationId')
      .fetchAll({
        withRelated: ['organization', 'organizationRole', 'user']
      })
      .then((memberships) => memberships.map(_toDomain));
  },

};


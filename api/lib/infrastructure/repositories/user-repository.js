const _ = require('lodash');
const BookshelfUser = require('../data/user');
const { AlreadyRegisteredEmailError } = require('../../domain/errors');
const { UserNotFoundError } = require('../../domain/errors');
const User = require('../../domain/models/User');
const Membership = require('../../domain/models/Membership');
const Organization = require('../../domain/models/Organization');
const OrganizationRole = require('../../domain/models/OrganizationRole');

function _toMembershipsDomain(membershipsBookshelf) {
  return membershipsBookshelf.map((membershipBookshelf) => {
    return new Membership({
      id: membershipBookshelf.get('id'),
      organization: new Organization({
        id: membershipBookshelf.related('organization').get('id'),
        code: membershipBookshelf.related('organization').get('code'),
        name: membershipBookshelf.related('organization').get('name'),
        type: membershipBookshelf.related('organization').get('type'),
      }),
      organizationRole: new OrganizationRole({
        id: membershipBookshelf.related('organizationRole').get('id'),
        name: membershipBookshelf.related('organizationRole').get('name')
      })
    });
  });
}

function _toDomain(userBookshelf) {
  return new User({
    id: userBookshelf.get('id'),
    firstName: userBookshelf.get('firstName'),
    lastName: userBookshelf.get('lastName'),
    email: userBookshelf.get('email'),
    password: userBookshelf.get('password'),
    cgu: Boolean(userBookshelf.get('cgu')),
    pixOrgaTermsOfServiceAccepted: Boolean(userBookshelf.get('pixOrgaTermsOfServiceAccepted')),
    memberships: _toMembershipsDomain(userBookshelf.related('memberships'))
  });
}

function _setSearchFiltersForQueryBuilder(filters, qb) {
  const { firstName, lastName, email } = filters;
  if (firstName) {
    qb.where('firstName', 'LIKE', `%${firstName}%`);
  }
  if (lastName) {
    qb.where('lastName', 'LIKE', `%${lastName}%`);
  }
  if (email) {
    qb.where('email', 'LIKE', `%${email}%`);
  }
}

module.exports = {

  // TODO use _toDomain()
  findByEmail(email) {
    return BookshelfUser
      .where({ email })
      .fetch({ require: true })
      .then((bookshelfUser) => {
        return bookshelfUser.toDomainEntity();
      });
  },

  findByEmailWithRoles(email) {
    return BookshelfUser
      .where({ email })
      .fetch({
        withRelated: [
          'memberships',
          'memberships.organization',
          'memberships.organizationRole',
        ]
      })
      .then((foundUser) => {
        if (foundUser === null) {
          return Promise.reject(new UserNotFoundError());
        }
        return _toDomain(foundUser);
      });
  },

  /**
   * @deprecated Please use #get(userId) that returns a domain User object
   */
  findUserById(userId) {
    return BookshelfUser
      .where({ id: userId })
      .fetch({ require: true });
  },

  get(userId) {
    return BookshelfUser
      .where({ id: userId })
      .fetch({
        require: true,
        withRelated: ['pixRoles']
      })
      .then((bookshelfUser) => bookshelfUser.toDomainEntity())
      .catch((err) => {
        if (err instanceof BookshelfUser.NotFoundError) {
          throw new UserNotFoundError(`User not found for ID ${userId}`);
        }
        throw err;
      });
  },

  find(filters, pagination) {
    const { page, pageSize } = pagination;
    return BookshelfUser.query((qb) => _setSearchFiltersForQueryBuilder(filters, qb))
      .fetchPage({ page, pageSize })
      .then((results) => results.map(_toDomain));
  },

  count(filters) {
    return BookshelfUser.query((qb) => _setSearchFiltersForQueryBuilder(filters, qb)).count();
  },

  getWithMemberships(userId) {
    return BookshelfUser
      .where({ id: userId })
      .fetch({
        withRelated: [
          'memberships',
          'memberships.organization',
          'memberships.organizationRole',
        ]
      })
      .then((foundUser) => {
        if (foundUser === null) {
          return Promise.reject(new UserNotFoundError(`User not found for ID ${userId}`));
        }
        return _toDomain(foundUser);
      });
  },

  create(domainUser) {
    const userRawData = _.omit(domainUser, ['pixRoles', 'memberships']);
    return new BookshelfUser(userRawData)
      .save()
      .then((bookshelfUser) => bookshelfUser.toDomainEntity());
  },

  isEmailAvailable(email) {
    return BookshelfUser
      .where({ email })
      .fetch()
      .then((user) => {
        if (user) {
          return Promise.reject(new AlreadyRegisteredEmailError());
        }

        return Promise.resolve(email);
      });
  },

  updatePassword(id, hashedPassword) {
    return BookshelfUser.where({ id })
      .save({ password: hashedPassword }, {
        patch: true,
        require: false
      })
      .then((bookshelfUser) => bookshelfUser.toDomainEntity());
  },

  updateUser(domainUser) {
    const userToUpdate = _.omit(domainUser, ['pixRoles', 'memberships']);
    return BookshelfUser.where({ id: domainUser.id })
      .save(userToUpdate, {
        patch: true,
        method: 'update',
      })
      .then(_toDomain);
  },

  hasRolePixMaster(userId) {
    return this.get(userId)
      .then((user) => user.hasRolePixMaster);
  }

};

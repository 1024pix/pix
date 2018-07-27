const _ = require('lodash');
const BookshelfUser = require('../data/user');
const { AlreadyRegisteredEmailError } = require('../../domain/errors');
const { UserNotFoundError } = require('../../domain/errors');
const User = require('../../domain/models/User');
const OrganizationAccess = require('../../domain/models/OrganizationAccess');
const Organization = require('../../domain/models/Organization');
const OrganizationRole = require('../../domain/models/OrganizationRole');

function _toOrganizationAccessesDomain(organizationAccessesBookshelf) {
  return organizationAccessesBookshelf.map((organizationAccessBookshelf) => {
    return new OrganizationAccess({
      id: organizationAccessBookshelf.get('id'),
      organization: new Organization({
        id: organizationAccessBookshelf.related('organization').get('id'),
        code: organizationAccessBookshelf.related('organization').get('code'),
        name: organizationAccessBookshelf.related('organization').get('name'),
        type: organizationAccessBookshelf.related('organization').get('type'),
        email: organizationAccessBookshelf.related('organization').get('email')
      }),
      organizationRole: new OrganizationRole({
        id: organizationAccessBookshelf.related('organizationRole').get('id'),
        name: organizationAccessBookshelf.related('organizationRole').get('name')
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
    organizationAccesses: _toOrganizationAccessesDomain(userBookshelf.related('organizationAccesses'))
  });
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
          'organizationAccesses',
          'organizationAccesses.organization',
          'organizationAccesses.organizationRole',
        ]
      })
      .then((foundUser) => {
        if(foundUser === null) {
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

  getWithOrganizationAccesses(userId) {
    return BookshelfUser
      .where({ id: userId })
      .fetch({
        withRelated: [
          'organizationAccesses',
          'organizationAccesses.organization',
          'organizationAccesses.organizationRole',
        ]
      })
      .then((foundUser) => {
        if(foundUser === null) {
          return Promise.reject(new UserNotFoundError(`User not found for ID ${userId}`));
        }
        return _toDomain(foundUser);
      });
  },

  create(domainUser) {
    const userRawData = _.omit(domainUser, ['pixRoles', 'organizationAccesses']);
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
      .save({ password: hashedPassword, cgu: true }, {
        patch: true,
        require: false
      })
      .then((bookshelfUser) => bookshelfUser.toDomainEntity());
  },

  hasRolePixMaster(userId) {
    return this.get(userId)
      .then((user) => user.hasRolePixMaster);
  }

};

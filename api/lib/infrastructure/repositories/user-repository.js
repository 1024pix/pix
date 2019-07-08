const _ = require('lodash');
const BookshelfUser = require('../data/user');
const { AlreadyRegisteredEmailError } = require('../../domain/errors');
const { UserNotFoundError } = require('../../domain/errors');
const User = require('../../domain/models/User');
const PixRole = require('../../domain/models/PixRole');
const Membership = require('../../domain/models/Membership');
const CertificationCenter = require('../../domain/models/CertificationCenter');
const CertificationCenterMembership = require('../../domain/models/CertificationCenterMembership');
const Organization = require('../../domain/models/Organization');

function _toCertificationCenterMembershipsDomain(certificationCenterMembershipBookshelf) {
  return certificationCenterMembershipBookshelf.map((bookshelf) => {
    return new CertificationCenterMembership({
      id: bookshelf.get('id'),
      certificationCenter: new CertificationCenter({
        id: bookshelf.related('certificationCenter').get('id'),
        name: bookshelf.related('certificationCenter').get('name'),
      })
    });
  });
}

function _toMembershipsDomain(membershipsBookshelf) {
  return membershipsBookshelf.map((membershipBookshelf) => {
    return new Membership({
      id: membershipBookshelf.get('id'),
      organizationRole: membershipBookshelf.get('organizationRole'),
      organization: new Organization({
        id: membershipBookshelf.related('organization').get('id'),
        code: membershipBookshelf.related('organization').get('code'),
        name: membershipBookshelf.related('organization').get('name'),
        type: membershipBookshelf.related('organization').get('type'),
      }),
    });
  });
}

function _toPixRolesDomain(pixRolesBookshelf) {
  return pixRolesBookshelf.map((pixRoleBookshelf) => {
    return new PixRole({
      id: pixRoleBookshelf.get('id'),
      name: pixRoleBookshelf.get('name'),
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
    pixCertifTermsOfServiceAccepted: Boolean(userBookshelf.get('pixCertifTermsOfServiceAccepted')),
    memberships: _toMembershipsDomain(userBookshelf.related('memberships')),
    certificationCenterMemberships: _toCertificationCenterMembershipsDomain(userBookshelf.related('certificationCenterMemberships')),
    pixRoles: _toPixRolesDomain(userBookshelf.related('pixRoles')),
    isProfileV2: Boolean(userBookshelf.get('isProfileV2')),
  });
}

function _setSearchFiltersForQueryBuilder(filters, qb) {
  const { firstName, lastName, email } = filters;

  if (firstName) {
    qb.whereRaw('LOWER("firstName") LIKE ?', `%${firstName.toLowerCase()}%`);
  }
  if (lastName) {
    qb.whereRaw('LOWER("lastName") LIKE ?', `%${lastName.toLowerCase()}%`);
  }
  if (email) {
    qb.whereRaw('LOWER("email") LIKE ?', `%${email.toLowerCase()}%`);
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
      })
      .catch((err) => {
        if (err instanceof BookshelfUser.NotFoundError) {
          throw new UserNotFoundError(`User not found for email ${email}`);
        }
        throw err;
      });
  },

  findByEmailWithRoles(email) {
    return BookshelfUser
      .where({ email })
      .fetch({
        withRelated: [
          'memberships',
          'memberships.organization',
          'pixRoles',
          'certificationCenterMemberships.certificationCenter',
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
      .fetch({ require: true })
      .catch((err) => {
        if (err instanceof BookshelfUser.NotFoundError) {
          throw new UserNotFoundError(`User not found for ID ${userId}`);
        }
        throw err;
      });
  },

  get(userId) {
    return BookshelfUser
      .where({ id: userId })
      .fetch({
        require: true,
        withRelated: ['pixRoles', 'organizations']
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
        ]
      })
      .then((foundUser) => {
        if (foundUser === null) {
          return Promise.reject(new UserNotFoundError(`User not found for ID ${userId}`));
        }
        return _toDomain(foundUser);
      });
  },

  getWithCertificationCenterMemberships(userId) {
    return BookshelfUser
      .where({ id: userId })
      .fetch({
        require: true,
        withRelated: [
          'certificationCenterMemberships.certificationCenter',
        ]
      })
      .then(_toDomain)
      .catch((err) => {
        if (err instanceof BookshelfUser.NotFoundError) {
          throw new UserNotFoundError(`User not found for ID ${userId}`);
        }
        throw err;
      });
  },

  async getBySamlId(samlId) {
    const bookshelfUser = await BookshelfUser
      .where({ samlId })
      .fetch();
    return bookshelfUser ? _toDomain(bookshelfUser) : null;
  },

  create(domainUser) {
    const userToCreate = _.omit(domainUser, [
      'organizations', 'campaignParticipations', 'pixRoles', 'memberships',
      'certificationCenterMemberships', 'pixScore', 'knowledgeElements',
      'scorecards',
    ]);
    return new BookshelfUser(userToCreate)
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
    const userToUpdate = _.omit(domainUser, [
      'organizations', 'campaignParticipations', 'pixRoles', 'memberships',
      'certificationCenterMemberships', 'pixScore', 'knowledgeElements',
      'scorecards',
    ]);
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

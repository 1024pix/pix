const omit = require('lodash/omit');
const moment = require('moment');

const DomainTransaction = require('../DomainTransaction');
const BookshelfUser = require('../data/user');
const bookshelfToDomainConverter = require('../utils/bookshelf-to-domain-converter');

const {
  AlreadyRegisteredEmailError,
  AlreadyRegisteredUsernameError,
  UserNotFoundError,
} = require('../../domain/errors');

const User = require('../../domain/models/User');
const UserDetailsForAdmin = require('../../domain/models/UserDetailsForAdmin');
const PixRole = require('../../domain/models/PixRole');
const Membership = require('../../domain/models/Membership');
const CertificationCenter = require('../../domain/models/CertificationCenter');
const CertificationCenterMembership = require('../../domain/models/CertificationCenterMembership');
const Organization = require('../../domain/models/Organization');
const SchoolingRegistrationForAdmin = require('../../domain/read-models/SchoolingRegistrationForAdmin');
const AuthenticationMethod = require('../../domain/models/AuthenticationMethod');

const PIX_MASTER_ROLE_ID = 1;

module.exports = {

  // TODO use _toDomain()
  getByEmail(email) {
    return BookshelfUser
      .query((qb) => {
        qb.whereRaw('LOWER("email") = ?', email.toLowerCase());
      })
      .fetch()
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

  getByUsernameOrEmailWithRolesAndPassword(username) {
    return BookshelfUser
      .query((qb) => qb.where({ email: username.toLowerCase() }).orWhere({ 'username': username }))
      .fetch({
        require: false,
        withRelated: [
          { 'memberships': (qb) => qb.where({ disabledAt: null }) },
          'memberships.organization',
          'pixRoles',
          'certificationCenterMemberships.certificationCenter',
          { 'authenticationMethods': (qb) => qb.where({ identityProvider: 'PIX' }) },
        ],
      })
      .then((foundUser) => {
        if (foundUser === null) {
          return Promise.reject(new UserNotFoundError());
        }
        return _toDomain(foundUser);
      });
  },

  get(userId, domainTransaction = DomainTransaction.emptyTransaction()) {
    return BookshelfUser
      .where({ id: userId })
      .fetch({ transacting: domainTransaction.knexTransaction })
      .then((user) => bookshelfToDomainConverter.buildDomainObject(BookshelfUser, user))
      .catch((err) => {
        if (err instanceof BookshelfUser.NotFoundError) {
          throw new UserNotFoundError(`User not found for ID ${userId}`);
        }
        throw err;
      });
  },

  getForObfuscation(userId) {
    return BookshelfUser
      .where({ id: userId })
      .fetch({ columns: ['id', 'email', 'username'] })
      .then((userAuthenticationMethods) => _toUserAuthenticationMethods(userAuthenticationMethods))
      .catch((err) => {
        if (err instanceof BookshelfUser.NotFoundError) {
          throw new UserNotFoundError(`User not found for ID ${userId}`);
        }
        throw err;
      });
  },

  getUserDetailsForAdmin(userId) {
    return BookshelfUser
      .where({ id: userId })
      .fetch({
        columns: ['id', 'firstName', 'lastName', 'email', 'username', 'cgu', 'pixOrgaTermsOfServiceAccepted', 'pixCertifTermsOfServiceAccepted'],
        withRelated: [{
          schoolingRegistrations: (query) => { query
            .leftJoin('organizations', 'schooling-registrations.organizationId', 'organizations.id')
            .where({ type: 'SCO' })
            .orderBy('id'); } },
        'schoolingRegistrations.organization',
        'authenticationMethods',
        ],
      })
      .then((userDetailsForAdmin) => _toUserDetailsForAdminDomain(userDetailsForAdmin))
      .catch((err) => {
        if (err instanceof BookshelfUser.NotFoundError) {
          throw new UserNotFoundError(`User not found for ID ${userId}`);
        }
        throw err;
      });
  },

  findPaginatedFiltered({ filter, page }) {
    return BookshelfUser
      .query((qb) => _setSearchFiltersForQueryBuilder(filter, qb))
      .fetchPage({
        page: page.number,
        pageSize: page.size,
      })
      .then(({ models, pagination }) => {
        const users = bookshelfToDomainConverter.buildDomainObjects(BookshelfUser, models);
        return { models: users, pagination };
      });
  },

  getWithMemberships(userId) {
    return BookshelfUser
      .where({ id: userId })
      .fetch({
        require: false,
        withRelated: [
          { 'memberships': (qb) => qb.where({ disabledAt: null }) },
          'memberships.organization',
        ],
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
        withRelated: [
          'certificationCenterMemberships.certificationCenter',
        ],
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
      .query((qb) => {
        qb.innerJoin('authentication-methods', function() {
          this.on('users.id', 'authentication-methods.userId')
            .andOnVal('authentication-methods.identityProvider', AuthenticationMethod.identityProviders.GAR)
            .andOnVal('authentication-methods.externalIdentifier', samlId);
        });
      })
      .fetch({ require: false, withRelated: 'authenticationMethods' });
    return bookshelfUser ? _toDomain(bookshelfUser) : null;
  },

  create({ user, domainTransaction = DomainTransaction.emptyTransaction() }) {
    const userToCreate = _adaptModelToDb(user);
    return new BookshelfUser(userToCreate)
      .save(null, { transacting: domainTransaction.knexTransaction })
      .then((bookshelfUser) => bookshelfUser.toDomainEntity());
  },

  isEmailAvailable(email) {
    return BookshelfUser
      .query((qb) => qb.whereRaw('LOWER("email") = ?', email.toLowerCase()))
      .fetch({ require: false })
      .then((user) => {
        if (user) {
          return Promise.reject(new AlreadyRegisteredEmailError());
        }

        return Promise.resolve(email);
      });
  },

  async isEmailAllowedToUseForCurrentUser(userId, email) {
    const userFound = await BookshelfUser
      .where('id', '!=', userId)
      .where({ email: email.toLowerCase() })
      .fetch({ require: false });
    if (userFound) {
      throw new AlreadyRegisteredEmailError();
    }
    else {
      return true;
    }
  },

  isUserExistingByEmail(email) {
    return BookshelfUser
      .where({ email: email.toLowerCase() })
      .fetch()
      .then(() => true)
      .catch(() => {
        throw new UserNotFoundError();
      });
  },

  updatePassword(id, hashedPassword) {
    return BookshelfUser
      .where({ id })
      .save({ password: hashedPassword }, { patch: true, method: 'update' })
      .then((bookshelfUser) => bookshelfUser.toDomainEntity())
      .catch((err) => {
        if (err instanceof BookshelfUser.NoRowsUpdatedError) {
          throw new UserNotFoundError(`User not found for ID ${id}`);
        }
        throw err;
      });
  },

  updateEmail({ id, email }) {
    return BookshelfUser
      .where({ id })
      .save({ email }, { patch: true, method: 'update' })
      .then((bookshelfUser) => bookshelfUser.toDomainEntity())
      .catch((err) => {
        if (err instanceof BookshelfUser.NoRowsUpdatedError) {
          throw new UserNotFoundError(`User not found for ID ${id}`);
        }
        throw err;
      });
  },

  async updateUserDetailsForAdministration(id, userAttributes) {
    try {
      const updatedUser = await BookshelfUser
        .where({ id })
        .save(userAttributes, { patch: true, method: 'update' });
      await updatedUser.related('authenticationMethods').fetch({ require: false });
      return _toUserDetailsForAdminDomain(updatedUser);
    } catch (err) {
      if (err instanceof BookshelfUser.NoRowsUpdatedError) {
        throw new UserNotFoundError(`User not found for ID ${id}`);
      }
      throw err;
    }
  },

  async isPixMaster(id) {
    const user = await BookshelfUser
      .where({ 'users.id': id, 'users_pix_roles.user_id': id })
      .query((qb) => {
        qb.innerJoin('users_pix_roles', 'users_pix_roles.user_id', 'users.id');
        qb.where({ 'users_pix_roles.pix_role_id': PIX_MASTER_ROLE_ID });
      })
      .fetch({ require: false, columns: 'users.id' });
    return Boolean(user);
  },

  async updateHasSeenAssessmentInstructionsToTrue(id) {
    const user = await BookshelfUser.where({ id }).fetch({ require: false });
    await user.save({ 'hasSeenAssessmentInstructions': true }, { patch: true, method: 'update' });
    return bookshelfToDomainConverter.buildDomainObject(BookshelfUser, user);
  },

  async updateHasSeenNewDashboardInfoToTrue(id) {
    const user = await BookshelfUser.where({ id }).fetch({ require: false });
    await user.save({ 'hasSeenNewDashboardInfo': true }, { patch: true, method: 'update' });
    return bookshelfToDomainConverter.buildDomainObject(BookshelfUser, user);
  },

  async acceptPixLastTermsOfService(id) {
    const user = await BookshelfUser.where({ id }).fetch({ require: false });
    await user.save({
      'lastTermsOfServiceValidatedAt': moment().toDate(),
      'mustValidateTermsOfService': false,
    }, { patch: true, method: 'update' });
    return bookshelfToDomainConverter.buildDomainObject(BookshelfUser, user);
  },

  async updatePixOrgaTermsOfServiceAcceptedToTrue(id) {
    const user = await BookshelfUser.where({ id }).fetch({ require: false });
    await user.save({ 'pixOrgaTermsOfServiceAccepted': true }, { patch: true, method: 'update' });
    return bookshelfToDomainConverter.buildDomainObject(BookshelfUser, user);
  },

  async updatePixCertifTermsOfServiceAcceptedToTrue(id) {
    const user = await BookshelfUser.where({ id }).fetch({ require: false });
    await user.save({ 'pixCertifTermsOfServiceAccepted': true }, { patch: true, method: 'update' });
    return bookshelfToDomainConverter.buildDomainObject(BookshelfUser, user);
  },

  async isUsernameAvailable(username) {
    const foundUser = await BookshelfUser
      .where({ username })
      .fetch({ require: false });
    if (foundUser) {
      throw new AlreadyRegisteredUsernameError();
    }
    return username;
  },

  updateUsername({
    id,
    username,
    domainTransaction = DomainTransaction.emptyTransaction(),
  }) {
    return BookshelfUser
      .where({ id })
      .save(
        { username },
        {
          transacting: domainTransaction.knexTransaction,
          patch: true,
          method: 'update',
        },
      )
      .then((bookshelfUser) => bookshelfUser.toDomainEntity())
      .catch((err) => {
        if (err instanceof BookshelfUser.NoRowsUpdatedError) {
          throw new UserNotFoundError(`User not found for ID ${id}`);
        }
        throw err;
      });
  },

  addUsername(id, username) {
    return BookshelfUser
      .where({ id })
      .save({ username }, { patch: true, method: 'update' })
      .then((bookshelfUser) => bookshelfUser.toDomainEntity())
      .catch((err) => {
        if (err instanceof BookshelfUser.NoRowsUpdatedError) {
          throw new UserNotFoundError(`User not found for ID ${id}`);
        }
        throw err;
      });
  },

  async updateUserAttributes(id, userAttributes) {
    try {
      const bookshelfUser = await BookshelfUser
        .where({ id })
        .save(userAttributes, { patch: true, method: 'update' });
      return bookshelfUser.toDomainEntity();

    } catch (err) {
      if (err instanceof BookshelfUser.NoRowsUpdatedError) {
        throw new UserNotFoundError(`User not found for ID ${id}`);
      }
      throw err;
    }
  },

  async findByPoleEmploiExternalIdentifier(externalIdentityId) {
    const bookshelfUser = await BookshelfUser
      .query((qb) => {
        qb.innerJoin('authentication-methods', function() {
          this.on('users.id', 'authentication-methods.userId')
            .andOnVal('authentication-methods.identityProvider', AuthenticationMethod.identityProviders.POLE_EMPLOI)
            .andOnVal('authentication-methods.externalIdentifier', externalIdentityId);
        });
      })
      .fetch({ require: false, withRelated: 'authenticationMethods' });
    return bookshelfUser ? _toDomain(bookshelfUser) : null;
  },
};

function _toUserDetailsForAdminDomain(bookshelfUser) {
  const rawUserDetailsForAdmin = bookshelfUser.toJSON();
  return new UserDetailsForAdmin({
    id: rawUserDetailsForAdmin.id,
    firstName: rawUserDetailsForAdmin.firstName,
    lastName: rawUserDetailsForAdmin.lastName,
    birthdate: rawUserDetailsForAdmin.birthdate,
    organizationId: rawUserDetailsForAdmin.organizationId,
    username: rawUserDetailsForAdmin.username,
    email: rawUserDetailsForAdmin.email,
    cgu: rawUserDetailsForAdmin.cgu,
    pixOrgaTermsOfServiceAccepted: rawUserDetailsForAdmin.pixOrgaTermsOfServiceAccepted,
    pixCertifTermsOfServiceAccepted: rawUserDetailsForAdmin.pixCertifTermsOfServiceAccepted,
    schoolingRegistrations: _toSchoolingRegistrationsForAdmin(rawUserDetailsForAdmin.schoolingRegistrations),
    authenticationMethods: rawUserDetailsForAdmin.authenticationMethods,
  });
}

function _toSchoolingRegistrationsForAdmin(schoolingRegistrations) {
  if (!schoolingRegistrations) {
    return [];
  }
  return schoolingRegistrations.map((schoolingRegistration) => {
    return new SchoolingRegistrationForAdmin({
      id: schoolingRegistration.id,
      firstName: schoolingRegistration.firstName,
      lastName: schoolingRegistration.lastName,
      birthdate: schoolingRegistration.birthdate,
      division: schoolingRegistration.division,
      organizationId: schoolingRegistration.organization.id,
      organizationExternalId: schoolingRegistration.organization.externalId,
      organizationName: schoolingRegistration.organization.name,
      createdAt: schoolingRegistration.createdAt,
      updatedAt: schoolingRegistration.updatedAt,
    });
  });
}

function _toUserAuthenticationMethods(bookshelfUser) {
  const rawUser = bookshelfUser.toJSON();
  return new User({
    id: rawUser.id,
    email: rawUser.email,
    username: rawUser.username,
  });
}

function _toCertificationCenterMembershipsDomain(certificationCenterMembershipBookshelf) {
  return certificationCenterMembershipBookshelf.map((bookshelf) => {
    return new CertificationCenterMembership({
      id: bookshelf.get('id'),
      certificationCenter: new CertificationCenter({
        id: bookshelf.related('certificationCenter').get('id'),
        name: bookshelf.related('certificationCenter').get('name'),
      }),
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
        isManagingStudents: Boolean(membershipBookshelf.related('organization').get('isManagingStudents')),
        canCollectProfiles: Boolean(membershipBookshelf.related('organization').get('canCollectProfiles')),
        externalId: membershipBookshelf.related('organization').get('externalId'),
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

function _getAuthenticationComplementAndExternalIdentifier(authenticationMethodBookshelf) {
  const identityProvider = authenticationMethodBookshelf.get('identityProvider');

  let authenticationComplement = authenticationMethodBookshelf.get('authenticationComplement');
  let externalIdentifier = authenticationMethodBookshelf.get('externalIdentifier');

  if (identityProvider === AuthenticationMethod.identityProviders.PIX) {
    authenticationComplement = new AuthenticationMethod.PixAuthenticationComplement({
      password: authenticationComplement.password,
      shouldChangePassword: Boolean(authenticationComplement.shouldChangePassword),
    });
    externalIdentifier = undefined;
  } else if (identityProvider === AuthenticationMethod.identityProviders.POLE_EMPLOI) {
    authenticationComplement = new AuthenticationMethod.PoleEmploiAuthenticationComplement({
      accessToken: authenticationComplement.accessToken,
      refreshToken: authenticationComplement.refreshToken,
      expiredDate: authenticationComplement.expiredDate,
    });
  }

  return { authenticationComplement, externalIdentifier };
}

function _toAuthenticationMethodsDomain(authenticationMethodsBookshelf) {
  return authenticationMethodsBookshelf.map((authenticationMethodBookshelf) => {
    const {
      authenticationComplement,
      externalIdentifier,
    } = _getAuthenticationComplementAndExternalIdentifier(authenticationMethodBookshelf);

    return new AuthenticationMethod({
      id: authenticationMethodBookshelf.get('id'),
      userId: authenticationMethodBookshelf.get('userId'),
      identityProvider: authenticationMethodBookshelf.get('identityProvider'),
      externalIdentifier,
      authenticationComplement,
    });
  });
}

function _toDomain(userBookshelf) {
  return new User({
    id: userBookshelf.get('id'),
    firstName: userBookshelf.get('firstName'),
    lastName: userBookshelf.get('lastName'),
    email: userBookshelf.get('email'),
    username: userBookshelf.get('username'),
    password: userBookshelf.get('password'),
    shouldChangePassword: Boolean(userBookshelf.get('shouldChangePassword')),
    cgu: Boolean(userBookshelf.get('cgu')),
    pixOrgaTermsOfServiceAccepted: Boolean(userBookshelf.get('pixOrgaTermsOfServiceAccepted')),
    pixCertifTermsOfServiceAccepted: Boolean(userBookshelf.get('pixCertifTermsOfServiceAccepted')),
    memberships: _toMembershipsDomain(userBookshelf.related('memberships')),
    certificationCenterMemberships: _toCertificationCenterMembershipsDomain(userBookshelf.related('certificationCenterMemberships')),
    pixRoles: _toPixRolesDomain(userBookshelf.related('pixRoles')),
    hasSeenAssessmentInstructions: Boolean(userBookshelf.get('hasSeenAssessmentInstructions')),
    authenticationMethods: _toAuthenticationMethodsDomain(userBookshelf.related('authenticationMethods')),
  });
}

function _setSearchFiltersForQueryBuilder(filter, qb) {
  const { firstName, lastName, email } = filter;

  if (firstName) {
    qb.whereRaw('LOWER("firstName") LIKE ?', `%${firstName.toLowerCase()}%`);
  }
  if (lastName) {
    qb.whereRaw('LOWER("lastName") LIKE ?', `%${lastName.toLowerCase()}%`);
  }
  if (email) {
    qb.whereRaw('email LIKE ?', `%${email.toLowerCase()}%`);
  }
}

function _adaptModelToDb(user) {
  const userToBeSaved = omit(user, [
    'id', 'campaignParticipations', 'pixRoles', 'memberships',
    'certificationCenterMemberships', 'pixScore', 'knowledgeElements',
    'scorecards', 'userOrgaSettings',
    'authenticationMethods',
  ]);

  return userToBeSaved;
}

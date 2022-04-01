const moment = require('moment');
const { knex } = require('../../../db/knex-database-connection');

const DomainTransaction = require('../DomainTransaction');
const BookshelfUser = require('../orm-models/User');
const { isUniqConstraintViolated } = require('../utils/knex-utils');
const bookshelfToDomainConverter = require('../utils/bookshelf-to-domain-converter');

const {
  AlreadyExistingEntityError,
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
  getByEmail(email) {
    return BookshelfUser.query((qb) => {
      qb.whereRaw('LOWER("email") = ?', email.toLowerCase());
    })
      .fetch()
      .then((bookshelfUser) => {
        return _toDomain(bookshelfUser);
      })
      .catch((err) => {
        if (err instanceof BookshelfUser.NotFoundError) {
          throw new UserNotFoundError(`User not found for email ${email}`);
        }
        throw err;
      });
  },

  getByUsernameOrEmailWithRolesAndPassword(username) {
    return BookshelfUser.query((qb) => qb.where({ email: username.toLowerCase() }).orWhere({ username: username }))
      .fetch({
        require: false,
        withRelated: [
          { memberships: (qb) => qb.where({ disabledAt: null }) },
          { certificationCenterMemberships: (qb) => qb.where({ disabledAt: null }) },
          'memberships.organization',
          'pixRoles',
          'certificationCenterMemberships.certificationCenter',
          { authenticationMethods: (qb) => qb.where({ identityProvider: 'PIX' }) },
        ],
      })
      .then((foundUser) => {
        if (foundUser === null) {
          return Promise.reject(new UserNotFoundError());
        }
        return _toDomain(foundUser);
      });
  },

  get(userId) {
    return BookshelfUser.where({ id: userId })
      .fetch()
      .then((user) => bookshelfToDomainConverter.buildDomainObject(BookshelfUser, user))
      .catch((err) => {
        if (err instanceof BookshelfUser.NotFoundError) {
          throw new UserNotFoundError(`User not found for ID ${userId}`);
        }
        throw err;
      });
  },

  getForObfuscation(userId) {
    return BookshelfUser.where({ id: userId })
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
    return BookshelfUser.where({ id: userId })
      .fetch({
        columns: [
          'id',
          'firstName',
          'lastName',
          'email',
          'username',
          'cgu',
          'pixOrgaTermsOfServiceAccepted',
          'pixCertifTermsOfServiceAccepted',
        ],
        withRelated: [
          {
            schoolingRegistrations: (query) => {
              query.leftJoin('organizations', 'organization-learners.organizationId', 'organizations.id').orderBy('id');
            },
          },
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
    return BookshelfUser.query((qb) => _setSearchFiltersForQueryBuilder(filter, qb))
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
    return BookshelfUser.where({ id: userId })
      .fetch({
        require: false,
        withRelated: [{ memberships: (qb) => qb.where({ disabledAt: null }) }, 'memberships.organization'],
      })
      .then((foundUser) => {
        if (foundUser === null) {
          return Promise.reject(new UserNotFoundError(`User not found for ID ${userId}`));
        }
        return _toDomain(foundUser);
      });
  },

  getWithCertificationCenterMemberships(userId) {
    return BookshelfUser.where({ id: userId })
      .fetch({
        withRelated: [
          { certificationCenterMemberships: (qb) => qb.where({ disabledAt: null }) },
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
    const bookshelfUser = await BookshelfUser.query((qb) => {
      qb.innerJoin('authentication-methods', function () {
        this.on('users.id', 'authentication-methods.userId')
          .andOnVal('authentication-methods.identityProvider', AuthenticationMethod.identityProviders.GAR)
          .andOnVal('authentication-methods.externalIdentifier', samlId);
      });
    }).fetch({ require: false, withRelated: 'authenticationMethods' });
    return bookshelfUser ? _toDomain(bookshelfUser) : null;
  },

  updateWithEmailConfirmed({
    id,
    userAttributes,
    domainTransaction: { knexTransaction } = DomainTransaction.emptyTransaction(),
  }) {
    const query = knex('users').where({ id }).update(userAttributes);
    if (knexTransaction) query.transacting(knexTransaction);
    return query;
  },

  checkIfEmailIsAvailable(email) {
    return BookshelfUser.query((qb) => qb.whereRaw('LOWER("email") = ?', email.toLowerCase()))
      .fetch({ require: false })
      .then((user) => {
        if (user) {
          return Promise.reject(new AlreadyRegisteredEmailError());
        }

        return Promise.resolve(email);
      });
  },

  isUserExistingByEmail(email) {
    return BookshelfUser.where({ email: email.toLowerCase() })
      .fetch()
      .then(() => true)
      .catch(() => {
        throw new UserNotFoundError();
      });
  },

  updatePassword(id, hashedPassword) {
    return BookshelfUser.where({ id })
      .save({ password: hashedPassword }, { patch: true, method: 'update' })
      .then((bookshelfUser) => _toDomain(bookshelfUser))
      .catch((err) => {
        if (err instanceof BookshelfUser.NoRowsUpdatedError) {
          throw new UserNotFoundError(`User not found for ID ${id}`);
        }
        throw err;
      });
  },

  updateEmail({ id, email }) {
    return BookshelfUser.where({ id })
      .save({ email }, { patch: true, method: 'update' })
      .then((bookshelfUser) => _toDomain(bookshelfUser))
      .catch((err) => {
        if (err instanceof BookshelfUser.NoRowsUpdatedError) {
          throw new UserNotFoundError(`User not found for ID ${id}`);
        }
        throw err;
      });
  },

  async updateUserDetailsForAdministration(id, userAttributes) {
    try {
      const updatedUser = await BookshelfUser.where({ id }).save(userAttributes, { patch: true, method: 'update' });
      await updatedUser.related('authenticationMethods').fetch({ require: false });
      return _toUserDetailsForAdminDomain(updatedUser);
    } catch (err) {
      if (err instanceof BookshelfUser.NoRowsUpdatedError) {
        throw new UserNotFoundError(`User not found for ID ${id}`);
      }
      if (isUniqConstraintViolated(err)) {
        throw new AlreadyExistingEntityError('Cette adresse e-mail ou cet identifiant est déjà utilisé(e).');
      }
      throw err;
    }
  },

  async isPixMaster(id) {
    const user = await BookshelfUser.where({ 'users.id': id, 'users_pix_roles.user_id': id })
      .query((qb) => {
        qb.innerJoin('users_pix_roles', 'users_pix_roles.user_id', 'users.id');
        qb.where({ 'users_pix_roles.pix_role_id': PIX_MASTER_ROLE_ID });
      })
      .fetch({ require: false, columns: 'users.id' });
    return Boolean(user);
  },

  async updateHasSeenAssessmentInstructionsToTrue(id) {
    const user = await BookshelfUser.where({ id }).fetch({ require: false });
    await user.save({ hasSeenAssessmentInstructions: true }, { patch: true, method: 'update' });
    return bookshelfToDomainConverter.buildDomainObject(BookshelfUser, user);
  },

  async updateHasSeenNewDashboardInfoToTrue(id) {
    const user = await BookshelfUser.where({ id }).fetch({ require: false });
    await user.save({ hasSeenNewDashboardInfo: true }, { patch: true, method: 'update' });
    return bookshelfToDomainConverter.buildDomainObject(BookshelfUser, user);
  },

  async updateHasSeenChallengeTooltip({ userId, challengeType }) {
    const user = await BookshelfUser.where({ id: userId }).fetch({ require: false });
    if (challengeType === 'focused') {
      await user.save({ hasSeenFocusedChallengeTooltip: true }, { patch: true, method: 'update' });
    }
    if (challengeType === 'other') {
      await user.save({ hasSeenOtherChallengesTooltip: true }, { patch: true, method: 'update' });
    }
    return bookshelfToDomainConverter.buildDomainObject(BookshelfUser, user);
  },

  async acceptPixLastTermsOfService(id) {
    const user = await BookshelfUser.where({ id }).fetch({ require: false });
    await user.save(
      {
        lastTermsOfServiceValidatedAt: moment().toDate(),
        mustValidateTermsOfService: false,
      },
      { patch: true, method: 'update' }
    );
    return bookshelfToDomainConverter.buildDomainObject(BookshelfUser, user);
  },

  async updatePixOrgaTermsOfServiceAcceptedToTrue(id) {
    const now = new Date();

    const [user] = await knex('users')
      .where({ id })
      .update({ pixOrgaTermsOfServiceAccepted: true, lastPixOrgaTermsOfServiceValidatedAt: now, updatedAt: now })
      .returning('*');

    return new User(user);
  },

  async updatePixCertifTermsOfServiceAcceptedToTrue(id) {
    const now = new Date();

    const [user] = await knex('users')
      .where({ id })
      .update({ pixCertifTermsOfServiceAccepted: true, lastPixCertifTermsOfServiceValidatedAt: now, updatedAt: now })
      .returning('*');

    return new User(user);
  },

  async isUsernameAvailable(username) {
    const foundUser = await BookshelfUser.where({ username }).fetch({ require: false });
    if (foundUser) {
      throw new AlreadyRegisteredUsernameError();
    }
    return username;
  },

  updateUsername({ id, username, domainTransaction = DomainTransaction.emptyTransaction() }) {
    return BookshelfUser.where({ id })
      .save(
        { username },
        {
          transacting: domainTransaction.knexTransaction,
          patch: true,
          method: 'update',
        }
      )
      .then((bookshelfUser) => _toDomain(bookshelfUser))
      .catch((err) => {
        if (err instanceof BookshelfUser.NoRowsUpdatedError) {
          throw new UserNotFoundError(`User not found for ID ${id}`);
        }
        throw err;
      });
  },

  addUsername(id, username) {
    return BookshelfUser.where({ id })
      .save({ username }, { patch: true, method: 'update' })
      .then((bookshelfUser) => _toDomain(bookshelfUser))
      .catch((err) => {
        if (err instanceof BookshelfUser.NoRowsUpdatedError) {
          throw new UserNotFoundError(`User not found for ID ${id}`);
        }
        throw err;
      });
  },

  async updateUserAttributes(id, userAttributes) {
    try {
      const bookshelfUser = await BookshelfUser.where({ id }).save(userAttributes, { patch: true, method: 'update' });
      return _toDomain(bookshelfUser);
    } catch (err) {
      if (err instanceof BookshelfUser.NoRowsUpdatedError) {
        throw new UserNotFoundError(`User not found for ID ${id}`);
      }
      throw err;
    }
  },

  async findByPoleEmploiExternalIdentifier(externalIdentityId) {
    const bookshelfUser = await BookshelfUser.query((qb) => {
      qb.innerJoin('authentication-methods', function () {
        this.on('users.id', 'authentication-methods.userId')
          .andOnVal('authentication-methods.identityProvider', AuthenticationMethod.identityProviders.POLE_EMPLOI)
          .andOnVal('authentication-methods.externalIdentifier', externalIdentityId);
      });
    }).fetch({ require: false, withRelated: 'authenticationMethods' });
    return bookshelfUser ? _toDomain(bookshelfUser) : null;
  },

  async findAnotherUserByEmail(userId, email) {
    return BookshelfUser.where('id', '!=', userId)
      .where({ email: email.toLowerCase() })
      .fetchAll()
      .then((users) => bookshelfToDomainConverter.buildDomainObjects(BookshelfUser, users));
  },

  async findAnotherUserByUsername(userId, username) {
    return BookshelfUser.where('id', '!=', userId)
      .where({ username })
      .fetchAll()
      .then((users) => bookshelfToDomainConverter.buildDomainObjects(BookshelfUser, users));
  },

  async updateLastLoggedAt({ userId }) {
    const now = new Date();

    await knex('users').where({ id: userId }).update({ lastLoggedAt: now });
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
      group: schoolingRegistration.group,
      organizationId: schoolingRegistration.organization.id,
      organizationName: schoolingRegistration.organization.name,
      createdAt: schoolingRegistration.createdAt,
      updatedAt: schoolingRegistration.updatedAt,
      isDisabled: schoolingRegistration.isDisabled,
      organizationIsManagingStudents: schoolingRegistration.organization.isManagingStudents,
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
    const { authenticationComplement, externalIdentifier } =
      _getAuthenticationComplementAndExternalIdentifier(authenticationMethodBookshelf);

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
    emailConfirmedAt: userBookshelf.get('emailConfirmedAt'),
    username: userBookshelf.get('username'),
    password: userBookshelf.get('password'),
    shouldChangePassword: Boolean(userBookshelf.get('shouldChangePassword')),
    cgu: Boolean(userBookshelf.get('cgu')),
    lang: userBookshelf.get('lang'),
    isAnonymous: Boolean(userBookshelf.get('isAnonymous')),
    lastTermsOfServiceValidatedAt: userBookshelf.get('lastTermsOfServiceValidatedAt'),
    hasSeenNewDashboardInfo: Boolean(userBookshelf.get('hasSeenNewDashboardInfo')),
    mustValidateTermsOfService: Boolean(userBookshelf.get('mustValidateTermsOfService')),
    pixOrgaTermsOfServiceAccepted: Boolean(userBookshelf.get('pixOrgaTermsOfServiceAccepted')),
    pixCertifTermsOfServiceAccepted: Boolean(userBookshelf.get('pixCertifTermsOfServiceAccepted')),
    memberships: _toMembershipsDomain(userBookshelf.related('memberships')),
    certificationCenterMemberships: _toCertificationCenterMembershipsDomain(
      userBookshelf.related('certificationCenterMemberships')
    ),
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

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
const Membership = require('../../domain/models/Membership');
const CertificationCenter = require('../../domain/models/CertificationCenter');
const CertificationCenterMembership = require('../../domain/models/CertificationCenterMembership');
const Organization = require('../../domain/models/Organization');
const OrganizationLearnerForAdmin = require('../../domain/read-models/OrganizationLearnerForAdmin');
const AuthenticationMethod = require('../../domain/models/AuthenticationMethod');
const OidcIdentityProviders = require('../../domain/constants/oidc-identity-providers');
const UserLogin = require('../../domain/models/UserLogin');

module.exports = {
  async getByEmail(email) {
    const foundUser = await knex.from('users').whereRaw('LOWER("email") = ?', email.toLowerCase()).first();
    if (!foundUser) {
      throw new UserNotFoundError(`User not found for email ${email}`);
    }
    return new User(foundUser);
  },

  getByUsernameOrEmailWithRolesAndPassword(username) {
    return BookshelfUser.query((qb) =>
      qb.where({ email: username.toLowerCase() }).orWhere({ username: username.toLowerCase() })
    )
      .fetch({
        require: false,
        withRelated: [
          { memberships: (qb) => qb.where({ disabledAt: null }) },
          { certificationCenterMemberships: (qb) => qb.where({ disabledAt: null }) },
          'memberships.organization',
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

  /**
   * @deprecated Use getById instead
   */
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

  async getById(userId) {
    const foundUser = await knex.from('users').where({ id: userId }).first();
    if (!foundUser) {
      throw new UserNotFoundError();
    }
    return new User(foundUser);
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

  async getUserDetailsForAdmin(userId) {
    const userDTO = await knex('users')
      .leftJoin('user-logins', 'user-logins.userId', 'users.id')
      .select([
        'users.*',
        'user-logins.id AS userLoginId',
        'user-logins.failureCount',
        'user-logins.temporaryBlockedUntil',
        'user-logins.blockedAt',
      ])
      .where({ 'users.id': userId })
      .first();

    if (!userDTO) {
      throw new UserNotFoundError(`User not found for ID ${userId}`);
    }

    const authenticationMethodsDTO = await knex('authentication-methods')
      .select(['authentication-methods.id', 'identityProvider'])
      .join('users', 'users.id', 'authentication-methods.userId')
      .where({ userId });

    const organizationLearnersDTO = await knex('organization-learners')
      .select([
        'organization-learners.*',
        'organizations.name AS organizationName',
        'organizations.isManagingStudents AS organizationIsManagingStudents',
      ])
      .join('organizations', 'organizations.id', 'organization-learners.organizationId')
      .where({ userId })
      .orderBy('id');

    return _fromKnexDTOToUserDetailsForAdmin({ userDTO, organizationLearnersDTO, authenticationMethodsDTO });
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

  async findByExternalIdentifier({ externalIdentityId, identityProvider }) {
    const bookshelfUser = await BookshelfUser.query((qb) => {
      qb.innerJoin('authentication-methods', function () {
        this.on('users.id', 'authentication-methods.userId')
          .andOnVal('authentication-methods.identityProvider', identityProvider)
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

function _fromKnexDTOToUserDetailsForAdmin({ userDTO, organizationLearnersDTO, authenticationMethodsDTO }) {
  const organizationLearners = organizationLearnersDTO.map(
    (organizationLearnerDTO) =>
      new OrganizationLearnerForAdmin({
        id: organizationLearnerDTO.id,
        firstName: organizationLearnerDTO.firstName,
        lastName: organizationLearnerDTO.lastName,
        birthdate: organizationLearnerDTO.birthdate,
        division: organizationLearnerDTO.division,
        group: organizationLearnerDTO.group,
        organizationId: organizationLearnerDTO.organizationId,
        organizationName: organizationLearnerDTO.organizationName,
        createdAt: organizationLearnerDTO.createdAt,
        updatedAt: organizationLearnerDTO.updatedAt,
        isDisabled: organizationLearnerDTO.isDisabled,
        organizationIsManagingStudents: organizationLearnerDTO.organizationIsManagingStudents,
      })
  );
  const userLogin = new UserLogin({
    id: userDTO.userLoginId,
    userId: userDTO.userId,
    failureCount: userDTO.failureCount,
    temporaryBlockedUntil: userDTO.temporaryBlockedUntil,
    blockedAt: userDTO.blockedAt,
  });
  return new UserDetailsForAdmin({
    id: userDTO.id,
    firstName: userDTO.firstName,
    lastName: userDTO.lastName,
    username: userDTO.username,
    email: userDTO.email,
    cgu: userDTO.cgu,
    pixOrgaTermsOfServiceAccepted: userDTO.pixOrgaTermsOfServiceAccepted,
    pixCertifTermsOfServiceAccepted: userDTO.pixCertifTermsOfServiceAccepted,
    createdAt: userDTO.createdAt,
    lang: userDTO.lang,
    lastTermsOfServiceValidatedAt: userDTO.lastTermsOfServiceValidatedAt,
    lastPixOrgaTermsOfServiceValidatedAt: userDTO.lastPixOrgaTermsOfServiceValidatedAt,
    lastPixCertifTermsOfServiceValidatedAt: userDTO.lastPixCertifTermsOfServiceValidatedAt,
    lastLoggedAt: userDTO.lastLoggedAt,
    emailConfirmedAt: userDTO.emailConfirmedAt,
    organizationLearners,
    authenticationMethods: authenticationMethodsDTO,
    userLogin,
  });
}

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
    createdAt: rawUserDetailsForAdmin.createdAt,
    lang: rawUserDetailsForAdmin.lang,
    lastTermsOfServiceValidatedAt: rawUserDetailsForAdmin.lastTermsOfServiceValidatedAt,
    lastPixOrgaTermsOfServiceValidatedAt: rawUserDetailsForAdmin.lastPixOrgaTermsOfServiceValidatedAt,
    lastPixCertifTermsOfServiceValidatedAt: rawUserDetailsForAdmin.lastPixCertifTermsOfServiceValidatedAt,
    lastLoggedAt: rawUserDetailsForAdmin.lastLoggedAt,
    emailConfirmedAt: rawUserDetailsForAdmin.emailConfirmedAt,
    organizationLearners: _toOrganizationLearnersForAdmin(rawUserDetailsForAdmin.organizationLearners),
    authenticationMethods: rawUserDetailsForAdmin.authenticationMethods,
  });
}

function _toOrganizationLearnersForAdmin(organizationLearners) {
  if (!organizationLearners) {
    return [];
  }
  return organizationLearners.map((organizationLearner) => {
    return new OrganizationLearnerForAdmin({
      id: organizationLearner.id,
      firstName: organizationLearner.firstName,
      lastName: organizationLearner.lastName,
      birthdate: organizationLearner.birthdate,
      division: organizationLearner.division,
      group: organizationLearner.group,
      organizationId: organizationLearner.organization.id,
      organizationName: organizationLearner.organization.name,
      createdAt: organizationLearner.createdAt,
      updatedAt: organizationLearner.updatedAt,
      isDisabled: organizationLearner.isDisabled,
      organizationIsManagingStudents: organizationLearner.organization.isManagingStudents,
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
  } else if (identityProvider === OidcIdentityProviders.POLE_EMPLOI.code) {
    authenticationComplement = new AuthenticationMethod.OidcAuthenticationComplement({
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
    hasSeenAssessmentInstructions: Boolean(userBookshelf.get('hasSeenAssessmentInstructions')),
    authenticationMethods: _toAuthenticationMethodsDomain(userBookshelf.related('authenticationMethods')),
  });
}

function _setSearchFiltersForQueryBuilder(filter, qb) {
  const { firstName, lastName, email, username } = filter;

  if (firstName) {
    qb.whereILike('firstName', `%${firstName}%`);
  }
  if (lastName) {
    qb.whereILike('lastName', `%${lastName}%`);
  }
  if (email) {
    qb.whereILike('email', `%${email}%`);
  }
  if (username) {
    qb.whereILike('username', `%${username}%`);
  }
}

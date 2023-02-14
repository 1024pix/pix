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
const { fetchPage } = require('../utils/knex-utils');

module.exports = {
  async getByEmail(email) {
    const foundUser = await knex.from('users').whereRaw('LOWER("email") = ?', email.toLowerCase()).first();
    if (!foundUser) {
      throw new UserNotFoundError(`User not found for email ${email}`);
    }
    return new User(foundUser);
  },

  async getByUsernameOrEmailWithRolesAndPassword(username) {
    const userDTO = await knex('users')
      .where({ email: username.toLowerCase() })
      .orWhere({ username: username.toLowerCase() })
      .first();

    if (!userDTO) {
      throw new UserNotFoundError();
    }

    const membershipsDTO = await knex('memberships').where({ userId: userDTO.id, disabledAt: null });
    const certificationCenterMembershipsDTO = await knex('certification-center-memberships').where({
      userId: userDTO.id,
      disabledAt: null,
    });
    const authenticationMethodsDTO = await knex('authentication-methods').where({
      userId: userDTO.id,
      identityProvider: 'PIX',
    });

    return _toDomainFromDTO({ userDTO, membershipsDTO, certificationCenterMembershipsDTO, authenticationMethodsDTO });
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

  async getForObfuscation(userId) {
    const foundUser = await knex.select('id', 'email', 'username').from('users').where({ id: userId }).first();
    if (!foundUser) {
      throw new UserNotFoundError(`User not found for ID ${userId}`);
    }
    return new User({ id: foundUser.id, email: foundUser.email, username: foundUser.username });
  },

  async getUserDetailsForAdmin(userId) {
    const userDTO = await knex('users')
      .leftJoin('user-logins', 'user-logins.userId', 'users.id')
      .leftJoin('users AS anonymisedBy', 'anonymisedBy.id', 'users.hasBeenAnonymisedBy')
      .select([
        'users.*',
        'user-logins.id AS userLoginId',
        'user-logins.failureCount',
        'user-logins.temporaryBlockedUntil',
        'user-logins.blockedAt',
        'anonymisedBy.firstName AS anonymisedByFirstName',
        'anonymisedBy.lastName AS anonymisedByLastName',
      ])
      .where({ 'users.id': userId })
      .first();

    if (!userDTO) {
      throw new UserNotFoundError(`User not found for ID ${userId}`);
    }

    const authenticationMethodsDTO = await knex('authentication-methods')
      .select([
        'authentication-methods.id',
        'authentication-methods.identityProvider',
        'authentication-methods.authenticationComplement',
      ])
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

  async findPaginatedFiltered({ filter, page }) {
    const query = knex('users').where((qb) => _setSearchFiltersForQueryBuilder(filter, qb));
    const { results, pagination } = await fetchPage(query, page);

    const users = results.map((userDTO) => new User(userDTO));
    return { models: users, pagination };
  },

  async getWithMemberships(userId) {
    const userDTO = await knex('users').where({ id: userId }).first();

    if (!userDTO) {
      throw new UserNotFoundError();
    }

    const membershipsDTO = await knex('memberships')
      .select(
        'memberships.*',
        'organizations.name AS organizationName',
        'organizations.type AS organizationType',
        'organizations.externalId AS organizationExternalId',
        'organizations.isManagingStudents AS organizationIsManagingStudents'
      )
      .join('organizations', 'organizations.id', 'memberships.organizationId')
      .where({ userId: userDTO.id, disabledAt: null });

    return _toDomainFromDTO({ userDTO, membershipsDTO });
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

  async updateUserDetailsForAdministration({
    id,
    userAttributes,
    domainTransaction = DomainTransaction.emptyTransaction(),
  }) {
    try {
      const knexConn = domainTransaction.knexTransaction ?? knex;
      const [userDTO] = await knexConn('users').where({ id }).update(userAttributes).returning('*');

      if (!userDTO) {
        throw new UserNotFoundError(`User not found for ID ${id}`);
      }
    } catch (err) {
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

  async updateLastDataProtectionPolicySeenAt({ userId }) {
    const now = new Date();

    const [user] = await knex('users')
      .where({ id: userId })
      .update({ lastDataProtectionPolicySeenAt: now })
      .returning('*');

    return new User(user);
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

  const authenticationMethods = authenticationMethodsDTO.map((authenticationMethod) => {
    const isPixAuthenticationMethodWithAuthenticationComplement =
      authenticationMethod.identityProvider === AuthenticationMethod.identityProviders.PIX &&
      authenticationMethod.authenticationComplement;
    if (isPixAuthenticationMethodWithAuthenticationComplement) {
      // eslint-disable-next-line no-unused-vars
      const { password, ...authenticationComplement } = authenticationMethod.authenticationComplement;
      return {
        ...authenticationMethod,
        authenticationComplement,
      };
    }

    return authenticationMethod;
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
    lang: userDTO.lang,
    lastTermsOfServiceValidatedAt: userDTO.lastTermsOfServiceValidatedAt,
    lastPixOrgaTermsOfServiceValidatedAt: userDTO.lastPixOrgaTermsOfServiceValidatedAt,
    lastPixCertifTermsOfServiceValidatedAt: userDTO.lastPixCertifTermsOfServiceValidatedAt,
    lastLoggedAt: userDTO.lastLoggedAt,
    emailConfirmedAt: userDTO.emailConfirmedAt,
    organizationLearners,
    authenticationMethods,
    userLogin,
    hasBeenAnonymised: userDTO.hasBeenAnonymised,
    updatedAt: userDTO.updatedAt,
    createdAt: userDTO.createdAt,
    anonymisedByFirstName: userDTO.anonymisedByFirstName,
    anonymisedByLastName: userDTO.anonymisedByLastName,
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
  } else if (identityProvider === OidcIdentityProviders.POLE_EMPLOI.service.code) {
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

function _toDomainFromDTO({
  userDTO,
  membershipsDTO = [],
  certificationCenterMembershipsDTO = [],
  authenticationMethodsDTO = [],
}) {
  const memberships = membershipsDTO.map((membershipDTO) => {
    let organization;
    if (membershipDTO.organizationName) {
      organization = new Organization({
        id: membershipDTO.organizationId,
        name: membershipDTO.organizationName,
        type: membershipDTO.organizationType,
        externalId: membershipDTO.organizationExternalId,
        isManagingStudents: membershipDTO.organizationIsManagingStudents,
      });
    }
    return new Membership({ ...membershipDTO, organization });
  });
  const certificationCenterMemberships = certificationCenterMembershipsDTO.map(
    (certificationCenterMembershipDTO) => new CertificationCenterMembership(certificationCenterMembershipDTO)
  );
  return new User({
    id: userDTO.id,
    cgu: userDTO.cgu,
    pixOrgaTermsOfServiceAccepted: userDTO.pixOrgaTermsOfServiceAccepted,
    pixCertifTermsOfServiceAccepted: userDTO.pixCertifTermsOfServiceAccepted,
    email: userDTO.email,
    emailConfirmedAt: userDTO.emailConfirmedAt,
    username: userDTO.username,
    firstName: userDTO.firstName,
    knowledgeElements: userDTO.knowledgeElements,
    lastName: userDTO.lastName,
    lastTermsOfServiceValidatedAt: userDTO.lastTermsOfServiceValidatedAt,
    lastPixOrgaTermsOfServiceValidatedAt: userDTO.lastPixOrgaTermsOfServiceValidatedAt,
    lastPixCertifTermsOfServiceValidatedAt: userDTO.lastPixCertifTermsOfServiceValidatedAt,
    hasSeenAssessmentInstructions: userDTO.hasSeenAssessmentInstructions,
    hasSeenNewDashboardInfo: userDTO.hasSeenNewDashboardInfo,
    hasSeenFocusedChallengeTooltip: userDTO.hasSeenFocusedChallengeTooltip,
    hasSeenOtherChallengesTooltip: userDTO.hasSeenOtherChallengesTooltip,
    mustValidateTermsOfService: userDTO.mustValidateTermsOfService,
    lang: userDTO.lang,
    isAnonymous: userDTO.isAnonymous,
    pixScore: userDTO.pixScore,
    scorecards: userDTO.scorecards,
    campaignParticipations: userDTO.campaignParticipations,
    memberships,
    certificationCenterMemberships,
    authenticationMethods: authenticationMethodsDTO,
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

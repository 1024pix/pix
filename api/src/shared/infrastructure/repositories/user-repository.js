import { knex } from '../../../../db/knex-database-connection.js';
import { DomainTransaction } from '../../../../lib/infrastructure/DomainTransaction.js';
import { BookshelfUser } from '../../../../lib/infrastructure/orm-models/User.js';
import { isUniqConstraintViolated, fetchPage } from '../../../../lib/infrastructure/utils/knex-utils.js';

import {
  AlreadyExistingEntityError,
  AlreadyRegisteredEmailError,
  AlreadyRegisteredUsernameError,
  UserNotFoundError,
} from '../../../../lib/domain/errors.js';

import { User } from '../../../../lib/domain/models/User.js';
import { UserDetailsForAdmin } from '../../../../lib/domain/models/UserDetailsForAdmin.js';
import { Membership } from '../../../../lib/domain/models/Membership.js';
import { CertificationCenter } from '../../../../lib/domain/models/CertificationCenter.js';
import { CertificationCenterMembership } from '../../../../lib/domain/models/CertificationCenterMembership.js';
import { Organization } from '../../../../lib/domain/models/Organization.js';
import { OrganizationLearnerForAdmin } from '../../../../lib/domain/read-models/OrganizationLearnerForAdmin.js';
import { AuthenticationMethod } from '../../../../lib/domain/models/AuthenticationMethod.js';
import { NON_OIDC_IDENTITY_PROVIDERS } from '../../../../lib/domain/constants/identity-providers.js';
import * as OidcIdentityProviders from '../../../../lib/domain/constants/oidc-identity-providers.js';
import { UserLogin } from '../../../authentication/domain/models/UserLogin.js';

const getByEmail = async function (email) {
  const foundUser = await knex.from('users').whereRaw('LOWER("email") = ?', email.toLowerCase()).first();
  if (!foundUser) {
    throw new UserNotFoundError(`User not found for email ${email}`);
  }
  return new User(foundUser);
};

const getFullById = async function (userId) {
  const userDTO = await knex('users').where({ id: userId }).first();
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
};

const getByUsernameOrEmailWithRolesAndPassword = async function (username) {
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
};

const get = async function (userId) {
  const foundUser = await knex('users').where('id', userId).first();
  if (!foundUser) throw new UserNotFoundError(`User not found for ID ${userId}`);
  return new User(foundUser);
};
//Doublon ici entre le get & getById ?
const getById = async function (userId) {
  const foundUser = await knex.from('users').where({ id: userId }).first();
  if (!foundUser) {
    throw new UserNotFoundError();
  }
  return new User(foundUser);
};

const getByIds = async function (userIds) {
  const dbUsers = await knex('users').whereIn('id', userIds);

  return dbUsers.map((dbUser) => new User(dbUser));
};

const getForObfuscation = async function (userId) {
  const foundUser = await knex.select('id', 'email', 'username').from('users').where({ id: userId }).first();
  if (!foundUser) {
    throw new UserNotFoundError(`User not found for ID ${userId}`);
  }
  return new User({ id: foundUser.id, email: foundUser.email, username: foundUser.username });
};

const getUserDetailsForAdmin = async function (userId) {
  const userDTO = await knex('users')
    .leftJoin('user-logins', 'user-logins.userId', 'users.id')
    .leftJoin('users AS anonymisedBy', 'anonymisedBy.id', 'users.hasBeenAnonymisedBy')
    .select([
      'users.*',
      'user-logins.id AS userLoginId',
      'user-logins.failureCount',
      'user-logins.temporaryBlockedUntil',
      'user-logins.blockedAt',
      'user-logins.lastLoggedAt AS lastLoggedAt',
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

  const organizationLearnersDTO = await knex('view-active-organization-learners')
    .select([
      'view-active-organization-learners.*',
      'organizations.name AS organizationName',
      'organizations.isManagingStudents AS organizationIsManagingStudents',
    ])
    .join('organizations', 'organizations.id', 'view-active-organization-learners.organizationId')
    .where({ userId })
    .orderBy('id');

  return _fromKnexDTOToUserDetailsForAdmin({ userDTO, organizationLearnersDTO, authenticationMethodsDTO });
};

const findPaginatedFiltered = async function ({ filter, page }) {
  const query = knex('users')
    .where((qb) => _setSearchFiltersForQueryBuilder(filter, qb))
    .orderBy([{ column: 'firstName', order: 'asc' }, { column: 'lastName', order: 'asc' }, { column: 'id' }]);
  const { results, pagination } = await fetchPage(query, page);

  const users = results.map((userDTO) => new User(userDTO));
  return { models: users, pagination };
};

const getWithMemberships = async function (userId) {
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
      'organizations.isManagingStudents AS organizationIsManagingStudents',
    )
    .join('organizations', 'organizations.id', 'memberships.organizationId')
    .where({ userId: userDTO.id, disabledAt: null });

  return _toDomainFromDTO({ userDTO, membershipsDTO });
};

const getWithCertificationCenterMemberships = async function (userId) {
  const user = await knex('users').where({ id: userId }).first();
  if (!user) throw new UserNotFoundError(`User not found for ID ${userId}`);

  const certificationCenterMemberships = await knex('certification-center-memberships')
    .where({ userId })
    .whereNull('disabledAt');
  const certificationCenters = await knex('certification-centers').whereIn(
    'id',
    certificationCenterMemberships.map(
      (certificationCenterMembership) => certificationCenterMembership.certificationCenterId,
    ),
  );

  return new User({
    ...user,
    certificationCenterMemberships: certificationCenterMemberships.map(
      (certificationCenterMembership) =>
        new CertificationCenterMembership({
          ...certificationCenterMembership,
          certificationCenter: new CertificationCenter(
            certificationCenters.find(
              (certificationCenter) => certificationCenter.id === certificationCenterMembership.certificationCenterId,
            ),
          ),
        }),
    ),
  });
};

const getBySamlId = async function (samlId) {
  const bookshelfUser = await BookshelfUser.query((qb) => {
    qb.innerJoin('authentication-methods', function () {
      this.on('users.id', 'authentication-methods.userId')
        .andOnVal('authentication-methods.identityProvider', NON_OIDC_IDENTITY_PROVIDERS.GAR.code)
        .andOnVal('authentication-methods.externalIdentifier', samlId);
    });
  }).fetch({ require: false, withRelated: 'authenticationMethods' });
  return bookshelfUser ? _toDomain(bookshelfUser) : null;
};

const update = async function (properties) {
  const { id: userId, ...data } = properties;
  data.updatedAt = new Date();
  await knex('users').where({ id: userId }).update(data);
};

const updateWithEmailConfirmed = function ({
  id,
  userAttributes,
  domainTransaction: { knexTransaction } = DomainTransaction.emptyTransaction(),
}) {
  const query = knex('users')
    .where({ id })
    .update({ ...userAttributes, updatedAt: new Date() });
  if (knexTransaction) query.transacting(knexTransaction);
  return query;
};

const checkIfEmailIsAvailable = async function (email) {
  const existingUserEmail = await knex('users').whereRaw('LOWER("email") = ?', email.toLowerCase()).first();

  if (existingUserEmail) throw new AlreadyRegisteredEmailError();

  return email;
};

const isUserExistingByEmail = async function (email) {
  const existingUser = await knex('users').where('email', email.toLowerCase()).first();
  if (!existingUser) throw new UserNotFoundError();
  return true;
};

const updateEmail = async function ({ id, email }) {
  const [updatedUserEmail] = await knex('users').where({ id }).update({ email, updatedAt: new Date() }).returning('*');
  if (!updatedUserEmail) throw new UserNotFoundError(`User not found for ID ${id}`);
  return new User(updatedUserEmail);
};

const updateUserDetailsForAdministration = async function ({
  id,
  userAttributes,
  domainTransaction = DomainTransaction.emptyTransaction(),
}) {
  try {
    const knexConn = domainTransaction.knexTransaction ?? knex;
    const [userDTO] = await knexConn('users')
      .where({ id })
      .update({ ...userAttributes, updatedAt: new Date() })
      .returning('*');

    if (!userDTO) {
      throw new UserNotFoundError(`User not found for ID ${id}`);
    }
  } catch (err) {
    if (isUniqConstraintViolated(err)) {
      throw new AlreadyExistingEntityError('Cette adresse e-mail ou cet identifiant est déjà utilisé(e).');
    }
    throw err;
  }
};

const updateHasSeenAssessmentInstructionsToTrue = async function (id) {
  const [user] = await knex('users')
    .where({ id })
    .update({ hasSeenAssessmentInstructions: true, updatedAt: new Date() })
    .returning('*');

  return new User(user);
};

const updateHasSeenLevelSevenInfoToTrue = async function (id) {
  const now = new Date();
  const [user] = await knex('users')
    .where({ id })
    .update({ hasSeenLevelSevenInfo: true, updatedAt: now })
    .returning('*');

  return new User(user);
};

const updateHasSeenNewDashboardInfoToTrue = async function (id) {
  const [user] = await knex('users')
    .where({ id })
    .update({ hasSeenNewDashboardInfo: true, updatedAt: new Date() })
    .returning('*');

  return new User(user);
};

const updateHasSeenChallengeTooltip = async function ({ userId, challengeType }) {
  let user;
  if (challengeType === 'focused') {
    [user] = await knex('users')
      .where({ id: userId })
      .update({ hasSeenFocusedChallengeTooltip: true, updatedAt: new Date() })
      .returning('*');
  }
  if (challengeType === 'other') {
    [user] = await knex('users')
      .where({ id: userId })
      .update({ hasSeenOtherChallengesTooltip: true, updatedAt: new Date() })
      .returning('*');
  }
  return new User(user);
};

const acceptPixLastTermsOfService = async function (id) {
  const [user] = await knex('users')
    .where({ id })
    .update({ lastTermsOfServiceValidatedAt: new Date(), mustValidateTermsOfService: false, updatedAt: new Date() })
    .returning('*');

  return new User(user);
};

const updatePixOrgaTermsOfServiceAcceptedToTrue = async function (id) {
  const now = new Date();

  const [user] = await knex('users')
    .where({ id })
    .update({ pixOrgaTermsOfServiceAccepted: true, lastPixOrgaTermsOfServiceValidatedAt: now, updatedAt: now })
    .returning('*');

  return new User(user);
};

const updatePixCertifTermsOfServiceAcceptedToTrue = async function (id) {
  const now = new Date();

  const [user] = await knex('users')
    .where({ id })
    .update({ pixCertifTermsOfServiceAccepted: true, lastPixCertifTermsOfServiceValidatedAt: now, updatedAt: now })
    .returning('*');

  return new User(user);
};

const isUsernameAvailable = async function (username) {
  const foundUser = await knex('users').where({ username }).first();

  if (foundUser) throw new AlreadyRegisteredUsernameError();

  return username;
};

const updateUsername = async function ({ id, username, domainTransaction = DomainTransaction.emptyTransaction() }) {
  const knexConn = domainTransaction.knexTransaction || knex;
  const [updatedUsername] = await knexConn('users')
    .where({ id })
    .update({ username, updatedAt: new Date() })
    .returning('*');
  if (!updatedUsername) throw new UserNotFoundError(`User not found for ID ${id}`);
  return new User(updatedUsername);
};

const findByExternalIdentifier = async function ({ externalIdentityId, identityProvider }) {
  const bookshelfUser = await BookshelfUser.query((qb) => {
    qb.innerJoin('authentication-methods', function () {
      this.on('users.id', 'authentication-methods.userId')
        .andOnVal('authentication-methods.identityProvider', identityProvider)
        .andOnVal('authentication-methods.externalIdentifier', externalIdentityId);
    });
  }).fetch({ require: false, withRelated: 'authenticationMethods' });
  return bookshelfUser ? _toDomain(bookshelfUser) : null;
};

const findAnotherUserByEmail = async function (userId, email) {
  const anotherUsers = await knex('users').whereNot('id', userId).where({ email: email.toLowerCase() });

  return anotherUsers.map((anotherUser) => new User(anotherUser));
};

const findAnotherUserByUsername = async function (userId, username) {
  const anotherUsers = await knex('users').whereNot('id', userId).where({ username });

  return anotherUsers.map((anotherUser) => new User(anotherUser));
};

const updateLastDataProtectionPolicySeenAt = async function ({ userId }) {
  const now = new Date();

  const [user] = await knex('users')
    .where({ id: userId })
    .update({ lastDataProtectionPolicySeenAt: now, updatedAt: new Date() })
    .returning('*');

  return new User(user);
};

export {
  acceptPixLastTermsOfService,
  checkIfEmailIsAvailable,
  findAnotherUserByEmail,
  findAnotherUserByUsername,
  findByExternalIdentifier,
  findPaginatedFiltered,
  get,
  getByEmail,
  getById,
  getByIds,
  getBySamlId,
  getByUsernameOrEmailWithRolesAndPassword,
  getForObfuscation,
  getFullById,
  getUserDetailsForAdmin,
  getWithCertificationCenterMemberships,
  getWithMemberships,
  isUserExistingByEmail,
  isUsernameAvailable,
  update,
  updateEmail,
  updateHasSeenAssessmentInstructionsToTrue,
  updateHasSeenChallengeTooltip,
  updateHasSeenLevelSevenInfoToTrue,
  updateHasSeenNewDashboardInfoToTrue,
  updateLastDataProtectionPolicySeenAt,
  updatePixCertifTermsOfServiceAcceptedToTrue,
  updatePixOrgaTermsOfServiceAcceptedToTrue,
  updateUserDetailsForAdministration,
  updateUsername,
  updateWithEmailConfirmed,
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
      }),
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
      authenticationMethod.identityProvider === NON_OIDC_IDENTITY_PROVIDERS.PIX.code &&
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
    locale: userDTO.locale,
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

  if (identityProvider === NON_OIDC_IDENTITY_PROVIDERS.PIX.code) {
    authenticationComplement = new AuthenticationMethod.PixAuthenticationComplement({
      password: authenticationComplement.password,
      shouldChangePassword: Boolean(authenticationComplement.shouldChangePassword),
    });
    externalIdentifier = undefined;
  } else if (identityProvider === OidcIdentityProviders.POLE_EMPLOI.code) {
    authenticationComplement = new AuthenticationMethod.PoleEmploiOidcAuthenticationComplement({
      accessToken: authenticationComplement.accessToken,
      refreshToken: authenticationComplement.refreshToken,
      expiredDate: authenticationComplement.expiredDate,
    });
  } else if (OidcIdentityProviders.getValidOidcProviderCodes().includes(identityProvider)) {
    if (authenticationComplement) {
      authenticationComplement = new AuthenticationMethod.OidcAuthenticationComplement(authenticationComplement);
    }
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
      userBookshelf.related('certificationCenterMemberships'),
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
    (certificationCenterMembershipDTO) => new CertificationCenterMembership(certificationCenterMembershipDTO),
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
    locale: userDTO.locale,
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
  const { id, firstName, lastName, email, username } = filter;

  if (id) {
    qb.where({ id });
  }
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

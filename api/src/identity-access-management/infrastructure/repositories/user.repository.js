import { knex } from '../../../../db/knex-database-connection.js';
import { InvalidOrAlreadyUsedEmailError } from '../../../identity-access-management/domain/errors.js';
import * as legalDocumentApi from '../../../legal-documents/application/api/legal-documents-api.js';
import * as organizationFeaturesApi from '../../../organizational-entities/application/api/organization-features-api.js';
import { Organization } from '../../../organizational-entities/domain/models/Organization.js';
import { OrganizationLearnerForAdmin } from '../../../prescription/learner-management/domain/read-models/OrganizationLearnerForAdmin.js';
import * as organizationLearnerImportFormatRepository from '../../../prescription/learner-management/infrastructure/repositories/organization-learner-import-format-repository.js';
import { DomainTransaction } from '../../../shared/domain/DomainTransaction.js';
import {
  AlreadyExistingEntityError,
  AlreadyRegisteredUsernameError,
  UserNotFoundError,
} from '../../../shared/domain/errors.js';
import { CertificationCenter } from '../../../shared/domain/models/CertificationCenter.js';
import { CertificationCenterMembership } from '../../../shared/domain/models/CertificationCenterMembership.js';
import { Membership } from '../../../shared/domain/models/Membership.js';
import { fetchPage, isUniqConstraintViolated } from '../../../shared/infrastructure/utils/knex-utils.js';
import { NON_OIDC_IDENTITY_PROVIDERS } from '../../domain/constants/identity-providers.js';
import { QUERY_TYPES } from '../../domain/constants/user-query.js';
import { LastUserApplicationConnection } from '../../domain/models/LastUserApplicationConnection.js';
import { User } from '../../domain/models/User.js';
import { UserDetailsForAdmin } from '../../domain/models/UserDetailsForAdmin.js';
import { UserLogin } from '../../domain/models/UserLogin.js';

const getByEmail = async function (email) {
  const foundUser = await knex.from('users').whereRaw('LOWER("email") = ?', email.toLowerCase()).first();
  if (!foundUser) {
    throw new UserNotFoundError(`User not found for email ${email}`);
  }
  return new User(foundUser);
};

/**
 * @param userId
 * @return {Promise<User>}
 * @throws {UserNotFoundError}
 */
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
    .whereRaw('LOWER("email") = ?', username.toLowerCase())
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

/**
 * @param {string} userId
 * @return {Promise<User>}
 * @throws {UserNotFoundError}
 */
const get = async function (userId) {
  const knexConn = DomainTransaction.getConnection();
  const foundUser = await knexConn('users').where('id', userId).first();
  if (!foundUser) throw new UserNotFoundError(`User not found for ID ${userId}`);
  return new User(foundUser);
};

const getByIds = async function (userIds) {
  const knexConn = DomainTransaction.getConnection();

  const dbUsers = await knexConn('users').whereIn('id', userIds);

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

  const pixOrgaLegalDocumentStatus = await legalDocumentApi.getLegalDocumentStatusByUserId({
    userId,
    service: 'pix-orga',
    type: 'TOS',
  });

  const lastUserApplicationConnectionsDTO = await knex('last-user-application-connections').where({ userId });

  const authenticationMethodsDTO = await knex('authentication-methods')
    .select([
      'authentication-methods.id',
      'authentication-methods.identityProvider',
      'authentication-methods.authenticationComplement',
      'authentication-methods.lastLoggedAt',
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

  for (const learner of organizationLearnersDTO) {
    const features = await organizationFeaturesApi.getAllFeaturesFromOrganization(learner.organizationId);
    learner.hasImportFeature = features.hasLearnersImportFeature;
    if (learner.hasImportFeature) {
      const importFormat = await organizationLearnerImportFormatRepository.get(learner.organizationId);
      learner.additionalColumns = importFormat.extraColumns;
    }
  }

  const pixAdminRolesDTO = await knex('pix-admin-roles').where({ userId });

  return _fromKnexDTOToUserDetailsForAdmin({
    userDTO,
    pixOrgaLegalDocumentStatus,
    organizationLearnersDTO,
    authenticationMethodsDTO,
    pixAdminRolesDTO,
    lastUserApplicationConnectionsDTO,
  });
};

const findPaginatedFiltered = async function ({ filter, page, queryType = QUERY_TYPES.CONTAINS }) {
  const query = knex('users')
    .where((qb) => _setSearchFiltersForQueryBuilder(filter, qb, queryType))
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
  const user = await knex('users')
    .select('users.*')
    .join('authentication-methods', function () {
      this.on('users.id', 'authentication-methods.userId')
        .andOnVal('authentication-methods.identityProvider', NON_OIDC_IDENTITY_PROVIDERS.GAR.code)
        .andOnVal('authentication-methods.externalIdentifier', samlId);
    })
    .first();

  return user ? _toDomainFromDTO({ userDTO: user }) : null;
};

const update = async function (properties) {
  const { id: userId, ...data } = properties;
  data.updatedAt = new Date();
  await knex('users').where({ id: userId }).update(data);
};

const updateWithEmailConfirmed = function ({ id, userAttributes }) {
  const knexConn = DomainTransaction.getConnection();
  return knexConn('users')
    .where({ id })
    .update({ ...userAttributes, updatedAt: new Date() });
};

const checkIfEmailIsAvailable = async function (email) {
  const existingUserEmail = await knex('users').whereRaw('LOWER("email") = ?', email.toLowerCase()).first();

  if (existingUserEmail) throw new InvalidOrAlreadyUsedEmailError();

  return email;
};

const isUserExistingByEmail = async function (email) {
  const existingUser = await knex('users').whereRaw('LOWER("email") = ?', email.toLowerCase()).first();
  if (!existingUser) throw new UserNotFoundError();
  return true;
};

const updateEmail = async function ({ id, email }) {
  const [updatedUserEmail] = await knex('users').where({ id }).update({ email, updatedAt: new Date() }).returning('*');
  if (!updatedUserEmail) throw new UserNotFoundError(`User not found for ID ${id}`);
  return new User(updatedUserEmail);
};

const updateEmailConfirmed = async function (userId) {
  const knexConn = DomainTransaction.getConnection();
  const updatedAt = new Date();
  await knexConn('users').where({ id: userId }).update({ emailConfirmedAt: updatedAt, updatedAt });
};

const updateUserDetailsForAdministration = async function ({ id, userAttributes }, { preventUpdatedAt } = {}) {
  const knexConn = DomainTransaction.getConnection();

  try {
    if (!preventUpdatedAt) {
      userAttributes.updatedAt = new Date();
    }

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
};

const updateHasSeenAssessmentInstructionsToTrue = async function (id) {
  const [user] = await knex('users')
    .where({ id })
    .update({ hasSeenAssessmentInstructions: true, updatedAt: new Date() })
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

const updateUsername = async function ({ id, username }) {
  const knexConn = DomainTransaction.getConnection();
  const [updatedUsername] = await knexConn('users')
    .where({ id })
    .update({ username, updatedAt: new Date() })
    .returning('*');
  if (!updatedUsername) throw new UserNotFoundError(`User not found for ID ${id}`);
  return new User(updatedUsername);
};

const findByExternalIdentifier = async function ({ externalIdentityId, identityProvider }) {
  const user = await knex('users')
    .select('users.*')
    .join('authentication-methods', function () {
      this.on('users.id', 'authentication-methods.userId')
        .andOnVal('authentication-methods.identityProvider', identityProvider)
        .andOnVal('authentication-methods.externalIdentifier', externalIdentityId);
    })
    .first();

  return user ? _toDomainFromDTO({ userDTO: user }) : null;
};

const findAnotherUserByEmail = async function (userId, email) {
  const anotherUsers = await knex('users').whereNot('id', userId).whereRaw('LOWER("email") = ?', email.toLowerCase());

  return anotherUsers.map((anotherUser) => new User(anotherUser));
};

const findAnotherUserByUsername = async function (userId, username) {
  const anotherUsers = await knex('users').whereNot('id', userId).where({ username });

  return anotherUsers.map((anotherUser) => new User(anotherUser));
};

/**
 * @param {string} userId
 * @return {Promise<User>}
 */
const findById = async function (userId) {
  const user = await knex('users').where({ id: userId }).first();
  return user ? new User(user) : null;
};

/**
 * @param {{
 *   userId: string
 * }} params
 * @return {Promise<User>}
 */
const updateLastDataProtectionPolicySeenAt = async function ({ userId }) {
  const now = new Date();

  const [user] = await knex('users')
    .where({ id: userId })
    .update({ lastDataProtectionPolicySeenAt: now, updatedAt: new Date() })
    .returning('*');

  return new User(user);
};

/**
 * @typedef {Object} UserRepository
 * @property {function} acceptPixLastTermsOfService
 * @property {function} checkIfEmailIsAvailable
 * @property {function} findAnotherUserByEmail
 * @property {function} findAnotherUserByUsername
 * @property {function} findByExternalIdentifier
 * @property {function} findById
 * @property {function} findPaginatedFiltered
 * @property {function} get
 * @property {function} getByEmail
 * @property {function} getByIds
 * @property {function} getBySamlId
 * @property {function} getByUsernameOrEmailWithRolesAndPassword
 * @property {function} getForObfuscation
 * @property {function} getFullById
 * @property {function} getUserDetailsForAdmin
 * @property {function} getWithCertificationCenterMemberships
 * @property {function} getWithMemberships
 * @property {function} isUserExistingByEmail
 * @property {function} isUsernameAvailable
 * @property {function} update
 * @property {function} updateEmail
 * @property {function} updateEmailConfirmed
 * @property {function} updateHasSeenAssessmentInstructionsToTrue
 * @property {function} updateHasSeenChallengeTooltip
 * @property {function} updateHasSeenNewDashboardInfoToTrue
 * @property {function} updateLastDataProtectionPolicySeenAt
 * @property {function} updatePixCertifTermsOfServiceAcceptedToTrue
 * @property {function} updateUserDetailsForAdministration
 * @property {function} updateUsername
 * @property {function} updateWithEmailConfirmed
 */

export {
  acceptPixLastTermsOfService,
  checkIfEmailIsAvailable,
  findAnotherUserByEmail,
  findAnotherUserByUsername,
  findByExternalIdentifier,
  findById,
  findPaginatedFiltered,
  get,
  getByEmail,
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
  updateEmailConfirmed,
  updateHasSeenAssessmentInstructionsToTrue,
  updateHasSeenChallengeTooltip,
  updateHasSeenNewDashboardInfoToTrue,
  updateLastDataProtectionPolicySeenAt,
  updatePixCertifTermsOfServiceAcceptedToTrue,
  updateUserDetailsForAdministration,
  updateUsername,
  updateWithEmailConfirmed,
};

function _fromKnexDTOToUserDetailsForAdmin({
  userDTO,
  pixOrgaLegalDocumentStatus,
  organizationLearnersDTO,
  authenticationMethodsDTO,
  pixAdminRolesDTO,
  lastUserApplicationConnectionsDTO,
}) {
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
        organizationIsManagingStudents:
          organizationLearnerDTO.organizationIsManagingStudents || organizationLearnerDTO.hasImportFeature,
        additionalInformations: organizationLearnerDTO.attributes,
        additionalColumns: organizationLearnerDTO.additionalColumns,
      }),
  );
  const userLogin = new UserLogin({
    id: userDTO.userLoginId,
    userId: userDTO.userId,
    failureCount: userDTO.failureCount,
    temporaryBlockedUntil: userDTO.temporaryBlockedUntil,
    blockedAt: userDTO.blockedAt,
  });

  const lastApplicationConnections = lastUserApplicationConnectionsDTO.map(
    (lastUserApplicationConnectionDTO) => new LastUserApplicationConnection(lastUserApplicationConnectionDTO),
  );

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
    pixOrgaTermsOfServiceAccepted: pixOrgaLegalDocumentStatus.status === 'accepted',
    pixCertifTermsOfServiceAccepted: userDTO.pixCertifTermsOfServiceAccepted,
    lang: userDTO.lang,
    locale: userDTO.locale,
    lastTermsOfServiceValidatedAt: userDTO.lastTermsOfServiceValidatedAt,
    lastPixOrgaTermsOfServiceValidatedAt: pixOrgaLegalDocumentStatus.acceptedAt,
    lastPixCertifTermsOfServiceValidatedAt: userDTO.lastPixCertifTermsOfServiceValidatedAt,
    lastLoggedAt: userDTO.lastLoggedAt,
    emailConfirmedAt: userDTO.emailConfirmedAt,
    organizationLearners,
    authenticationMethods,
    userLogin,
    hasBeenAnonymised: userDTO.hasBeenAnonymised,
    hasBeenAnonymisedBy: userDTO.hasBeenAnonymisedBy,
    updatedAt: userDTO.updatedAt,
    createdAt: userDTO.createdAt,
    anonymisedByFirstName: userDTO.anonymisedByFirstName,
    anonymisedByLastName: userDTO.anonymisedByLastName,
    isPixAgent: pixAdminRolesDTO.length > 0,
    lastApplicationConnections,
  });
}

/**
 * @param userDTO
 * @param membershipsDTO
 * @param certificationCenterMembershipsDTO
 * @param authenticationMethodsDTO
 * @return {User}
 * @private
 */
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
    pixCertifTermsOfServiceAccepted: userDTO.pixCertifTermsOfServiceAccepted,
    email: userDTO.email,
    emailConfirmedAt: userDTO.emailConfirmedAt,
    username: userDTO.username,
    firstName: userDTO.firstName,
    knowledgeElements: userDTO.knowledgeElements,
    lastName: userDTO.lastName,
    lastTermsOfServiceValidatedAt: userDTO.lastTermsOfServiceValidatedAt,
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

function _setSearchFiltersForQueryBuilder(filter, qb, queryType) {
  const id = filter.id;
  const fields = ['email', 'firstName', 'lastName', 'email', 'username'];
  if (id) {
    qb.where({ id });
  }

  fields.forEach((field) => {
    if (filter[field]) {
      _applyQueryType(field, filter[field], qb, queryType);
    }
  });
}

function _applyQueryType(field, value, qb, queryType) {
  if (queryType === QUERY_TYPES.EXACT_QUERY) {
    qb.where(field, value);
  } else {
    qb.whereILike(field, `%${value}%`);
  }
}

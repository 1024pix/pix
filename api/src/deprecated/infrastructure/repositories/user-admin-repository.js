import { NON_OIDC_IDENTITY_PROVIDERS } from '../../../identity-access-management/domain/constants/identity-providers.js';
import { LastUserApplicationConnection } from '../../../identity-access-management/domain/models/LastUserApplicationConnection.js';
import { UserLogin } from '../../../identity-access-management/domain/models/UserLogin.js';
import * as organizationFeaturesApi from '../../../organizational-entities/application/api/organization-features-api.js';
import { OrganizationLearnerForAdmin } from '../../../prescription/learner-management/domain/read-models/OrganizationLearnerForAdmin.js';
import * as organizationLearnerImportFormatRepository from '../../../prescription/learner-management/infrastructure/repositories/organization-learner-import-format-repository.js';
import { DomainTransaction } from '../../../shared/domain/DomainTransaction.js';
import { UserNotFoundError } from '../../../shared/domain/errors.js';
import { UserDetailsForAdmin } from '../../domain/models/UserDetailsForAdmin.js';

const getUserDetailsForAdmin = async function (userId) {
  const knexConn = DomainTransaction.getConnection();
  const userDTO = await knexConn('users')
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

  const lastUserApplicationConnectionsDTO = await knexConn('last-user-application-connections').where({ userId });

  const authenticationMethodsDTO = await knexConn('authentication-methods')
    .select([
      'authentication-methods.id',
      'authentication-methods.identityProvider',
      'authentication-methods.authenticationComplement',
      'authentication-methods.lastLoggedAt',
    ])
    .join('users', 'users.id', 'authentication-methods.userId')
    .where({ userId });

  const organizationLearnersDTO = await knexConn('view-active-organization-learners')
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

  const pixAdminRolesDTO = await knexConn('pix-admin-roles').where({ userId });

  return _fromKnexDTOToUserDetailsForAdmin({
    userDTO,
    organizationLearnersDTO,
    authenticationMethodsDTO,
    pixAdminRolesDTO,
    lastUserApplicationConnectionsDTO,
  });
};

export { getUserDetailsForAdmin };

function _fromKnexDTOToUserDetailsForAdmin({
  userDTO,
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
      // eslint-disable-next-line no-unused-vars -- extract password so that it's not returned/displayed
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
    pixCertifTermsOfServiceAccepted: userDTO.pixCertifTermsOfServiceAccepted,
    lang: userDTO.lang,
    locale: userDTO.locale,
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

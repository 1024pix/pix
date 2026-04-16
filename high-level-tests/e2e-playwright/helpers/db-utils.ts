import { Knex } from 'knex';

// @ts-expect-error getUserHashedPassword from API project
import { getUserHashedPassword } from '../../../api/db/database-builder/factory/build-authentication-method.js';
// @ts-expect-error NON_OIDC_IDENTITY_PROVIDERS from API project
import { NON_OIDC_IDENTITY_PROVIDERS } from '../../../api/src/identity-access-management/domain/constants/identity-providers.js';
// @ts-expect-error AuthenticationMethod from API project
import { AuthenticationMethod } from '../../../api/src/identity-access-management/domain/models/AuthenticationMethod.js';

export async function createUserInDB(
  {
    firstName,
    lastName,
    email,
    rawPassword,
    cgu,
    pixCertifTermsOfServiceAccepted,
    mustValidateTermsOfService,
    id,
  }: {
    firstName: string;
    lastName: string;
    email: string;
    rawPassword: string;
    cgu: boolean;
    pixCertifTermsOfServiceAccepted: boolean;
    mustValidateTermsOfService: boolean;
    id?: number;
  },
  knex: Knex,
) {
  const someDate = new Date();
  const [{ id: userId }] = await knex('users')
    .insert({
      id,
      firstName,
      lastName,
      email,
      cgu,
      pixCertifTermsOfServiceAccepted,
      lang: 'fr',
      lastTermsOfServiceValidatedAt: cgu ? someDate : null,
      lastPixCertifTermsOfServiceValidatedAt: pixCertifTermsOfServiceAccepted ? someDate : null,
      mustValidateTermsOfService,
      hasSeenAssessmentInstructions: false,
      createdAt: someDate,
      updatedAt: someDate,
      emailConfirmedAt: someDate,
    })
    .returning('id');

  await knex('authentication-methods').insert({
    userId: userId,
    identityProvider: NON_OIDC_IDENTITY_PROVIDERS.PIX.code,
    authenticationComplement: new AuthenticationMethod.PixAuthenticationComplement({
      password: getUserHashedPassword(rawPassword),
      shouldChangePassword: false,
    }),
    externalIdentifier: undefined,
    createdAt: someDate,
    updatedAt: someDate,
  });

  return userId;
}

export async function createOrganizationLearnerInDb(
  {
    organizationId,
    userId,
    firstName,
    lastName,
  }: {
    organizationId: number;
    userId: number;
    firstName: string;
    lastName: string;
  },
  knex: Knex,
) {
  return knex('organization-learners').insert({
    organizationId,
    userId,
    firstName,
    lastName,
  });
}

export async function createCertificationCenterInDB(
  {
    type,
    externalId,
  }: {
    type: string;
    externalId: string;
  },
  knex: Knex,
) {
  const someDate = new Date('2025-07-09');
  const [{ id }] = await knex('certification-centers')
    .insert({
      name: externalId + type,
      type,
      externalId,
      createdAt: someDate,
      createdBy: null,
      updatedAt: someDate,
      isScoBlockedAccessWhitelist: false,
      archivedAt: null,
      archivedBy: null,
    })
    .returning('id');
  return id;
}

export async function createCertificationCenterMembershipInDB(
  {
    userId,
    certificationCenterId,
  }: {
    userId: number;
    certificationCenterId: number;
  },
  knex: Knex,
) {
  const someDate = new Date('2025-07-09');
  await knex('certification-center-memberships').insert({
    userId,
    updatedByUserId: null,
    certificationCenterId,
    createdAt: someDate,
    updatedAt: someDate,
    disabledAt: null,
    isReferer: false,
    role: 'MEMBER',
    lastAccessedAt: someDate,
  });
}

export async function createCertificationCenterHabilitationInDB(
  {
    certificationCenterId,
    key,
  }: {
    certificationCenterId: number;
    key: string;
  },
  knex: Knex,
) {
  const { id: habilitationId } = await knex('complementary-certifications').select('id').where({ key }).first();
  await knex('complementary-certification-habilitations').insert({
    certificationCenterId,
    complementaryCertificationId: habilitationId,
  });
}

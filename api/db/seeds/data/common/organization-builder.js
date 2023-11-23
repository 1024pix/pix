import {
  ALL_ORGANIZATION_USER_ID,
  FEATURE_MULTIPLE_SENDING_ASSESSMENT_ID,
  FEATURE_COMPUTE_ORGANIZATION_LEARNER_CERTIFICABILITY_ID,
  DEFAULT_PASSWORD,
  PRO_ORGANIZATION_ID,
  PRO_ORGANIZATION_USER_ID,
  SCO_ORGANIZATION_ID,
  SCO_ORGANIZATION_USER_ID,
  SUP_ORGANIZATION_ID,
  SUP_ORGANIZATION_USER_ID,
  SUP_MANAGING_ORGANIZATION_ID,
  SCO_MANAGING_ORGANIZATION_ID,
  FEATURE_PLACES_MANAGEMENT_ID,
} from './constants.js';

import { organization } from './tooling/index.js';

async function _createScoOrganization(databaseBuilder) {
  await organization.createOrganization({
    databaseBuilder,
    organizationId: SCO_MANAGING_ORGANIZATION_ID,
    type: 'SCO',
    name: 'SCO Orga - Managing Students',
    isManagingStudents: true,
    externalId: 'SCO_MANAGING',
    adminIds: [SCO_ORGANIZATION_USER_ID],
    memberIds: [ALL_ORGANIZATION_USER_ID],
    featureIds: [FEATURE_COMPUTE_ORGANIZATION_LEARNER_CERTIFICABILITY_ID],
  });

  await organization.createOrganization({
    databaseBuilder,
    organizationId: SCO_ORGANIZATION_ID,
    type: 'SCO',
    name: 'SCO Orga - Not Managing Students',
    isManagingStudents: false,
    externalId: 'SCO_NOT_MANAGING',
    adminIds: [SCO_ORGANIZATION_USER_ID],
    memberIds: [ALL_ORGANIZATION_USER_ID],
    featureIds: [FEATURE_MULTIPLE_SENDING_ASSESSMENT_ID],
  });
}

async function _createSupOrganization(databaseBuilder) {
  await organization.createOrganization({
    databaseBuilder,
    organizationId: SUP_MANAGING_ORGANIZATION_ID,
    type: 'SUP',
    name: 'SUP Orga - Managing Students',
    isManagingStudents: true,
    externalId: 'SUP_MANAGING',
    adminIds: [SUP_ORGANIZATION_USER_ID],
    memberIds: [ALL_ORGANIZATION_USER_ID],
  });

  await organization.createOrganization({
    databaseBuilder,
    organizationId: SUP_ORGANIZATION_ID,
    type: 'SUP',
    name: 'SUP Orga - Not Managing Students',
    isManagingStudents: false,
    externalId: 'SUP_NOT_MANAGING',
    adminIds: [SUP_ORGANIZATION_USER_ID],
    memberIds: [ALL_ORGANIZATION_USER_ID],
    featureIds: [FEATURE_MULTIPLE_SENDING_ASSESSMENT_ID],
  });
}

async function _createProOrganization(databaseBuilder) {
  await organization.createOrganization({
    databaseBuilder,
    organizationId: PRO_ORGANIZATION_ID,
    type: 'PRO',
    name: 'PRO Orga',
    isManagingStudents: false,
    externalId: 'PRO_NOT_MANAGING',
    adminIds: [PRO_ORGANIZATION_USER_ID],
    memberIds: [ALL_ORGANIZATION_USER_ID],
    featureIds: [FEATURE_MULTIPLE_SENDING_ASSESSMENT_ID, FEATURE_PLACES_MANAGEMENT_ID],
  });
}

function _createUserAdminForScoOrganization(databaseBuilder) {
  databaseBuilder.factory.buildUser.withRawPassword({
    id: SCO_ORGANIZATION_USER_ID,
    firstName: 'Scholar',
    lastName: 'pleure',
    email: 'sco-orga@example.net',
    cgu: true,
    lang: 'fr',
    rawPassword: DEFAULT_PASSWORD,
    shouldChangePassword: false,
    pixOrgaTermsOfServiceAccepted: true,
  });
}

function _createUserAdminForSupOrganization(databaseBuilder) {
  databaseBuilder.factory.buildUser.withRawPassword({
    id: SUP_ORGANIZATION_USER_ID,
    firstName: 'Supra',
    lastName: 'conducteur',
    email: 'sup-orga@example.net',
    cgu: true,
    lang: 'fr',
    rawPassword: DEFAULT_PASSWORD,
    shouldChangePassword: false,
    pixOrgaTermsOfServiceAccepted: true,
  });
}

function _createUserAdminForProOrganization(databaseBuilder) {
  databaseBuilder.factory.buildUser.withRawPassword({
    id: PRO_ORGANIZATION_USER_ID,
    firstName: 'Pro',
    lastName: 'tips',
    email: 'pro-orga@example.net',
    cgu: true,
    lang: 'fr',
    rawPassword: DEFAULT_PASSWORD,
    shouldChangePassword: false,
    pixOrgaTermsOfServiceAccepted: true,
  });
}

function _createUserMemberWithAllTypesOfOrga(databaseBuilder) {
  databaseBuilder.factory.buildUser.withRawPassword({
    id: ALL_ORGANIZATION_USER_ID,
    firstName: 'Juste',
    lastName: 'un member',
    email: 'all-orga@example.net',
    cgu: true,
    lang: 'en',
    rawPassword: DEFAULT_PASSWORD,
    shouldChangePassword: false,
    pixOrgaTermsOfServiceAccepted: true,
  });
}

export async function organizationBuilder({ databaseBuilder }) {
  _createUserAdminForScoOrganization(databaseBuilder);
  _createUserAdminForSupOrganization(databaseBuilder);
  _createUserAdminForProOrganization(databaseBuilder);
  _createUserMemberWithAllTypesOfOrga(databaseBuilder);

  await _createScoOrganization(databaseBuilder);
  await _createSupOrganization(databaseBuilder);
  await _createProOrganization(databaseBuilder);
}

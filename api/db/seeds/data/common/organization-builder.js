import {
  AGRICULTURE_TAG,
  DEFAULT_PASSWORD,
  FEATURE_COMPUTE_ORGANIZATION_LEARNER_CERTIFICABILITY_ID,
  FEATURE_LEARNER_IMPORT_ID,
  FEATURE_MULTIPLE_SENDING_ASSESSMENT_ID,
  FEATURE_PLACES_MANAGEMENT_ID,
  IMPORT_FORMAT_GENERIC_ID,
  PRO_MANAGING_ORGANIZATION_ID,
  PRO_ORGANIZATION_ID,
  SCO_FREGATA_MANAGING_ORGANIZATION_ID,
  SCO_MANAGING_ORGANIZATION_ID,
  SCO_ORGANIZATION_ID,
  SUP_MANAGING_ORGANIZATION_ID,
  SUP_ORGANIZATION_ID,
  USER_ID_ADMIN_ORGANIZATION,
  USER_ID_MEMBER_ORGANIZATION,
} from './constants.js';
import { organization } from './tooling/index.js';

async function _createScoOrganization(databaseBuilder) {
  await organization.createOrganization({
    databaseBuilder,
    organizationId: SCO_MANAGING_ORGANIZATION_ID,
    type: 'SCO',
    name: 'SCO SIECLE',
    isManagingStudents: true,
    externalId: 'SCO_SIECLE_MANAGING',
    adminIds: [USER_ID_ADMIN_ORGANIZATION],
    memberIds: [USER_ID_MEMBER_ORGANIZATION],
    features: [
      { id: FEATURE_COMPUTE_ORGANIZATION_LEARNER_CERTIFICABILITY_ID },
      { id: FEATURE_MULTIPLE_SENDING_ASSESSMENT_ID },
    ],
  });

  await organization.createOrganization({
    databaseBuilder,
    organizationId: SCO_ORGANIZATION_ID,
    type: 'SCO',
    name: 'SCO Classic',
    isManagingStudents: false,
    externalId: 'SCO_NOT_MANAGING',
    adminIds: [USER_ID_ADMIN_ORGANIZATION],
    memberIds: [USER_ID_MEMBER_ORGANIZATION],
    features: [{ id: FEATURE_MULTIPLE_SENDING_ASSESSMENT_ID }],
  });

  await organization.createOrganization({
    databaseBuilder,
    organizationId: SCO_FREGATA_MANAGING_ORGANIZATION_ID,
    type: 'SCO',
    name: 'SCO FREGATA',
    isManagingStudents: true,
    externalId: 'SCO_FREGATA_MANAGING',
    adminIds: [USER_ID_ADMIN_ORGANIZATION],
    memberIds: [USER_ID_MEMBER_ORGANIZATION],
    features: [{ id: FEATURE_MULTIPLE_SENDING_ASSESSMENT_ID }],
    tagIds: [AGRICULTURE_TAG.id],
  });
}

async function _createSupOrganization(databaseBuilder) {
  await organization.createOrganization({
    databaseBuilder,
    organizationId: SUP_MANAGING_ORGANIZATION_ID,
    type: 'SUP',
    name: 'SUP Import',
    isManagingStudents: true,
    externalId: 'SUP_MANAGING',
    adminIds: [USER_ID_ADMIN_ORGANIZATION],
    memberIds: [USER_ID_MEMBER_ORGANIZATION],
    features: [{ id: FEATURE_MULTIPLE_SENDING_ASSESSMENT_ID }],
  });

  await organization.createOrganization({
    databaseBuilder,
    organizationId: SUP_ORGANIZATION_ID,
    type: 'SUP',
    name: 'SUP Classic',
    isManagingStudents: false,
    externalId: 'SUP_NOT_MANAGING',
    adminIds: [USER_ID_ADMIN_ORGANIZATION],
    memberIds: [USER_ID_MEMBER_ORGANIZATION],
    features: [{ id: FEATURE_MULTIPLE_SENDING_ASSESSMENT_ID }],
  });
}

async function _createProOrganization(databaseBuilder) {
  await organization.createOrganization({
    databaseBuilder,
    organizationId: PRO_ORGANIZATION_ID,
    type: 'PRO',
    name: 'PRO Classic',
    isManagingStudents: false,
    externalId: 'PRO_NOT_MANAGING',
    adminIds: [USER_ID_ADMIN_ORGANIZATION],
    memberIds: [USER_ID_MEMBER_ORGANIZATION],
    features: [{ id: FEATURE_MULTIPLE_SENDING_ASSESSMENT_ID }, { id: FEATURE_PLACES_MANAGEMENT_ID }],
  });

  await organization.createOrganization({
    databaseBuilder,
    organizationId: PRO_MANAGING_ORGANIZATION_ID,
    type: 'PRO',
    name: 'PRO Import (Generic)',
    isManagingStudents: false,
    externalId: 'PRO_MANAGING',
    adminIds: [USER_ID_ADMIN_ORGANIZATION],
    memberIds: [USER_ID_MEMBER_ORGANIZATION],
    features: [
      { id: FEATURE_MULTIPLE_SENDING_ASSESSMENT_ID },
      { id: FEATURE_LEARNER_IMPORT_ID, params: { organizationLearnerImportFormatId: IMPORT_FORMAT_GENERIC_ID } },
    ],
  });
}

function _createUserAdminForOrganizations(databaseBuilder) {
  databaseBuilder.factory.buildUser.withRawPassword({
    id: USER_ID_ADMIN_ORGANIZATION,
    firstName: 'Ad',
    lastName: 'min hominen',
    email: 'admin-orga@example.net',
    cgu: true,
    lang: 'fr',
    rawPassword: DEFAULT_PASSWORD,
    shouldChangePassword: false,
    pixOrgaTermsOfServiceAccepted: true,
  });
}

function _createUserMemberForOrganizations(databaseBuilder) {
  databaseBuilder.factory.buildUser.withRawPassword({
    id: USER_ID_MEMBER_ORGANIZATION,
    firstName: 'Justin',
    lastName: 'member',
    email: 'member-orga@example.net',
    cgu: true,
    lang: 'en',
    rawPassword: DEFAULT_PASSWORD,
    shouldChangePassword: false,
    pixOrgaTermsOfServiceAccepted: true,
  });
}

export async function organizationBuilder({ databaseBuilder }) {
  _createUserAdminForOrganizations(databaseBuilder);
  _createUserMemberForOrganizations(databaseBuilder);

  await _createScoOrganization(databaseBuilder);
  await _createSupOrganization(databaseBuilder);
  await _createProOrganization(databaseBuilder);
}

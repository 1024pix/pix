import { FEATURE_MULTIPLE_SENDING_ASSESSMENT_ID } from '../common/constants.js';
import {
  ALL_ORGANIZATION_USER_ID,
  DEFAULT_PASSWORD,
  PRO_ORGANIZATION_ID,
  PRO_ORGANIZATION_USER_ID,
  SCO_ORGANIZATION_ID,
  SCO_ORGANIZATION_USER_ID,
  SUP_ORGANIZATION_ID,
  SUP_ORGANIZATION_USER_ID,
} from './constants.js';

function _createScoOrganization(databaseBuilder) {
  databaseBuilder.factory.buildOrganization({
    id: SCO_ORGANIZATION_ID,
    type: 'SCO',
    name: 'SCO Orga - team prescription',
    isManagingStudents: true,
    externalId: 'PRESCRIPTION',
  });

  databaseBuilder.factory.buildOrganizationFeature({
    organizationId: SCO_ORGANIZATION_ID,
    featureId: FEATURE_MULTIPLE_SENDING_ASSESSMENT_ID,
  });

  _createUserAdminForScoOrganization(databaseBuilder);
}
function _createSupOrganization(databaseBuilder) {
  databaseBuilder.factory.buildOrganization({
    id: SUP_ORGANIZATION_ID,
    type: 'SUP',
    name: 'SUP Orga - team prescription',
    isManagingStudents: true,
    externalId: 'PRESCRIPTION',
  });

  databaseBuilder.factory.buildOrganizationFeature({
    organizationId: SUP_ORGANIZATION_ID,
    featureId: FEATURE_MULTIPLE_SENDING_ASSESSMENT_ID,
  });

  _createUserAdminForSupOrganization(databaseBuilder);
}
function _createProOrganization(databaseBuilder) {
  databaseBuilder.factory.buildOrganization({
    id: PRO_ORGANIZATION_ID,
    type: 'PRO',
    name: 'PRO Orga - team prescription',
    isManagingStudents: false,
    externalId: 'PRESCRIPTION',
  });

  databaseBuilder.factory.buildOrganizationFeature({
    organizationId: PRO_ORGANIZATION_ID,
    featureId: FEATURE_MULTIPLE_SENDING_ASSESSMENT_ID,
  });

  _createUserAdminForProOrganization(databaseBuilder);
}

function _createUserAdminForScoOrganization(databaseBuilder) {
  databaseBuilder.factory.buildUser.withRawPassword({
    id: SCO_ORGANIZATION_USER_ID,
    firstName: 'Orga Sco',
    lastName: 'Team Prescription',
    email: 'prescription-sco@example.net',
    cgu: true,
    lang: 'fr',
    rawPassword: DEFAULT_PASSWORD,
    shouldChangePassword: false,
    pixOrgaTermsOfServiceAccepted: true,
  });
  databaseBuilder.factory.buildMembership({
    userId: SCO_ORGANIZATION_USER_ID,
    organizationId: SCO_ORGANIZATION_ID,
    organizationRole: 'ADMIN',
  });
}

function _createUserAdminForSupOrganization(databaseBuilder) {
  databaseBuilder.factory.buildUser.withRawPassword({
    id: SUP_ORGANIZATION_USER_ID,
    firstName: 'Orga Sup',
    lastName: 'Team Prescription',
    email: 'prescription-sup@example.net',
    cgu: true,
    lang: 'fr',
    rawPassword: DEFAULT_PASSWORD,
    shouldChangePassword: false,
    pixOrgaTermsOfServiceAccepted: true,
  });
  databaseBuilder.factory.buildMembership({
    userId: SUP_ORGANIZATION_USER_ID,
    organizationId: SUP_ORGANIZATION_ID,
    organizationRole: 'ADMIN',
  });
}

function _createUserAdminForProOrganization(databaseBuilder) {
  databaseBuilder.factory.buildUser.withRawPassword({
    id: PRO_ORGANIZATION_USER_ID,
    firstName: 'Orga Pro',
    lastName: 'Team Prescription',
    email: 'prescription-pro@example.net',
    cgu: true,
    lang: 'fr',
    rawPassword: DEFAULT_PASSWORD,
    shouldChangePassword: false,
    pixOrgaTermsOfServiceAccepted: true,
  });
  databaseBuilder.factory.buildMembership({
    userId: PRO_ORGANIZATION_USER_ID,
    organizationId: PRO_ORGANIZATION_ID,
    organizationRole: 'ADMIN',
  });
}

function _createUserMemberWithAllTypesOfOrga(databaseBuilder) {
  databaseBuilder.factory.buildUser.withRawPassword({
    id: ALL_ORGANIZATION_USER_ID,
    firstName: 'All Orga',
    lastName: 'Team Prescription',
    email: 'prescription-all@example.net',
    cgu: true,
    lang: 'fr',
    rawPassword: DEFAULT_PASSWORD,
    shouldChangePassword: false,
    pixOrgaTermsOfServiceAccepted: true,
  });

  databaseBuilder.factory.buildMembership({
    userId: ALL_ORGANIZATION_USER_ID,
    organizationId: SCO_ORGANIZATION_ID,
    organizationRole: 'MEMBER',
  });
  databaseBuilder.factory.buildMembership({
    userId: ALL_ORGANIZATION_USER_ID,
    organizationId: SUP_ORGANIZATION_ID,
    organizationRole: 'MEMBER',
  });
  databaseBuilder.factory.buildMembership({
    userId: ALL_ORGANIZATION_USER_ID,
    organizationId: PRO_ORGANIZATION_ID,
    organizationRole: 'MEMBER',
  });
}

export function buildOrganizations(databaseBuilder) {
  _createScoOrganization(databaseBuilder);
  _createSupOrganization(databaseBuilder);
  _createProOrganization(databaseBuilder);
  _createUserMemberWithAllTypesOfOrga(databaseBuilder);

  return databaseBuilder.commit();
}

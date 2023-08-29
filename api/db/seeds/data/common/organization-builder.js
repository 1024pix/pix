import {
  ALL_ORGANIZATION_USER_ID,
  FEATURE_MULTIPLE_SENDING_ASSESSMENT_ID,
  DEFAULT_PASSWORD,
  PRO_ORGANIZATION_ID,
  PRO_ORGANIZATION_USER_ID,
  SCO_ORGANIZATION_ID,
  SCO_ORGANIZATION_USER_ID,
  SUP_ORGANIZATION_ID,
  SUP_ORGANIZATION_USER_ID,
  SUP_MANAGING_ORGANIZATION_ID,
  SCO_MANAGING_ORGANIZATION_ID,
} from './constants.js';

function _createScoOrganization(databaseBuilder) {
  databaseBuilder.factory.buildOrganization({
    id: SCO_MANAGING_ORGANIZATION_ID,
    type: 'SCO',
    name: 'SCO Orga - Managing Students',
    isManagingStudents: true,
    externalId: 'SCO_MANAGING',
  });

  databaseBuilder.factory.buildOrganization({
    id: SCO_ORGANIZATION_ID,
    type: 'SCO',
    name: 'SCO Orga - Not Managing Students',
    isManagingStudents: false,
    externalId: 'SCO_NOT_MANAGING',
  });

  databaseBuilder.factory.buildOrganizationFeature({
    organizationId: SCO_ORGANIZATION_ID,
    featureId: FEATURE_MULTIPLE_SENDING_ASSESSMENT_ID,
  });

  _createUserAdminForScoOrganization(databaseBuilder);
}

function _createSupOrganization(databaseBuilder) {
  databaseBuilder.factory.buildOrganization({
    id: SUP_MANAGING_ORGANIZATION_ID,
    type: 'SUP',
    name: 'SUP Orga - Managing Students',
    isManagingStudents: true,
    externalId: 'SUP_MANAGING',
  });

  databaseBuilder.factory.buildOrganization({
    id: SUP_ORGANIZATION_ID,
    type: 'SUP',
    name: 'SUP Orga - Not Managing Students',
    isManagingStudents: false,
    externalId: 'SUP_NOT_MANAGING',
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
    name: 'PRO Orga',
    isManagingStudents: false,
    externalId: 'PRO_NOT_MANAGING',
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
    firstName: 'Scholar',
    lastName: 'pleure',
    email: 'sco-orga@example.net',
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

  databaseBuilder.factory.buildMembership({
    userId: SCO_ORGANIZATION_USER_ID,
    organizationId: SCO_MANAGING_ORGANIZATION_ID,
    organizationRole: 'ADMIN',
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
  databaseBuilder.factory.buildMembership({
    userId: SUP_ORGANIZATION_USER_ID,
    organizationId: SUP_ORGANIZATION_ID,
    organizationRole: 'ADMIN',
  });

  databaseBuilder.factory.buildMembership({
    userId: SUP_ORGANIZATION_USER_ID,
    organizationId: SUP_MANAGING_ORGANIZATION_ID,
    organizationRole: 'ADMIN',
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
  databaseBuilder.factory.buildMembership({
    userId: PRO_ORGANIZATION_USER_ID,
    organizationId: PRO_ORGANIZATION_ID,
    organizationRole: 'ADMIN',
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

  databaseBuilder.factory.buildMembership({
    userId: ALL_ORGANIZATION_USER_ID,
    organizationId: SCO_MANAGING_ORGANIZATION_ID,
    organizationRole: 'MEMBER',
  });
  databaseBuilder.factory.buildMembership({
    userId: ALL_ORGANIZATION_USER_ID,
    organizationId: SCO_ORGANIZATION_ID,
    organizationRole: 'MEMBER',
  });

  databaseBuilder.factory.buildMembership({
    userId: ALL_ORGANIZATION_USER_ID,
    organizationId: SUP_MANAGING_ORGANIZATION_ID,
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

export async function organizationBuilder({ databaseBuilder }) {
  _createScoOrganization(databaseBuilder);
  _createSupOrganization(databaseBuilder);
  _createProOrganization(databaseBuilder);
  _createUserMemberWithAllTypesOfOrga(databaseBuilder);

  await databaseBuilder.commit();
}

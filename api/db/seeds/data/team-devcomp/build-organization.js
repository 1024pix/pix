import { DEFAULT_PASSWORD, SCO_ORGANIZATION_ID, SCO_ORGANIZATION_USER_ID } from './constants.js';
import { FEATURE_MULTIPLE_SENDING_ASSESSMENT_ID } from '../common/constants.js';
async function _createScoOrganization(databaseBuilder) {
  databaseBuilder.factory.buildOrganization({
    id: SCO_ORGANIZATION_ID,
    type: 'SCO',
    name: 'Sco Orga team devcomp',
    isManagingStudents: false,
    externalId: 'DEVCOMP',
  });
  databaseBuilder.factory.buildUser.withRawPassword({
    id: SCO_ORGANIZATION_USER_ID,
    firstName: 'Orga Sco',
    lastName: 'Team Devcomp',
    email: 'devcomp-sco@example.net',
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

  databaseBuilder.factory.buildOrganizationFeature({
    organizationId: SCO_ORGANIZATION_ID,
    featureId: FEATURE_MULTIPLE_SENDING_ASSESSMENT_ID,
  });
}

export async function buildOrganizations(databaseBuilder) {
  await _createScoOrganization(databaseBuilder);
}

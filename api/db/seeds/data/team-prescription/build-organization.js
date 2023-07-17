import { DEFAULT_PASSWORD, SCO_ORGANIZATION_ID, SCO_ORGANIZATION_USER_ID } from './constants.js';

function _createScoOrganization(databaseBuilder) {
  databaseBuilder.factory.buildOrganization({
    id: SCO_ORGANIZATION_ID,
    type: 'SCO',
    name: 'Sco Orga team prescription',
    isManagingStudents: false,
    externalId: 'PRESCRIPTION',
  });
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

export function buildOrganizations(databaseBuilder) {
  _createScoOrganization(databaseBuilder);
}

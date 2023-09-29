import * as tooling from '../common/tooling/index.js';
import { ALL_ORGANIZATION_USER_ID } from '../common/constants.js';

const TEAM_1D_OFFSET_ID = 9000;

const TEAM_1D_ORGANIZATION_1_ID = TEAM_1D_OFFSET_ID;
const TEAM_1D_ORGANIZATION_2_ID = TEAM_1D_OFFSET_ID + 1;

const TEAM_1D_USER_ID = TEAM_1D_OFFSET_ID;

async function team1dDataBuilder(databaseBuilder) {
  await _createSco1dUser(databaseBuilder);
  await _createSco1dOrganizations(databaseBuilder);
}

async function _createSco1dUser(databaseBuilder) {
  await databaseBuilder.factory.buildUser.withRawPassword({
    id: TEAM_1D_USER_ID,
    firstName: 'Jules',
    lastName: 'Ferry',
    email: '1d-orga@example.net',
    cgu: true,
    lang: 'fr',
    lastTermsOfServiceValidatedAt: new Date(),
    lastPixOrgaTermsOfServiceValidatedAt: new Date(),
    mustValidateTermsOfService: false,
    pixOrgaTermsOfServiceAccepted: false,
    pixCertifTermsOfServiceAccepted: false,
    hasSeenAssessmentInstructions: false,
    rawPassword: 'pix123',
    shouldChangePassword: false,
  });
  await databaseBuilder.commit();
}

async function _createSco1dOrganizations(databaseBuilder) {
  await tooling.organization.createOrganization({
    databaseBuilder,
    organizationId: TEAM_1D_ORGANIZATION_1_ID,
    type: 'SCO-1D',
    name: 'Ecole des Pyrénées - Pix1D',
    isManagingStudents: true,
    externalId: 'PIX1D_1',
    configOrganization: {
      learnerCount: 8,
    },
    tagIds: [],
    adminIds: [TEAM_1D_USER_ID],
    memberIds: [ALL_ORGANIZATION_USER_ID],
  });

  await databaseBuilder.factory.buildSchool({ organizationId: TEAM_1D_ORGANIZATION_1_ID, code: 'MINIPIXOU' });

  await tooling.organization.createOrganization({
    databaseBuilder,
    organizationId: TEAM_1D_ORGANIZATION_2_ID,
    type: 'SCO-1D',
    name: 'Ecole des Alpes - Pix1D',
    isManagingStudents: true,
    externalId: 'PIX1D_2',
    configOrganization: {
      learnerCount: 8,
    },
    tagIds: [],
    adminIds: [TEAM_1D_USER_ID],
  });
  await databaseBuilder.factory.buildSchool({ organizationId: TEAM_1D_ORGANIZATION_2_ID, code: 'MAXIPIXOU' });
}

export { team1dDataBuilder };

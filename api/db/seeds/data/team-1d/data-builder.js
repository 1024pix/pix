import {
  FEATURE_LEARNER_IMPORT_ID,
  FEATURE_MISSIONS_MANAGEMENT_ID,
  ONDE_IMPORT_FORMAT_ID,
  USER_ID_MEMBER_ORGANIZATION,
} from '../common/constants.js';
import * as tooling from '../common/tooling/index.js';

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
    pixOrgaTermsOfServiceAccepted: true,
    pixCertifTermsOfServiceAccepted: true,
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
    tagIds: [],
    adminIds: [TEAM_1D_USER_ID],
    memberIds: [USER_ID_MEMBER_ORGANIZATION],
    featureIds: [FEATURE_MISSIONS_MANAGEMENT_ID],
  });
  await databaseBuilder.factory.buildOrganizationFeature({
    organizationId: TEAM_1D_ORGANIZATION_1_ID,
    featureId: FEATURE_LEARNER_IMPORT_ID,
    params: { organizationLearnerImportFormatId: ONDE_IMPORT_FORMAT_ID },
  });

  await databaseBuilder.factory.buildSchool({ organizationId: TEAM_1D_ORGANIZATION_1_ID, code: 'MINIPIXOU' });

  await _buildSchoolStudent({
    databaseBuilder,
    division: 'CM2-A',
    organizationId: TEAM_1D_ORGANIZATION_1_ID,
    studentNb: 5,
  });

  await _buildSchoolStudent({
    databaseBuilder,
    division: 'CM2-B',
    organizationId: TEAM_1D_ORGANIZATION_1_ID,
    studentNb: 30,
  });

  await _buildSchoolStudent({
    databaseBuilder,
    division: 'CM2-C',
    organizationId: TEAM_1D_ORGANIZATION_1_ID,
    studentNb: 1,
  });

  await _buildSchoolStudent({
    databaseBuilder,
    division: 'CM1-A',
    organizationId: TEAM_1D_ORGANIZATION_1_ID,
    studentNb: 1,
  });

  // create class with namesakes
  await databaseBuilder.factory.prescription.organizationLearners.buildOndeOrganizationLearner({
    firstName: 'Bob',
    lastName: 'Le lapin',
    division: 'CM1-B',
    organizationId: TEAM_1D_ORGANIZATION_1_ID,
  });
  await databaseBuilder.factory.prescription.organizationLearners.buildOndeOrganizationLearner({
    firstName: 'Bob',
    lastName: 'Le castor',
    division: 'CM1-B',
    organizationId: TEAM_1D_ORGANIZATION_1_ID,
  });

  await databaseBuilder.factory.prescription.organizationLearners.buildOndeOrganizationLearner({
    firstName: 'Aya',
    lastName: 'Pas',
    division: 'CM1-B',
    organizationId: TEAM_1D_ORGANIZATION_1_ID,
  });
  await databaseBuilder.factory.prescription.organizationLearners.buildOndeOrganizationLearner({
    firstName: 'Aya',
    lastName: 'Pasta',
    division: 'CM1-B',
    organizationId: TEAM_1D_ORGANIZATION_1_ID,
  });

  await tooling.organization.createOrganization({
    databaseBuilder,
    organizationId: TEAM_1D_ORGANIZATION_2_ID,
    type: 'SCO-1D',
    name: 'Ecole des Alpes - Pix1D',
    isManagingStudents: true,
    externalId: 'PIX1D_2',
    tagIds: [],
    adminIds: [TEAM_1D_USER_ID],
    featureIds: [FEATURE_MISSIONS_MANAGEMENT_ID],
  });

  await databaseBuilder.factory.buildSchool({ organizationId: TEAM_1D_ORGANIZATION_2_ID, code: 'MAXIPIXOU' });

  await databaseBuilder.factory.buildOrganizationFeature({
    organizationId: TEAM_1D_ORGANIZATION_2_ID,
    featureId: FEATURE_LEARNER_IMPORT_ID,
    params: { organizationLearnerImportFormatId: ONDE_IMPORT_FORMAT_ID },
  });

  await _buildSchoolStudent({
    databaseBuilder,
    division: 'CM1-CM2',
    organizationId: TEAM_1D_ORGANIZATION_2_ID,
    studentNb: 10,
  });

  await _buildSchoolStudent({
    databaseBuilder,
    division: 'CM2-5',
    organizationId: TEAM_1D_ORGANIZATION_2_ID,
    studentNb: 25,
  });
}

const firstNames = [
  'Ichigo',
  'Light',
  'Zoro',
  'Kamina',
  'Goku',
  'Nagisa',
  'Sakura',
  'Himawari',
  'Lelouch',
  'Shizuka',
  'Zenitsu',
  'Katsuki',
  'Usagi',
  'Shinya',
  'Hana-Belle',
  'Ayame',
  'Edward',
  'Yato',
  'Lucy',
  'Yuki',
  'Spike',
  'Hikari',
  'Haruka',
  'Faye',
  'Kirito',
  'Gon',
  'Mikasa',
  'Roy',
  'Naruto',
  'Esdras',
  'Rin',
  'Kushina',
  'Yusuke',
  'Ayako',
  'Kaori',
  'Touka',
  'Chiharu',
  'Levi',
  'Sasuke-Yuri',
  'Kirishima',
];

async function _buildSchoolStudent({ databaseBuilder, organizationId, division, studentNb }) {
  for (let index = 0; index < studentNb; index++) {
    const firstName = firstNames[index];
    const lastName = _generateLastName();
    const userId = await databaseBuilder.factory.buildUser({ firstName, lastName }).id;
    await databaseBuilder.factory.prescription.organizationLearners.buildOndeOrganizationLearner({
      firstName,
      lastName,
      division,
      organizationId,
      userId,
    });
  }
}

function _generateLastName() {
  const syllables = [
    'de',
    'bo',
    'bu',
    'ta',
    'se',
    'tri',
    'su',
    'ke',
    'ka',
    'flo',
    'ko',
    'pi',
    'pe',
    'no',
    'go',
    'fo',
    'si',
    'pa',
    'ar',
    'es',
    'i',
    'fle',
    'o',
    'ne',
    'na',
    'le',
    'lu',
    'ma',
    'an',
  ];
  const randomLength = function () {
    return 2 + Math.floor(Math.random() * 4);
  };
  const randomSyllable = function () {
    return syllables[Math.floor(Math.random() * syllables.length)];
  };

  const result = [];
  for (let i = 0; i < randomLength(); i++) {
    result.push(randomSyllable());
  }
  return result.join('');
}

export { TEAM_1D_USER_ID, team1dDataBuilder };

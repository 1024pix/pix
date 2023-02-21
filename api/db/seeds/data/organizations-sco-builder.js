import Membership from '../../../lib/domain/models/Membership';
import { DEFAULT_PASSWORD, PIX_ALL_ORGA_ID } from './users-builder';
import { SamlIdentityProviders } from '../../../lib/domain/constants/saml-identity-providers';
import { PIX_ADMIN } from '../../../lib/domain/constants';

const { ROLES: ROLES } = PIX_ADMIN;

import {
  SCO_COLLEGE_EXTERNAL_ID,
  SCO_LYCEE_EXTERNAL_ID,
  SCO_AGRI_EXTERNAL_ID,
  SCO_NO_MANAGING_STUDENTS_EXTERNAL_ID,
  SCO_COLLEGE_WITHOUT_STUDENT_EXTERNAL_ID,
  GREAT_OAK_CERTIF_CENTER_EXTERNAL_ID,
} from '../data/certification/certification-centers-builder';

const SCO_MIDDLE_SCHOOL_ID = 3;
const SCO_HIGH_SCHOOL_ID = 6;
const SCO_AGRI_ID = 7;
const SCO_AEFE_ID = 9;
const SCO_STUDENT_ID = 99;
const CANADA_INSEE_CODE = '401';
const SCO_FOREIGNER_USER_ID = 301;
const SCO_FOREIGNER_USER_ID_IN_ANOTHER_ORGANIZATION = 302;
const SCO_STUDENT_NOT_CERTIFIABLE_ID = 303;
const SCO_FRENCH_USER_ID = 311;
const SCO_DISABLED_USER_ID = 321;
const SCO_ADMIN_ID = 4;
const SCO_MEMBER_ID = 5;

function organizationsScoBuilder({ databaseBuilder }) {
  _buildMiddleSchools({ databaseBuilder });
  _buildHighSchools({ databaseBuilder });
  _buildFarmingSchools({ databaseBuilder });
  _buildAEFE({ databaseBuilder });
}

function _buildMiddleSchools({ databaseBuilder }) {
  databaseBuilder.factory.buildUser.withRawPassword({
    id: SCO_ADMIN_ID,
    firstName: 'Jon',
    lastName: 'Snow',
    email: 'sco.admin@example.net',
    rawPassword: DEFAULT_PASSWORD,
    cgu: true,
    pixOrgaTermsOfServiceAccepted: true,
    lastPixOrgaTermsOfServiceValidatedAt: new Date(),
  });
  databaseBuilder.factory.buildUser.withRawPassword({
    id: SCO_MEMBER_ID,
    firstName: 'Aemon',
    lastName: 'Targaryen',
    email: 'sco.member@example.net',
    rawPassword: DEFAULT_PASSWORD,
    cgu: true,
    pixOrgaTermsOfServiceAccepted: true,
    lastPixOrgaTermsOfServiceValidatedAt: new Date(),
  });

  const middleSchoolsCreator = databaseBuilder.factory.buildUser.withRawPassword({
    firstName: 'Iven',
    lastName: 'Patry',
    rawPassword: DEFAULT_PASSWORD,
    cgu: true,
  });
  databaseBuilder.factory.buildPixAdminRole({ userId: middleSchoolsCreator.id, role: ROLES.SUPER_ADMIN });

  databaseBuilder.factory.buildOrganization({
    id: SCO_MIDDLE_SCHOOL_ID,
    type: 'SCO',
    name: 'Collège The Night Watch',
    isManagingStudents: true,
    email: 'sco.generic.account@example.net',
    externalId: SCO_COLLEGE_EXTERNAL_ID,
    documentationUrl: 'https://pix.fr/',
    provinceCode: '12',
    identityProviderForCampaigns: SamlIdentityProviders.GAR.code,
    createdBy: middleSchoolsCreator.id,
  });
  databaseBuilder.factory.buildOrganization({
    id: 31,
    type: 'SCO',
    name: 'Collège de la vie',
    isManagingStudents: true,
    email: 'sco.generic.account@example.net',
    externalId: SCO_COLLEGE_WITHOUT_STUDENT_EXTERNAL_ID,
    documentationUrl: 'https://pix.fr/',
    provinceCode: '12',
    identityProviderForCampaigns: SamlIdentityProviders.GAR.code,
    createdBy: middleSchoolsCreator.id,
  });

  databaseBuilder.factory.buildMembership({
    userId: SCO_ADMIN_ID,
    organizationId: SCO_MIDDLE_SCHOOL_ID,
    organizationRole: Membership.roles.ADMIN,
  });
  databaseBuilder.factory.buildMembership({
    userId: PIX_ALL_ORGA_ID,
    organizationId: SCO_MIDDLE_SCHOOL_ID,
    organizationRole: Membership.roles.ADMIN,
  });
  databaseBuilder.factory.buildMembership({
    userId: SCO_ADMIN_ID,
    organizationId: 31,
    organizationRole: Membership.roles.ADMIN,
  });

  databaseBuilder.factory.buildMembership({
    userId: SCO_MEMBER_ID,
    organizationId: SCO_MIDDLE_SCHOOL_ID,
    organizationRole: Membership.roles.MEMBER,
  });

  databaseBuilder.factory.buildOrganizationTag({ organizationId: SCO_MIDDLE_SCHOOL_ID, tagId: 8 });

  const disabledUserId = databaseBuilder.factory.buildUser.withRawPassword({
    id: 6,
    firstName: 'Mance',
    lastName: 'Rayder',
    email: 'sco.disabled@example.net',
    rawPassword: DEFAULT_PASSWORD,
  }).id;

  databaseBuilder.factory.buildMembership({
    userId: disabledUserId,
    organizationId: SCO_MIDDLE_SCHOOL_ID,
    organizationRole: Membership.roles.MEMBER,
    disabledAt: new Date(),
  });

  // organization learner not associated yet
  databaseBuilder.factory.buildOrganizationLearner({
    firstName: 'First',
    lastName: 'Last',
    birthdate: '2010-10-10',
    division: '6E',
    group: null,
    organizationId: SCO_MIDDLE_SCHOOL_ID,
    userId: null,
    nationalStudentId: '123456789AA',
  });

  // organization learner not associated yet
  databaseBuilder.factory.buildOrganizationLearner({
    firstName: 'Prenom',
    lastName: 'Nom',
    birthdate: '2009-09-09',
    division: '3B',
    group: null,
    organizationId: SCO_MIDDLE_SCHOOL_ID,
    userId: null,
    nationalStudentId: '123456789BB',
  });

  // organization learner associated with username
  const userWithUsername = databaseBuilder.factory.buildUser.withRawPassword({
    id: SCO_FRENCH_USER_ID,
    firstName: 'George',
    lastName: 'De Cambridge',
    username: 'george.decambridge2207',
    rawPassword: DEFAULT_PASSWORD,
    cgu: false,
  });

  databaseBuilder.factory.buildOrganizationLearner({
    id: SCO_FRENCH_USER_ID,
    firstName: userWithUsername.firstName,
    lastName: userWithUsername.lastName,
    birthdate: '2013-07-22',
    division: '3A',
    group: null,
    organizationId: SCO_MIDDLE_SCHOOL_ID,
    userId: SCO_FRENCH_USER_ID,
    nationalStudentId: '123456789CC',
  });

  // organization learner associated with username and email
  const userWithEmailAndUsername = databaseBuilder.factory.buildUser.withRawPassword({
    id: SCO_FOREIGNER_USER_ID,
    firstName: 'Blue Ivy',
    lastName: 'Carter',
    email: 'blueivy.carter@example.net',
    username: 'blueivy.carter0701',
    rawPassword: DEFAULT_PASSWORD,
    cgu: false,
  });

  databaseBuilder.factory.buildOrganizationLearner({
    id: SCO_FOREIGNER_USER_ID,
    firstName: userWithEmailAndUsername.firstName,
    lastName: userWithEmailAndUsername.lastName,
    birthdate: '2012-01-07',
    birthCountryCode: CANADA_INSEE_CODE,
    division: '3A',
    group: null,
    sex: null,
    organizationId: SCO_MIDDLE_SCHOOL_ID,
    userId: SCO_FOREIGNER_USER_ID,
    nationalStudentId: '123456789DD',
  });

  // organization learner associated with email
  const userWithEmail = databaseBuilder.factory.buildUser.withRawPassword({
    id: SCO_STUDENT_NOT_CERTIFIABLE_ID,
    firstName: 'Lyanna',
    lastName: 'Mormont',
    email: 'mormont.lyanna@example.net',
    rawPassword: DEFAULT_PASSWORD,
    cgu: false,
  });

  databaseBuilder.factory.buildOrganizationLearner({
    id: SCO_STUDENT_NOT_CERTIFIABLE_ID,
    firstName: userWithEmail.firstName,
    lastName: userWithEmail.lastName,
    birthdate: '2002-01-07',
    division: '5D',
    group: null,
    organizationId: SCO_MIDDLE_SCHOOL_ID,
    userId: SCO_STUDENT_NOT_CERTIFIABLE_ID,
    nationalStudentId: '123456789EE',
  });

  // organization learner associated with email used by certification
  const userCertifWithEmail = databaseBuilder.factory.buildUser.withRawPassword({
    id: SCO_STUDENT_ID,
    firstName: 'Student',
    lastName: 'Certified',
    email: 'student.certified@example.net',
    rawPassword: DEFAULT_PASSWORD,
    cgu: true,
  });

  databaseBuilder.factory.buildOrganizationLearner({
    id: SCO_STUDENT_ID,
    firstName: userCertifWithEmail.firstName,
    lastName: userCertifWithEmail.lastName,
    birthdate: '2000-01-01',
    division: '5D',
    group: null,
    organizationId: SCO_MIDDLE_SCHOOL_ID,
    userId: SCO_STUDENT_ID,
    nationalStudentId: '123456789FF',
  });

  // organization learner associated with gar
  const userWithGAR = databaseBuilder.factory.buildUser({
    firstName: 'user',
    lastName: 'gar',
    email: null,
    username: null,
    cgu: false,
  });

  databaseBuilder.factory.buildAuthenticationMethod.withGarAsIdentityProvider({
    externalIdentifier: '1234567',
    userId: userWithGAR.id,
  });

  databaseBuilder.factory.buildOrganizationLearner({
    firstName: userWithGAR.firstName,
    lastName: userWithGAR.lastName,
    birthdate: '2002-01-07',
    division: '5D',
    group: null,
    organizationId: SCO_MIDDLE_SCHOOL_ID,
    userId: userWithGAR.id,
    nationalStudentId: '123456789GG',
  });

  // organization learner disabled
  const studentDisabled = databaseBuilder.factory.buildUser.withRawPassword({
    id: SCO_DISABLED_USER_ID,
    firstName: 'student',
    lastName: 'disabled',
    username: 'student.disabled1234',
    rawPassword: DEFAULT_PASSWORD,
    cgu: false,
  });

  databaseBuilder.factory.buildOrganizationLearner({
    id: SCO_DISABLED_USER_ID,
    firstName: studentDisabled.firstName,
    lastName: studentDisabled.lastName,
    birthdate: '2000-01-01',
    division: '3A',
    group: null,
    organizationId: SCO_MIDDLE_SCHOOL_ID,
    userId: SCO_DISABLED_USER_ID,
    nationalStudentId: '123456789HH',
    isDisabled: true,
  });

  // user who has left SCO
  const userWhoHasLeftSCO = databaseBuilder.factory.buildUser({
    firstName: 'Studentsco',
    lastName: 'HasLeftSCO',
    email: 'studentsco.hasleftsco@example.net',
    username: null,
    cgu: true,
    emailConfirmedAt: new Date(),
  });

  databaseBuilder.factory.buildOrganizationLearner({
    firstName: userWhoHasLeftSCO.firstName,
    lastName: userWhoHasLeftSCO.lastName,
    birthdate: '2000-01-01',
    division: '3A',
    group: null,
    organizationId: SCO_MIDDLE_SCHOOL_ID,
    userId: userWhoHasLeftSCO.id,
    nationalStudentId: '123456789II',
    isDisabled: true,
  });

  databaseBuilder.factory.buildAuthenticationMethod.withGarAsIdentityProvider({
    externalIdentifier: '1234555',
    userId: userWhoHasLeftSCO.id,
  });

  databaseBuilder.factory.buildAuthenticationMethod.withPixAsIdentityProviderAndPassword({
    userId: userWhoHasLeftSCO.id,
  });

  databaseBuilder.factory.buildAccountRecoveryDemand({
    userId: userWhoHasLeftSCO.id,
    firstName: userWhoHasLeftSCO.firstName,
    lastName: userWhoHasLeftSCO.lastName,
    used: true,
  });

  // Great Oak School - anonymization purpose
  const greatOakSchool = databaseBuilder.factory.buildOrganization({
    type: 'SCO',
    name: 'Great Oak School',
    isManagingStudents: true,
    email: 'great.oak.school@example.net',
    externalId: GREAT_OAK_CERTIF_CENTER_EXTERNAL_ID,
    documentationUrl: 'https://pix.fr/',
    provinceCode: '12',
    identityProviderForCampaigns: SamlIdentityProviders.GAR.code,
    createdBy: middleSchoolsCreator.id,
  });
  const greatOakSchoolAdmin = databaseBuilder.factory.buildUser.withRawPassword({
    firstName: 'Haldir',
    lastName: 'Adceran',
    email: 'haldir.adceran@example.net',
    rawPassword: DEFAULT_PASSWORD,
    cgu: true,
    pixOrgaTermsOfServiceAccepted: true,
    lastPixOrgaTermsOfServiceValidatedAt: new Date(),
  });
  const greatOakSchoolMember = databaseBuilder.factory.buildUser.withRawPassword({
    firstName: 'Katar',
    lastName: 'Orilee',
    email: 'katar.orilee@example.net',
    rawPassword: DEFAULT_PASSWORD,
    cgu: true,
    pixOrgaTermsOfServiceAccepted: true,
    lastPixOrgaTermsOfServiceValidatedAt: new Date(),
  });
  databaseBuilder.factory.buildMembership({
    userId: greatOakSchoolAdmin.id,
    organizationId: greatOakSchool.id,
    organizationRole: Membership.roles.ADMIN,
  });
  databaseBuilder.factory.buildMembership({
    userId: greatOakSchoolMember.id,
    organizationId: greatOakSchool.id,
    organizationRole: Membership.roles.MEMBER,
  });
}

function _buildHighSchools({ databaseBuilder }) {
  const highSchoolsCreator = databaseBuilder.factory.buildUser.withRawPassword({
    firstName: 'France',
    lastName: 'Guernon',
    rawPassword: DEFAULT_PASSWORD,
    cgu: true,
  });
  databaseBuilder.factory.buildPixAdminRole({ userId: highSchoolsCreator.id, role: ROLES.SUPER_ADMIN });

  databaseBuilder.factory.buildOrganization({
    id: SCO_HIGH_SCHOOL_ID,
    type: 'SCO',
    name: 'Lycée The Night Watch',
    isManagingStudents: true,
    email: 'sco2.generic.account@example.net',
    externalId: SCO_LYCEE_EXTERNAL_ID,
    provinceCode: '12',
    createdBy: highSchoolsCreator.id,
  });

  databaseBuilder.factory.buildOrganizationTag({ organizationId: SCO_HIGH_SCHOOL_ID, tagId: 9 });

  databaseBuilder.factory.buildMembership({
    userId: SCO_ADMIN_ID,
    organizationId: SCO_HIGH_SCHOOL_ID,
    organizationRole: Membership.roles.ADMIN,
  });

  databaseBuilder.factory.buildMembership({
    userId: SCO_MEMBER_ID,
    organizationId: SCO_HIGH_SCHOOL_ID,
    organizationRole: Membership.roles.MEMBER,
  });

  // organization learner also associated in another organization
  databaseBuilder.factory.buildOrganizationLearner({
    id: SCO_FOREIGNER_USER_ID_IN_ANOTHER_ORGANIZATION,
    userId: SCO_FOREIGNER_USER_ID,
    firstName: 'Same Blue Ivy',
    lastName: 'Same Carter',
    birthdate: '2012-01-07',
    division: '2B',
    group: null,
    organizationId: SCO_HIGH_SCHOOL_ID,
    nationalStudentId: '123456789DD',
    createdAt: new Date('2020-08-14'),
  });

  // organization learner associated in another organization but not associated yet
  databaseBuilder.factory.buildOrganizationLearner({
    userId: null,
    firstName: 'Same George',
    lastName: 'Same De Cambridge',
    birthdate: '2013-07-22',
    division: '2A',
    group: null,
    organizationId: SCO_HIGH_SCHOOL_ID,
    nationalStudentId: 'autreINE',
    createdAt: new Date('2020-08-14'),
  });

  // organization learner associated in another organization but not associated yet and should be associated automatically
  databaseBuilder.factory.buildOrganizationLearner({
    firstName: 'Same Lyanna',
    lastName: 'Same Mormont',
    birthdate: '2002-01-07',
    division: '2D',
    group: null,
    organizationId: SCO_HIGH_SCHOOL_ID,
    userId: null,
    nationalStudentId: '123456789EE',
  });

  // siblings using the same computer and in different school
  const bigSister = databaseBuilder.factory.buildUser.withRawPassword({
    firstName: 'Sister',
    lastName: 'Big',
    email: 'sister@example.net',
    rawPassword: DEFAULT_PASSWORD,
  });
  databaseBuilder.factory.buildOrganizationLearner({
    firstName: 'Sister',
    lastName: 'Big',
    birthdate: '2008-02-01',
    division: '3B',
    group: null,
    organizationId: SCO_HIGH_SCHOOL_ID,
    userId: bigSister.id,
    nationalStudentId: '987654321EE',
  });
  databaseBuilder.factory.buildOrganizationLearner({
    firstName: 'Brother',
    lastName: 'Little',
    birthdate: '2010-10-10',
    division: '5A',
    group: null,
    organizationId: SCO_MIDDLE_SCHOOL_ID,
    userId: null,
    nationalStudentId: '987654321NN',
  });
}

function _buildFarmingSchools({ databaseBuilder }) {
  const farmingSchoolsCreator = databaseBuilder.factory.buildUser.withRawPassword({
    firstName: 'Maryse',
    lastName: 'Marceau',
    rawPassword: DEFAULT_PASSWORD,
    cgu: true,
  });
  databaseBuilder.factory.buildPixAdminRole({ userId: farmingSchoolsCreator.id, role: ROLES.SUPER_ADMIN });

  databaseBuilder.factory.buildOrganization({
    id: SCO_AGRI_ID,
    type: 'SCO',
    name: 'Lycée Agricole',
    isManagingStudents: true,
    email: 'sco3.generic.account@example.net',
    externalId: SCO_AGRI_EXTERNAL_ID,
    provinceCode: '12',
    createdBy: farmingSchoolsCreator.id,
  });

  databaseBuilder.factory.buildOrganizationTag({ organizationId: SCO_AGRI_ID, tagId: 1 });

  databaseBuilder.factory.buildMembership({
    userId: SCO_ADMIN_ID,
    organizationId: SCO_AGRI_ID,
    organizationRole: Membership.roles.ADMIN,
  });

  databaseBuilder.factory.buildMembership({
    userId: PIX_ALL_ORGA_ID,
    organizationId: SCO_AGRI_ID,
    organizationRole: Membership.roles.ADMIN,
  });

  databaseBuilder.factory.buildMembership({
    userId: SCO_MEMBER_ID,
    organizationId: SCO_AGRI_ID,
    organizationRole: Membership.roles.MEMBER,
  });
}

function _buildAEFE({ databaseBuilder }) {
  const aefeCreator = databaseBuilder.factory.buildUser.withRawPassword({
    firstName: 'Bevis',
    lastName: 'Bellefeuille',
    rawPassword: DEFAULT_PASSWORD,
    cgu: true,
  });
  databaseBuilder.factory.buildPixAdminRole({ userId: aefeCreator.id, role: ROLES.SUPER_ADMIN });

  databaseBuilder.factory.buildOrganization({
    id: SCO_AEFE_ID,
    type: 'SCO',
    name: 'AEFE',
    email: 'sco4.generic.account@example.net',
    externalId: SCO_NO_MANAGING_STUDENTS_EXTERNAL_ID,
    provinceCode: '12',
    createdBy: aefeCreator.id,
  });

  databaseBuilder.factory.buildOrganizationTag({ organizationId: SCO_AEFE_ID, tagId: 6 });

  databaseBuilder.factory.buildMembership({
    userId: SCO_ADMIN_ID,
    organizationId: SCO_AEFE_ID,
    organizationRole: Membership.roles.ADMIN,
  });

  databaseBuilder.factory.buildMembership({
    userId: SCO_MEMBER_ID,
    organizationId: SCO_AEFE_ID,
    organizationRole: Membership.roles.MEMBER,
  });
}

export default {
  organizationsScoBuilder,
  SCO_MIDDLE_SCHOOL_ID,
  SCO_HIGH_SCHOOL_ID,
  SCO_AGRI_ID,
  SCO_AEFE_ID,
  SCO_STUDENT_ID,
  SCO_FOREIGNER_USER_ID,
  SCO_FOREIGNER_USER_ID_IN_ANOTHER_ORGANIZATION,
  SCO_FRENCH_USER_ID,
  SCO_DISABLED_USER_ID,
  SCO_STUDENT_NOT_CERTIFIABLE_ID,
};

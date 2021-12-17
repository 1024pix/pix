const Membership = require('../../../lib/domain/models/Membership');
const { DEFAULT_PASSWORD } = require('./users-builder');
const SCO_MIDDLE_SCHOOL_ID = 3;
const SCO_HIGH_SCHOOL_ID = 6;
const SCO_HIGH_SCHOOL_ID_2 = 13;
const SCO_AGRI_ID = 7;
const SCO_AGRI_ID_2 = 12;
const SCO_AEFE_ID = 9;
const SCO_STUDENT_ID = 99;
const CANADA_INSEE_CODE = '401';
const SCO_FOREIGNER_USER_ID = 9912;
const SCO_FRENCH_USER_ID = 2339213;

function organizationsScoBuilder({ databaseBuilder }) {
  const SCO_COLLEGE_EXTERNAL_ID = '1237457A';

  /* COLLEGE */
  const scoUser1 = databaseBuilder.factory.buildUser.withRawPassword({
    id: 4,
    firstName: 'Jon',
    lastName: 'Snow',
    email: 'sco.admin@example.net',
    rawPassword: DEFAULT_PASSWORD,
    cgu: true,
    pixOrgaTermsOfServiceAccepted: true,
    lastPixOrgaTermsOfServiceValidatedAt: new Date(),
  });

  const scoUser2 = databaseBuilder.factory.buildUser.withRawPassword({
    id: 5,
    firstName: 'Aemon',
    lastName: 'Targaryen',
    email: 'sco.member@example.net',
    rawPassword: DEFAULT_PASSWORD,
    cgu: true,
    pixOrgaTermsOfServiceAccepted: true,
    lastPixOrgaTermsOfServiceValidatedAt: new Date(),
  });

  databaseBuilder.factory.buildOrganization({
    id: SCO_MIDDLE_SCHOOL_ID,
    type: 'SCO',
    name: 'Collège The Night Watch',
    isManagingStudents: true,
    canCollectProfiles: true,
    email: 'sco.generic.account@example.net',
    externalId: SCO_COLLEGE_EXTERNAL_ID,
    documentationUrl: 'https://pix.fr/',
    provinceCode: '12',
  });

  databaseBuilder.factory.buildOrganization({
    id: SCO_AGRI_ID_2,
    type: 'SCO',
    name: 'Lycée agri The Night Watch',
    isManagingStudents: true,
    canCollectProfiles: true,
    email: 'sco.generic.account@example.net',
    externalId: '1237457D',
    provinceCode: '12',
  });

  databaseBuilder.factory.buildOrganization({
    id: SCO_HIGH_SCHOOL_ID_2,
    type: 'SCO',
    name: 'Lycée Sunnydale',
    isManagingStudents: true,
    canCollectProfiles: true,
    email: 'sco.generic.account@example.net',
    externalId: '1237457K',
    provinceCode: '12',
  });

  databaseBuilder.factory.buildMembership({
    userId: scoUser1.id,
    organizationId: SCO_HIGH_SCHOOL_ID_2,
    organizationRole: Membership.roles.ADMIN,
  });

  databaseBuilder.factory.buildMembership({
    userId: scoUser1.id,
    organizationId: SCO_MIDDLE_SCHOOL_ID,
    organizationRole: Membership.roles.ADMIN,
  });

  databaseBuilder.factory.buildMembership({
    userId: scoUser2.id,
    organizationId: SCO_MIDDLE_SCHOOL_ID,
    organizationRole: Membership.roles.MEMBER,
  });

  databaseBuilder.factory.buildOrganizationTag({ organizationId: SCO_HIGH_SCHOOL_ID_2, tagId: 9 });
  databaseBuilder.factory.buildOrganizationTag({ organizationId: SCO_MIDDLE_SCHOOL_ID, tagId: 8 });
  databaseBuilder.factory.buildOrganizationTag({ organizationId: SCO_AGRI_ID_2, tagId: 1 });

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

  // schooling registration not associated yet
  databaseBuilder.factory.buildSchoolingRegistration({
    id: 1,
    firstName: 'First',
    lastName: 'Last',
    birthdate: '2010-10-10',
    division: '6E',
    group: null,
    organizationId: SCO_MIDDLE_SCHOOL_ID,
    userId: null,
    nationalStudentId: '123456789AA',
  });

  // schooling registration associated with username
  const userWithUsername = databaseBuilder.factory.buildUser.withRawPassword({
    id: SCO_FRENCH_USER_ID,
    firstName: 'George',
    lastName: 'De Cambridge',
    username: 'george.decambridge2207',
    rawPassword: DEFAULT_PASSWORD,
    cgu: false,
  });

  const schoolingRegistrationAssociated = databaseBuilder.factory.buildSchoolingRegistration({
    firstName: userWithUsername.firstName,
    lastName: userWithUsername.lastName,
    birthdate: '2013-07-22',
    division: '3A',
    group: null,
    organizationId: SCO_MIDDLE_SCHOOL_ID,
    userId: userWithUsername.id,
    nationalStudentId: '123456789BB',
  });

  // schooling registration associated with username and email
  const userWithEmailAndUsername = databaseBuilder.factory.buildUser.withRawPassword({
    id: SCO_FOREIGNER_USER_ID,
    firstName: 'Blue Ivy',
    lastName: 'Carter',
    email: 'blueivy.carter@example.net',
    username: 'blueivy.carter0701',
    rawPassword: DEFAULT_PASSWORD,
    cgu: false,
  });

  const schoolingRegistrationAssociated2 = databaseBuilder.factory.buildSchoolingRegistration({
    firstName: userWithEmailAndUsername.firstName,
    lastName: userWithEmailAndUsername.lastName,
    birthdate: '2012-01-07',
    birthCountryCode: CANADA_INSEE_CODE,
    division: '3A',
    group: null,
    sex: null,
    organizationId: SCO_MIDDLE_SCHOOL_ID,
    userId: userWithEmailAndUsername.id,
    nationalStudentId: '123456789CC',
  });

  // schooling registration associated with email
  const userWithEmail = databaseBuilder.factory.buildUser.withRawPassword({
    firstName: 'Lyanna',
    lastName: 'Mormont',
    email: 'mormont.lyanna@example.net',
    rawPassword: DEFAULT_PASSWORD,
    cgu: false,
  });

  databaseBuilder.factory.buildSchoolingRegistration({
    firstName: userWithEmail.firstName,
    lastName: userWithEmail.lastName,
    birthdate: '2002-01-07',
    division: '5D',
    group: null,
    organizationId: SCO_MIDDLE_SCHOOL_ID,
    userId: userWithEmail.id,
    nationalStudentId: '123456789DD',
  });

  // schooling registration associated with email used by certification
  const userCertifWithEmail = databaseBuilder.factory.buildUser.withRawPassword({
    id: SCO_STUDENT_ID,
    firstName: 'student',
    lastName: 'certif',
    email: 'eleve-certif@example.net',
    rawPassword: DEFAULT_PASSWORD,
    cgu: true,
  });

  databaseBuilder.factory.buildSchoolingRegistration({
    firstName: userCertifWithEmail.firstName,
    lastName: userCertifWithEmail.lastName,
    birthdate: '2000-01-01',
    division: '5D',
    group: null,
    organizationId: SCO_MIDDLE_SCHOOL_ID,
    userId: userCertifWithEmail.id,
    nationalStudentId: '123456789EE',
  });

  // schooling registration associated with gar
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

  databaseBuilder.factory.buildSchoolingRegistration({
    firstName: userWithGAR.firstName,
    lastName: userWithGAR.lastName,
    birthdate: '2002-01-07',
    division: '5D',
    group: null,
    organizationId: SCO_MIDDLE_SCHOOL_ID,
    userId: userWithGAR.id,
    nationalStudentId: '123456789FF',
  });

  // schooling registration disabled
  const studentDisabled = databaseBuilder.factory.buildUser.withRawPassword({
    firstName: 'student',
    lastName: 'disabled',
    username: 'student.disabled1234',
    rawPassword: DEFAULT_PASSWORD,
    cgu: false,
  });

  databaseBuilder.factory.buildSchoolingRegistration({
    firstName: studentDisabled.firstName,
    lastName: studentDisabled.lastName,
    birthdate: '2000-01-01',
    division: '3A',
    group: null,
    organizationId: SCO_MIDDLE_SCHOOL_ID,
    userId: studentDisabled.id,
    nationalStudentId: '123456789GG',
    isDisabled: true,
  });

  /* LYCEE */
  databaseBuilder.factory.buildOrganization({
    id: SCO_HIGH_SCHOOL_ID,
    type: 'SCO',
    name: 'Lycée The Night Watch',
    isManagingStudents: true,
    canCollectProfiles: true,
    email: 'sco2.generic.account@example.net',
    externalId: '1237457B',
    provinceCode: '12',
  });

  databaseBuilder.factory.buildMembership({
    userId: scoUser1.id,
    organizationId: SCO_HIGH_SCHOOL_ID,
    organizationRole: Membership.roles.ADMIN,
  });

  databaseBuilder.factory.buildMembership({
    userId: scoUser2.id,
    organizationId: SCO_HIGH_SCHOOL_ID,
    organizationRole: Membership.roles.MEMBER,
  });

  // schooling registration also associated in another organization
  databaseBuilder.factory.buildSchoolingRegistration({
    userId: userWithEmailAndUsername.id,
    firstName: userWithEmailAndUsername.firstName,
    lastName: userWithEmailAndUsername.lastName,
    birthdate: userWithEmailAndUsername.birtdate,
    division: '3D',
    group: null,
    organizationId: SCO_HIGH_SCHOOL_ID,
    nationalStudentId: schoolingRegistrationAssociated2.nationalStudentId,
    createdAt: new Date('2020-08-14'),
  });

  // schooling registration associated in another organization but not associated yet
  databaseBuilder.factory.buildSchoolingRegistration({
    userId: null,
    firstName: userWithUsername.firstName,
    lastName: userWithUsername.lastName,
    birthdate: userWithUsername.birthdate,
    division: '3D',
    group: null,
    organizationId: SCO_HIGH_SCHOOL_ID,
    nationalStudentId: schoolingRegistrationAssociated.nationalStudentId,
    createdAt: new Date('2020-08-14'),
  });

  /* AGRICULTURE */
  databaseBuilder.factory.buildOrganization({
    id: SCO_AGRI_ID,
    type: 'SCO',
    name: 'Lycée Agricole',
    isManagingStudents: true,
    canCollectProfiles: true,
    email: 'sco3.generic.account@example.net',
    externalId: '1237457C',
    provinceCode: '12',
  });

  databaseBuilder.factory.buildOrganizationTag({ organizationId: SCO_AGRI_ID, tagId: 1 });

  databaseBuilder.factory.buildMembership({
    userId: scoUser1.id,
    organizationId: SCO_AGRI_ID,
    organizationRole: Membership.roles.ADMIN,
  });

  databaseBuilder.factory.buildMembership({
    userId: scoUser2.id,
    organizationId: SCO_AGRI_ID,
    organizationRole: Membership.roles.MEMBER,
  });

  /* AEFE */
  databaseBuilder.factory.buildOrganization({
    id: SCO_AEFE_ID,
    type: 'SCO',
    name: 'AEFE',
    canCollectProfiles: true,
    email: 'sco5.generic.account@example.net',
    externalId: '1237457E',
    provinceCode: '12',
  });

  databaseBuilder.factory.buildOrganizationTag({ organizationId: SCO_AEFE_ID, tagId: 6 });

  databaseBuilder.factory.buildMembership({
    userId: scoUser1.id,
    organizationId: SCO_AEFE_ID,
    organizationRole: Membership.roles.ADMIN,
  });

  databaseBuilder.factory.buildMembership({
    userId: scoUser2.id,
    organizationId: SCO_AEFE_ID,
    organizationRole: Membership.roles.MEMBER,
  });

  // user who has left SCO
  const userWhoHasLeftSCO = databaseBuilder.factory.buildUser({
    firstName: 'John',
    lastName: 'hasLeftSCO',
    email: 'john.hasleftsco@example.net',
    username: null,
    cgu: true,
    emailConfirmedAt: new Date(),
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
}

module.exports = {
  organizationsScoBuilder,
  SCO_MIDDLE_SCHOOL_ID,
  SCO_HIGH_SCHOOL_ID,
  SCO_AGRI_ID,
  SCO_AEFE_ID,
  SCO_STUDENT_ID,
  SCO_FOREIGNER_USER_ID,
  SCO_FRENCH_USER_ID,
};

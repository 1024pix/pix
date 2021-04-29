const Membership = require('../../../lib/domain/models/Membership');
const AuthenticationMethod = require('../../../lib/domain/models/AuthenticationMethod');
const { DEFAULT_PASSWORD } = require('./users-builder');
const SCO_MIDDLE_SCHOOL_ID = 3;
const SCO_HIGH_SCHOOL_ID = 6;
const SCO_AGRI_ID = 7;
const SCO_AGRI_CFA_ID = 8;
const SCO_AEFE_ID = 9;
const SCO_STUDENT_ID = 99;

function organizationsScoBuilder({ databaseBuilder }) {
  const SCO_EXTERNAL_ID = '1237457A';

  /* COLLEGE */
  const scoUser1 = databaseBuilder.factory.buildUser.withRawPassword({
    id: 4,
    firstName: 'John',
    lastName: 'Snow',
    email: 'sco.admin@example.net',
    rawPassword: DEFAULT_PASSWORD,
    cgu: true,
    pixOrgaTermsOfServiceAccepted: true,
  });

  const scoUser2 = databaseBuilder.factory.buildUser.withRawPassword({
    id: 5,
    firstName: 'Aemon',
    lastName: 'Targaryen',
    email: 'sco.member@example.net',
    rawPassword: DEFAULT_PASSWORD,
    cgu: true,
    pixOrgaTermsOfServiceAccepted: true,
  });

  databaseBuilder.factory.buildOrganization({
    id: SCO_MIDDLE_SCHOOL_ID,
    type: 'SCO',
    name: 'Collège The Night Watch',
    isManagingStudents: true,
    canCollectProfiles: true,
    email: 'sco.generic.account@example.net',
    externalId: SCO_EXTERNAL_ID,
    provinceCode: '12',
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
    organizationId: SCO_MIDDLE_SCHOOL_ID,
    userId: null,
    nationalStudentId: '123456789AB',
  });

  // schooling registration associated with username
  const userWithUsername = databaseBuilder.factory.buildUser.withRawPassword({
    firstName: 'George',
    lastName: 'De Cambridge',
    email: null,
    username: 'george.decambridge2207',
    rawPassword: DEFAULT_PASSWORD,
    cgu: false,
  });

  const schoolingRegistrationAssociated = databaseBuilder.factory.buildSchoolingRegistration({
    firstName: userWithUsername.firstName,
    lastName: userWithUsername.lastName,
    birthdate: '2013-07-22',
    division: '3A',
    organizationId: SCO_MIDDLE_SCHOOL_ID,
    userId: userWithUsername.id,
    nationalStudentId: '123123123A',
  });

  // schooling registration associated with username and email
  const userWithEmailAndUsername = databaseBuilder.factory.buildUser.withRawPassword({
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
    division: '3A',
    organizationId: SCO_MIDDLE_SCHOOL_ID,
    userId: userWithEmailAndUsername.id,
    nationalStudentId: '123123123B',
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
    organizationId: SCO_MIDDLE_SCHOOL_ID,
    userId: userWithEmail.id,
    nationalStudentId: '123123123C',
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
    organizationId: SCO_MIDDLE_SCHOOL_ID,
    userId: userCertifWithEmail.id,
    nationalStudentId: '123123123E',
  });

  // schooling registration associated with gar
  const userWithGAR = databaseBuilder.factory.buildUser({
    firstName: 'user',
    lastName: 'gar',
    email: null,
    username: null,
    cgu: false,
  });

  databaseBuilder.factory.buildAuthenticationMethod({
    identityProvider: AuthenticationMethod.identityProviders.GAR,
    externalIdentifier: '1234567',
    userId: userWithGAR.id,
  });

  databaseBuilder.factory.buildSchoolingRegistration({
    firstName: userWithGAR.firstName,
    lastName: userWithGAR.lastName,
    birthdate: '2002-01-07',
    division: '5D',
    organizationId: SCO_MIDDLE_SCHOOL_ID,
    userId: userWithGAR.id,
    nationalStudentId: '123123123D',
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

  /* CFA AGRICULTURE */
  databaseBuilder.factory.buildOrganization({
    id: 8,
    type: 'SCO',
    name: 'CFA Agricole',
    isManagingStudents: true,
    canCollectProfiles: true,
    email: 'sco4.generic.account@example.net',
    externalId: '1237457D',
    provinceCode: '12',
  });

  databaseBuilder.factory.buildOrganizationTag({ organizationId: SCO_AGRI_CFA_ID, tagId: 1 });
  databaseBuilder.factory.buildOrganizationTag({ organizationId: SCO_AGRI_CFA_ID, tagId: 5 });

  databaseBuilder.factory.buildMembership({
    userId: scoUser1.id,
    organizationId: SCO_AGRI_CFA_ID,
    organizationRole: Membership.roles.ADMIN,
  });

  databaseBuilder.factory.buildMembership({
    userId: scoUser2.id,
    organizationId: SCO_AGRI_CFA_ID,
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
}

module.exports = {
  organizationsScoBuilder,
  SCO_MIDDLE_SCHOOL_ID,
  SCO_HIGH_SCHOOL_ID,
  SCO_AGRI_ID,
  SCO_AGRI_CFA_ID,
  SCO_AEFE_ID,
  SCO_STUDENT_ID,
};


const Membership = require('../../../lib/domain/models/Membership');
const AuthenticationMethod = require('../../../lib/domain/models/AuthenticationMethod');
const { DEFAULT_PASSWORD } = require('./users-builder');
const MIDDLE_SCHOOL_ID = 3;

module.exports = function organizationsScoBuilder({ databaseBuilder }) {
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

  const middleSchool = databaseBuilder.factory.buildOrganization({
    id: MIDDLE_SCHOOL_ID,
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
    organizationId: middleSchool.id,
    organizationRole: Membership.roles.ADMIN,
  });

  databaseBuilder.factory.buildMembership({
    userId: scoUser2.id,
    organizationId: middleSchool.id,
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
    organizationId: middleSchool.id,
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
    organizationId: middleSchool.id,
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
    organizationId: middleSchool.id,
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
    organizationId: middleSchool.id,
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
    organizationId: middleSchool.id,
    userId: userWithEmail.id,
    nationalStudentId: '123123123C',
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
    organizationId: middleSchool.id,
    userId: userWithGAR.id,
    nationalStudentId: '123123123D',
  });

  /* LYCEE */
  const highSchool = databaseBuilder.factory.buildOrganization({
    id: 6,
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
    organizationId: highSchool.id,
    organizationRole: Membership.roles.ADMIN,
  });

  databaseBuilder.factory.buildMembership({
    userId: scoUser2.id,
    organizationId: highSchool.id,
    organizationRole: Membership.roles.MEMBER,
  });

  // schooling registration also associated in another organization
  databaseBuilder.factory.buildSchoolingRegistration({
    userId: userWithEmailAndUsername.id,
    firstName: userWithEmailAndUsername.firstName,
    lastName: userWithEmailAndUsername.lastName,
    birthdate: userWithEmailAndUsername.birtdate,
    organizationId: highSchool.id,
    nationalStudentId: schoolingRegistrationAssociated2.nationalStudentId,
    createdAt: new Date('2020-08-14'),
  });

  // schooling registration associated in another organization but not associated yet
  databaseBuilder.factory.buildSchoolingRegistration({
    userId: null,
    firstName: userWithUsername.firstName,
    lastName: userWithUsername.lastName,
    birthdate: userWithUsername.birthdate,
    organizationId: highSchool.id,
    nationalStudentId: schoolingRegistrationAssociated.nationalStudentId,
    createdAt: new Date('2020-08-14'),
  });

  /* AGRICULTURE */
  const agriculture = databaseBuilder.factory.buildOrganization({
    id: 7,
    type: 'SCO',
    name: 'Lycée Agricole',
    isManagingStudents: true,
    canCollectProfiles: true,
    email: 'sco3.generic.account@example.net',
    externalId: '1237457C',
    provinceCode: '12',
  });

  databaseBuilder.factory.buildOrganizationTag({ organizationId: agriculture.id, tagId: 1 });

  databaseBuilder.factory.buildMembership({
    userId: scoUser1.id,
    organizationId: agriculture.id,
    organizationRole: Membership.roles.ADMIN,
  });

  databaseBuilder.factory.buildMembership({
    userId: scoUser2.id,
    organizationId: agriculture.id,
    organizationRole: Membership.roles.MEMBER,
  });

  /* CFA AGRICULTURE */
  const agricultureCFA = databaseBuilder.factory.buildOrganization({
    id: 8,
    type: 'SCO',
    name: 'CFA Agricole',
    isManagingStudents: true,
    canCollectProfiles: true,
    email: 'sco4.generic.account@example.net',
    externalId: '1237457D',
    provinceCode: '12',
  });

  databaseBuilder.factory.buildOrganizationTag({ organizationId: agricultureCFA.id, tagId: 1 });
  databaseBuilder.factory.buildOrganizationTag({ organizationId: agricultureCFA.id, tagId: 5 });

  databaseBuilder.factory.buildMembership({
    userId: scoUser1.id,
    organizationId: agricultureCFA.id,
    organizationRole: Membership.roles.ADMIN,
  });

  databaseBuilder.factory.buildMembership({
    userId: scoUser2.id,
    organizationId: agricultureCFA.id,
    organizationRole: Membership.roles.MEMBER,
  });

  /* AEFE */
  const AEFE = databaseBuilder.factory.buildOrganization({
    id: 9,
    type: 'SCO',
    name: 'AEFE',
    canCollectProfiles: true,
    email: 'sco5.generic.account@example.net',
    externalId: '1237457E',
    provinceCode: '12',
  });

  databaseBuilder.factory.buildOrganizationTag({ organizationId: AEFE.id, tagId: 6 });

  databaseBuilder.factory.buildMembership({
    userId: scoUser1.id,
    organizationId: AEFE.id,
    organizationRole: Membership.roles.ADMIN,
  });

  databaseBuilder.factory.buildMembership({
    userId: scoUser2.id,
    organizationId: AEFE.id,
    organizationRole: Membership.roles.MEMBER,
  });
};

module.exports.MIDDLE_SCHOOL_ID = MIDDLE_SCHOOL_ID;

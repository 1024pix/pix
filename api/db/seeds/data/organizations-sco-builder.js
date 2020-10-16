const Membership = require('../../../lib/domain/models/Membership');

module.exports = function organizationsScoBuilder({ databaseBuilder }) {
  const defaultPassword = 'pix123';

  /* COLLEGE */
  const scoUser1 = databaseBuilder.factory.buildUser.withUnencryptedPassword({
    id: 4,
    firstName: 'John',
    lastName: 'Snow',
    email: 'sco.admin@example.net',
    rawPassword: defaultPassword,
    cgu: true,
    pixOrgaTermsOfServiceAccepted: true,
  });

  const scoUser2 = databaseBuilder.factory.buildUser.withUnencryptedPassword({
    id: 5,
    firstName: 'Aemon',
    lastName: 'Targaryen',
    email: 'sco.member@example.net',
    rawPassword: defaultPassword,
    cgu: true,
    pixOrgaTermsOfServiceAccepted: true,
  });

  const middleSchool = databaseBuilder.factory.buildOrganization({
    id: 3,
    type: 'SCO',
    name: 'Collège The Night Watch',
    isManagingStudents: true,
    canCollectProfiles: true,
    email: 'sco.generic.account@example.net',
    externalId: '1237457A',
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

  const disabledUserId = databaseBuilder.factory.buildUser.withUnencryptedPassword({
    id: 6,
    firstName: 'Mance',
    lastName: 'Rayder',
    email: 'sco.disabled@example.net',
    rawPassword: defaultPassword,
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
    organizationId: middleSchool.id,
    userId: null,
    nationalStudentId: '123456789AB',
  });

  // schooling registration associated with username
  const userWithUsername = databaseBuilder.factory.buildUser.withUnencryptedPassword({
    firstName: 'George',
    lastName: 'De Cambridge',
    email: null,
    username: 'george.decambridge2207',
    rawPassword: defaultPassword,
    cgu: false,
  });

  const schoolingRegistrationAssociated = databaseBuilder.factory.buildSchoolingRegistration({
    firstName: userWithUsername.firstName,
    lastName: userWithUsername.lastName,
    birthdate: '2013-07-22',
    organizationId: middleSchool.id,
    userId: userWithUsername.id,
    nationalStudentId: '123123123A',
  });

  // schooling registration associated with username and email
  const userWithEmailAndUsername = databaseBuilder.factory.buildUser.withUnencryptedPassword({
    firstName: 'Blue Ivy',
    lastName: 'Carter',
    email: 'blueivy.carter@example.net',
    username: 'blueivy.carter0701',
    rawPassword: defaultPassword,
    cgu: false,
  });

  const schoolingRegistrationAssociated2 = databaseBuilder.factory.buildSchoolingRegistration({
    firstName: userWithEmailAndUsername.firstName,
    lastName: userWithEmailAndUsername.lastName,
    birthdate: '2012-01-07',
    organizationId: middleSchool.id,
    userId: userWithEmailAndUsername.id,
    nationalStudentId: '123123123B',
  });

  // schooling registration associated with email
  const userWithEmail = databaseBuilder.factory.buildUser.withUnencryptedPassword({
    firstName: 'Lyanna',
    lastName: 'Mormont',
    email: 'mormont.lyanna@example.net',
    rawPassword: defaultPassword,
    cgu: false,
  });

  databaseBuilder.factory.buildSchoolingRegistration({
    firstName: userWithEmail.firstName,
    lastName: userWithEmail.lastName,
    birthdate: '2002-01-07',
    organizationId: middleSchool.id,
    userId: userWithEmail.id,
    nationalStudentId: '123123123C',
  });

  // schooling registration associated with gar
  const userWithGAR = databaseBuilder.factory.buildUser.withUnencryptedPassword({
    firstName: 'user',
    lastName: 'gar',
    email: null,
    username: null,
    samlId: '1234567',
    rawPassword: defaultPassword,
    cgu: false,
  });

  databaseBuilder.factory.buildSchoolingRegistration({
    firstName: userWithGAR.firstName,
    lastName: userWithGAR.lastName,
    birthdate: '2002-01-07',
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
  databaseBuilder.factory.buildOrganizationTag({ organizationId: 7, tagId: 1 });

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
};

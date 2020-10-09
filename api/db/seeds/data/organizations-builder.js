const Membership = require('../../../lib/domain/models/Membership');

module.exports = function organizationsBuilder({ databaseBuilder }) {

  const defaultPassword = 'pix123';

  // Type: SUP

  databaseBuilder.factory.buildOrganization({
    id: 2,
    type: 'SUP',
    name: 'Tyrion SUP',
    isManagingStudents: true,
    credit: 10000,
  });

  databaseBuilder.factory.buildMembership({
    userId: 3,
    organizationId: 2,
    organizationRole: Membership.roles.ADMIN,
  });

  databaseBuilder.factory.buildSchoolingRegistration({
    firstName: 'Joffrey',
    lastName: 'Baratheon',
    birthdate: '2000-02-28',
    organizationId: 2,
    userId: null,
    studentNumber: 'JAIMELESFRUITS123',
  });

  const sansaStark = databaseBuilder.factory.buildUser.withUnencryptedPassword({
    firstName: 'Sansa',
    lastName: 'Stark',
    email: 'sansa.stark@example.net',
    rawPassword: defaultPassword,
    cgu: false,
  });

  databaseBuilder.factory.buildSchoolingRegistration({
    firstName: sansaStark.firstName,
    lastName: sansaStark.lastName,
    birthdate: '2000-05-28',
    organizationId: 2,
    userId: sansaStark.id,
    isSupernumerary: true,
    studentNumber: null,
  });

  // Type: SCO

  databaseBuilder.factory.buildOrganization({
    id: 3,
    type: 'SCO',
    name: 'The Night Watch',
    isManagingStudents: true,
    canCollectProfiles: true,
    email: 'sco.generic.account@example.net',
    externalId: '1237457A',
    credit: 0,
  });

  // Memberships
  databaseBuilder.factory.buildMembership({
    userId: 4,
    organizationId: 3,
    organizationRole: Membership.roles.ADMIN,
  });

  databaseBuilder.factory.buildMembership({
    userId: 9,
    organizationId: 3,
    organizationRole: Membership.roles.MEMBER,
  });

  const disabledUserId = databaseBuilder.factory.buildUser.withUnencryptedPassword({
    firstName: 'Mance',
    lastName: 'Rayder',
    email: 'mance.rayder@example.net',
    rawPassword: defaultPassword,
  }).id;

  databaseBuilder.factory.buildMembership({
    userId: disabledUserId,
    organizationId: 3,
    organizationRole: Membership.roles.MEMBER,
    removedAt: new Date(),
  });

  // SchoolingRegistrations

  const userFirstLast = databaseBuilder.factory.buildUser.withUnencryptedPassword({
    firstName: 'First',
    lastName: 'Last',
    email: 'first.last@example.net',
    rawPassword: defaultPassword,
    cgu: true,
  });

  const firstLastSchoolingRegistration = databaseBuilder.factory.buildSchoolingRegistration({
    id: 1,
    firstName: userFirstLast.firstName,
    lastName: userFirstLast.lastName,
    birthdate: '2010-10-10',
    organizationId: 3,
    userId: null,
    nationalStudentId: '123456789AB',
  });

  const user1Id = databaseBuilder.factory.buildUser.withUnencryptedPassword({
    firstName: 'George',
    lastName: 'De Cambridge',
    email: null,
    username: 'george.decambridge2207',
    rawPassword: defaultPassword,
    cgu: false,
  }).id;

  databaseBuilder.factory.buildSchoolingRegistration({
    firstName: 'George',
    lastName: 'De Cambridge',
    birthdate: '2013-07-22',
    organizationId: 3,
    userId: user1Id,
  });

  const user2Id = databaseBuilder.factory.buildUser.withUnencryptedPassword({
    firstName: 'Blue Ivy',
    lastName: 'Carter',
    email: null,
    username: 'blueivy.carter0701',
    rawPassword: defaultPassword,
    cgu: false,
  }).id;

  databaseBuilder.factory.buildSchoolingRegistration({
    firstName: 'Blue Ivy',
    lastName: 'Carter',
    birthdate: '2012-01-07',
    organizationId: 3,
    userId: user2Id,
  });

  const INE = '234567890AB';

  const userWithEmailAndUsername = databaseBuilder.factory.buildUser.withUnencryptedPassword({
    firstName: 'Lyanna',
    lastName: 'Mormont',
    email: 'lyanna.mormont@example.net',
    username: 'lyanna.mormont3009',
    rawPassword: defaultPassword,
    cgu: false,
  });

  databaseBuilder.factory.buildUser.withUnencryptedPassword({
    firstName: 'Lyanna',
    lastName: 'Mormont',
    email: 'mormont.lyanna@example.net',
    rawPassword: defaultPassword,
    cgu: false,
  });

  databaseBuilder.factory.buildSchoolingRegistration({
    userId: userWithEmailAndUsername.id,
    firstName: userWithEmailAndUsername.firstName,
    lastName: userWithEmailAndUsername.lastName,
    birthdate: '2003-09-30',
    organizationId: 3,
    nationalStudentId: INE,
  });

  const anotherINE = '345678901AB';

  const userAuthentificationMethodIsEmailOnly = databaseBuilder.factory.buildUser.withUnencryptedPassword({
    firstName: 'user',
    lastName: 'pix',
    email: 'user.pix@example.net',
    username: null,
    rawPassword: defaultPassword,
    cgu: false,
  });

  databaseBuilder.factory.buildSchoolingRegistration({
    userId: userAuthentificationMethodIsEmailOnly.id,
    firstName: userAuthentificationMethodIsEmailOnly.firstName,
    lastName: userAuthentificationMethodIsEmailOnly.lastName,
    birthdate: '2010-09-30',
    organizationId: 3,
    nationalStudentId: anotherINE,
  });

  const userAuthentificationMethodIsSamlIdOnly = databaseBuilder.factory.buildUser.withUnencryptedPassword({
    firstName: 'user',
    lastName: 'gar',
    email: null,
    username: null,
    samlId: '1234567',
    rawPassword: defaultPassword,
    cgu: false,
  });

  databaseBuilder.factory.buildSchoolingRegistration({
    userId: userAuthentificationMethodIsSamlIdOnly.id,
    firstName: userAuthentificationMethodIsSamlIdOnly.firstName,
    lastName: userAuthentificationMethodIsSamlIdOnly.lastName,
    birthdate: '2010-09-30',
    organizationId: 3,
  });

  databaseBuilder.factory.buildSchoolingRegistration({
    userId: null,
    firstName: 'USER1',
    lastName: 'USER1',
    birthdate: '2001-01-01',
    organizationId: 3,
  });

  databaseBuilder.factory.buildSchoolingRegistration({
    userId: null,
    firstName: 'USER1234',
    lastName: 'USER1234',
    birthdate: '2001-01-01',
    organizationId: 3,
  });

  // Type: SCO

  // id=5 is already used in dragon-and-co-builder
  const SCO2OrganizationId = 6;

  databaseBuilder.factory.buildOrganization({
    id: SCO2OrganizationId,
    type: 'SCO',
    name: 'Managing students #2',
    isManagingStudents: true,
    canCollectProfiles: true,
    externalId: '1237457B',
  });

  // Memberships

  const adminSCO2ManagingStudentUserId = databaseBuilder.factory.buildUser.withUnencryptedPassword({
    firstName: 'Admin',
    lastName: 'SCO2',
    email: 'admin.sco2@example.net',
    rawPassword: defaultPassword,
  }).id;

  databaseBuilder.factory.buildMembership({
    userId: adminSCO2ManagingStudentUserId,
    organizationId: SCO2OrganizationId,
    organizationRole: Membership.roles.ADMIN,
  });

  // SchoolingRegistrations

  databaseBuilder.factory.buildSchoolingRegistration({
    userId: userWithEmailAndUsername.id,
    firstName: userWithEmailAndUsername.firstName,
    lastName: userWithEmailAndUsername.lastName,
    birthdate: '2003-09-30',
    organizationId: SCO2OrganizationId,
    nationalStudentId: INE,
    createdAt: new Date('2020-08-14'),
  });

  databaseBuilder.factory.buildSchoolingRegistration({
    userId: userFirstLast.id,
    firstName: userFirstLast.firstName,
    lastName: userFirstLast.lastName,
    birthdate: firstLastSchoolingRegistration.birthdate,
    organizationId: SCO2OrganizationId,
    nationalStudentId: firstLastSchoolingRegistration.nationalStudentId,
    createdAt: new Date('2020-08-14'),
  });

};

const Membership = require('../../../lib/domain/models/Membership');

module.exports = function organizationsBuilder({ databaseBuilder }) {
  databaseBuilder.factory.buildOrganization({
    id: 2,
    type: 'SUP',
    name: 'Tyrion SUP',
    isManagingStudents: true,
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
    studentNumber: null,
  });
  const sansaStark = databaseBuilder.factory.buildUser.withUnencryptedPassword({
    firstName: 'Sansa',
    lastName: 'Stark',
    email: 'sansa.stark@example.net',
    rawPassword: 'Pix123',
    cgu: false
  });
  databaseBuilder.factory.buildSchoolingRegistration({
    firstName: sansaStark.firstName,
    lastName: sansaStark.lastName,
    birthdate: '2000-05-28',
    organizationId: 2,
    userId: sansaStark.id,
  });
  databaseBuilder.factory.buildOrganization({
    id: 3,
    type: 'SCO',
    name: 'The Night Watch',
    isManagingStudents: true,
    canCollectProfiles: true,
    email: 'sco.generic.account@example.net'
  });
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
  databaseBuilder.factory.buildSchoolingRegistration({
    id: 1,
    firstName: 'First',
    lastName: 'Last',
    birthdate: '2010-10-10',
    organizationId: 3,
    userId: null
  });
  const disabledUserId = databaseBuilder.factory.buildUser.withUnencryptedPassword({
    firstName: 'Mance',
    lastName: 'Rayder',
    email: 'mance.rayder@example.net',
    rawPassword: 'Pix123',
  }).id;
  databaseBuilder.factory.buildMembership({
    userId: disabledUserId,
    organizationId: 3,
    organizationRole: Membership.roles.MEMBER,
    removedAt: new Date()
  });

  const user1Id = databaseBuilder.factory.buildUser.withUnencryptedPassword({
    firstName: 'George',
    lastName: 'De Cambridge',
    email: null,
    username: 'george.decambridge2207',
    rawPassword: 'Pix123',
    cgu: false
  }).id;
  const user2Id = databaseBuilder.factory.buildUser.withUnencryptedPassword({
    firstName: 'Blue Ivy',
    lastName: 'Carter',
    email: null,
    username: 'blueivy.carter0701',
    rawPassword: 'Pix123',
    cgu: false
  }).id;
  databaseBuilder.factory.buildSchoolingRegistration({
    firstName: 'George',
    lastName: 'De Cambridge',
    birthdate: '2013-07-22',
    organizationId: 3,
    userId: user1Id
  });
  databaseBuilder.factory.buildSchoolingRegistration({
    firstName: 'Blue Ivy',
    lastName: 'Carter',
    birthdate: '2012-01-07',
    organizationId: 3,
    userId: user2Id
  });

  const userWithEmailAndUsername = databaseBuilder.factory.buildUser.withUnencryptedPassword({
    firstName: 'Lyanna',
    lastName: 'Mormont',
    email: 'lyanna.mormont@example.net',
    username: 'lyanna.mormont3009',
    rawPassword: 'Pix123',
    cgu: false
  });
  databaseBuilder.factory.buildSchoolingRegistration({
    userId: userWithEmailAndUsername.id,
    firstName: userWithEmailAndUsername.firstName,
    lastName: userWithEmailAndUsername.lastName,
    birthdate: '2003-09-30',
    organizationId: 3,
  });
};

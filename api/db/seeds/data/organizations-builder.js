const Membership = require('../../../lib/domain/models/Membership');

module.exports = function organizationsBuilder({ databaseBuilder }) {
  databaseBuilder.factory.buildOrganization({
    id: 2,
    type: 'SUP',
    name: 'Tyrion SUP',
  });

  databaseBuilder.factory.buildMembership({
    userId: 3,
    organizationId: 2,
    organizationRole: Membership.roles.ADMIN,
  });

  databaseBuilder.factory.buildOrganization({
    id: 3,
    type: 'SCO',
    name: 'The Night Watch',
    isManagingStudents: true,
    canCollectProfiles: true,
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

};

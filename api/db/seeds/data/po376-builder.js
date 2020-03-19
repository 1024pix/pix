const _ = require('lodash');

module.exports = function organizationsBuilder({ databaseBuilder }) {

  const user1Id = databaseBuilder.factory.buildUser.withUnencryptedPassword({
    firstName: 'USER 1',
    lastName: 'PO-376',
    email: 'user1@example.net',
    rawPassword: 'pix123',
  }).id;

  const user2Id = databaseBuilder.factory.buildUser.withUnencryptedPassword({
    firstName: 'USER 2',
    lastName: 'PO-376',
    email: 'user2@example.net',
    rawPassword: 'pix123',
  }).id;

  const user3Id = databaseBuilder.factory.buildUser.withUnencryptedPassword({
    firstName: 'USER 3',
    lastName: 'PO-376',
    email: 'user3@example.net',
    rawPassword: 'pix123',
  }).id;

  const user4Id = databaseBuilder.factory.buildUser.withUnencryptedPassword({
    firstName: 'USER 4',
    lastName: 'PO-376',
    email: 'user4@example.net',
    rawPassword: 'pix123',
  }).id;

  const orgaAId = databaseBuilder.factory.buildOrganization({
    type: 'SCO',
    name: 'ORGANISATION SCO A',
  }).id;
  const orgaBId = databaseBuilder.factory.buildOrganization({
    type: 'SCO',
    name: 'ORGANISATION SCO B',
  }).id;

  _.each([
    { userId: user1Id, organizationId: orgaAId },

    { userId: user2Id, organizationId: orgaAId },
    { userId: user2Id, organizationId: orgaBId },

    { userId: user3Id, organizationId: orgaAId },
    { userId: user3Id, organizationId: orgaBId },

    { userId: user4Id, organizationId: orgaAId },
    { userId: user4Id, organizationId: orgaBId },
  ], (membership) => {
    databaseBuilder.factory.buildMembership(membership);
  });

};

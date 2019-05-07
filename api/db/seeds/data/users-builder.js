const Membership = require('../../../lib/domain/models/Membership');

module.exports = function usersBuilder({ databaseBuilder }) {

  databaseBuilder.factory.buildUser.withUnencryptedPassword({
    id: 3,
    firstName: 'Tyrion',
    lastName: 'Lannister',
    email: 'sup@example.net',
    rawPassword: 'pix123',
    cgu: true,
    boardOrganizationId: 2,
  });

  databaseBuilder.factory.buildMembership({
    userId: 3,
    organizationId: 2,
    organizationRole: Membership.roles.ADMIN,
  });

  databaseBuilder.factory.buildUser.withUnencryptedPassword({
    id: 4,
    firstName: 'John',
    lastName: 'Snow',
    email: 'sco@example.net',
    rawPassword: 'pix123',
    cgu: true,
    boardOrganizationId: 3,
  });

  databaseBuilder.factory.buildMembership({
    userId: 4,
    organizationId: 3,
    organizationRole: Membership.roles.ADMIN,
  });

  databaseBuilder.factory.buildUser.withUnencryptedPassword({
    id: 5,
    firstName: 'Pix',
    lastName: 'Master',
    email: 'pixmaster@example.net',
    rawPassword: 'pix123',
    cgu: true,
  });

  databaseBuilder.factory.buildUser.withUnencryptedPassword({
    id: 9,
    firstName: 'Aemon',
    lastName: 'Targaryen',
    email: 'sco2@example.net',
    rawPassword: 'pix123',
    cgu: true,
  });

  databaseBuilder.factory.buildMembership({
    userId: 9,
    organizationId: 3,
    organizationRole: Membership.roles.MEMBER,
  });

};

const Membership = require('../../../lib/domain/models/Membership');

module.exports = function organizationsBuilder({ databaseBuilder }) {
  databaseBuilder.factory.buildOrganization({
    id: 2,
    userId: 3,
    type: 'SUP',
    name: 'Tyrion SUP',
    code: 'SUPTY'
  });

  databaseBuilder.factory.buildMembership({
    userId: 3,
    organizationId: 2,
    organizationRole: Membership.roles.ADMIN,
  });

  databaseBuilder.factory.buildOrganization({
    id: 3,
    userId: 4,
    type: 'SCO',
    name: 'The Night Watch',
    code: 'SCO12',
    isManagingStudents: true,
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

  databaseBuilder.factory.buildStudent({
    id: 1,
    firstName: 'Eddison',
    lastName: 'Tollett',
    organizationId: 3,
    userId: null
  });
};

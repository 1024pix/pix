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
    organizationRole: Membership.roles.OWNER,
  });

  databaseBuilder.factory.buildOrganization({
    id: 3,
    userId: 4,
    type: 'SCO',
    name: 'SCOw',
    code: 'SCO12'
  });

  databaseBuilder.factory.buildMembership({
    userId: 4,
    organizationId: 3,
    organizationRole: Membership.roles.OWNER,
  });
};

const { roles } = require('../../lib/domain/models/Membership');
const TABLE_NAME = 'memberships';

exports.up = function(knex) {
  return knex(TABLE_NAME)
    .select('id', 'organizationId')
    .then((memberships) => {
      const membershipsByOrganizationId = {};
      const promises = [];

      // Sort memberships by organization id
      memberships.forEach((membership) => {
        if (!membershipsByOrganizationId[membership.organizationId]) {
          membershipsByOrganizationId[membership.organizationId] = [];
        }

        membershipsByOrganizationId[membership.organizationId].push(membership);
      });

      Object.keys(membershipsByOrganizationId).forEach((organizationId) => {
        const memberships = membershipsByOrganizationId[organizationId].sort((a, b) => a.id < b.id ? -1 : 1);

        // Remove earliest membership, that stays ADMIN
        memberships.shift();

        // The others are MEMBERs
        memberships.forEach((membership) => {
          promises.push(
            knex(TABLE_NAME)
              .where('id', membership.id)
              .update({
                organizationRoleId: roles.MEMBER,
              })
          );
        });
      });

      return Promise.all(promises);
    });
};

// Rollback, make every membership an ADMIN
exports.down = function(knex) {
  return knex(TABLE_NAME)
    .update({
      organizationRoleId: roles.ADMIN,
    });
};

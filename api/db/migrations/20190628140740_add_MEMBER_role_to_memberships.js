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

      Object.values(membershipsByOrganizationId).forEach((memberships) => {
        memberships.sort((a, b) => a.id < b.id ? -1 : 1);

        // Remove earliest membership, that stays OWNER
        memberships.shift();

        // The others are MEMBERs
        memberships.forEach((membership) => {
          promises.push(
            knex(TABLE_NAME)
              .where('id', membership.id)
              .update({
                organizationRole: roles.MEMBER,
              })
          );
        });
      });

      return Promise.all(promises);
    });
};

// Rollback, make every membership an OWNER
exports.down = function(knex) {
  return knex(TABLE_NAME)
    .update({
      organizationRole: roles.OWNER,
    });
};

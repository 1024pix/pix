const { batch } = require('../batchTreatment');

const TABLE_NAME_USER_ORGA_SETTINGS = 'user-orga-settings';
const TABLE_NAME_MEMBERSHIPS = 'memberships';

exports.up = function(knex) {
  const subQuery = knex(TABLE_NAME_MEMBERSHIPS).min('id').groupBy('userId');

  return knex(TABLE_NAME_MEMBERSHIPS)
    .select('userId', 'organizationId')
    .whereIn('id', subQuery)
    .then((memberships) => {

      return batch(knex, memberships, (membership) => {
        return knex(TABLE_NAME_USER_ORGA_SETTINGS)
          .insert({
            userId: membership.userId,
            currentOrganizationId: membership.organizationId
          });
      });
    });
};

exports.down = function(knex) {
  const subQuery = knex(TABLE_NAME_MEMBERSHIPS).min('id').groupBy('userId');

  return knex(TABLE_NAME_MEMBERSHIPS)
    .select('userId', 'organizationId')
    .whereIn('id', subQuery)
    .then((memberships) => {

      return batch(knex, memberships, (membership) => {
        return knex(TABLE_NAME_USER_ORGA_SETTINGS)
          .delete({
            userId: membership.userId,
            currentOrganizationId: membership.organizationId
          });
      });
    });
};

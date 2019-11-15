const TABLE_NAME = 'memberships';

exports.up = function(knex) {
  return knex(TABLE_NAME)
    .where('organizationRole', '=', 'OWNER')
    .update({ organizationRole: 'ADMIN' });
};

exports.down = function(knex) {
  return knex(TABLE_NAME)
    .where('organizationRole', '=', 'ADMIN')
    .update({ organizationRole: 'OWNER' });
};

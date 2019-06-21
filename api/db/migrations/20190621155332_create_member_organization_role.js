const TABLE_NAME = 'organization-roles';

exports.up = function(knex) {
  return knex(TABLE_NAME).insert({ id: 2, name: 'MEMBER' });
};

exports.down = function(knex) {
  return knex(TABLE_NAME)
    .where('name', 'MEMBER')
    .delete();
};

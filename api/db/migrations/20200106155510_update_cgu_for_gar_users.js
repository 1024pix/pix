const TABLE_NAME = 'users';

exports.up = function(knex) {
  return knex(TABLE_NAME)
    .whereNotNull('samlId')
    .update({ cgu : false });
};

exports.down = function(knex) {
  return knex(TABLE_NAME)
    .whereNotNull('samlId')
    .update({ cgu : true });
};

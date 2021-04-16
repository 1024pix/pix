const TABLE_NAME = 'certification-challenges';

exports.up = function(knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.string('certifiableBadgeKey');
  });
};

exports.down = function(knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropColumn('certifiableBadgeKey');
  });
};

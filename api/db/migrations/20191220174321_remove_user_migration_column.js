const TABLE_NAME = 'users';

exports.up = function(knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropColumn('isProfileV2');
    table.dropColumn('migratedAt');
  });
};

exports.down = function(knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.boolean('isProfileV2').defaultTo(true);
    table.dateTime('migratedAt').nullable();

  });
};

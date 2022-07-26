const TABLE_NAME = 'campaigns';

exports.up = function (knex) {
  return knex.schema.table(TABLE_NAME, function (table) {
    table.integer('participationsCount').defaultTo(0);
    table.integer('sharedParticipationsCount').defaultTo(0);
  });
};

exports.down = function (knex) {
  return knex.schema.table(TABLE_NAME, function (table) {
    table.dropColumn('participationsCount');
    table.dropColumn('sharedParticipationsCount');
  });
};

const TABLE_NAME = 'campaign-participations';

exports.up = function (knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropColumn('isShared');
  });
};

exports.down = function (knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.string('isShared');
  });
};

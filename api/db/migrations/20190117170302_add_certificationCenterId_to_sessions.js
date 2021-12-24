const TABLE_NAME = 'sessions';

exports.up = function (knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.integer('certificationCenterId').references('certification-centers.id').index();
  });
};

exports.down = function (knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropColumn('certificationCenterId');
  });
};

const TABLE_NAME = 'sessions';

const up = function (knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.integer('certificationCenterId').references('certification-centers.id').index();
  });
};

const down = function (knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropColumn('certificationCenterId');
  });
};

export { up, down };

const TABLE_NAME = 'sessions';

export const up = function (knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.integer('certificationCenterId').references('certification-centers.id').index();
  });
};

export const down = function (knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropColumn('certificationCenterId');
  });
};

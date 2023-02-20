const TABLE_NAME = 'certification-center-memberships';

export const up = (knex) => {
  return knex.schema.alterTable(TABLE_NAME, function (table) {
    table.integer('certificationCenterId').unsigned().alter();
  });
};

export const down = (knex) => {
  return knex.schema.alterTable(TABLE_NAME, function (table) {
    table.bigInteger('certificationCenterId').alter();
  });
};

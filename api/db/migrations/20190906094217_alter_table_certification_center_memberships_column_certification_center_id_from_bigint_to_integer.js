const TABLE_NAME = 'certification-center-memberships';

const up = function (knex) {
  return knex.schema.alterTable(TABLE_NAME, function (table) {
    table.integer('certificationCenterId').unsigned().alter();
  });
};

const down = function (knex) {
  return knex.schema.alterTable(TABLE_NAME, function (table) {
    table.bigInteger('certificationCenterId').alter();
  });
};

export { up, down };

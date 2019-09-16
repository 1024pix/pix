const TABLE_NAME = 'certification-center-memberships';

exports.up = (knex) => {
  return knex.schema.alterTable(TABLE_NAME, function(table) {
    table.integer('certificationCenterId').unsigned().alter();
  });
};

exports.down = (knex) => {
  return knex.schema.alterTable(TABLE_NAME, function(table) {
    table.bigInteger('certificationCenterId').alter();
  });
};

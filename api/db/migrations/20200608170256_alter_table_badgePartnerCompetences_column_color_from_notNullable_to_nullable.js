const TABLE_NAME = 'badge-partner-competences';

exports.up = (knex) => {
  return knex.schema.alterTable(TABLE_NAME, function(table) {
    table.string('color').nullable().alter();
  });
};

exports.down = (knex) => {
  return knex.schema.alterTable(TABLE_NAME, function(table) {
    table.string('color').notNullable().alter();
  });
};

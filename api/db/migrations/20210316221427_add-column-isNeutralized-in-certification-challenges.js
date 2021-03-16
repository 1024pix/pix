const TABLE_NAME = 'certification-challenges';

exports.up = function(knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.boolean('isNeutralized').notNullable().defaultTo(false);
  });
};

exports.down = function(knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropColumn('isNeutralized');
  });
};

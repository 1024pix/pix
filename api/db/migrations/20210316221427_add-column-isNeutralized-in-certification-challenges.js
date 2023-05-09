const TABLE_NAME = 'certification-challenges';

const up = function(knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.boolean('isNeutralized').notNullable().defaultTo(false);
  });
};

const down = function(knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropColumn('isNeutralized');
  });
};

export { up, down };

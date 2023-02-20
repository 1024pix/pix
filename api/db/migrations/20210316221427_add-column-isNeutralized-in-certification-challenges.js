const TABLE_NAME = 'certification-challenges';

export const up = function (knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.boolean('isNeutralized').notNullable().defaultTo(false);
  });
};

export const down = function (knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropColumn('isNeutralized');
  });
};

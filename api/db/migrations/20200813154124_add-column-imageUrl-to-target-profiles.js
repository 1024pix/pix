const TABLE_NAME = 'target-profiles';
const COLUMN_NAME = 'imageUrl';

export const up = (knex) => {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.string(COLUMN_NAME).defaultTo(null);
  });
};

export const down = (knex) => {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropColumn(COLUMN_NAME);
  });
};

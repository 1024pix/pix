const TABLE_NAME = 'campaigns';

export const up = (knex) => {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.string('title');
  });
};

export const down = (knex) => {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropColumn('title');
  });
};

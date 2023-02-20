const TABLE_NAME = 'campaign-participations';

export const up = (knex) => {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.boolean('isShared').notNullable().defaultTo(false);
    table.dateTime('sharedAt');
  });
};

export const down = (knex) => {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropColumn('isShared');
    table.dropColumn('sharedAt');
  });
};

const TABLE_NAME = 'campaign-participations';

const up = function (knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.boolean('isShared').notNullable().defaultTo(false);
    table.dateTime('sharedAt');
  });
};

const down = function (knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropColumn('isShared');
    table.dropColumn('sharedAt');
  });
};

export { up, down };

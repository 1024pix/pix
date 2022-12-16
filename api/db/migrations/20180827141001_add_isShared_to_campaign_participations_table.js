const TABLE_NAME = 'campaign-participations';

exports.up = (knex) => {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.boolean('isShared').notNullable().defaultTo(false);
    table.dateTime('sharedAt');
  });
};

exports.down = (knex) => {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropColumn('isShared');
    table.dropColumn('sharedAt');
  });
};

const TABLE_NAME = 'certification-centers';

const up = async function (knex) {
  await knex.schema.table(TABLE_NAME, function (table) {
    table.timestamp('archivedAt');
    table.bigInteger('archivedBy').references('users.id').index();
  });
};

const down = async function (knex) {
  await knex.schema.table(TABLE_NAME, function (table) {
    table.dropColumn('archivedAt');
    table.dropColumn('archivedBy');
  });
};

export { down, up };

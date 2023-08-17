const TABLE_NAME = 'organization-learners';

const up = async function (knex) {
  await knex.schema.table(TABLE_NAME, function (table) {
    table.dateTime('deletedAt').nullable();
    table.bigInteger('deletedBy').index().references('users.id').nullable();
  });
};

const down = function (knex) {
  return knex.schema.table(TABLE_NAME, function (table) {
    table.dropColumn('deletedAt');
    table.dropColumn('deletedBy');
  });
};

export { down, up };
